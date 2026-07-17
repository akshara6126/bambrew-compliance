import { kv } from '@vercel/kv';
import nodemailer from 'nodemailer';
import { COMPLIANCES, STATIC_PRIORITIES } from '../../lib/compliance-schedule.js';

const DEPT_NAMES = {
  cs: 'Company Secretary', legal: 'Legal', hr: 'HR', finance: 'Finance',
  marketing: 'Marketing', operations: 'Operations', supply: 'Supply Chain',
  design: 'Design', rnd: 'R&D', sales: 'Sales',
};

const ALL_DEPTS = ['cs','legal','hr','finance','marketing','operations','supply','design','rnd','sales'];

// ── Date helpers ─────────────────────────────────────────────────────────────
const _MONTHS = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };

function today()         { const d = new Date(); d.setHours(0,0,0,0); return d; }
function todayISO()      { return today().toISOString().slice(0,10); }
function daysUntil(date) { return Math.ceil((date - today()) / 86400000); }
function isoDate(d)      { return d.toISOString().slice(0,10); }
function fmtDate(iso)    {
  return new Date(iso).toLocaleDateString('en-IN', {
    day:'numeric', month:'short', year:'numeric', timeZone:'Asia/Kolkata',
  });
}

// Fallback deadlines for undated/event-based compliances — from FY end March 31, 2027
// very-important → +30d = Apr 30 2027
// important/medium → +60d = May 30 2027
// not-important → +90d = Jun 29 2027
function fallbackDeadline(priority) {
  const fyEnd = new Date(2027, 2, 31);
  const days = ({ 'very-important': 30, 'important': 60, 'medium': 60, 'not-important': 90 })[priority] || 60;
  return isoDate(new Date(fyEnd.getTime() + days * 86400000));
}

function nextDayOfMonth(day) {
  const t = today(), y = t.getFullYear(), m = t.getMonth();
  let d = new Date(y, m, day);
  if (d < t) d = new Date(y, m + 1, day);
  if (d.getDate() !== day) d.setDate(0);
  return isoDate(d);
}

function nextFromMultiDate(text) {
  const t = today();
  const re = /(\d{1,2})\s+([A-Za-z]+)/g;
  let m, best = null;
  while ((m = re.exec(text)) !== null) {
    const mon = _MONTHS[m[2].toLowerCase().slice(0,3)];
    if (mon === undefined) continue;
    const day = parseInt(m[1]);
    let d = new Date(t.getFullYear(), mon, day);
    if (d < t) d = new Date(t.getFullYear() + 1, mon, day);
    if (!best || d < best) best = d;
  }
  return best ? isoDate(best) : null;
}

function nextQuarterDue(addDays) {
  const t = today(), y = t.getFullYear();
  const qEnds = [
    new Date(y, 5, 30), new Date(y, 8, 30),
    new Date(y, 11, 31), new Date(y + 1, 2, 31),
  ];
  for (const qe of qEnds) {
    const due = new Date(qe.getTime() + addDays * 86400000);
    if (due >= t) return isoDate(due);
  }
  return null;
}

function rolledMonthlyDate(storedISO) {
  const t = today();
  const stored = new Date(storedISO); stored.setHours(0,0,0,0);
  if (stored >= t) return { date: storedISO, rolled: false };
  const day = stored.getDate();
  let next = new Date(t.getFullYear(), t.getMonth(), day);
  if (next < t) next = new Date(t.getFullYear(), t.getMonth() + 1, day);
  if (next.getDate() !== day) next.setDate(0);
  return { date: isoDate(next), rolled: true };
}

