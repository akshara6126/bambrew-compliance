import { kv } from '@vercel/kv';
import nodemailer from 'nodemailer';

// Search queries — Bambrew-specific: bamboo, plastic regulation, sustainability, standard compliance areas
const QUERIES = [
  // Core regulatory bodies
  { q: 'MCA ministry corporate affairs circular notification India', dept: 'cs',         label: 'MCA' },
  { q: 'GST India notification circular amendment',                  dept: 'finance',     label: 'GST' },
  { q: 'income tax TDS TCS India compliance notification',           dept: 'finance',     label: 'Income Tax' },
  { q: 'SEBI India compliance regulation notification',              dept: 'finance',     label: 'SEBI' },
  { q: 'India labour law PF ESI wages compliance notification',      dept: 'hr',          label: 'Labour' },
  { q: 'India trademark patent intellectual property regulation',    dept: 'legal',       label: 'IP/Legal' },
  { q: 'consumer protection ASCI advertising India regulation',      dept: 'marketing',   label: 'Consumer' },

  // Plastic & packaging — core to Bambrew's market
  { q: 'single use plastic ban India CPCB regulation',              dept: 'operations',  label: 'Plastic Ban' },
  { q: 'Plastic Waste Management Rules India amendment',             dept: 'operations',  label: 'Plastic Waste' },
  { q: 'EPR extended producer responsibility packaging India',       dept: 'operations',  label: 'EPR' },
  { q: 'biodegradable compostable packaging India regulation',       dept: 'operations',  label: 'Biodegradable Packaging' },
  { q: 'plastic alternatives regulation India policy',               dept: 'operations',  label: 'Plastic Alternatives' },

  // Bamboo & sustainability
  { q: 'bamboo regulation policy India NMBA mission',               dept: 'operations',  label: 'Bamboo Policy' },
  { q: 'bamboo products standard BIS certification India',          dept: 'rnd',         label: 'Bamboo BIS' },
  { q: 'bamboo forest conservation cultivation India',              dept: 'legal',       label: 'Bamboo Forest' },
  { q: 'sustainable packaging regulation India green',              dept: 'operations',  label: 'Sustainable Packaging' },
  { q: 'FSC forest certification India sustainable',                dept: 'rnd',         label: 'FSC/Certification' },

  // ESG & sustainability reporting
  { q: 'BRSR business responsibility sustainability reporting India SEBI', dept: 'finance', label: 'ESG/BRSR' },
  { q: 'ESG sustainability disclosure India company',               dept: 'finance',     label: 'ESG' },
  { q: 'carbon footprint disclosure India regulation',              dept: 'operations',  label: 'Carbon/Climate' },
  { q: 'circular economy India policy green procurement',           dept: 'operations',  label: 'Circular Economy' },

  // Environment & product standards
  { q: 'BIS standard certification India product regulation',       dept: 'rnd',         label: 'BIS Standards' },
  { q: 'CPCB MoEFCC environment India compliance notification',     dept: 'operations',  label: 'Environment' },
  { q: 'green product certification ecolabel India',                dept: 'rnd',         label: 'Ecolabel' },
  { q: 'customs import export compliance India notification',       dept: 'supply',      label: 'Trade/Customs' },

  // Food-contact packaging — relevant if Bambrew products touch food
  { q: 'FSSAI food contact material packaging regulation India',    dept: 'rnd',         label: 'FSSAI Food Contact' },
  { q: 'food grade packaging India regulation BIS standard',        dept: 'rnd',         label: 'Food-Grade Packaging' },
  { q: 'food packaging safety India compliance notification',       dept: 'operations',  label: 'Food Packaging Safety' },
  { q: 'food contact bamboo wood material safety India',            dept: 'rnd',         label: 'Bamboo Food Contact' },
];

// Keywords that flag an article as likely a compliance action item
const COMPLIANCE_KEYWORDS = [
  'circular', 'notification', 'gazette', 'amendment', 'mandatory', 'penalty',
  'deadline', 'due date', 'last date', 'prescribed', 'required by', 'comply',
  'compliance', 'filing', 'return', 'form no', 'schedule', 'section', 'rule',
  'ban effective', 'prohibited', 'banned from', 'effective from', 'comes into force',
  'notified', 'gazetted', 'enforced', 'extended', 'applicable from',
];

