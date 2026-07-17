#!/usr/bin/env python3
"""
Bambrew Compliance Dashboard — News + Auto-Discovered Compliance Refresher
==========================================================================
Fetches Google News for compliance-relevant keywords and rewrites the NEWS
+ AUTO_DISCOVERED_COMPLIANCES arrays in ../index.html.

Same pattern as the grants refresher.
- Reads keywords from keywords.txt
- Uses Google News RSS (no API key)
- Stdlib only (no pip install)
- Detects items as "likely new compliance" via grant-style heuristic
- Auto-categorises into a department by keyword matching
"""

from urllib.parse import urlencode
from urllib.request import urlopen, Request
from urllib.error import URLError
from email.utils import parsedate_to_datetime
import xml.etree.ElementTree as ET
import datetime
import html
import logging
import pathlib
import ssl
import sys

# Some Python installs (macOS) lack a configured CA bundle. Public RSS only, so safe fallback.
_VERIFIED_CTX = ssl.create_default_context()
_UNVERIFIED_CTX = ssl._create_unverified_context()

HERE          = pathlib.Path(__file__).parent.resolve()
DASHBOARD     = (HERE.parent / "index.html").resolve()
KEYWORDS_FILE = HERE / "keywords.txt"
LOG_FILE      = HERE / "refresh.log"

MAX_NEWS_TOTAL          = 12
MAX_AUTO_COMPLIANCES    = 6   # cap auto-detected compliance candidates per run
PER_KEYWORD_MAX         = 2
DAYS_BACK               = 30
REQUEST_TIMEOUT_S       = 15

# Headline-based heuristic: must contain BOTH a compliance-trigger token AND a relevance token.
COMPLIANCE_TOKENS = [
    "rule", "regulation", "notification", "amendment", "compliance",
    "act", "policy", "guideline", "standard", "circular", "directive",
    "deadline", "mandatory", "registration", "license", "certification",
]
RELEVANCE_TOKENS = [
    "plastic", "compost", "biodegrad", "biopolymer", "bioplastic",
    "packaging", "epr", "pwm", "fssai", "food", "gst", "tds",
    "labour", "labor", "pf ", "esi", "posh", "factory", "manufactur",
    "pollution", "cpcb", "moefcc", "dgft", "customs", "brsr", "csr",
    "companies act", "msme", "sustainab", "single-use", "single use",
]

# Map keyword fragments to a department id
DEPT_HINTS = {
    'cs':         ["companies act", "roc", "agm", "board meeting", "mgt-7", "aoc-4", "dir-3", "udyam", "msme", "company secretary"],
    'finance':    ["gst", "tds", "tcs", "income tax", "advance tax", "tax audit", "transfer pricing", "brsr", "csr"],
    'hr':         ["labour code", "labor code", "pf", "esi", "posh", "gratuity", "professional tax", "welfare fund", "minimum wage"],
    'operations': ["plastic waste", "pwm", "epr", "compost", "biopolymer", "bioplastic", "factory", "pollution", "cpcb", "fssai", "food contact"],
    'supply':     ["customs", "dgft", "iec", "import", "export", "plexconcil", "e-way bill", "e-invoic"],
    'marketing':  ["dpdp", "asci", "advertis", "influencer", "trademark", "copyright"],
    'design':     ["designs act", "design ip"],
    'rnd':        ["patent", "dsir", "section 35", "r&d", "birac"],
    'sales':      ["e-invoic", "tcs", "sales tax"],
    'legal':      ["trademark", "litigation", "contract"],
}

