# The Report Kit (shared components)

Build these once; every statement reuses them. This is the difference between a consistent financial surface and five pages that drifted apart. Promote any per-page duplication into this kit.

## Inventory (build in this order)

| Component | Responsibility |
|---|---|
| `ReportShell` | The page root: `<div className="report-print flex flex-col gap-4">`. Marks the print region. |
| `ReportPageHeader` | Title (bilingual), description (period + scope), `actions` slot (Kembali / Cetak / Ekspor). One component, not one per statement. |
| `ReportFilterCard` | The `Card className="print-hidden"` wrapping the filters; lays out date controls + presets + scope + badge. |
| `ReportPeriodPresets` | Quick ranges (Bulan Ini / Lalu / Kuartal / Tahun). **Ranges computed in onClick.** |
| `ScopeFilter` | Domain scope selector (outlet / unit / company). Defaults to consolidated. Emits `null` for consolidated. |
| `ReportStatusBadge` | The integrity badge. `role="status" aria-live="polite"`. Variants: ok / warn / bad. |
| `ReportStates` (or 4 separate) | `ErrorState(onRetry)`, loading `SkeletonCard(rows)`, `EmptyState(icon,title,description,action)`. |
| `ReportTable` primitives | `SectionHeaderRow`, `Amount`/`SignedAmount`, `TotalRow`, reconciliation footer strip. |
| `exportCsv` helper | UTF-8 BOM + RFC-4180. (See `table-and-export.md`.) |

Report-specific (keep per page, do NOT force into the kit): the account-tree nesting for each statement, the per-statement reconciliation math, the CSV row mapping.

## `Amount` — the money primitive

The single rule for how money renders. Zero is a dash, negatives are visually distinct, everything is `tabular-nums`.

```tsx
function amountClass(value: number) {
  if (value === 0) return "text-muted-foreground";
  if (value < 0) return "text-rose-600";        // negative = attention
  return "text-brand-deep";                       // positive = brand ink
}

function Amount({ value, bold }: { value: number; bold?: boolean }) {
  return (
    <span className={cn("tabular-nums", amountClass(value), bold && "font-semibold")}>
      {value === 0 ? "—" : formatIDR(value)}
    </span>
  );
}
```

- `SignedAmount` is the same but used where a sign genuinely carries meaning (cash flow movements). Same color rules.
- **Accessibility:** color must not be the only signal. `formatIDR` of a negative must read as negative (minus or parens) in text; add `aria-label` for the row if needed. Rose-on-white alone fails contrast-only users.
- Never hand-format currency inline. Always go through `formatIDR` (Rp, grouping, no on-screen decimals).

## The integrity badge

```tsx
function BalanceIndicator({ balanced }: { balanced: boolean }) {
  return balanced ? (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-lime/50 bg-brand-lime/20 px-3 py-1.5 text-sm font-semibold text-brand-deep">
      <CheckCircle2 className="h-4 w-4" /> Seimbang
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/30 dark:text-rose-300">
      <TriangleAlert className="h-4 w-4" /> Tidak Seimbang
    </span>
  );
}
```

- **Three tones, by severity:** ok = lime/brand tint (`Seimbang`, `Tercocok`). warn = amber (`Belum Tercocok` — a soft mismatch worth a human look, e.g. cash flow off by a rounding bucket). bad = rose (`Tidak Seimbang` — a hard imbalance = the data is wrong).
- The boolean comes from the **DTO** (`data.balanced`, `data.reconciled`). The FE never decides it.
- Wrap the badge's container in `role="status" aria-live="polite"` so screen readers announce when it flips.
- Pair with a footer strip showing the two compared figures (see `table-and-export.md`).

## `EmptyState` — onboarding, not a dead end

```tsx
<EmptyState
  icon={BookOpen}
  title="Pilih akun untuk menelusuri"
  description="Pilih sebuah akun di atas untuk melihat saldo awal, setiap transaksi yang terposting, dan saldo berjalannya."
  action={<Button asChild variant="outline"><Link href="/reports/trial-balance">Buka Neraca Saldo</Link></Button>}
/>
```

- Icon in a tinted circle, `<h2>` title (keeps it under the page `<h1>`), muted description (max-w for readability), and an `action` that points to the next step.
- Distinguish "no selection yet" (gate the query, show this first) from "ran but empty" (a valid empty period). Both use `EmptyState`, different copy.

## `ScopeFilter` — the domain dimension

```tsx
const CONSOLIDATED = "__all__";
// value:string|null  (null = consolidated). onChange emits null for consolidated.
<Select value={value ?? CONSOLIDATED} onChange={(e) => onChange(e.target.value === CONSOLIDATED ? null : e.target.value)}>
  <option value={CONSOLIDATED}>Semua Outlet (Konsolidasi)</option>   {/* or "Semua Unit (Konsolidasi)" */}
  {scopes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
</Select>
```

- Backed by the **real** scope list (locations / units / companies) from a query hook — never hardcoded.
- A `useScopeName(id)` helper resolves the id to a display name for the header description and CSV.
- **Thread the scope as a prop/query, never via `localStorage`.** A `localStorage` scope hack races across multi-scope views and breaks consolidation. (Real anti-pattern observed in the field.)

## Brand tokens

This kit uses `brand-deep` (primary ink), `brand-lime`/`brand-accent` (healthy/highlight), `rose-600` (negative/bad), `amber` (soft warning), `muted` (secondary). When porting to a product whose theme lacks these, **add the tokens to the theme** (see `domain-adaptation.md` for the Tailwind v4 `@theme` migration) — do not hardcode hexes in components.
