import { kv } from '@vercel/kv';

// GET  /api/auth/manage-emails?dept=hr           → { emails: [...] }
// POST /api/auth/manage-emails                   → { dept, emails: [...] } → saves to KV
// DELETE /api/auth/manage-emails?dept=hr&email=x → removes one email

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    const { dept } = req.query;
    if (!dept) return res.status(400).json({ error: 'dept required' });
    const emails = (await kv.get(`dept-emails:${dept}`)) || [];
    return res.status(200).json({ emails });
  }

  if (req.method === 'POST') {
    const { dept, emails } = req.body || {};
    if (!dept || !Array.isArray(emails)) {
      return res.status(400).json({ error: 'dept and emails array required' });
    }
    const cleaned = [...new Set(emails.map(e => e.toLowerCase().trim()).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)))];
    await kv.set(`dept-emails:${dept}`, cleaned);
    return res.status(200).json({ success: true, emails: cleaned });
  }

  if (req.method === 'DELETE') {
    const { dept, email } = req.query;
    if (!dept || !email) return res.status(400).json({ error: 'dept and email required' });
    const emails = (await kv.get(`dept-emails:${dept}`)) || [];
    const updated = emails.filter(e => e.toLowerCase() !== email.toLowerCase().trim());
    await kv.set(`dept-emails:${dept}`, updated);
    return res.status(200).json({ success: true, emails: updated });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
