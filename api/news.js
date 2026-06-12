import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // GET — return stored news (already filtered of dismissed)
  if (req.method === 'GET') {
    try {
      const data = await kv.get('whats-new-data');
      if (!data) return res.status(200).json({ news: [], compliances: [], refreshedAt: null });
      return res.status(200).json(data);
    } catch (err) {
      console.error('news GET error:', err);
      return res.status(500).json({ error: 'Failed to load news.' });
    }
  }

  // POST — dismiss a news or compliance item permanently
  if (req.method === 'POST') {
    try {
      const { dismissId } = req.body || {};
      if (!dismissId) return res.status(400).json({ error: 'dismissId required' });

      const [dismissed, data] = await Promise.all([
        kv.get('dismissed-news-ids'),
        kv.get('whats-new-data'),
      ]);

      const dismissedSet = new Set(dismissed || []);
      dismissedSet.add(dismissId);
      await kv.set('dismissed-news-ids', [...dismissedSet]);

      if (data) {
        data.news = (data.news || []).filter(n => n.id !== dismissId);
        data.compliances = (data.compliances || []).filter(c => c.id !== dismissId);
        await kv.set('whats-new-data', data, { ex: 60 * 60 * 24 * 7 });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('news POST error:', err);
      return res.status(500).json({ error: 'Failed to dismiss item.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
