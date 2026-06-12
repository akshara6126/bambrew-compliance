import { kv } from '@vercel/kv';

// Search queries targeting Indian compliance/regulatory news relevant to Bambrew
const QUERIES = [
  { q: 'MCA ministry corporate affairs circular notification India 2025', dept: 'cs', label: 'MCA' },
  { q: 'GST India notification circular amendment 2025', dept: 'finance', label: 'GST' },
  { q: 'income tax TDS TCS India compliance 2025', dept: 'finance', label: 'Income Tax' },
  { q: 'India labour law PF ESI compliance notification 2025', dept: 'hr', label: 'Labour' },
  { q: 'EPR extended producer responsibility packaging India 2025', dept: 'operations', label: 'EPR' },
  { q: 'BIS standard certification India regulation 2025', dept: 'rnd', label: 'BIS' },
  { q: 'SEBI India compliance regulation notification 2025', dept: 'finance', label: 'SEBI' },
  { q: 'sustainable packaging bamboo India regulation 2025', dept: 'operations', label: 'Packaging' },
  { q: 'India trademark patent IP registration 2025', dept: 'legal', label: 'IP' },
  { q: 'consumer protection ASCI advertising India 2025', dept: 'marketing', label: 'Consumer' },
];

// Keywords that suggest a news item is likely a compliance requirement
const COMPLIANCE_KEYWORDS = [
  'circular', 'notification', 'gazette', 'amendment', 'mandatory', 'penalty',
  'deadline', 'due date', 'prescribed', 'required by', 'comply', 'compliance',
  'last date', 'filing', 'return', 'form', 'schedule', 'section', 'rule',
];

// Simple RSS parser (no external deps)
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const get = (tag) => {
      const r = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const match = r.exec(block);
      return match ? (match[1] || match[2] || '').trim() : '';
    };
    const getAttr = (tag, attr) => {
      const r = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i');
      const match = r.exec(block);
      return match ? match[1].trim() : '';
    };

    const title = get('title').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    const link = get('link') || getAttr('link', 'href');
    const pubDate = get('pubDate');
    const source = get('source').replace(/&amp;/g, '&');

    if (title && link) {
      items.push({ title, link, pubDate, source });
    }
  }
  return items;
}

// Fetch one Google News RSS query
async function fetchQuery({ q, dept, label }) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BambrewBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRSS(xml).map(item => ({ ...item, dept, label }));
  } catch {
    return [];
  }
}

// Deterministic ID from URL
function makeId(url) {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (Math.imul(31, h) + url.charCodeAt(i)) | 0;
  return 'auto-' + Math.abs(h).toString(36);
}

// Is this article likely a compliance requirement?
function isLikelyCompliance(title) {
  const t = title.toLowerCase();
  return COMPLIANCE_KEYWORDS.some(kw => t.includes(kw));
}

export default async function handler(req, res) {
  // Allow GET (cron trigger) and POST (manual refresh from management)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch all queries in parallel
    const allResults = await Promise.all(QUERIES.map(fetchQuery));
    const flat = allResults.flat();

    // Deduplicate by URL
    const seen = new Set();
    const unique = flat.filter(item => {
      if (seen.has(item.link)) return false;
      seen.add(item.link);
      return true;
    });

    // Filter to items published in the last 5 days
    const cutoff = Date.now() - 5 * 24 * 60 * 60 * 1000;
    const recent = unique.filter(item => {
      const d = item.pubDate ? new Date(item.pubDate).getTime() : 0;
      return d > cutoff;
    });

    // Sort by date descending
    recent.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Split into news and likely-compliance items
    const newsItems = [];
    const complianceItems = [];

    for (const item of recent.slice(0, 60)) {
      const id = makeId(item.link);
      const date = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

      if (isLikelyCompliance(item.title)) {
        complianceItems.push({
          id,
          dept: item.dept,
          description: item.title,
          type: 'statutory',
          statutoryRef: item.label,
          url: item.link,
          discoveredOn: date,
        });
      } else {
        newsItems.push({
          id,
          title: item.title,
          url: item.link,
          source: item.source || item.label,
          date,
          significance: `${item.label} update`,
          regulatory: true,
        });
      }
    }

    const payload = {
      news: newsItems.slice(0, 30),
      compliances: complianceItems.slice(0, 20),
      refreshedAt: new Date().toISOString(),
    };

    await kv.set('whats-new-data', payload, { ex: 60 * 60 * 24 * 7 }); // 7-day TTL

    return res.status(200).json({ ok: true, news: newsItems.length, compliances: complianceItems.length });
  } catch (err) {
    console.error('refresh-news error:', err);
    return res.status(500).json({ error: 'Refresh failed.' });
  }
}
