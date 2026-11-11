#!/usr/bin/env python3
"""Free gate before Ahrefs: a listing-traffic floor, then a real-site link check.

Usage: python3 linkcheck.py <batch.domains.new-only.txt> [batch.listing.csv]
Run it after scanned.py filter and before any Ahrefs call. Writes next to the input:
  <batch>.linkcheck.csv     per-domain evidence
  <batch>.ahrefs-queue.txt  domains allowed into the Ahrefs scan (verdicts other than nofollow and
                            listing_low_traffic)

Floor: with the listing given, a domain whose listed Ahrefs traffic is under MIN_LISTING_TRAFFIC is
skipped without any fetch (verdict listing_low_traffic). A missing traffic number is not skipped.
Measured on the travel, food and construction audits (910 Ahrefs scans, 84 shortlisted): a floor of
300 would have skipped 199 scans and lost 2 shortlisted sites. The position of a record in the
export predicted nothing, so there is no position cut.

Per domain it finds up to POSTS recent articles (WordPress REST, then RSS, then sitemap, then
homepage links), fetches them, and reads the rel attribute of every external link inside the
article body. Share buttons, social profiles and affiliate-network banners are ignored. A page-level
<meta name="robots" content="nofollow"> counts every link on that page as nofollow.

Verdicts:
  listing_low_traffic  listed Ahrefs traffic under the floor; dropped before Ahrefs, not fetched
  nofollow    no followed external link in any checked article; dropped before Ahrefs
  dofollow    at least 80% of external body links are followed
  mixed       some followed, some not; passes, flagged
  no_links    site loads but no external body links found; passes, unverified
  blocked     403/429/503 or bot challenge; passes, unverified
  unreachable no response; passes, unverified (a failed fetch is not evidence of nofollow)
What it cannot see: the rel a seller will put on a paid link. Check the live link after placement.
"""
import csv
import re
import sys
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urljoin, urlparse

import warnings

import requests
from bs4 import BeautifulSoup, XMLParsedAsHTMLWarning

warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

POSTS, TIMEOUT, WORKERS = 4, 15, 12
MIN_LISTING_TRAFFIC = 300
DROPPED = ("listing_low_traffic", "nofollow")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")
NOT_FOLLOWED = {"nofollow", "sponsored", "ugc"}
SOCIAL = re.compile(r"(^|\.)(facebook|fb|twitter|x|pinterest|linkedin|instagram|youtube|youtu|tiktok|"
                    r"whatsapp|reddit|telegram|t|tumblr|threads|flipboard|wa)\.(com|me|net|be|org)$")
SHARE = re.compile(r"share|sharer|intent/tweet|pin/create|sharearticle", re.I)
# the site's own affiliate banners, not guest links: their rel says nothing about a paid placement
AFFILIATE = re.compile(r"(^|\.)(awin1\.com|shareasale\.com|amzn\.to|go\.skimresources\.com|click\.linksynergy\.com|"
                       r"anrdoezrs\.net|jdoqocy\.com|tkqlhce\.com|dpbolvw\.net|kqzyfj\.com|prf\.hn|pjtra\.com|"
                       r"pntra\.com|avantlink\.com|tradedoubler\.com|clkuk\.tradedoubler\.com)$")
BODY_SELECTORS = ["article", "[class*=entry-content]", "[class*=post-content]", "[class*=article-body]",
                  "[class*=article-content]", "[itemprop=articleBody]", "main"]
SKIP_PATH = re.compile(r"/(category|tag|author|page|wp-content|wp-admin|feed|search|login|cart|shop|product)s?(/|$)"
                       r"|/(about|about-us|contact|contact-us|privacy|privacy-policy|cookie-policy|cookies|terms|"
                       r"terms-and-conditions|terms-of-service|disclaimer|data-processing-agreement|dmca|"
                       r"write-for-us)/?$|\.xml$", re.I)
# bot-challenge pages only; a bare "captcha" also matches ordinary reCAPTCHA scripts on normal pages
CHALLENGE = re.compile(r"cf-chl|challenge-platform|<title>\s*Just a moment", re.I)


def host_of(url):
    h = (urlparse(url).hostname or "").lower()
    return h[4:] if h.startswith("www.") else h


