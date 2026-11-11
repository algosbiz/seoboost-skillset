#!/usr/bin/env python3
"""Merge one batch's audit stages into a verdict file, a shortlist, and already-scanned sources.

Usage: python3 merge.py <batch> <topic>     e.g. python3 merge.py construction construction

Reads from batches/:
  <batch>.ahrefs-metrics.csv     domain,dr,traffic,keywords,kw_top3,refdomains,top_country,top_country_traffic
  <batch>.listing.csv            from extract.py (link_type, price_placement)
  <batch>.keyword-verdicts.csv   domain,verdict,<topic>_share,evidence   verdict: topic|borderline|offtopic|spam
  <batch>.offtopic-by-name.csv   domain,reason
  <batch>.pattern-groups.csv     domain,group,sampled   unsampled members inherit 'borderline'
  <batch>.linkcheck.csv          from linkcheck.py; its nofollow domains never reached Ahrefs and
                                 are recorded here as link_nofollow. Its listing_low_traffic domains
                                 are listed in the audit but NOT added to already-scanned: they had
                                 no scan, and the floor re-applies for free if they show up again.
Stage precedence: keyword check > pattern group > name screen > low_traffic (<500) > fake_traffic (<50 keywords).

Writes <batch>.audit.csv, <batch>.best-dofollow.csv, <batch>.nofollow-or-mixed.csv and
sources/<category>_<topic>.txt per verdict. Refuses to overwrite an existing sources file.
"""
import csv
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
B = ROOT / "batches"
MIN_TRAFFIC, MIN_KEYWORDS, MIN_REFDOMAINS = 500, 50, 500
ORDER = ["topic", "borderline", "offtopic", "spam", "link_nofollow", "fake_traffic", "low_traffic",
         "listing_low_traffic"]
SHARE = {"high": 0, "medium": 1, "low": 2, "": 3}


