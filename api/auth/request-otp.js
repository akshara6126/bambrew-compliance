import { kv } from '@vercel/kv';
import nodemailer from 'nodemailer';

const DEPT_NAMES = {
  cs: 'Company Secretary', legal: 'Legal', hr: 'HR', finance: 'Finance',
  marketing: 'Marketing', operations: 'Operations', supply: 'Supply Chain',
  design: 'Design', rnd: 'R&D', sales: 'Sales',
};

function makeTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
}

async function sendEmail({ to, subject, html }) {
  const transporter = makeTransport();
  await transporter.sendMail({
    from: `Bambrew Compliance <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, dept } = req.body || {};
    if (!email || !dept) return res.status(400).json({ error: 'Email and department are required.' });

    const emailLower = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const [authorizedEmails, alertEmail] = await Promise.all([
      kv.get(`dept-emails:${dept}`),
      kv.get(`dept-alert-email:${dept}`),
    ]);

    const authorized = (authorizedEmails || []).map(e => e.toLowerCase());
    const isAuthorized = authorized.includes(emailLower);

    if (!isAuthorized) {
      const effectiveAlertEmail = alertEmail || 'f20240761@pilani.bits-pilani.ac.in';
      const deptName = DEPT_NAMES[dept] || dept;
      const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
      sendEmail({
        to: effectiveAlertEmail,
        subject: `Unauthorized access attempt — ${deptName}`,
        html: `
          <div style="font-family:-apple-system,sans-serif;max-width:460px;margin:0 auto;padding:32px 24px;border:1px solid #e6e8eb;border-radius:8px;">
            <div style="margin-bottom:20px;"><span style="background:#0f2a1e;color:#fff;padding:5px 12px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.8px;">BAMBREW COMPLIANCE</span></div>
            <div style="background:#fff3f3;border:1px solid #f5c6c6;border-radius:8px;padding:18px 20px;margin-bottom:20px;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#842121;">Unauthorized access attempt</p>
              <p style="margin:0;font-size:13px;color:#57636d;">Someone tried to access <strong>${deptName}</strong> using an email not on the authorized list.</p>
            </div>
            <table style="font-size:13px;width:100%;border-collapse:collapse;">
              <tr><td style="padding:7px 0;color:#8a929a;width:110px;">Email used</td><td style="color:#0f2a1e;font-weight:600;">${emailLower}</td></tr>
              <tr><td style="padding:7px 0;color:#8a929a;">Department</td><td style="color:#0f2a1e;">${deptName}</td></tr>
              <tr><td style="padding:7px 0;color:#8a929a;">Time (IST)</td><td style="color:#0f2a1e;">${now}</td></tr>
            </table>
          </div>`,
      }).catch(err => console.error('Alert email failed:', err));

      return res.status(403).json({ error: 'This email is not authorized for this department. Contact your manager.' });
    }

    // Rate limit: max 3 requests per email/dept per 10 min
    const rateLimitKey = `otp-rate:${emailLower}:${dept}`;
    const attempts = (await kv.get(rateLimitKey)) || 0;
    if (attempts >= 3) {
      return res.status(429).json({ error: 'Too many requests. Please wait 10 minutes before trying again.' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const deptName = DEPT_NAMES[dept] || dept;

    await Promise.all([
      kv.set(`otp:${emailLower}:${dept}`, otp, { ex: 600 }),
      kv.set(rateLimitKey, attempts + 1, { ex: 600 }),
    ]);

    await sendEmail({
      to: emailLower,
      subject: `${otp} — your Bambrew Compliance OTP`,
      html: `
        <div style="font-family:-apple-system,sans-serif;max-width:460px;margin:0 auto;padding:40px 28px;border:1px solid #e6e8eb;border-radius:8px;">
          <div style="margin-bottom:28px;"><span style="background:#0f2a1e;color:#fff;padding:5px 12px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.8px;">BAMBREW COMPLIANCE</span></div>
          <h2 style="font-size:20px;font-weight:700;color:#0f2a1e;margin:0 0 8px;">Your one-time password</h2>
          <p style="color:#57636d;font-size:14px;margin:0 0 28px;">Accessing <strong>${deptName}</strong> compliance dashboard</p>
          <div style="background:#f4f6f8;border-radius:8px;padding:28px;text-align:center;margin-bottom:24px;">
            <span style="font-size:38px;font-weight:700;letter-spacing:14px;color:#0f2a1e;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#8a929a;font-size:12px;margin:0 0 4px;">Expires in <strong>10 minutes</strong>. Do not share this code.</p>
          <p style="color:#c0c8d0;font-size:11px;margin:0;">If you did not request this, please ignore this email.</p>
        </div>`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('request-otp error:', err);
    return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
}