def same_site(h, site):
    return h == site or h.endswith("." + site) or site.endswith("." + h)


def get(s, url):
    """Follow redirects by hand, upgrading http:// targets to https://: plain http cannot leave the
    cloud container (only the HTTPS proxy is available), and most sites answer on both."""
    try:
        for _ in range(6):
            r = s.get(url, timeout=TIMEOUT, allow_redirects=False)
            loc = r.headers.get("location")
            if not (r.is_redirect and loc):
                return r, None
            url = urljoin(url, loc)
            if url.startswith("http://"):
                url = "https://" + url[len("http://"):]
        return None, "TooManyRedirects"
    except requests.RequestException as e:
        return None, type(e).__name__


def classify_links(html, site):
    """Return (followed, nofollow, sponsored, ugc, page_nofollow) for external links in the article body."""
    soup = BeautifulSoup(html, "html.parser")
    robots = " ".join(m.get("content", "") for m in soup.find_all("meta", attrs={"name": re.compile("^robots$", re.I)}))
    page_nofollow = "nofollow" in robots.lower()
    root = next((soup.select_one(sel) for sel in BODY_SELECTORS if soup.select_one(sel)), None)
    if root is None:
        root = soup.body or soup
        for tag in root.find_all(["header", "nav", "footer", "aside"]):
            tag.decompose()
    counts = {"followed": 0, "not_followed": 0, "nofollow": 0, "sponsored": 0, "ugc": 0}
    for a in root.find_all("a", href=True):
        href = a["href"].strip()
        if not href.startswith(("http://", "https://")) or SHARE.search(href):
            continue
        h = host_of(href)
        if not h or same_site(h, site) or SOCIAL.search(h) or AFFILIATE.search(h):
            continue
        rel = {t.lower() for t in (a.get("rel") or [])}
        hit = rel & NOT_FOLLOWED
        if page_nofollow and not hit:
            hit = {"nofollow"}
        counts["not_followed" if hit else "followed"] += 1
        for t in hit:
            counts[t] += 1  # rel="nofollow sponsored" tallies both tokens but is one not_followed link
    return counts, page_nofollow


def article_urls(s, base, site):
    urls = []
    r, _ = get(s, base + "/wp-json/wp/v2/posts?per_page=%d&_fields=link" % POSTS)
    if r is not None and r.ok and r.headers.get("content-type", "").startswith("application/json"):
        try:
            urls = [p["link"] for p in r.json() if isinstance(p, dict) and p.get("link")]
        except ValueError:
            urls = []
    if not urls:
        for path in ("/feed/", "/rss", "/sitemap.xml", "/post-sitemap.xml", "/sitemap_index.xml"):
            kind, locs = xml_locs(s, base + path)
            if kind == "sitemapindex":  # follow one child sitemap, preferring the posts one
                child = next((u for u in locs if "post" in u.lower()), locs[0] if locs else None)
                kind, locs = xml_locs(s, child) if child else ("", [])
            locs = [u for u in locs if same_site(host_of(u), site) and urlparse(u).path.strip("/")
                    and not SKIP_PATH.search(urlparse(u).path)]
            if locs:
                urls = locs[-POSTS:] if kind == "urlset" else locs[:POSTS]
                break
    return list(dict.fromkeys(urls))[:POSTS]


def xml_locs(s, url):
    """Return (root tag, link or loc texts) of a feed or sitemap, or ("", []) when it is not XML."""
    r, _ = get(s, url)
    if r is None or not r.ok or b"<" not in r.content[:200]:
        return "", []
    try:
        tree = ET.fromstring(r.content)
    except ET.ParseError:
        return "", []
    locs = [e.text.strip() for e in tree.iter() if e.tag.split("}")[-1] in ("link", "loc") and e.text]
    return tree.tag.split("}")[-1], locs


def homepage_articles(html, base, site):
    soup = BeautifulSoup(html, "html.parser")
    out = []
    for a in soup.find_all("a", href=True):
        u = urljoin(base + "/", a["href"]).split("#")[0]
        p = urlparse(u).path
        if same_site(host_of(u), site) and "-" in p and not SKIP_PATH.search(p) and u not in out:
            out.append(u)
    return out[:POSTS]


