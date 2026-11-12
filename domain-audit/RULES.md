# Domain audit rules

Pipeline for one Adsy export, in order. Steps 1 to 4 cost no Ahrefs units.

1. `python3 -I extract.py batches/<batch>.raw.txt` writes `<batch>.domains.txt` and `<batch>.listing.csv`.
2. `python3 -I scanned.py filter batches/<batch>.domains.txt` writes `<batch>.domains.new-only.txt`.
   Copy it to `<batch>.domains.clean.txt` at once: a later filter run overwrites new-only.
3. `python3 -I linkcheck.py batches/<batch>.domains.new-only.txt batches/<batch>.listing.csv`
   applies the listing floor and the real-site link check, and writes `<batch>.ahrefs-queue.txt`.
   Needs Network access set to Full in the cloud environment.
4. Ahrefs batch-analysis on `<batch>.ahrefs-queue.txt` only, 100 targets per call. Save each result
   to `<batch>.ahrefs-metrics.csv` before the next call.
5. Gate, name screen, pattern groups, keyword checks (230 units each), then
   `python3 -I merge.py <batch> <topic>` and `python3 -I scanned.py build`.

## Rules set by the team

- Listing floor: skip a domain before Ahrefs when its listed Ahrefs traffic is under 300.
  Measured on travel, food and construction (910 scans, 84 shortlisted): saves 199 scans, loses 2.
  Floor-skipped domains are not added to already-scanned; the floor re-applies for free.
- No position cut. Taking only the top pages of the Adsy export lost good sites at about the same
  rate it saved scans (top 200 records: 65% of scans saved, 41 of 84 shortlisted lost).
- Check each real website before the Ahrefs scan. A site whose articles have no followed external
  link is dropped. Blocked, unreachable or link-less sites still go to Ahrefs, marked unverified.
- A high number of referring domains is never a spam signal. Sites with many referring domains are
  still okay. Spam verdicts rest on keyword evidence only (fabricated brand or phone-number queries,
  casino or piracy traffic, sold posts carrying the traffic). merge.py exempts any domain with 500+
  refdomains from the fake_traffic gate: low keyword count on a well-linked site signals link-driven
  traffic, not bots. Those domains are marked borderline instead of fake_traffic.
- Traffic spike is spam (team rule, 2026-11-11). For every domain that passes the gate with a
  dofollow or mixed link, pull Ahrefs `site-explorer-metrics` with `date` set 12 months back
  (about 50 units each). If traffic then was under 10% of traffic now, the site is spam: years flat
  near zero, then a sudden vertical jump, as on alphacraftai.com (0 in May 2026, 24,862 in Nov).
  10% to 20% is "rising fast": keep it, but open the Site Explorer chart before buying.
  Save the snapshots to `<batch>.traffic-12mo.csv`.
  Why 12 and not 6 months: the first version looked 6 months back and passed measuralogic.com,
  whose spike began in March 2026 (0 traffic and 1 referring domain in Nov 2025, 2,028 by May,
  6,454 by Sep). By the 6-month date the climb had already started, so it looked like normal
  growth. Batches checked only at 6 months (NBV, SBM before 2026-11-12) need the 12-month pass.
- Already used by a client: `used-by-client/<client>/domains.txt` lists every site where that client
  already has a placement, taken from the Adsy Tasks report (Report button, all tasks). A site in
  a client's list may still be scanned and used for other clients, but never offered to that client
  again. First list: spabalimoon (50 sites, from the 2025 and 2026 completed-task reports). The raw
  reports carry task costs, so they are not committed; refresh the list from a new report instead.
- Do not rescan anything in already-scanned.
- Banned forever: `banned/<batch>/domains.txt` holds domains the team rejected after a manual link
  check, one folder per batch: `english-avc` (31 domains, 2026-11-11), `nbv` (22 domains,
  2026-11-12) and `sbm` (129 domains, 2026-11-12: every SBM domain rated Adsy No-index, nofollow,
  fake traffic, low traffic, borderline, link not confirmed, traffic spike or price too high). `scanned.py build` reads every folder, so `scanned.py filter` drops them before any
  check. Never scan them again, never buy from them, and never remove a line without the team's
  decision. A new banned batch gets its own folder.

## State of the scan history

The working folder lived only on a cloud container until 2026-11-11 and was wiped once.
`sources/recovered_*` was rebuilt from a session transcript and is partial: it holds the
Transport, France, English AVC and peptides scans plus the earlier best-dofollow shortlists, not
every domain scanned before 2026-11-10. If an older `sources/` folder turns up, merge it in.

## What the checks cannot prove

The rel attribute a seller puts on a paid link. Inspect the live link after placement.

