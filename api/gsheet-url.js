import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // GET — return all dept configs
  if (req.method === 'GET') {
    try {
      const deptIds = [
        '__management__',
        'cs', 'legal', 'hr', 'finance', 'marketing',
        'operations', 'supply', 'design', 'rnd', 'sales',
      ];
      const entries = await Promise.all(
        deptIds.map(id =>
          kv.get(`gsheet-config:${id}`)
            .then(v => [id, v || {}])
            .catch(() => [id, {}])
        )
      );
      return res.status(200).json(Object.fromEntries(entries));
    } catch (err) {
      console.error('gsheet-url GET error:', err);
      return res.status(500).json({ error: 'Failed to load config.' });
    }
  }

  // POST — save config for one dept
  if (req.method === 'POST') {
    try {
      const { dept, link, webhook } = req.body || {};
      if (!dept) return res.status(400).json({ error: 'dept required' });
      await kv.set(`gsheet-config:${dept}`, { link: link || '', webhook: webhook || '' });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('gsheet-url POST error:', err);
      return res.status(500).json({ error: 'Failed to save config.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
