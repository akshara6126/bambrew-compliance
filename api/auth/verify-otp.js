import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, dept, otp } = req.body || {};
    if (!email || !dept || !otp) return res.status(400).json({ error: 'Email, department, and OTP are required.' });

    const emailLower = email.toLowerCase().trim();
    const kvKey = `otp:${emailLower}:${dept}`;
    const storedOtp = await kv.get(kvKey);

    if (!storedOtp) return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    if (String(otp).trim() !== String(storedOtp)) return res.status(400).json({ error: 'Incorrect OTP. Please check the code and try again.' });

    await kv.del(kvKey);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
}
