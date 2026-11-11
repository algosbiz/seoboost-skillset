#!/usr/bin/env python3
"""Check homepage of each domain for noindex signals. Writes two files next to the input:
  <stem>.noindex-check.csv   full results per domain
  <stem>.noindex-clean.txt   domains with no noindex signal (safe to proceed)

Usage: python3 noindex_check.py <batch.domains.new-only.txt>
"""
import csv
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

WORKERS = 12
TIMEOUT = 15
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")
CHALLENGE = re.compile(r"cf-chl|challenge-platform|<title>\s*Just a moment", re.I)


def get(s, url):
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


def has_noindex(r):
    """Return (noindex: bool, reason: str) from response headers and body."""
    # X-Robots-Tag header
    xrt = r.headers.get("x-robots-tag", "").lower()
    if "noindex" in xrt:
        return True, f"X-Robots-Tag: {xrt}"
    # meta robots in HTML
    try:
        soup = BeautifulSoup(r.text[:50000], "html.parser")
        for meta in soup.find_all("meta", attrs={"name": re.compile(r"^(robots|googlebot)$", re.I)}):
            content = meta.get("content", "").lower()
            if "noindex" in content:
                return True, f'<meta name="{meta.get("name")}" content="{meta.get("content")}">'
    except Exception:
        pass
    return False, ""


def check(domain):
    s = requests.Session()
    s.headers.update({"User-Agent": UA, "Accept": "text/html,*/*"})
    home, err = None, ""
    for base in (f"https://{domain}", f"https://www.{domain}", f"http://{domain}"):
        home, err = get(s, base + "/")
        if home is not None:
            break
    if home is None:
        return {"domain": domain, "status": "unreachable", "noindex": "unknown",
                "http_code": "", "reason": err}
    if home.status_code in (403, 429, 503) or CHALLENGE.search(home.text[:5000]):
        return {"domain": domain, "status": "blocked", "noindex": "unknown",
                "http_code": home.status_code, "reason": f"HTTP {home.status_code}"}
    noindex, reason = has_noindex(home)
    return {"domain": domain, "status": "ok", "noindex": "yes" if noindex else "no",
            "http_code": home.status_code, "reason": reason}


def main(path):
    p = Path(path)
    domains = [d for d in p.read_text().split() if d]
    print(f"checking {len(domains)} domains with {WORKERS} workers...")
    with ThreadPoolExecutor(WORKERS) as ex:
        rows = list(ex.map(check, domains))
    stem = p.name.split(".domains")[0] if ".domains" in p.name else p.stem
    out_csv = p.with_name(f"{stem}.noindex-check.csv")
    with out_csv.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["domain", "status", "noindex", "http_code", "reason"])
        w.writeheader()
        w.writerows(rows)
    # Clean list: exclude confirmed noindex; keep no, unknown (blocked/unreachable = can't confirm = pass)
    clean = [r["domain"] for r in rows if r["noindex"] != "yes"]
    noindex_domains = [r for r in rows if r["noindex"] == "yes"]
    p.with_name(f"{stem}.noindex-clean.txt").write_text("\n".join(clean) + ("\n" if clean else ""))
    print(f"\nresults:")
    for label, val in [("ok - no noindex", sum(1 for r in rows if r["noindex"] == "no")),
                       ("noindex detected", len(noindex_domains)),
                       ("blocked/unreachable (kept)", sum(1 for r in rows if r["noindex"] == "unknown"))]:
        print(f"  {label}: {val}")
    print(f"\nclean domains (safe to proceed): {len(clean)}")
    print(f"written: {out_csv}")
    if noindex_domains:
        print(f"\nexcluded (noindex):")
        for r in noindex_domains:
            print(f"  {r['domain']}  {r['reason']}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