function computeDeadline(c) {
  const dd = (c.dueDates || '').trim();
  if (c.frequency === 'Monthly') {
    const m = dd.match(/(\d+)(?:st|nd|rd|th)\s+of\s+every\s+month/i);
    if (m) return nextDayOfMonth(parseInt(m[1]));
  }
  if (c.frequency === 'Annual') {
    const multi = nextFromMultiDate(dd);
    if (multi) return multi;
    const paren = dd.match(/\((\d{1,2}\s+[A-Za-z]+)/);
    if (paren) return nextFromMultiDate(paren[1]);
  }
  if (c.frequency === 'Quarterly') {
    const multi = nextFromMultiDate(dd);
    if (multi) return multi;
    const wm = dd.match(/within\s+(\d+)\s+days?\s+of\s+quarter\s+close/i);
    if (wm) return nextQuarterDue(parseInt(wm[1]));
  }
  return null;
}

function resolveStatus(statusMap, cid) {
  const raw = statusMap[cid] || 'not-started';
  if (!raw.startsWith('completed:')) return raw;
  const period = raw.slice('completed:'.length);
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [py, pm] = period.split('-').map(Number);
    return (y === py && m + 1 === pm) ? 'completed' : 'not-started';
  }
  if (/^\d{4}-Q\d$/.test(period)) {
    const py = parseInt(period), pq = parseInt(period.split('Q')[1]);
    return (y === py && Math.floor(m/3)+1 === pq) ? 'completed' : 'not-started';
  }
  if (/^FY\d{4}$/.test(period)) {
    return ((m >= 3 ? y + 1 : y) === parseInt(period.slice(2))) ? 'completed' : 'not-started';
  }
  return 'completed';
}

// ── Email ─────────────────────────────────────────────────────────────────────
function makeTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  });
}

async function sendMail({ to, subject, html }) {
  const recipients = [...new Set(Array.isArray(to) ? to : [to])].filter(Boolean);
  if (!recipients.length) return;
  await makeTransport().sendMail({
    from: `Bambrew Compliance <${process.env.GMAIL_USER}>`,
    to: recipients.join(', '), subject, html,
  });
}

function statusPill(status) {
  const cfg = {
    'not-started': ['#b03030','#fde8e8','Not Started'],
    'in-progress':  ['#b88410','#fef8e1','In Progress'],
    'completed':    ['#2a8f5e','#edf7f2','Completed'],
  }[status] || ['#8a929a','#f4f4f4','Unknown'];
  return `<span style="background:${cfg[1]};color:${cfg[0]};border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700;">${cfg[2]}</span>`;
}

function daysBadge(days) {
  const color = days <= 5 ? '#b03030' : days <= 10 ? '#c0740a' : days <= 15 ? '#b88410' : '#1c5496';
  return `<span style="color:${color};font-weight:700;">${days}d left</span>`;
}

function compRow(item) {
  return `
  <tr style="border-bottom:1px solid #f0f1f3;">
    <td style="padding:10px 12px;font-size:12px;color:#0f2a1e;font-weight:600;">${item.description}</td>
    <td style="padding:10px 12px;font-size:12px;color:#57636d;white-space:nowrap;">${fmtDate(item.deadlineISO)}</td>
    <td style="padding:10px 12px;white-space:nowrap;">${daysBadge(item.daysLeft)}</td>
    <td style="padding:10px 12px;">${statusPill(item.status)}</td>
  </tr>`;
}

function tableHtml(items, headerColor, bgColor) {
  return `
  <table style="width:100%;border-collapse:collapse;border:1px solid ${headerColor}33;border-radius:8px;overflow:hidden;margin-bottom:16px;">
    <thead><tr style="background:${bgColor};">
      <th style="padding:8px 12px;font-size:10.5px;color:${headerColor};text-align:left;font-weight:700;">Compliance</th>
      <th style="padding:8px 12px;font-size:10.5px;color:${headerColor};text-align:left;font-weight:700;">Deadline</th>
      <th style="padding:8px 12px;font-size:10.5px;color:${headerColor};text-align:left;font-weight:700;">Days Left</th>
      <th style="padding:8px 12px;font-size:10.5px;color:${headerColor};text-align:left;font-weight:700;">Status</th>
    </tr></thead>
    <tbody>${items.map(compRow).join('')}</tbody>
  </table>`;
}

const TODAY_STR = new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const DATE_SHORT = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'});

