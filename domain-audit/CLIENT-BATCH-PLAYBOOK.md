# Client batch playbook

How to turn one Adsy export for a client into a list of clean publisher domains, and what to ban
afterwards. Set by the team on 2026-11-12 while working the SBM (Spa Bali Moon) list, and meant
for every client. `RULES.md` holds the thresholds and the reasons behind them; this file holds the
order of work. If the two disagree on a threshold, `RULES.md` wins.

Reference run: SBM, 162 domains in, 13 clean out. Files: `batches/sbm-*`, `banned/sbm/`,
`used-by-client/spabalimoon/`.

## Ground rules

- Work from the repo copy (`domain-audit/` in this repo), never a loose folder. Pull before you
  start; commit and push after every step that produces data. A cloud container can be wiped at
  any time, and only what is pushed survives.
- Never rescan a domain that is in `already-scanned`. One exception: when its stored Ahrefs data
  was lost, rescan it only after the team says yes.
- Never commit the raw Adsy task reports: they carry task costs. Commit only domain lists
  derived from them.
- Every Ahrefs call: check the unit balance first (`subscription-info-limits-and-usage`, free),
  say the expected cost, save each result to the batch file before the next call.

## Client list codes

The first line of an Adsy export names the client list. Confirmed so far:

| Code | Client | Promoted site |
|---|---|---|
| SBM | Spa Bali Moon | spabalimoon.com |
| NBV | Nyuh Bali Villas | nyuhbalivillas.com |

Other codes in the Adsy list menu (HLA, Lembongan, Penida, FF, AVC EN, AVC SE, DMG) are not yet
confirmed against a client. Add a row here when the team confirms one.

## Steps

1. **Extract.** Save the export as `batches/<code>.raw.txt`, run `extract.py`. Note the record
   count.
2. **Filter.** Run `scanned.py filter`. It drops every domain already scanned and every domain in
   any `banned/*/` folder. Report the banned hits by folder: banned domains keep reappearing in
   new exports, and the team wants to see that the ban works.
3. **Adsy No-index.** Drop every record whose `Post type` is No-index: the paid post would be
   noindexed, so the link carries no SEO value. `extract.py` does not read this field; parse the
   raw export.
4. **Homepage noindex.** Run `noindex_check.py`. Drop confirmed noindex. Blocked or unreachable
   homepages stay in, unverified. If it finds zero noindex, confirm the checker still catches a
   test `noindex` tag before trusting the zero.
5. **Already used by this client.** Get the Adsy Tasks report (Tasks page, Report button, all
   tasks; the team exports one file per year). Take every task whose promoted URL is the client's
   site, take the host of its placement URL, and save the list to
   `used-by-client/<client>/domains.txt`. Drop every batch domain on that list, both new ones and
   ones checked before. The report holds Completed, Edited and For-approval tasks only; tasks in
   progress, rejected or in draft are not in it, so say so in the result. A used domain is blocked
   for this client only, not banned.
6. **Split the rest.** Domains already in `already-scanned` (checked in an earlier batch) reuse
   their stored Ahrefs data at no cost; only checks that did not exist then (the 12-month spike
   check) are run on them. Domains whose stored data was lost are "Not rated" until rescanned.
7. **Link check (free).** Run `linkcheck.py` on the new domains. Nofollow is dropped before
   Ahrefs. No links, blocked or unreachable go on, marked "link not confirmed".
8. **Ahrefs batch scan.** `batch-analysis` on the link-check queue, 100 targets per call, about
   29 units per domain. Save to `<code>.ahrefs-metrics.csv` and push right away.
9. **Gate.** In this order, first match wins:
   - spam by name: piracy, gambling or adult words in the domain (apk, ibomma, tamilyogi,
     isaimini, tamilmv, khatrimaza, callbomb, casino, bet, matka, 888, 4d, porn, incest, flix,
     torrent, crack, mp3);
   - low traffic: Ahrefs organic traffic under 500;
   - under 50 keywords with under 500 referring domains: fake traffic;
   - under 50 keywords with 500 or more referring domains: borderline (few keywords);
   - otherwise: passes.
   A domain that passes but has an unconfirmed link is "link not confirmed".
