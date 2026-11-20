// /api/mail-relay — lets the Bambrew Grants dashboard send its reminder emails
// through this project's existing Gmail account (bambrewcompliance@gmail.com),
// so the Gmail app password lives in one place only.
//
// POST { to: [...], subject, html, fromName }
// Header: Authorization: Bearer <MAIL_RELAY_SECRET>
// Only @bambrew.in recipients are allowed, so a leaked secret can't be used to spam outsiders.

import nodemailer from 'nodemailer';
import { timingSafeEqual } from 'node:crypto';

const ALLOWED_DOMAIN = '@bambrew.in';

function authorized(req) {
  const secret = process.env.MAIL_RELAY_SECRET || '';
  const got = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (secret.length < 32 || got.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(secret));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { to, subject, html, fromName } = req.body || {};
  const recipients = [...new Set((Array.isArray(to) ? to : [to]).map(e => String(e || '').toLowerCase().trim()))].filter(Boolean);
  if (!recipients.length || !subject || !html) return res.status(400).json({ error: 'to, subject and html are required' });
  if (recipients.length > 10 || recipients.some(e => !e.endsWith(ALLOWED_DOMAIN))) {
    return res.status(400).json({ error: `Only up to 10 ${ALLOWED_DOMAIN} recipients are allowed` });
  }
  if (String(html).length > 300_000) return res.status(413).json({ error: 'Email too large' });

  try {
    const name = String(fromName || 'Bambrew').replace(/[<>"\r\n]/g, '').slice(0, 60);
    await nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    }).sendMail({
      from: `${name} <${process.env.GMAIL_USER}>`,
      to: recipients.join(', '),
      subject: String(subject).replace(/[\r\n]/g, ' ').slice(0, 200),
      html,
    });
    return res.status(200).json({ ok: true, sent: recipients.length });
  } catch (err) {
    console.error('mail-relay error:', err);
    return res.status(500).json({ error: err.message });
  }
}
