import { kv } from '@vercel/kv';

// Search queries — Bambrew-specific: bamboo, plastic regulation, sustainability, standard compliance areas
const QUERIES = [
  // Core regulatory bodies
  { q: 'MCA ministry corporate affairs circular notification India', dept: 'cs',         label: 'MCA' },
  { q: 'GST India notification circular amendment',                  dept: 'finance',     label: 'GST' },
  { q: 'income tax TDS TCS India compliance notification',           dept: 'finance',     label: 'Income Tax' },
  { q: 'SEBI India compliance regulation notification',              dept: 'finance',     label: 'SEBI' },
  { q: 'India labour law PF ESI wages compliance notification',      dept: 'hr',          label: 'Labour' },
  { q: 'India trademark patent intellectual property regulation',    dept: 'legal',       label: 'IP/Legal' },
  { q: 'consumer protection ASCI advertising India regulation',      dept: 'marketing',   label: 'Consumer' },

  // Plastic & packaging — core to Bambrew's market
  { q: 'single use plastic ban India CPCB regulation',              dept: 'operations',  label: 'Plastic Ban' },
  { q: 'Plastic Waste Management Rules India amendment',             dept: 'operations',  label: 'Plastic Waste' },
  { q: 'EPR extended producer responsibility packaging India',       dept: 'operations',  label: 'EPR' },
  { q: 'biodegradable compostable packaging India regulation',       dept: 'operations',  label: 'Biodegradable Packaging' },
  { q: 'plastic alternatives regulation India policy',               dept: 'operations',  label: 'Plastic Alternatives' },

  // Bamboo & sustainability
  { q: 'bamboo regulation policy India NMBA mission',               dept: 'operations',  label: 'Bamboo Policy' },
  { q: 'bamboo products standard BIS certification India',          dept: 'rnd',         label: 'Bamboo BIS' },
  { q: 'bamboo forest conservation cultivation India',              dept: 'legal',       label: 'Bamboo Forest' },
  { q: 'sustainable packaging regulation India green',              dept: 'operations',  label: 'Sustainable Packaging' },
  { q: 'FSC forest certification India sustainable',                dept: 'rnd',         label: 'FSC/Certification' },

  // ESG & sustainability reporting
  { q: 'BRSR business responsibility sustainability reporting India SEBI', dept: 'finance', label: 'ESG/BRSR' },
  { q: 'ESG sustainability disclosure India company',               dept: 'finance',     label: 'ESG' },
  { q: 'carbon footprint disclosure India regulation',              dept: 'operations',  label: 'Carbon/Climate' },
  { q: 'circular economy India policy green procurement',           dept: 'operations',  label: 'Circular Economy' },

  // Environment & product standards
  { q: 'BIS standard certification India product regulation',       dept: 'rnd',         label: 'BIS Standards' },
  { q: 'CPCB MoEFCC environment India compliance notification',     dept: 'operations',  label: 'Environment' },
  { q: 'green product certification ecolabel India',                dept: 'rnd',         label: 'Ecolabel' },
  { q: 'customs import export compliance India notification',       dept: 'supply',      label: 'Trade/Customs' },
];

// Keywords that flag an article as likely a compliance action item
const COMPLIANCE_KEYWORDS = [
  'circular', 'notification', 'gazette', 'amendment', 'mandatory', 'penalty',
  'deadline', 'due date', 'last date', 'prescribed', 'required by', 'comply',
  'compliance', 'filing', 'return', 'form no', 'schedule', 'section', 'rule',
  'ban effective', 'prohibited', 'banned from', 'effective from', 'comes into force',
  'notified', 'gazetted', 'enforced', 'extended', 'applicable from',
];

// Trusted sources only — partial case-insensitive match against source name
const TRUSTED_SOURCES = [
  // Business & financial press
  'economic times', 'business standard', 'mint', 'livemint', 'financial express',
  'hindu businessline', 'businessline', 'moneycontrol', 'ndtv profit', 'cnbctv18',
  'bloomberg', 'reuters', 'hindu', 'times of india', 'india today',
  'bq prime', 'fortune india', 'business today', 'inc42',

  // Regulatory / legal / tax specialists
  'taxmann', 'taxguru', 'cleartax', 'livelaw', 'barandbench', 'manupatra',

  // Environment & sustainability
  'down to earth', 'mongabay', 'climate home', 'eco-business',

  // Government / official
  'pib', 'press information bureau', 'mca.gov', 'sebi.gov', 'cbic.gov',
  'gst.gov', 'moef.gov', 'labour.gov', 'bis.gov', 'cpcb.nic',

  // Wire services
  'pti', 'ani', 'ians',
];

function isTrustedSource(source) {
  if (!source) return false;
  const s = source.toLowerCase();
  return TRUSTED_SOURCES.some(t => s.includes(t));
}

// Simple RSS parser — no external deps
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const get = (tag) => {
      const r = new RegExp(
        `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'
      );
      const match = r.exec(block);
      return match ? (match[1] || match[2] || '').trim() : '';
    };
    const getAttr = (tag, attr) => {
      const r = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i');
      const match = r.exec(block);
      return match ? match[1].trim() : '';
    };

    const decode = s => s
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');

    const title  = decode(get('title'));
    const link   = get('link') || getAttr('link', 'href');
    const pubDate = get('pubDate');
    const source  = decode(get('source'));

    if (title && link) items.push({ title, link, pubDate, source });
  }
  return items;
}

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

function isLikelyCompliance(title) {
  const t = title.toLowerCase();
  return COMPLIANCE_KEYWORDS.some(kw => t.includes(kw));
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const allResults = await Promise.all(QUERIES.map(fetchQuery));
    const flat = allResults.flat();

    // Deduplicate by URL
    const seen = new Set();
    const unique = flat.filter(item => {
      if (seen.has(item.link)) return false;
      seen.add(item.link);
      return true;
    });

    // Filter: trusted sources only + published in last 5 days
    const cutoff = Date.now() - 5 * 24 * 60 * 60 * 1000;
    const filtered = unique.filter(item => {
      const trusted = isTrustedSource(item.source);
      const recent = item.pubDate ? new Date(item.pubDate).getTime() > cutoff : false;
      return trusted && recent;
    });

    filtered.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    const newsItems = [];
    const complianceItems = [];

    for (const item of filtered.slice(0, 80)) {
      const id   = makeId(item.link);
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
          source: item.source,
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

    await kv.set('whats-new-data', payload, { ex: 60 * 60 * 24 * 7 });

    return res.status(200).json({
      ok: true,
      news: newsItems.length,
      compliances: complianceItems.length,
      filtered_out: unique.length - filtered.length,
    });
  } catch (err) {
    console.error('refresh-news error:', err);
    return res.status(500).json({ error: 'Refresh failed.' });
  }
}
