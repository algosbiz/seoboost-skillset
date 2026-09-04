---
name: seoboost-financial-report-ui
description: Use when building, extending, or reviewing financial/accounting report screens (Profit & Loss, Balance Sheet/Neraca, Cash Flow/Arus Kas, Trial Balance/Neraca Saldo, General Ledger/Buku Besar, aging, project/unit P&L) in any SEO Boost web app. This is the SEO Boost house standard for financial-report UX — toolbar, period presets, scope filter, integrity badges (Seimbang/Tercocok), four-state handling, section-grouped tables with subtotals, running-balance ledgers, honest partial-scope disclosure, print, and Excel-safe CSV export. Triggers — "buat laporan keuangan", "laporan neraca/arus kas/laba rugi/buku besar", "report page akuntansi", "financial statement UI", or porting the report look from one SEO Boost product to another.
---

# SEO Boost Financial Report UI Standard

The house standard for how every SEO Boost product renders financial statements. Born from a reference salon-ERP accounting report surface (P&L, Neraca, Arus Kas, Neraca Saldo, Buku Besar) and validated by an accounting + FE + BE council. Follow it so that a salon ERP, a project-management platform, and a POS all *feel* like the same trustworthy ledger.

This is a **rigid pattern skill** for the structure (states, badges, table anatomy, export) and a **flexible pattern** for the per-statement math. Do not adapt away the discipline (the four states, the integrity badge, the honest caveats). Adapt the statements themselves to the product's domain.

## The One Principle (non-negotiable)

> **The backend computes; the frontend renders.**

Balance/reconcile flags, subtotals, parent-group rollups, running balances, contra-account sign flips, and consolidation are computed **server-side** and returned as a presentation-ready DTO. The FE never re-derives a subtotal, never re-decides whether a statement balances, never flips a sign. If the FE is doing accounting math, the design is wrong — push it to the BE.

Why: two clients (and two engineers) will diverge on rounding, sign, and rollup rules. One authority = one truth = audit-safe.

## What "good" looks like (the seven marks)

Every SEO Boost financial report screen has these. If one is missing, it is not done.

