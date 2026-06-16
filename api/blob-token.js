import { handleUpload } from '@vercel/blob';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const response = await handleUpload({
      body: req.body,
      request: req,
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const { compId, name } = JSON.parse(tokenPayload || '{}');
          if (!compId) return;
          const meta = {
            name: name || blob.pathname.split('/').pop(),
            url: blob.url,
            size: blob.size,
            uploadedAt: new Date().toISOString(),
          };
          const existing = (await kv.get(`docs:${compId}`)) || [];
          existing.push(meta);
          await kv.set(`docs:${compId}`, existing);
        } catch (err) {
          console.error('blob-token callback error:', err);
        }
      },
    });
    return res.json(response);
  } catch (err) {
    console.error('blob-token error:', err);
    return res.status(400).json({ error: err.message });
  }
}
