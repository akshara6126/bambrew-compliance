import { kv } from '@vercel/kv';

const DEPT_NAMES = {
  cs: 'Company Secretary', legal: 'Legal', hr: 'HR', finance: 'Finance',
  marketing: 'Marketing', operations: 'Operations', supply: 'Supply Chain',
  design: 'Design', rnd: 'R&D', sales: 'Sales',
};

async function sendEmail({ to, subject, html }) {
  // Email provider not yet configured — log OTP to Vercel function logs for now
  console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
  console.log(`[EMAIL BODY] ${html.replace(/<[^>]+>/g, '').trim()}`);
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

    // Check authorized emails for this dept
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
        subject: `Unauthorized access attempt on ${deptName}`,
        html: `<p>Unauthorized attempt on <b>${deptName}</b> by <b>${emailLower}</b> at ${now} IST.</p>`,
      }).catch(() => {});
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

    await Promise.all([
      kv.set(`otp:${emailLower}:${dept}`, otp, { ex: 600 }),
      kv.set(rateLimitKey, attempts + 1, { ex: 600 }),
    ]);

    const deptName = DEPT_NAMES[dept] || dept;
    await sendEmail({
      to: emailLower,
      subject: `${otp} is your Bambrew Compliance OTP`,
      html: `<p>Your OTP for <b>${deptName}</b>: <b>${otp}</b>. Expires in 10 minutes.</p>`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('request-otp error:', err);
    return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
}