10. **Traffic spike (12 months).** For every domain that passes with a dofollow or mixed link, pull
    `site-explorer-metrics` with `date` 12 months back (about 50 units each). Traffic then under
    10% of now: spam, traffic spike. 10% to 20%: clean but "rising fast", open the Ahrefs chart
    before buying. Never use a 6-month date: it missed measuralogic.com, whose climb had already
    started 6 months back.
11. **Clean list.** What is left is clean. Deliver a CSV sorted by traffic with: DR, traffic now,
    traffic 6 and 12 months ago, keywords, referring domains, top country, link check, followed
    links, both Adsy prices, and a note column flagging rising fast, falling traffic (now at or
    under 35% of then), thin link profile (under 100 referring domains), traffic concentrated (100
    or more traffic per keyword), mixed links, and anything seen on the homepage (spam guest posts,
    errors).
12. **Team review.** The team opens each clean domain in Adsy and on Ahrefs. Domains removed for
    price get the status "Removed by team: price too high". The export price can be lower than the
    live price: special-topic surcharges (health, spa, beauty) and price changes. A spike the team
    finds on the Ahrefs chart that the snapshot missed means the rule needs fixing, not just the
    domain: find why, fix the rule here and in `RULES.md`, re-run the check on the whole clean list.
13. **Breakdown.** Write `<code>-<total>-breakdown.csv`: every domain of the export exactly once,
    with status, description and evidence. The counts must add up to the export total.
14. **Ban.** After the team review, ban every domain in these statuses, in a new folder
    `banned/<code>/domains.txt` (one folder per batch, never mixed with another batch's folder):
    Adsy No-index, Nofollow link, Spam by name, Fake traffic, Low traffic, Borderline (few
    keywords), Link not confirmed, Spam: traffic spike, Removed by team: price too high.
    Domains already in another ban folder stay there and are not copied. Not banned: Clean, and
    Already used by the client. Rebuild with `scanned.py build`, test that a banned domain is
    filtered and a clean one is not, then commit and push.
15. **Record the scan.** Add the scanned domains to `sources/<code>_scanned.txt` and rebuild, so
    the batch is never paid for twice.

## Status list

| # | Status | Meaning | Banned after review |
|---|---|---|---|
| 1 | Banned | Already in a `banned/` folder from an earlier batch | already |
| 2 | Adsy No-index | Adsy says the paid post is noindexed | yes |
| 3 | Already used by the client | The client already has a placement on this site | no, blocked for this client only |
| 4 | Homepage noindex | Noindex tag on the homepage | yes |
| 5 | Not rated (data lost) | Scanned before, Ahrefs data lost; rescan with team OK | decide after rescan |
| 6 | Nofollow link | Real-site check found no followed links | yes |
| 7 | Spam by name | Piracy, gambling or adult domain name | yes |
| 8 | Fake traffic | Under 50 keywords and under 500 referring domains | yes |
| 9 | Low traffic | Ahrefs organic traffic under 500 | yes |
| 10 | Borderline (few keywords) | Under 50 keywords, 500 or more referring domains | yes |
| 11 | Link not confirmed | Passed the gate; link check found no external links, or was blocked | yes |
| 12 | Spam: traffic spike | Traffic 12 months ago under 10% of now | yes |
| 13 | Clean / Clean (rising fast) | Passed every check | no |
| 14 | Removed by team: price too high | Live Adsy price too high | yes |

## Costs seen on the SBM run

Ahrefs batch scan 29 units per domain; 12-month snapshot 50 per domain; full monthly history 11
per row (traffic) and 6 per row (referring domains), used only to explain a single domain. SBM in
total: about 5,000 units for 162 domains.
