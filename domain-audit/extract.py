#!/usr/bin/env python3
"""Extract domains and listed metrics from a marketplace export (.txt).

Usage: python3 extract.py <raw_export.txt>
Writes <name>.domains.txt and <name>.listing.csv next to the input.

A record starts at the line directly above a lone "🔗" line; that line is the domain.
"""
import csv
import re
import sys
from pathlib import Path

LABELS = {
    "Ahrefs Organic Traffic": "ahrefs_traffic",
    "Semrush Total Traffic": "semrush_traffic",
    "Referral Domains": "ref_domains",
    "Ahrefs DR Range": "dr",
    "Moz DA": "moz_da",
    "Semrush AS (Authority Score)": "semrush_as",
    "Content placement": "price_placement",
    "Writing & Placement": "price_writing",
    "Link attribution type": "link_type",
}
FIELDS = ["domain", *LABELS.values(), "countries"]


def clean_num(s):
    return re.sub(r"[^\d.]", "", s) or s.strip()


def parse(lines):
    starts = [i - 1 for i, l in enumerate(lines) if l.strip() == "🔗" and i > 0]
    records = []
    for n, s in enumerate(starts):
        end = starts[n + 1] if n + 1 < len(starts) else len(lines)
        block = [l.strip() for l in lines[s:end]]
        rec = {"domain": block[0].lower().removeprefix("www.")}
        for j, l in enumerate(block):
            if l in LABELS and j + 1 < len(block):
                v = block[j + 1]
                rec[LABELS[l]] = v if v.startswith(("$", "N/A", "Not")) else clean_num(v)
        if "Country" in block:
            j = block.index("Country") + 1
            countries = []
            while j < len(block) and block[j] != "Semrush Top Country":
                countries.append(block[j])
                j += 1
            rec["countries"] = ";".join(countries)
        records.append(rec)
    return records


def main(path):
    p = Path(path)
    lines = p.read_text(encoding="utf-8", errors="replace").splitlines()
    records = parse(lines)
    stem = p.name.removesuffix(".raw.txt").removesuffix(".txt")
    seen, uniq = set(), []
    for r in records:
        if r["domain"] not in seen:
            seen.add(r["domain"])
            uniq.append(r)
    (p.parent / f"{stem}.domains.txt").write_text("\n".join(r["domain"] for r in uniq) + "\n")
    with (p.parent / f"{stem}.listing.csv").open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        for r in uniq:
            w.writerow({k: r.get(k, "") for k in FIELDS})
    print(f"records: {len(records)}  unique domains: {len(uniq)}  duplicates: {len(records) - len(uniq)}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])

