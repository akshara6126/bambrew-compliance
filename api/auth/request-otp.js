import { kv } from '@vercel/kv';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const DEPT_NAMES = {
  cs: 'Company Secretary', legal: 'Legal', hr: 'HR', finance: 'Finance',
  marketing: 'Marketing', operations: 'Operations', supply: 'Supply Chain',
  design: 'Design', rnd: 'R&D', sales: 'Sales',
};

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

    // Check authorized emails for this dept
    const authorizedEmails = (await kv.get(`dept-emails:${dept}`)) || [];
    const isAuthorized = authorizedEmails.map(e => e.toLowerCase()).includes(emailLower);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'This email is not authorized for this department. Contact your manager.' });
    }

    // Rate limit: max 3 OTP requests per email/dept per 10 minutes
    const rateLimitKey = `otp-rate:${emailLower}:${dept}`;
    const attempts = (await kv.get(rateLimitKey)) || 0;
    if (attempts >= 3) {
      return res.status(429).json({ error: 'Too many requests. Please wait 10 minutes before trying again.' });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Store OTP (10-min TTL) and increment rate counter
    await Promise.all([
      kv.set(`otp:${emailLower}:${dept}`, otp, { ex: 600 }),
      kv.set(rateLimitKey, attempts + 1, { ex: 600 }),
    ]);

    const deptName = DEPT_NAMES[dept] || dept;
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    await resend.emails.send({
      from: `Bambrew Compliance <${fromEmail}>`,
      to: emailLower,
      subject: `${otp} is your Bambrew Compliance OTP`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:460px;margin:0 auto;padding:40px 28px;background:#fff;border:1px solid #e6e8eb;border-radius:8px;">
          <div style="margin-bottom:28px;">
            <span style="background:#0f2a1e;color:#fff;padding:5px 12px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.8px;">BAMBREW COMPLIANCE</span>
          </div>
          <h2 style="font-size:20px;font-weight:700;color:#0f2a1e;margin:0 0 8px 0;">Your one-time password</h2>
          <p style="color:#57636d;font-size:14px;margin:0 0 28px 0;">Accessing <strong>${deptName}</strong> compliance dashboard</p>
          <div style="background:#f4f6f8;border-radius:8px;padding:28px;text-align:center;margin-bottom:24px;">
            <span style="font-size:38px;font-weight:700;letter-spacing:14px;color:#0f2a1e;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#8a929a;font-size:12px;margin:0 0 4px 0;">Expires in <strong>10 minutes</strong>. Do not share this code.</p>
          <p style="color:#c0c8d0;font-size:11px;margin:0;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('request-otp error:', err);
    return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
}
