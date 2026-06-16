import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { compId, name, type, size, data } = req.body || {};
    if (!compId || !name || !data) return res.status(400).json({ error: 'compId, name, and data are required' });
    if (size > 4 * 1024 * 1024) return res.status(400).json({ error: 'File too large (max 4 MB)' });

    const safeName = name.replace(/[^a-zA-Z0-9._\- ]/g, '_');
    const blobPath = `compliance-docs/${compId}/${Date.now()}-${safeName}`;

    const buffer = Buffer.from(data, 'base64');
    const blob = await put(blobPath, buffer, {
      access: 'public',
      contentType: type || 'application/octet-stream',
    });

    const meta = { name, url: blob.url, size: size || buffer.byteLength, uploadedAt: new Date().toISOString() };

    const existing = (await kv.get(`docs:${compId}`)) || [];
    existing.push(meta);
    await kv.set(`docs:${compId}`, existing);

    return res.status(200).json({ success: true, file: meta });
  } catch (err) {
    console.error('upload error:', err);
    return res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
}
