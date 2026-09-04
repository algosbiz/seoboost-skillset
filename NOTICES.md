# Third-Party Notices

## Provenance of this repository

This skill set is a **rebranded derivative** of an internal repository authored by another
company:

| | |
|---|---|
| Upstream | [`su69ar/bmt-skills-set`](https://github.com/su69ar/bmt-skills-set) |
| Upstream author | PT Bali Micro Technology (BMT) / DotDev Asia |
| Upstream licence | **None granted.** The repository is publicly readable but ships no `LICENSE` file, and its README states: *"Internal. Tidak untuk redistribusi public tanpa approval team lead."* |

**What that means in practice.** Read this before the repo leaves this machine:

- The upstream repository was **never modified** in producing this one — no push, no branch,
  no commit reached it. Everything here was done in a local clone with its `origin` remote
  detached.
- The BMT-authored skills carry **no licence grant**, so publishing this repo publicly, or
  redistributing it outside your organisation, needs permission from the upstream author.
  Internal use is a decision for you and your team lead to make with that in mind.
- The third-party skills listed in the next section were vendored by the upstream author
  under their own permissive licences. Those licences travel with the code and are
  unaffected by the rebrand — they are yours to use under MIT terms directly.
- Client identities, staff names, bank details, internal hostnames and sample documents
  belonging to the upstream author were removed during the rebrand, not merely renamed.

## Vendored third-party content

This repository vendors (redistributes) skills and plugins authored by third parties.
Each is included under its original open-source license, with attribution below. Original
`LICENSE`/`LICENSE.txt` files are kept alongside the vendored content where applicable.

| Vendored as | Upstream source | License | Copyright |
|---|---|---|---|
| `plugins/seoboost-marketing/` (plugin, 46 skills) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | MIT | © Corey Haines |
| `seoboost-web-asset-generator/` | [alonw0/web-asset-generator](https://github.com/alonw0/web-asset-generator) — `skills/web-asset-generator` | MIT | © Web Asset Generator Contributors |
| `seoboost-<8 skills>/` (working-with-legacy-code, ux-heuristics, microinteractions, web-typography, ios-hig-design, top-design, lean-ux, mom-test) | [wondelai/skills](https://github.com/wondelai/skills) | MIT | © 2025 Wondel.ai sp. z o.o. |
| `seoboost-management-consulting/` | [gcamilo/management-consulting](https://github.com/gcamilo/management-consulting) | MIT | © 2026 gcamilo (see `seoboost-management-consulting/LICENSE`) |
| `seoboost-design-dna/` | [zanwei/design-dna](https://github.com/zanwei/design-dna) | MIT | © zanwei (see `seoboost-design-dna/LICENSE-upstream-design-dna`) |

Notes:

- Vendored content was **rebranded to the `seoboost-` / `seoboost-marketing` namespace**
  (folder + `name:` frontmatter changed) but is otherwise unmodified in substance.
- To pull upstream updates, re-vendor manually from the source repos.