1. **A print-ready page wrapper + a print-stripped toolbar.** The statement prints cleanly to PDF/paper with no app chrome.
2. **A header** with title (Indonesian + English in parens, e.g. "Neraca (Balance Sheet)"), a description line stating the **period + scope** ("Per 15 Juni 2026 · Semua Outlet (Konsolidasi)"), and actions: Kembali / Cetak / Ekspor CSV.
3. **A filter card**: the date control(s) + **quick period presets** + a **scope filter** (defaults to consolidated) + an **integrity badge** aligned right.
4. **An integrity badge** that states, in plain language, whether the numbers can be trusted: `Seimbang`/`Tidak Seimbang` (Neraca), `Tercocok`/`Belum Tercocok` (Arus Kas), etc. Green when healthy, amber/rose when not. The badge is `role="status" aria-live="polite"`.
5. **Four states, always**: error (with retry) · loading (skeletons) · empty (icon + title + description + a *next-action*) · data. The empty state doubles as onboarding ("Pilih akun untuk menelusuri").
6. **A section-grouped table**: section header rows, parent-group subtotals, indented line items with a monospace account code, bold total rows, and an `Amount` treatment — `—` for zero, a distinct color for negatives, `tabular-nums` everywhere.
7. **Honest disclosure.** When a filter makes the statement *partial* (e.g. a single outlet/unit can't show group-level equity or tax), say so in an amber caveat. Add per-line notes for figures that live at a higher level. **Never present a partial number as if it were whole.**

## The integrity badge is the soul of the pattern

A financial report without a "can I trust this?" signal is just a table. The badge is what makes a SEO Boost report a SEO Boost report.

- Pick the right invariant per statement: Neraca → assets = liabilities + equity. Cash Flow → computed cash change = actual cash change. Trial Balance → Σdebit = Σkredit. Consolidation → intercompany AR = intercompany AP (after elimination).
- The **backend** decides the boolean and returns it (`balanced`, `reconciled`, …). The FE only colors it.
- Green = healthy, lime/brand tint. Amber = a soft mismatch worth a human look. Rose = a hard imbalance that means the data is wrong.
- Always pair the badge with a footer strip that shows the two figures being compared, so a skeptical accountant can see *why* it balances.

## Build order (when creating a report surface from scratch)

1. **Confirm the data foundation exists.** These reports assume a **double-entry general ledger + chart of accounts** with POSTED journal lines as the immutable source of truth. If the product has only invoices/expenses and no GL, *that* is the first project — the report UI is meaningless without it. Check before designing.
2. **Freeze the BE→FE DTO contracts first** (one typed shape per statement). Lock them as exported interfaces/types shared by both sides. Contract drift (sign of contra accounts, header-row totals, consolidated vs scoped) is the #1 failure mode — higher-probability than any rendering bug.
3. **Build the shared "report kit"** (see `reference/component-kit.md`) — wrapper, header, filter card, period presets, scope filter, status badge, the four states, table primitives, the `Amount` component, and the CSV exporter. Build these *once*; every statement reuses them.
4. **Build statements in value order**, not textbook order. Lead with what the business actually looks at daily (for an agency: Project P&L; for a salon: daily P&L), then the statutory set (Neraca, Trial Balance), then Cash Flow and General Ledger.
5. **Wire each to its react-query hook**, render the four states, add the badge, add CSV + print. Verify with `tsc`/`lint`/`build` and a live look in the browser at the real breakpoints.

## Adapting to a new product (the part people get wrong)

The chrome ports cleanly. The *statements* must be rethought for the domain. Do not copy a salon Neraca into an agency and call it done.

- **Re-map the scope dimension.** A salon/POS product = outlet | consolidated. A multi-company platform = company (legal entity) | business unit (segment) | consolidated. **Legal statements (Neraca, Trial Balance, tax) are per-legal-entity**; units/projects are management dimensions that slice P&L only — they never get their own equity or tax liability. Getting this wrong (a per-unit balance sheet with its own equity) is the classic domain trap.
- **Add the statements the domain needs.** A project business needs Project P&L, Unit/segment P&L, WIP / unbilled-vs-deferred revenue, and AR/AP aging — none of which exist in a point-of-sale salon. A salon recognizes revenue instantly; a project recognizes over time. Copying point-of-sale revenue logic onto multi-month projects misstates the P&L badly.
- **Keep the honest-disclosure DNA, change the wording.** The amber caveat for "this outlet's neraca is partial" becomes "this consolidation has not run intercompany eliminations" or "this unit view excludes company-level equity and tax."
- **Match the host stack, don't import the source stack.** TS→JS: preserve rigor with JSDoc `@typedef` + zod at the API boundary. Tailwind v3→v4: migrate brand tokens to `@theme`, don't delete the legacy config if it's in compat mode. Port `.tsx` to `.jsx` — never drop TS files into a JS repo.

## Indonesian copy conventions (client-facing)

- Bilingual titles: "Laba Rugi (Profit & Loss)", "Buku Besar (General Ledger)".
- Scope labels: "Semua Outlet (Konsolidasi)" / "Semua Unit (Konsolidasi)" / "Semua Cabang".
- Period presets: "Bulan Ini", "Bulan Lalu", "Kuartal Ini", "Tahun Ini".
- Integrity: "Seimbang" / "Tidak Seimbang", "Tercocok" / "Belum Tercocok".
- Currency: `formatIDR` (Rp, thousands separator, no decimals on screen; 2 decimals in CSV). Numbers are always `tabular-nums`.
- No emoji in client-facing report UI.

## Accessibility & print (must-haves)

- Status badge: `role="status" aria-live="polite"` so a screen reader announces balance changes.
- Tables: `aria-label` describing statement + period + scope. Heading hierarchy: page `<h1>`, empty-state/section titles `<h2>` — do not use only `CardTitle`.
- **Color is never the only signal.** A negative amount in rose must also be legible as text (the minus sign / parens), and ideally carries an `aria-label`. Rose-on-white as the *sole* differentiator fails contrast-only users.
- Print: an `@media print` rule that hides everything except the report wrapper. Add `print-color-adjust: exact` so brand tints survive printing.

## Anti-patterns (automatic fail)

- FE computing subtotals, totals, running balances, or the balance/reconcile flag. (Violates the One Principle.)
- A report with no integrity badge / no "can I trust this?" signal.
- Showing a scoped (partial) figure without the honest caveat.
- A per-business-unit or per-project **Balance Sheet** with its own equity/tax (legal statements are per-legal-entity only).
- Recognizing project revenue at invoice date with no WIP/unbilled treatment, on a domain where work spans periods.
- Dropping `.ts`/`.tsx` files into a JavaScript repo; deleting a still-referenced Tailwind config during a v3→v4 migration.
- CSV without a UTF-8 BOM (Excel id-ID mojibake) or without quoting.
- Computing `new Date()` ranges at render time (hydration mismatch) — compute preset ranges inside the click handler.

## Reference files (read when implementing)

- `reference/page-anatomy.md` — the full page skeleton, the four states, the toolbar, and the filter card, with copy-ready structure.
- `reference/component-kit.md` — the shared "report kit" component inventory + the `Amount`/`SignedAmount` and integrity-badge patterns.
- `reference/table-and-export.md` — section-grouped table anatomy, running-balance ledger, and the Excel-safe CSV exporter.
- `reference/backend-contract.md` — the "BE computes, FE renders" DTO contracts, scope params, consolidation, and performance (keyset pagination, window running balance, caching on the period-close watermark).
- `reference/domain-adaptation.md` — how to re-map scope, which statements to add per domain, and the WIP/Project-P&L/legal-entity rules.