def rows(name):
    p = B / name
    return list(csv.DictReader(p.open())) if p.exists() else []


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def main(batch, topic):
    share_col = f"{topic}_share"
    metrics = rows(f"{batch}.ahrefs-metrics.csv")
    listing = {r["domain"]: r for r in rows(f"{batch}.listing.csv")}
    kw = {r["domain"]: r for r in rows(f"{batch}.keyword-verdicts.csv")}
    name = {r["domain"]: r for r in rows(f"{batch}.offtopic-by-name.csv")}
    groups = {r["domain"]: r for r in rows(f"{batch}.pattern-groups.csv")}
    lc = {r["domain"]: r for r in rows(f"{batch}.linkcheck.csv")}

    def site_links(d):
        r = lc.get(d)
        return f"{r['verdict']} {r['followed']}/{r['ext_links']}" if r else "not checked"

    sample_verdict = {g["group"]: kw.get(d, {}).get("verdict", "unchecked")
                      for d, g in groups.items() if g["sampled"] == "yes"}

    out = []
    for m in metrics:
        d, tr, k = m["domain"], num(m["traffic"]), num(m["keywords"])
        if d in kw:
            v, share, stage, ev = kw[d]["verdict"], kw[d][share_col], "keyword check", kw[d]["evidence"]
        elif d in groups:
            g = groups[d]["group"]
            v, share, stage = "borderline", "", "pattern group"
            ev = f"{g}: sampled member verdict '{sample_verdict.get(g, 'unchecked')}'; not checked individually"
        elif d in name:
            v, share, stage, ev = "offtopic", "low", "name screen", name[d]["reason"]
        elif tr < MIN_TRAFFIC:
            v, share, stage, ev = "low_traffic", "", "gate", f"organic traffic {int(tr)} < {MIN_TRAFFIC}"
        elif k < MIN_KEYWORDS:
            rd = num(m["refdomains"])
            if rd >= MIN_REFDOMAINS:
                v, share, stage, ev = "borderline", "", "gate", f"{int(tr)} traffic from {int(k)} keywords but {int(rd)} refdomains (link-driven)"
            else:
                v, share, stage, ev = "fake_traffic", "", "gate", f"{int(tr)} traffic from {int(k)} keywords, {int(rd)} refdomains"
        else:
            sys.exit(f"{d} passed the gate but has no verdict: add it to a stage file first")
        lst = listing.get(d, {})
        out.append({"domain": d, "verdict": topic if v == "topic" else v, share_col: share,
                    "dr": m["dr"], "traffic": m["traffic"], "keywords": m["keywords"], "kw_top3": m["kw_top3"],
                    "refdomains": m["refdomains"], "top_country": m["top_country"],
                    "link_type": lst.get("link_type", ""), "price_placement": lst.get("price_placement", ""),
                    "site_links": site_links(d), "stage": stage, "evidence": ev, "_v": v})
    scanned = {r["domain"] for r in out}
    for d, r in lc.items():
        if r["verdict"] not in ("nofollow", "listing_low_traffic") or d in scanned:
            continue
        lst = listing.get(d, {})
        if r["verdict"] == "nofollow":
            v, stage = "link_nofollow", "real-site check"
            ev = f"0 of {r['ext_links']} external article links followed across {r['posts_checked']} posts"
            if int(r["page_meta_nofollow"] or 0):
                ev += f"; meta robots nofollow on {r['page_meta_nofollow']} page(s)"
        else:
            v, stage, ev = "listing_low_traffic", "listing floor", r["note"]
        out.append({"domain": d, "verdict": v, share_col: "", "link_type": lst.get("link_type", ""),
                    "price_placement": lst.get("price_placement", ""), "site_links": site_links(d),
                    "stage": stage, "evidence": ev, "_v": v})
    out.sort(key=lambda r: (ORDER.index(r["_v"]), SHARE.get(r[share_col], 3), -num(r.get("traffic"))))

    full = ["domain", "verdict", share_col, "dr", "traffic", "keywords", "kw_top3", "refdomains",
            "top_country", "link_type", "site_links", "price_placement", "stage", "evidence"]
    short = [c for c in full if c not in ("verdict", "stage")]
    with (B / f"{batch}.audit.csv").open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=full, extrasaction="ignore")
        w.writeheader()
        w.writerows(out)
    best = [r for r in out if r["_v"] == "topic" and r["link_type"] == "Dofollow"]
    other = [r for r in out if r["_v"] == "topic" and r["link_type"] != "Dofollow"]
    for fname, data in ((f"{batch}.best-dofollow.csv", best), (f"{batch}.nofollow-or-mixed.csv", other)):
        with (B / fname).open("w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=short, extrasaction="ignore")
            w.writeheader()
            w.writerows(data)

    cats = {"topic": f"audit_{topic}_ok", "borderline": f"audit_borderline_{topic}",
            "offtopic": f"audit_offtopic_{topic}", "spam": f"spam_audit_{topic}",
            "link_nofollow": f"link_nofollow_{topic}",  # listing_low_traffic deliberately has no category
            "fake_traffic": f"spam_fake_traffic_{topic}", "low_traffic": f"no_traffic_audit_{topic}"}
    targets = {v: ROOT / "sources" / f"{c}.txt" for v, c in cats.items()}
    clash = [str(p) for v, p in targets.items() if p.exists() and any(r["_v"] == v for r in out)]
    if clash:
        sys.exit(f"refusing to overwrite: {clash}")
    for v, p in targets.items():
        ds = [r["domain"] for r in out if r["_v"] == v]
        if ds:
            p.write_text("\n".join(ds) + "\n")
    print(f"domains: {len(out)}")
    for v in ORDER:
        print(f"  {v}: {sum(1 for r in out if r['_v'] == v)}")
    print(f"best dofollow: {len(best)}  nofollow or mixed on-topic: {len(other)}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(*sys.argv[1:])

