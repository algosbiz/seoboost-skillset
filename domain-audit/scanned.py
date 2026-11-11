#!/usr/bin/env python3
"""Maintain the already-scanned domain list and filter new scans against it.

Usage:
  python3 scanned.py build                 # rebuild already-scanned.csv/.txt from sources/*.txt
  python3 scanned.py filter <new_file.txt> # print only domains NOT already scanned, report excluded

Matching is on the normalised host: lowercase, scheme/path/port stripped, leading "www." removed.
Subdomains are kept as their own entries (blog.example.com does not exclude example.com).
"""
import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCES = ROOT / "sources"
LIST_TXT = ROOT / "already-scanned.txt"
LIST_CSV = ROOT / "already-scanned.csv"
HOST_RE = re.compile(r"^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$")


def normalise(raw):
    s = raw.strip().lower()
    if not s or s.startswith("#"):
        return None
    s = re.sub(r"^[a-z]+://", "", s)
    s = s.split("/")[0].split("?")[0].split("#")[0].split(":")[0].strip(".")
    if s.startswith("www."):
        s = s[4:]
    return s


def read_hosts(path):
    good, bad = [], []
    for line in Path(path).read_text(encoding="utf-8", errors="replace").splitlines():
        h = normalise(line)
        if h is None:
            continue
        (good if HOST_RE.match(h) else bad).append(h if HOST_RE.match(h) else line.strip())
    return good, bad


def build():
    entries = {}
    dupes_within, malformed = [], []
    for src in sorted(SOURCES.glob("*.txt")):
        category = src.stem
        hosts, bad = read_hosts(src)
        malformed += [(category, b) for b in bad]
        seen = set()
        for h in hosts:
            if h in seen:
                dupes_within.append((category, h))
                continue
            seen.add(h)
            entries.setdefault(h, []).append(category)
    with LIST_CSV.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["domain", "category"])
        for h in sorted(entries):
            w.writerow([h, ";".join(entries[h])])
    LIST_TXT.write_text("\n".join(sorted(entries)) + "\n")
    cross = {h: c for h, c in entries.items() if len(c) > 1}
    print(f"unique domains: {len(entries)}")
    for cat in sorted({c for cs in entries.values() for c in cs}):
        print(f"  {cat}: {sum(1 for cs in entries.values() if cat in cs)}")
    print(f"duplicates within a file (dropped): {len(dupes_within)}")
    for c, h in dupes_within:
        print(f"  {c}: {h}")
    print(f"domains in more than one category: {len(cross)}")
    for h, c in sorted(cross.items()):
        print(f"  {h}: {';'.join(c)}")
    print(f"malformed lines skipped: {len(malformed)}")
    for c, b in malformed:
        print(f"  {c}: {b!r}")


def filter_new(path):
    scanned = set(LIST_TXT.read_text().split())
    hosts, bad = read_hosts(path)
    fresh, excluded, seen = [], [], set()
    for h in hosts:
        if h in seen:
            continue
        seen.add(h)
        (excluded if h in scanned else fresh).append(h)
    out = Path(path).with_name(Path(path).stem + ".new-only.txt")
    out.write_text("\n".join(fresh) + ("\n" if fresh else ""))
    print(f"input unique: {len(seen)}  already scanned: {len(excluded)}  new: {len(fresh)}  malformed: {len(bad)}")
    print(f"new-only list written to {out}")


if __name__ == "__main__":
    if len(sys.argv) >= 2 and sys.argv[1] == "build":
        build()
    elif len(sys.argv) == 3 and sys.argv[1] == "filter":
        filter_new(sys.argv[2])
    else:
        sys.exit(__doc__)