function buildDeptEmail({ deptName, critical, approaching }) {
  const total = critical.length + approaching.length;
  const critSection = critical.length
    ? `<h3 style="font-size:12px;font-weight:700;color:#b03030;margin:20px 0 8px;text-transform:uppercase;letter-spacing:0.5px;">Critical — due within 10 days (${critical.length})</h3>
       ${tableHtml(critical, '#b03030', '#fde8e8')}`
    : '';
  const appSection = approaching.length
    ? `<h3 style="font-size:12px;font-weight:700;color:#1c5496;margin:20px 0 8px;text-transform:uppercase;letter-spacing:0.5px;">Approaching — 11–25 days (${approaching.length})</h3>
       ${tableHtml(approaching, '#1c5496', '#dbeafe')}`
    : '';
  return `
<div style="font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:36px 28px;border:1px solid #e6e8eb;border-radius:10px;background:#fff;">
  <div style="margin-bottom:20px;"><span style="background:#0f2a1e;color:#fff;padding:5px 12px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.8px;">BAMBREW COMPLIANCE</span></div>
  <h2 style="font-size:18px;font-weight:700;color:#0f2a1e;margin:0 0 4px;">${deptName} — Daily Update</h2>
  <p style="font-size:12px;color:#57636d;margin:0 0 20px;">${TODAY_STR} · ${total} item${total!==1?'s':''} need attention</p>
  ${critSection}${appSection}
  <a href="https://bambrew-compliance.vercel.app" style="display:inline-block;background:#0f2a1e;color:#fff;padding:11px 22px;border-radius:6px;font-size:13px;font-weight:700;text-decoration:none;">Open your compliance view →</a>
  <p style="color:#c0c8d0;font-size:11px;margin:20px 0 0;">Daily alert · Bambrew Compliance · Do not reply.</p>
</div>`;
}

function buildFOEmail({ allItems }) {
  const byDept = {};
  for (const item of allItems) {
    if (!byDept[item.dept]) byDept[item.dept] = [];
    byDept[item.dept].push(item);
  }
  const sections = Object.entries(byDept).map(([dept, items]) => {
    const sorted = [...items].sort((a,b) => a.daysLeft - b.daysLeft);
    return `<h3 style="font-size:12px;font-weight:700;color:#0f2a1e;margin:18px 0 6px;text-transform:uppercase;letter-spacing:0.5px;">${DEPT_NAMES[dept]||dept} (${items.length})</h3>
    ${tableHtml(sorted, '#57636d', '#f8f9fa')}`;
  }).join('');
  return `
<div style="font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;padding:36px 28px;border:1px solid #e6e8eb;border-radius:10px;background:#fff;">
  <div style="margin-bottom:20px;"><span style="background:#0f2a1e;color:#fff;padding:5px 12px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.8px;">BAMBREW COMPLIANCE</span></div>
  <h2 style="font-size:18px;font-weight:700;color:#0f2a1e;margin:0 0 4px;">Founders Office — Daily Briefing</h2>
  <p style="font-size:12px;color:#57636d;margin:0 0 20px;">${TODAY_STR} · ${allItems.length} item${allItems.length!==1?'s':''} across ${Object.keys(byDept).length} dept${Object.keys(byDept).length!==1?'s':''}</p>
  ${sections}
  <a href="https://bambrew-compliance.vercel.app" style="display:inline-block;background:#0f2a1e;color:#fff;padding:11px 22px;border-radius:6px;font-size:13px;font-weight:700;text-decoration:none;">Open compliance portal →</a>
  <p style="color:#c0c8d0;font-size:11px;margin:20px 0 0;">Daily briefing · Bambrew Compliance · Do not reply.</p>
</div>`;
}