// Trusted sources only — partial case-insensitive match against source name
const TRUSTED_SOURCES = [
  // Business & financial press
  'economic times', 'business standard', 'mint', 'livemint', 'financial express',
  'hindu businessline', 'businessline', 'moneycontrol', 'ndtv profit', 'cnbctv18',
  'bloomberg', 'reuters', 'hindu', 'times of india', 'india today',
  'bq prime', 'fortune india', 'business today', 'inc42',

  // Regulatory / legal / tax specialists
  'taxmann', 'taxguru', 'cleartax', 'livelaw', 'barandbench', 'manupatra',

  // Environment & sustainability
  'down to earth', 'mongabay', 'climate home', 'eco-business',

  // Government / official
  'pib', 'press information bureau', 'mca.gov', 'sebi.gov', 'cbic.gov',
  'gst.gov', 'moef.gov', 'labour.gov', 'bis.gov', 'cpcb.nic', 'fssai.gov',

  // Wire services
  'pti', 'ani', 'ians',
];

function isTrustedSource(source) {
  if (!source) return false;
  const s = source.toLowerCase();
  return TRUSTED_SOURCES.some(t => s.includes(t));
}

// Simple RSS parser — no external deps
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const get = (tag) => {
      const r = new RegExp(
        `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'
      );
      const match = r.exec(block);
      return match ? (match[1] || match[2] || '').trim() : '';
    };
    const getAttr = (tag, attr) => {
      const r = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i');
      const match = r.exec(block);
      return match ? match[1].trim() : '';
    };

    const decode = s => s
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');

    const title  = decode(get('title'));
    const link   = get('link') || getAttr('link', 'href');
    const pubDate = get('pubDate');
    const source  = decode(get('source'));

    if (title && link) items.push({ title, link, pubDate, source });
  }
  return items;
}

async function fetchQuery({ q, dept, label }) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BambrewBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRSS(xml).map(item => ({ ...item, dept, label }));
  } catch {
    return [];
  }
}

// Deterministic ID from URL
function makeId(url) {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (Math.imul(31, h) + url.charCodeAt(i)) | 0;
  return 'auto-' + Math.abs(h).toString(36);
}

function isLikelyCompliance(title) {
  const t = title.toLowerCase();
  return COMPLIANCE_KEYWORDS.some(kw => t.includes(kw));
}

const DEPT_NAMES = {
  cs: 'Company Secretary', legal: 'Legal', hr: 'HR', finance: 'Finance',
  marketing: 'Marketing', operations: 'Operations', supply: 'Supply Chain',
  design: 'Design', rnd: 'R&D', sales: 'Sales',
};

function makeTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  });
}

async function alertManagementNewCompliance(mgmtEmails, freshCompliances) {
  if (!mgmtEmails.length || !freshCompliances.length) return;
  const rows = freshCompliances.map(c => `
    <tr style="border-bottom:1px solid #f0f1f3;">
      <td style="padding:10px 12px;font-size:12px;color:#0f2a1e;font-weight:600;">${c.description}</td>
      <td style="padding:10px 12px;font-size:12px;color:#57636d;">${DEPT_NAMES[c.dept] || c.dept}</td>
      <td style="padding:10px 12px;font-size:12px;color:#57636d;">${c.statutoryRef}</td>
      <td style="padding:10px 12px;font-size:12px;"><a href="${c.url}" style="color:#1c5496;text-decoration:none;">Read →</a></td>
    </tr>`).join('');

  const html = `
<div style="font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;padding:40px 28px;border:1px solid #e6e8eb;border-radius:10px;background:#fff;">
  <div style="margin-bottom:24px;"><span style="background:#0f2a1e;color:#fff;padding:5px 12px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.8px;">BAMBREW COMPLIANCE</span></div>
  <h2 style="font-size:18px;font-weight:700;color:#0f2a1e;margin:0 0 6px;">New compliance items detected</h2>
  <p style="font-size:13px;color:#57636d;margin:0 0 24px;">The daily regulatory scan found <strong>${freshCompliances.length} new compliance action item${freshCompliances.length > 1 ? 's' : ''}</strong> that may require your attention. Please review and add to the tracker if applicable.</p>
  <table style="width:100%;border-collapse:collapse;border:1px solid #e6e8eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
    <thead>
      <tr style="background:#f8f9fa;">
        <th style="padding:10px 12px;font-size:11px;color:#57636d;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Compliance</th>
        <th style="padding:10px 12px;font-size:11px;color:#57636d;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Department</th>
        <th style="padding:10px 12px;font-size:11px;color:#57636d;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Category</th>
        <th style="padding:10px 12px;font-size:11px;color:#57636d;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Source</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <a href="https://bambrew-compliance.vercel.app" style="display:inline-block;background:#0f2a1e;color:#fff;padding:12px 24px;border-radius:6px;font-size:13px;font-weight:700;text-decoration:none;">Review in compliance portal →</a>
  <p style="color:#c0c8d0;font-size:11px;margin:24px 0 0;">Daily regulatory scan · Bambrew Compliance · Do not reply.</p>
</div>`;

  await makeTransport().sendMail({
    from: `Bambrew Compliance <${process.env.GMAIL_USER}>`,
    to: mgmtEmails.join(', '),
    subject: `[New Compliance Alert] ${freshCompliances.length} new item${freshCompliances.length > 1 ? 's' : ''} detected — review required`,
    html,
  });
}

async function sendWeeklyDigest(mgmtEmails) {
  const state = (await kv.get('bambrew-compliance-state')) || {};
  const statusMap       = state.statusMap       || {};
  const deadlineDateMap = state.deadlineDateMap  || {};

  const DEPTS = ['cs','legal','hr','finance','marketing','operations','supply','design','rnd','sales'];
  const { COMPLIANCES } = await import('../../../lib/compliance-schedule.js');

  function resolveStatus(cid) {
    const raw = statusMap[cid] || 'not-started';
    if (!raw.startsWith('completed:')) return raw;
    return 'completed'; // simplified for digest
  }

  const summary = DEPTS.map(dept => {
    const items    = COMPLIANCES.filter(c => c.dept === dept);
    const done     = items.filter(c => resolveStatus(`${c.dept}-${c.sNo}`) === 'completed').length;
    const inProg   = items.filter(c => resolveStatus(`${c.dept}-${c.sNo}`) === 'in-progress').length;
    const notStart = items.length - done - inProg;
    const upcoming = items.filter(c => {
      const entry = deadlineDateMap[`${c.dept}-${c.sNo}`];
      if (!entry?.date) return false;
      const days = Math.ceil((new Date(entry.date) - new Date()) / 86400000);
      return days >= 0 && days <= 14;
    });
    return { dept, name: DEPT_NAMES[dept], total: items.length, done, inProg, notStart, upcoming };
  });

  const deptRows = summary.map(d => {
    const pct     = d.total ? Math.round((d.done / d.total) * 100) : 0;
    const barColor = pct === 100 ? '#2a8f5e' : pct >= 60 ? '#b88410' : '#b03030';
    const upcomingText = d.upcoming.length
      ? d.upcoming.map(c => {
          const entry = deadlineDateMap[`${c.dept}-${c.sNo}`];
          const days  = Math.ceil((new Date(entry.date) - new Date()) / 86400000);
          return `${c.description.slice(0, 40)}… (${days}d)`;
        }).join('<br>')
      : '<span style="color:#8a929a;">None in 14 days</span>';
    return `
    <tr style="border-bottom:1px solid #f0f1f3;">
      <td style="padding:12px;font-size:12px;font-weight:700;color:#0f2a1e;">${d.name}</td>
      <td style="padding:12px;font-size:12px;color:#0f2a1e;">${d.done}/${d.total} <span style="color:#2a8f5e;">(${pct}%)</span></td>
      <td style="padding:12px;font-size:12px;color:#b88410;">${d.inProg}</td>
      <td style="padding:12px;font-size:12px;color:#b03030;">${d.notStart}</td>
      <td style="padding:12px;font-size:12px;color:#57636d;">${upcomingText}</td>
    </tr>`;
  }).join('');

  const totalDone = summary.reduce((s, d) => s + d.done, 0);
  const totalAll  = summary.reduce((s, d) => s + d.total, 0);
  const overallPct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0;

  const html = `
<div style="font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;max-width:700px;margin:0 auto;padding:40px 28px;border:1px solid #e6e8eb;border-radius:10px;background:#fff;">
  <div style="margin-bottom:24px;"><span style="background:#0f2a1e;color:#fff;padding:5px 12px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.8px;">BAMBREW COMPLIANCE</span></div>
  <h2 style="font-size:20px;font-weight:700;color:#0f2a1e;margin:0 0 4px;">Weekly Compliance Digest</h2>
  <p style="font-size:13px;color:#57636d;margin:0 0 6px;">${new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
  <div style="background:#f4f6f8;border-radius:8px;padding:16px 20px;margin:20px 0 24px;display:flex;align-items:center;gap:16px;">
    <div style="font-size:32px;font-weight:700;color:#0f2a1e;">${overallPct}%</div>
    <div><div style="font-size:13px;font-weight:600;color:#0f2a1e;">Overall compliance rate</div><div style="font-size:12px;color:#57636d;">${totalDone} of ${totalAll} items completed across all departments</div></div>
  </div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #e6e8eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
    <thead>
      <tr style="background:#f8f9fa;">
        <th style="padding:10px 12px;font-size:11px;color:#57636d;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Department</th>
        <th style="padding:10px 12px;font-size:11px;color:#57636d;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Completed</th>
        <th style="padding:10px 12px;font-size:11px;color:#57636d;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">In Progress</th>
        <th style="padding:10px 12px;font-size:11px;color:#57636d;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Not Started</th>
        <th style="padding:10px 12px;font-size:11px;color:#57636d;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Due in 14 days</th>
      </tr>
    </thead>
    <tbody>${deptRows}</tbody>
  </table>
  <a href="https://bambrew-compliance.vercel.app" style="display:inline-block;background:#0f2a1e;color:#fff;padding:12px 24px;border-radius:6px;font-size:13px;font-weight:700;text-decoration:none;">Open compliance portal →</a>
  <p style="color:#c0c8d0;font-size:11px;margin:24px 0 0;">Weekly digest every Monday · Bambrew Compliance · Do not reply.</p>
</div>`;

  await makeTransport().sendMail({
    from: `Bambrew Compliance <${process.env.GMAIL_USER}>`,
    to: mgmtEmails.join(', '),
    subject: `Weekly Compliance Digest — ${overallPct}% complete across all departments`,
    html,
  });
}

async function sendCombinedDeptWeeklyReport(payload) {
  const { COMPLIANCES } = await import('../../lib/compliance-schedule.js');
  const state       = (await kv.get('bambrew-compliance-state')) || {};
  const statusMap   = state.statusMap       || {};
  const deadlineMap = state.deadlineDateMap  || {};
  const DEPTS       = ['cs','legal','hr','finance','marketing','operations','supply','design','rnd','sales'];
  const oneWeekAgo  = Date.now() - 7 * 24 * 60 * 60 * 1000;

  function resolveStatus(cid) {
    const raw = statusMap[cid] || 'not-started';
    return raw.startsWith('completed:') ? 'completed' : raw;
  }

  for (const dept of DEPTS) {
    const emails = (await kv.get(`dept-emails:${dept}`)) || [];
    if (!emails.length) continue;

    // News items for this dept published in last 7 days
    const deptNews = (payload.news || []).filter(n =>
      n.dept === dept && n.date && new Date(n.date).getTime() > oneWeekAgo
    );
    // Auto-discovered compliances for this dept
    const deptCompliances = (payload.compliances || []).filter(c => c.dept === dept);
    // Their compliance status
    const myCompliances = COMPLIANCES.filter(c => c.dept === dept);
    const done    = myCompliances.filter(c => resolveStatus(`${c.dept}-${c.sNo}`) === 'completed').length;
    const inProg  = myCompliances.filter(c => resolveStatus(`${c.dept}-${c.sNo}`) === 'in-progress').length;
    const notDone = myCompliances.length - done - inProg;
    // Upcoming deadlines in next 14 days
    const upcoming = myCompliances.filter(c => {
      const entry = deadlineMap[`${c.dept}-${c.sNo}`];
      if (!entry?.date) return false;
      const days = Math.ceil((new Date(entry.date) - new Date()) / 86400000);
      return days >= 0 && days <= 14;
    }).map(c => {
      const entry = deadlineMap[`${c.dept}-${c.sNo}`];
      const days  = Math.ceil((new Date(entry.date) - new Date()) / 86400000);
      return { ...c, days };
    }).sort((a,b) => a.days - b.days);

    if (!deptNews.length && !deptCompliances.length && !upcoming.length) continue;

    const statusSection = `
      <div style="background:#f4f6f8;border-radius:8px;padding:16px 20px;margin-bottom:20px;display:flex;gap:28px;">
        <div style="text-align:center;"><div style="font-size:22px;font-weight:700;color:#2a8f5e;">${done}</div><div style="font-size:11px;color:#57636d;">Completed</div></div>
        <div style="text-align:center;"><div style="font-size:22px;font-weight:700;color:#b88410;">${inProg}</div><div style="font-size:11px;color:#57636d;">In Progress</div></div>
        <div style="text-align:center;"><div style="font-size:22px;font-weight:700;color:#b03030;">${notDone}</div><div style="font-size:11px;color:#57636d;">Not Started</div></div>
        <div style="text-align:center;"><div style="font-size:22px;font-weight:700;color:#0f2a1e;">${myCompliances.length}</div><div style="font-size:11px;color:#57636d;">Total</div></div>
      </div>`;

    const upcomingSection = upcoming.length ? `
      <h3 style="font-size:13px;font-weight:700;color:#0f2a1e;margin:0 0 10px;">Deadlines in the next 14 days</h3>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e6e8eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
        <thead><tr style="background:#f8f9fa;">
          <th style="padding:9px 12px;font-size:10.5px;color:#57636d;text-align:left;font-weight:700;text-transform:uppercase;">Compliance</th>
          <th style="padding:9px 12px;font-size:10.5px;color:#57636d;text-align:left;font-weight:700;text-transform:uppercase;">Days left</th>
          <th style="padding:9px 12px;font-size:10.5px;color:#57636d;text-align:left;font-weight:700;text-transform:uppercase;">Status</th>
        </tr></thead>
        <tbody>${upcoming.map(c => {
          const color = c.days <= 5 ? '#b03030' : c.days <= 10 ? '#b88410' : '#1c5496';
          const st    = resolveStatus(`${c.dept}-${c.sNo}`);
          return `<tr style="border-top:1px solid #f0f1f3;">
            <td style="padding:9px 12px;font-size:12px;color:#0f2a1e;">${c.description}</td>
            <td style="padding:9px 12px;font-size:12px;font-weight:700;color:${color};">${c.days}d</td>
            <td style="padding:9px 12px;font-size:12px;color:#57636d;">${st}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>` : '';

    const newsSection = deptNews.length ? `
      <h3 style="font-size:13px;font-weight:700;color:#0f2a1e;margin:0 0 10px;">Regulatory updates relevant to ${DEPT_NAMES[dept]}</h3>
      ${deptNews.map(n => `
        <div style="border:1px solid #e6e8eb;border-radius:8px;padding:14px 16px;margin-bottom:10px;">
          <div style="font-size:10.5px;color:#8a929a;margin-bottom:4px;">${new Date(n.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})} · ${n.significance || n.source}</div>
          <div style="font-size:13px;font-weight:600;color:#0f2a1e;margin-bottom:6px;">${n.title}</div>
          ${n.url ? `<a href="${n.url}" style="font-size:11.5px;color:#1c5496;text-decoration:none;">Read full article →</a>` : ''}
        </div>`).join('')}` : '';

    const compSection = deptCompliances.length ? `
      <h3 style="font-size:13px;font-weight:700;color:#d97706;margin:16px 0 10px;">⚠ New compliance items discovered — review needed</h3>
      ${deptCompliances.map(c => `
        <div style="border:1px solid #fde8c0;border-radius:8px;padding:14px 16px;margin-bottom:10px;background:#fffbf0;">
          <div style="font-size:10.5px;color:#8a929a;margin-bottom:4px;">${c.statutoryRef}</div>
          <div style="font-size:13px;font-weight:600;color:#0f2a1e;margin-bottom:6px;">${c.description}</div>
          ${c.url ? `<a href="${c.url}" style="font-size:11.5px;color:#1c5496;text-decoration:none;">Read more →</a>` : ''}
        </div>`).join('')}` : '';

    const html = `
<div style="font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 28px;border:1px solid #e6e8eb;border-radius:10px;background:#fff;">
  <div style="margin-bottom:20px;"><span style="background:#0f2a1e;color:#fff;padding:5px 12px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.8px;">BAMBREW COMPLIANCE</span></div>
  <h2 style="font-size:18px;font-weight:700;color:#0f2a1e;margin:0 0 4px;">Weekly Report — ${DEPT_NAMES[dept]}</h2>
  <p style="font-size:12px;color:#57636d;margin:0 0 20px;">${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
  ${statusSection}
  ${upcomingSection}
  ${newsSection}
  ${compSection}
  <a href="https://bambrew-compliance.vercel.app" style="display:inline-block;background:#0f2a1e;color:#fff;padding:12px 24px;border-radius:6px;font-size:13px;font-weight:700;text-decoration:none;margin-top:8px;">Open your compliance view →</a>
  <p style="color:#c0c8d0;font-size:11px;margin:20px 0 0;">Weekly report every Monday · Bambrew Compliance · Do not reply.</p>
</div>`;

    await makeTransport().sendMail({
      from: `Bambrew Compliance <${process.env.GMAIL_USER}>`,
      to: emails.join(', '),
      subject: `[${DEPT_NAMES[dept]}] Weekly compliance report — ${upcoming.length} deadline${upcoming.length !== 1 ? 's' : ''} in 14 days`,
      html,
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const allResults = await Promise.all(QUERIES.map(fetchQuery));
    const flat = allResults.flat();

    const seen = new Set();
    const unique = flat.filter(item => {
      if (seen.has(item.link)) return false;
      seen.add(item.link);
      return true;
    });

    // Filter: trusted sources only + published in last 7 days
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const filtered = unique.filter(item => {
      const trusted = isTrustedSource(item.source);
      const recent = item.pubDate ? new Date(item.pubDate).getTime() > cutoff : false;
      return trusted && recent;
    });

    filtered.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    const [existing, dismissed] = await Promise.all([
      kv.get('whats-new-data'),
      kv.get('dismissed-news-ids'),
    ]);
    const dismissedSet = new Set(dismissed || []);
    const existingNews        = (existing?.news        || []).filter(n => !dismissedSet.has(n.id));
    const existingCompliances = (existing?.compliances || []).filter(c => !dismissedSet.has(c.id));
    const existingNewsIds        = new Set(existingNews.map(n => n.id));
    const existingComplianceIds  = new Set(existingCompliances.map(c => c.id));

    const freshNews = [];
    const freshCompliances = [];

    for (const item of filtered.slice(0, 80)) {
      const id   = makeId(item.link);
      if (dismissedSet.has(id)) continue;
      const date = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

      if (isLikelyCompliance(item.title)) {
        if (!existingComplianceIds.has(id)) {
          freshCompliances.push({
            id, dept: item.dept, description: item.title,
            type: 'statutory', statutoryRef: item.label,
            url: item.link, discoveredOn: date, source: item.source,
          });
        }
      } else {
        if (!existingNewsIds.has(id)) {
          freshNews.push({
            id, dept: item.dept, title: item.title, url: item.link,
            source: item.source || item.label, date,
            significance: `${item.label} update`, regulatory: true,
          });
        }
      }
    }

    const payload = {
      news:        [...freshNews,        ...existingNews       ].slice(0, 50),
      compliances: [...freshCompliances, ...existingCompliances].slice(0, 20),
      refreshedAt: new Date().toISOString(),
    };

    await kv.set('whats-new-data', payload, { ex: 60 * 60 * 24 * 30 });

    // Alert management if new compliance items discovered
    if (freshCompliances.length > 0) {
      const mgmtEmails = (await kv.get('dept-emails:__management__')) || [];
      await alertManagementNewCompliance(mgmtEmails, freshCompliances).catch(e =>
        console.error('New compliance alert email failed:', e)
      );
    }

    // Weekly digest — every Monday (day 1): one combined email to FO + Founders + all depts
    const isMonday = new Date().getDay() === 1;
    if (isMonday) {
      const [mgmtEmails, founderEmails] = await Promise.all([
        kv.get('dept-emails:__management__'),
        kv.get('dept-emails:__founders__'),
      ]);
      const weeklyRecipients = [...new Set([...(mgmtEmails||[]), ...(founderEmails||[])])];
      if (weeklyRecipients.length) {
        await sendWeeklyDigest(weeklyRecipients).catch(e =>
          console.error('Weekly digest email failed:', e)
        );
      }
      // One combined weekly report to all dept POCs as well
      await sendCombinedDeptWeeklyReport(payload).catch(e =>
        console.error('Dept weekly report failed:', e)
      );
    }

    return res.status(200).json({
      ok: true,
      fresh_news: freshNews.length,
      fresh_compliances: freshCompliances.length,
      alerted_mgmt: freshCompliances.length > 0,
      weekly_digest: isMonday,
    });
  } catch (err) {
    console.error('refresh-news error:', err);
    return res.status(500).json({ error: 'Refresh failed.' });
  }
}