logging.basicConfig(filename=str(LOG_FILE), level=logging.INFO,
                    format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("compliance-refresher")

def fetch_keyword(kw):
    url = "https://news.google.com/rss/search?" + urlencode({
        "q": kw, "hl": "en-IN", "gl": "IN", "ceid": "IN:en"
    })
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 BambrewComplianceRefresher"})
    data = None
    for ctx in (_VERIFIED_CTX, _UNVERIFIED_CTX):
        try:
            data = urlopen(req, timeout=REQUEST_TIMEOUT_S, context=ctx).read()
            break
        except URLError as e:
            if "CERTIFICATE_VERIFY_FAILED" in str(e): continue
            log.warning("Fetch failed for %r: %s", kw, e); return []
        except Exception as e:
            log.warning("Fetch failed for %r: %s", kw, e); return []
    if data is None: return []
    try:
        root = ET.fromstring(data)
    except ET.ParseError as e:
        log.warning("Parse failed for %r: %s", kw, e); return []
    items = []
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    for item in root.findall(".//item"):
        title_raw = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        pub_raw = (item.findtext("pubDate") or "").strip()
        source_el = item.find("source")
        source = source_el.text.strip() if (source_el is not None and source_el.text) else ""
        if " - " in title_raw and not source:
            title, trailing = title_raw.rsplit(" - ", 1)
            source = trailing
        else:
            title = title_raw
        title = html.unescape(title).strip()
        source = html.unescape(source).strip() or "Google News"
        try:
            dt = parsedate_to_datetime(pub_raw) if pub_raw else None
        except Exception:
            dt = None
        if not dt: continue
        if (now_utc - dt).days > DAYS_BACK: continue
        items.append({
            "date": dt.strftime("%Y-%m-%d"),
            "title": title,
            "url": link,
            "source": source,
            "matched_kw": kw,
            "_dt": dt,
        })
    return items

def _norm_title(t):
    base = t.rsplit(" - ", 1)[0] if " - " in t else t
    return " ".join(base.lower().split())

def dedupe(items):
    seen_urls, seen_titles, out = set(), set(), []
    for it in items:
        nt = _norm_title(it["title"])
        if it["url"] in seen_urls or nt in seen_titles: continue
        seen_urls.add(it["url"]); seen_titles.add(nt); out.append(it)
    return out

def is_likely_compliance(title):
    t = title.lower()
    return (any(g in t for g in COMPLIANCE_TOKENS) and
            any(r in t for r in RELEVANCE_TOKENS))

def guess_dept(title, matched_kw):
    text = (title + " " + matched_kw).lower()
    for dept_id, hints in DEPT_HINTS.items():
        if any(h in text for h in hints):
            return dept_id
    return 'cs'   # default to CS if uncertain

def js_str(s):
    if s is None: return ""
    return (s.replace("\\", "\\\\").replace("'", "\\'")
              .replace("\n", " ").replace("\r", " ").strip())

def to_news_js(items):
    now_iso = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    today_iso = datetime.datetime.now().strftime("%Y-%m-%d")

    lines = [f"const LAST_REFRESH = '{now_iso}';", "let NEWS = ["]
    for it in items[:MAX_NEWS_TOTAL]:
        lines.append(
            "  { date: '"     + js_str(it["date"])   + "', "
            "title: '"        + js_str(it["title"])  + "', "
            "significance: 'Matched keyword: " + js_str(it.get("matched_kw","")) + "', "
            "source: '"       + js_str(it["source"]) + "', "
            "url: '"          + js_str(it["url"])    + "', "
            "regulatory: "    + ("true" if is_likely_compliance(it["title"]) else "false") + " },"
        )
    lines.append("];")

    lines.append("let AUTO_DISCOVERED_COMPLIANCES = [")
    auto_count = 0
    for it in items:
        if not is_likely_compliance(it["title"]): continue
        slug = "auto-" + str(abs(hash(it["url"])) % (10**8))
        dept = guess_dept(it["title"], it.get("matched_kw", ""))
        lines.append(
            "  { id: '"             + slug                            + "', "
            "dept: '"               + dept                            + "', "
            "type: 'statutory', "
            "description: '"        + js_str(it["title"])             + "', "
            "statutoryRef: '"       + js_str(it.get("source",""))     + "', "
            "frequency: 'Event-based', dueDateFor: 'See source', "
            "dueDates: 'See source', processOwner: 'See source', "
            "currentPOC: 'See source', function: 'Auto-discovered', "
            "url: '"                + js_str(it["url"])               + "', "
            "discoveredOn: '"       + today_iso                       + "', "
            "autoDiscovered: true },"
        )
        auto_count += 1
        if auto_count >= MAX_AUTO_COMPLIANCES: break
    lines.append("];")
    return "\n".join(lines)

def update_dashboard(news_js):
    text = DASHBOARD.read_text(encoding="utf-8")
    start_m = "// __NEWS_START__"
    end_m   = "// __NEWS_END__"
    if start_m not in text or end_m not in text:
        log.error("Sentinels missing — aborting"); return False
    start = text.index(start_m) + len(start_m)
    end   = text.index(end_m)
    new_text = text[:start] + "\n" + news_js + "\n" + text[end:]
    backup = DASHBOARD.with_suffix(".html.bak")
    backup.write_text(text, encoding="utf-8")
    DASHBOARD.write_text(new_text, encoding="utf-8")
    return True

def main():
    log.info("=== Compliance refresh start ===")
    if not DASHBOARD.exists():
        log.error("Dashboard not found"); sys.exit(1)
    if not KEYWORDS_FILE.exists():
        log.error("keywords.txt missing"); sys.exit(1)

    keywords = [l.strip() for l in KEYWORDS_FILE.read_text(encoding="utf-8").splitlines()
                if l.strip() and not l.strip().startswith("#")]
    log.info("Loaded %d keywords", len(keywords))

    all_items = []
    for kw in keywords:
        items = fetch_keyword(kw)[:PER_KEYWORD_MAX]
        log.info("  %r -> %d items", kw, len(items))
        all_items.extend(items)
    all_items = dedupe(all_items)
    all_items.sort(key=lambda x: x["_dt"] or datetime.datetime.min.replace(tzinfo=datetime.timezone.utc), reverse=True)
    kept = min(len(all_items), MAX_NEWS_TOTAL)
    log.info("Total after dedupe: %d; keeping top %d", len(all_items), kept)

    if not all_items:
        log.warning("Zero items fetched — leaving dashboard untouched")
        print("WARN · zero items fetched"); sys.exit(0)

    if update_dashboard(to_news_js(all_items)):
        print(f"OK · {kept} news items + auto-discovered compliances written")
        log.info("=== Compliance refresh done (OK) ===\n")
    else:
        print("ERR · dashboard rewrite failed"); sys.exit(1)

if __name__ == "__main__":
    main()
