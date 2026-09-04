# Domain Adaptation

The chrome of this standard ports in an afternoon. The *statements* must be rethought for the product's domain, or you will ship a salon balance sheet inside a software business. This file is the checklist for that rethink.

## Step 1 — Re-map the scope dimension

| Product | Scope levels | Legal-statement boundary |
|---|---|---|
| Salon / POS product | Outlet · Konsolidasi | Brand (single legal entity) |
| Multi-company platform | Company (PT) · Business Unit · Project · Konsolidasi | **Company (each PT)** |
| Generic | tenant · sub-scope · consolidated | the legal entity |

Rules:
- **Legal/statutory statements (Balance Sheet, Trial Balance, tax reports) are per-legal-entity.** In a multi-PT business that means per-company first; the group view is a roll-up.
- **Business unit and project are management/segment dimensions.** They slice P&L and segment metrics. They do **not** get their own equity, their own tax liability, or a standalone legal Balance Sheet.
- Consolidated (no sub-scope) is the default view; sub-scoped views may be *partial* and must carry the honest caveat.

## Step 2 — Choose the statements by value, not by textbook

Build what the business looks at, in the order they look at it.

**Salon / POS (point-of-sale, instant revenue):** daily P&L → Balance Sheet → Trial Balance → Cash Flow → General Ledger. Revenue recognized at sale.

**Project / agency business (revenue over time):** the priority order inverts and *adds* statements a salon/POS product does not have —
1. **Project P&L / Project Profitability** — revenue vs cost (labor + COGS + allocated overhead) per project, with margin %. The #1 statement for an agency.
2. **WIP / Unbilled & Deferred Revenue schedule** — earned-not-billed (contract asset) vs billed-not-earned (contract advance / uang muka), by % completion or milestone. Entirely absent from salon logic and critical.
3. **Unit P&L (segment report)** — contribution by business unit.
4. **AR / AP Aging** — if invoices/bills exist, aging is mandatory for cash health; subledger aging must tie to the GL control account.
5. Then the statutory set: P&L, Balance Sheet (per company), Trial Balance, Cash Flow, General Ledger.

The point-in-time vs period split still holds: Balance Sheet / Trial Balance = `as-of`; P&L / Cash Flow / GL / aging = `from–to`.

## Step 3 — Keep the honest-disclosure DNA, change the wording

The amber caveat is product-specific copy over the same mechanism:
- Salon, single outlet: *"Neraca per outlet bersifat parsial: aset/kas/piutang per outlet; modal & kewajiban pajak tetap di tingkat brand (Konsolidasi)."*
- Multi-company, unit-filtered: *"Tampilan per unit hanya menampilkan P&L segmen. Ekuitas, kewajiban pajak, dan neraca legal berada di tingkat perusahaan (PT)."*
- Group consolidation before eliminations: *"Konsolidasi ini belum menjalankan eliminasi antar-PT (AR/AP & margin intra-grup). Angka grup dapat double-count."*

## Step 4 — The accounting traps (do not copy a salon naively)

1. **Treating a business unit / project as a legal entity** → generating a per-unit Balance Sheet with its own equity and tax. Wrong. Legal statements and tax are per-PT; units carry P&L + segment assets only.
2. **Booking revenue at invoice date with no WIP/unbilled treatment** on multi-month work. A salon recognizes at point-of-sale; a project earns over time. Naive copy massively misstates monthly P&L. You need contract-asset (earned-not-billed) and contract-liability (billed-not-earned) accruals.
3. **Summing companies without eliminating intercompany** → inflated group revenue/cost and double-counted intra-group AR/AP. And the PPN sub-trap: an intercompany service invoice still carries real PPN/PPh23 owed to the tax authority even though it eliminates in consolidation — **eliminate the P&L/receivable, never the tax liability.**

## Step 5 — Match the host stack (do not import the source stack)

**TypeScript → JavaScript:** you lose the DTO types (`BalanceSheetReport`, etc.). Recover the rigor with:
- JSDoc `@typedef` for every report/line/column shape in a `lib/reports/types.js`, applied via `@param {{...}}` on pure builders.
- **zod `.parse()` at the API boundary** — validate every report response before rendering. (A page that trusts `api.get` blindly is a real gap; close it.)
- Port `.tsx` → `.jsx`. **Never drop `.ts`/`.tsx` files into a JS + `jsconfig` repo** — the build breaks.

**Tailwind v3 → v4:**
- The brand tokens this standard uses (`brand-deep`, `brand-lime`, `brand-accent`) live in `tailwind.config` under v3. In v4 they must be declared the CSS-first way: add the CSS variable to `:root` and `.dark`, then map it under `@theme inline` (e.g. `--color-brand-deep: var(--brand-deep)`), so `bg-brand-deep/5`, `border-brand-deep/40`, `text-brand-deep` resolve.
- If the repo runs v4 in **compat mode** with a still-referenced `@config '../tailwind.config.js'`, **do not delete that config** — it silently feeds `border/input/ring/sidebar/chart` tokens to shadcn. Add new tokens the v4 way; leave the legacy block.
- Watch the cascade: a global `border-color` compat shim plus a `*` reset can interact with `border-t-2` total rows — verify the heavy total-row border actually renders.
- Dialog centering trap: center modals with longhand `fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]`, never base `inset-x-0` overridden by `sm:left-1/2` (the override loses in the cascade and the dialog flies off-screen-left). If the host's `dialog` already uses longhands, leave it.

## Step 6 — Reuse, don't reinvent, what the host already has

Before building, inventory the host: it may already have a partial report kit (header, actions, print CSS, an xlsx exporter, date-validation schemas). Consolidate around the host's existing pieces and fill the gaps to reach this standard, rather than porting from zero. Promote duplicated per-page code into the shared kit. Add CSV (the universal guarantee) even if xlsx exists.
