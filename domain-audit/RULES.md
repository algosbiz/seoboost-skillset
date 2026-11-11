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
- Do not rescan anything in already-scanned.
- Banned forever: domains in `sources/banned.txt` were rejected by the team after a manual link check
  (first list: 31 English AVC domains, 2026-11-11). Never scan them again, never buy from them, and
  never remove a line from that file without the team's decision.

## State of the scan history

The working folder lived only on a cloud container until 2026-11-11 and was wiped once.
`sources/recovered_*` was rebuilt from a session transcript and is partial: it holds the
Transport, France, English AVC and peptides scans plus the earlier best-dofollow shortlists, not
every domain scanned before 2026-11-10. If an older `sources/` folder turns up, merge it in.

## What the checks cannot prove

The rel attribute a seller puts on a paid link. Inspect the live link after placement.

