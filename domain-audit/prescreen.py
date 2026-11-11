#!/usr/bin/env python3
"""Free pre-screen of a marketplace batch using only the listing's own metrics (no API calls).

Usage: python3 prescreen.py <batch.listing.csv> <batch.domains.new-only.txt> [name_flags.csv]
Writes <batch>.prescreen.csv next to the listing.

This is a triage ranking, not a verdict. Marketplace numbers are seller-supplied snapshots and
can be stale or wrong; every domain still needs the Ahrefs keyword/top-page audit.
"""
import csv
import sys
from pathlib import Path


def num(v):
    try:
        return float(str(v).replace(",", ""))
    except ValueError:
        return None


def flags_for(r):
    out = []  # (points, reason)
    ah, sem = num(r["ahrefs_traffic"]), num(r["semrush_traffic"])
    rd, dr, da, as_ = num(r["ref_domains"]), num(r["dr"]), num(r["moz_da"]), num(r["semrush_as"])

    if ah and sem:
        ratio = max(ah, sem) / min(ah, sem)
        if ratio >= 10:
            hi = "Semrush" if sem > ah else "Ahrefs"
            out.append((1, f"traffic mismatch: {hi} {ratio:.0f}x the other ({int(ah)} vs {int(sem)})"))
    if dr is not None and rd is not None:
        if dr >= 40 and rd < 300:
            out.append((2, f"DR {int(dr)} from only {int(rd)} referring domains (DR likely inflated)"))
        if rd <= 10:
            out.append((2, f"only {int(rd)} referring domains"))
    if dr is not None and da is not None:
        gap = abs(da - dr)
        if gap >= 35:
            out.append((2, f"DA {int(da)} vs DR {int(dr)} gap {int(gap)} (one metric manipulated)"))
        elif gap >= 25:
            out.append((1, f"DA {int(da)} vs DR {int(dr)} gap {int(gap)}"))
    if ah and ah >= 5000 and ((dr is not None and dr < 15) or (rd is not None and rd < 100)):
        out.append((2, f"{int(ah)} Ahrefs traffic with DR {r['dr']} / {r['ref_domains']} RD (brand-query or fake-volume pattern)"))
    if as_ is not None and dr is not None and as_ <= 10 and dr >= 25:
        out.append((1, f"Semrush AS {int(as_)} vs DR {int(dr)}"))
    if ah is not None and ah < 300:
        out.append((1, f"low Ahrefs traffic ({int(ah)})"))
    if r.get("link_type", "Dofollow") != "Dofollow":
        out.append((1, f"listing says link is {r['link_type']}"))
    missing = [k for k in ("ahrefs_traffic", "semrush_traffic", "ref_domains", "dr") if num(r[k]) is None]
    if missing:
        out.append((1, "listing missing: " + ", ".join(missing)))
    return out


def main(listing, new_only, name_flags=None):
    keep = set(Path(new_only).read_text().split())
    extra = {}
    if name_flags:
        with open(name_flags) as f:
            for row in csv.DictReader(f):
                extra.setdefault(row["domain"], []).append((int(row["points"]), row["reason"]))
    rows = []
    with open(listing) as f:
        for r in csv.DictReader(f):
            if r["domain"] not in keep:
                continue
            fl = flags_for(r) + extra.get(r["domain"], [])
            score = sum(p for p, _ in fl)
            tier = "1 likely spam, audit first" if score >= 4 else "2 suspicious" if score >= 2 else "3 no listing red flags"
            rows.append({**r, "score": score, "tier": tier, "flags": " | ".join(t for _, t in fl)})
    rows.sort(key=lambda x: (-x["score"], x["domain"]))
    out = Path(listing).with_name(Path(listing).name.replace(".listing.csv", ".prescreen.csv"))
    with out.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["tier", "score", "domain", "ahrefs_traffic", "semrush_traffic",
                                          "ref_domains", "dr", "moz_da", "semrush_as", "price_placement",
                                          "link_type", "countries", "flags"], extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    missing = keep - {r["domain"] for r in rows}
    print(f"screened: {len(rows)}  (expected {len(keep)}, missing from listing: {sorted(missing) or 'none'})")
    for t in sorted({r['tier'] for r in rows}):
        print(f"  {t}: {sum(1 for r in rows if r['tier'] == t)}")
    print(f"written: {out}")


if __name__ == "__main__":
    if len(sys.argv) not in (3, 4):
        sys.exit(__doc__)
    main(*sys.argv[1:])

