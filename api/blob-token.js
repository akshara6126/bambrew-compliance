import { handleUpload } from '@vercel/blob';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const response = await handleUpload({
      body: req.body,
      request: req,
      onUploadCompleted: async ({ blob }) => {
        try {
          // compId is encoded as the second path segment: compliance-docs/{compId}/...
          const parts = blob.pathname.split('/');
          const compId = parts[1];
          const rawName = parts.slice(2).join('/');
          // strip leading timestamp prefix (e.g. "1718000000000-filename.pdf" → "filename.pdf")
          const name = rawName.replace(/^\d+-/, '');
          if (!compId) return;
          const meta = { name, url: blob.url, size: blob.size, uploadedAt: new Date().toISOString() };
          const existing = (await kv.get(`docs:${compId}`)) || [];
          existing.push(meta);
          await kv.set(`docs:${compId}`, existing);
        } catch (err) {
          console.error('blob upload-completed callback error:', err);
        }
      },
    });
    return res.json(response);
  } catch (err) {
    console.error('blob-token error:', err);
    return res.status(500).json({ error: err.message });
  }
}
