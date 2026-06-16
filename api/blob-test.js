export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return res.status(200).json({
      ok: false,
      reason: 'BLOB_READ_WRITE_TOKEN is not set. Go to Vercel project → Storage → connect a Blob store.',
    });
  }
  return res.status(200).json({ ok: true, tokenPrefix: token.slice(0, 12) + '…' });
}