def blank_row(site, listing_link, listing_traffic):
    return {"domain": site, "listing_link_type": listing_link, "listing_traffic": listing_traffic,
            "verdict": "", "posts_checked": 0, "ext_links": 0, "followed": 0, "not_followed": 0,
            "nofollow": 0, "sponsored": 0, "ugc": 0, "page_meta_nofollow": 0, "note": "", "pages": ""}


def listed_traffic(v):
    try:
        return float(str(v).replace(",", ""))
    except ValueError:
        return None


def check(site, listing_link, listing_traffic=""):
    row = blank_row(site, listing_link, listing_traffic)
    t = listed_traffic(listing_traffic)
    if t is not None and t < MIN_LISTING_TRAFFIC:
        row.update(verdict="listing_low_traffic", note=f"listing Ahrefs traffic {int(t)} < {MIN_LISTING_TRAFFIC}")
        return row
    s = requests.Session()
    s.headers.update({"User-Agent": UA, "Accept": "text/html,application/xhtml+xml,application/json,*/*"})
    home, err = None, ""
    for base in ("https://" + site, "https://www." + site, "http://" + site):
        home, err = get(s, base + "/")
        if home is not None:
            break
    if home is None:
        row.update(verdict="unreachable", note=err)
        return row
    if home.status_code in (403, 429, 503) or CHALLENGE.search(home.text[:5000]):
        row.update(verdict="blocked", note=f"HTTP {home.status_code}")
        return row
    final = urlparse(home.url)
    base = f"{final.scheme}://{final.netloc}"
    host = host_of(base)  # hostname only, so a redirect to www. or a port never breaks same-site tests
    urls = article_urls(s, base, host) or homepage_articles(home.text, base, host)
    checked = []
    for u in urls:
        r, _ = get(s, u)
        if r is None or not r.ok or "html" not in r.headers.get("content-type", "html"):
            continue
        c, page_nf = classify_links(r.text, host)
        for k, v in c.items():
            row[k] += v
        row["page_meta_nofollow"] += int(page_nf)
        checked.append(u)
    row["posts_checked"] = len(checked)
    row["pages"] = " ".join(checked)
    total = row["ext_links"] = row["followed"] + row["not_followed"]
    if not checked:
        row.update(verdict="no_links", note="no article pages found")
    elif total == 0:
        row.update(verdict="no_links", note="no external links in article bodies")
    elif row["followed"] == 0:
        row["verdict"] = "nofollow"
    elif row["followed"] / total >= 0.8:
        row["verdict"] = "dofollow"
    else:
        row["verdict"] = "mixed"
    if listing_link and row["verdict"] in ("dofollow", "nofollow"):
        says_do = listing_link == "Dofollow"
        if says_do != (row["verdict"] == "dofollow"):
            row["note"] = (row["note"] + "; " if row["note"] else "") + f"listing says {listing_link}"
    return row


def main(domains_file, listing=None):
    p = Path(domains_file)
    domains = [d for d in p.read_text().split() if d]
    lst = {}
    if listing:
        lst = {r["domain"]: r for r in csv.DictReader(open(listing))}
    with ThreadPoolExecutor(WORKERS) as ex:
        rows = list(ex.map(lambda d: check(d, lst.get(d, {}).get("link_type", ""),
                                           lst.get(d, {}).get("ahrefs_traffic", "")), domains))
    stem = p.name.split(".domains")[0] if ".domains" in p.name else p.stem
    out = p.with_name(f"{stem}.linkcheck.csv")
    with out.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    queue = [r["domain"] for r in rows if r["verdict"] not in DROPPED]
    p.with_name(f"{stem}.ahrefs-queue.txt").write_text("\n".join(queue) + ("\n" if queue else ""))
    print(f"checked: {len(rows)}" + ("" if listing else "  (no listing given: traffic floor not applied)"))
    for v in ("listing_low_traffic", "dofollow", "mixed", "nofollow", "no_links", "blocked", "unreachable"):
        print(f"  {v}: {sum(1 for r in rows if r['verdict'] == v)}")
    print(f"into Ahrefs queue: {len(queue)}  dropped: {len(rows) - len(queue)}")
    print(f"written: {out}")


if __name__ == "__main__":
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    main(*sys.argv[1:])