function buildFoundersEmail({ urgentItems }) {
  const sorted = [...urgentItems].sort((a,b) => a.daysLeft - b.daysLeft);
  return `
<div style="font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;max-width:580px;margin:0 auto;padding:36px 28px;border:1px solid #f5c6c6;border-radius:10px;background:#fff;">
  <div style="margin-bottom:20px;"><span style="background:#b03030;color:#fff;padding:5px 12px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.8px;">BAMBREW — URGENT</span></div>
  <h2 style="font-size:18px;font-weight:700;color:#0f2a1e;margin:0 0 4px;">${urgentItems.length} compliance${urgentItems.length!==1?'s':''} due within 7 days</h2>
  <p style="font-size:12px;color:#57636d;margin:0 0 20px;">${TODAY_STR}</p>
  ${tableHtml(sorted, '#b03030', '#fde8e8')}
  <a href="https://bambrew-compliance.vercel.app" style="display:inline-block;background:#b03030;color:#fff;padding:11px 22px;border-radius:6px;font-size:13px;font-weight:700;text-decoration:none;">View in compliance portal →</a>
  <p style="color:#c0c8d0;font-size:11px;margin:20px 0 0;">Urgent alert · Bambrew Compliance · Do not reply.</p>
</div>`;
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const state = (await kv.get('bambrew-compliance-state')) || {};
    const statusMap       = state.statusMap       || {};
    let   deadlineDateMap = state.deadlineDateMap  || {};
    let   stateChanged    = false;
    const runDate         = todayISO();

    // ── Step 1: Seed / roll / fallback deadlines ──────────────────────────────
    const deletedIds = new Set((state.deletedCompliances || []).map(d => d.id));

    for (const c of COMPLIANCES) {
      const cid      = `${c.dept}-${c.sNo}`;
      if (deletedIds.has(cid)) continue;
      const existing = deadlineDateMap[cid];
      if (existing && !existing.autoSet) continue;

      if (existing?.autoSet && c.frequency === 'Monthly') {
        const { date, rolled } = rolledMonthlyDate(existing.date);
        if (rolled) { deadlineDateMap[cid] = { ...existing, date }; stateChanged = true; }
        continue;
      }

      const date = computeDeadline(c) || fallbackDeadline(STATIC_PRIORITIES[cid] || 'medium');

      if (!deadlineDateMap[cid] || deadlineDateMap[cid].date !== date) {
        deadlineDateMap[cid] = {
          date, description: c.description, dept: c.dept, frequency: c.frequency, autoSet: true,
          ...(c.reminderStartDay ? { reminderStartDay: c.reminderStartDay } : {}),
        };
        stateChanged = true;
      }
    }

    // ── Step 1b: Seed user-added compliances (same pipeline as hardcoded) ────
    const userComps = state.userCompliances || [];
    for (const c of userComps) {
      const cid      = c.id;
      if (deletedIds.has(cid)) continue;
      const existing = deadlineDateMap[cid];
      if (existing && !existing.autoSet) continue;

      if (existing?.autoSet && c.frequency === 'Monthly') {
        const { date, rolled } = rolledMonthlyDate(existing.date);
        if (rolled) { deadlineDateMap[cid] = { ...existing, date }; stateChanged = true; }
        continue;
      }

      const date = computeDeadline(c) || fallbackDeadline('medium');
      if (!deadlineDateMap[cid] || deadlineDateMap[cid].date !== date) {
        deadlineDateMap[cid] = {
          date, description: c.description, dept: c.dept, frequency: c.frequency, autoSet: true,
          ...(c.reminderStartDay ? { reminderStartDay: c.reminderStartDay } : {}),
        };
        stateChanged = true;
      }
    }

    // ── Step 2: Load email lists ──────────────────────────────────────────────
    const [foEmails, founderEmails] = await Promise.all([
      kv.get('dept-emails:__management__'),  // Founders Office
      kv.get('dept-emails:__founders__'),    // Founders (7-day only)
    ]);
    const mgmtEmails     = foEmails      || [];
    const foundersEmails = founderEmails || [];

    const deptEmailMap = {};
    await Promise.all(ALL_DEPTS.map(async d => {
      deptEmailMap[d] = (await kv.get(`dept-emails:${d}`)) || [];
    }));

    // ── Step 3: Collect alert items ───────────────────────────────────────────
    const deptBuckets  = {}; // dept → { critical: [], approaching: [] }
    const foBucket     = [];
    const foundersBucket = [];

    for (const [cid, entry] of Object.entries(deadlineDateMap)) {
      if (!entry?.date) continue;
      if (deletedIds.has(cid)) continue;
      const effectiveDate = new Date(entry.date); effectiveDate.setHours(0,0,0,0);
      const daysLeft = daysUntil(effectiveDate);
      if (daysLeft < 0) continue;

      // Respect reminderStartDay — don't alert before the 1st (or configured day) of the deadline's month
      if (entry.reminderStartDay) {
        const t = today();
        const sameMonth = t.getFullYear() === effectiveDate.getFullYear() && t.getMonth() === effectiveDate.getMonth();
        if (sameMonth && t.getDate() < entry.reminderStartDay) continue;
        if (!sameMonth && effectiveDate > t) continue; // deadline is next month — don't alert yet
      }

      const dept     = entry.dept || cid.split('-')[0];
      const status   = resolveStatus(statusMap, cid);
      const item     = { cid, dept, description: entry.description || cid, deadlineISO: isoDate(effectiveDate), daysLeft, status };

      // Dept gets one email for: 25→11 (not-started) + 10→0 (not-completed)
      const forDept =
        (daysLeft >= 11 && daysLeft <= 25 && status === 'not-started') ||
        (daysLeft <= 10 && status !== 'completed');

      if (forDept) {
        if (!deptBuckets[dept]) deptBuckets[dept] = { critical: [], approaching: [] };
        (daysLeft <= 10 ? deptBuckets[dept].critical : deptBuckets[dept].approaching).push(item);
      }

      // FO: day 15 + 13 (once, not-started), day 10 (once, not-completed), days 5→0 daily (not-completed)
      const forFO =
        (daysLeft === 15 && status === 'not-started') ||
        (daysLeft === 13 && status === 'not-started') ||
        (daysLeft === 10 && status !== 'completed') ||
        (daysLeft <= 5 && status !== 'completed');
      if (forFO) foBucket.push(item);

      // Founders: day 7 (not started) or day 2 (not completed) — just 2 emails max
      if ((daysLeft === 7 && status === 'not-started') ||
          (daysLeft === 2 && status !== 'completed')) foundersBucket.push(item);
    }

    const fired = [], skipped = [];

    // ── Step 4: Dept consolidated emails (one per dept per day) ──────────────
    for (const [dept, { critical, approaching }] of Object.entries(deptBuckets)) {
      const emails = deptEmailMap[dept] || [];
      if (!emails.length) { skipped.push({ dept, reason: 'no emails' }); continue; }
      const key = `da:dept-digest:${dept}:${runDate}`;
      if (await kv.get(key)) { skipped.push({ dept, reason: 'already sent' }); continue; }
      await sendMail({
        to: emails,
        subject: `[${DEPT_NAMES[dept]}] ${critical.length + approaching.length} compliance${critical.length + approaching.length !== 1 ? 's' : ''} need attention — ${DATE_SHORT}`,
        html: buildDeptEmail({ deptName: DEPT_NAMES[dept], critical, approaching }),
      });
      await kv.set(key, true, { ex: 25 * 60 * 60 });
      fired.push({ type: 'dept', dept, count: critical.length + approaching.length });
    }

    // ── Step 5: Founders Office — one consolidated email per day ─────────────
    if (foBucket.length && mgmtEmails.length) {
      const key = `da:fo-digest:${runDate}`;
      if (!(await kv.get(key))) {
        await sendMail({
          to: mgmtEmails,
          subject: `[Founders Office] ${foBucket.length} compliance item${foBucket.length !== 1 ? 's' : ''} across departments — ${DATE_SHORT}`,
          html: buildFOEmail({ allItems: foBucket }),
        });
        await kv.set(key, true, { ex: 25 * 60 * 60 });
        fired.push({ type: 'fo', count: foBucket.length });
      } else skipped.push({ type: 'fo', reason: 'already sent' });
    }

    // ── Step 6: Founders — one email only when ≤7 days ───────────────────────
    if (foundersBucket.length && foundersEmails.length) {
      const key = `da:founders-digest:${runDate}`;
      if (!(await kv.get(key))) {
        await sendMail({
          to: foundersEmails,
          subject: `[URGENT] ${foundersBucket.length} compliance${foundersBucket.length !== 1 ? 's' : ''} due within 7 days`,
          html: buildFoundersEmail({ urgentItems: foundersBucket }),
        });
        await kv.set(key, true, { ex: 25 * 60 * 60 });
        fired.push({ type: 'founders', count: foundersBucket.length });
      } else skipped.push({ type: 'founders', reason: 'already sent' });
    }

    // ── Step 7: Persist state ─────────────────────────────────────────────────
    if (stateChanged) {
      await kv.set('bambrew-compliance-state', { ...state, deadlineDateMap });
    }

    return res.status(200).json({ ok: true, seeded: Object.keys(deadlineDateMap).length, fired, skipped, runDate });
  } catch (err) {
    console.error('deadline-alerts error:', err);
    return res.status(500).json({ error: err.message });
  }
}
