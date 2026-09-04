# Table Anatomy & Export

How a SEO Boost statement table is built, and how it leaves the app (print + CSV).

## Section-grouped statement table (Neraca / P&L / Cash Flow shape)

A statement = ordered sections; each section = parent groups; each group = line items; each section ends in a subtotal; the statement ends in a grand-total row. The table renders this hierarchy with consistent visual weight.

```tsx
<div className="overflow-hidden rounded-md border bg-card">
  <Table aria-label={caption}>                  {/* caption = title + period + scope */}
    <TableHeader>
      <TableRow>
        <TableHead>Akun</TableHead>
        <TableHead className="w-[200px] text-right">Saldo</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <Section title="Aset" section={report.assets} totalLabel="Total Aset" />
      <Section title="Kewajiban" section={report.liabilities} totalLabel="Total Kewajiban" />
      <Section title="Ekuitas" section={report.equity} totalLabel="Total Ekuitas" extraEquityLine={...} />

      {/* Grand total row — heaviest treatment */}
      <TableRow className="border-t-2 border-brand-deep/40 bg-brand-deep/5 hover:bg-brand-deep/5">
        <TableCell className="font-display text-sm font-semibold uppercase tracking-wide text-brand-deep">
          Total Kewajiban + Ekuitas
        </TableCell>
        <TableCell className="text-right">
          <span className="font-display text-base font-semibold tabular-nums text-brand-deep">{formatIDR(totalLiabEquity)}</span>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>

  {/* Reconciliation footer strip — shows the two figures being compared */}
  <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
    Total Aset {formatIDR(totalAssets)} dibandingkan Total Kewajiban + Ekuitas {formatIDR(totalLiabEquity)}.
  </div>
</div>
```

### The `Section` sub-component — visual hierarchy rules

```tsx
function Section({ title, section, totalLabel, extraEquityLine }) {
  return (
    <Fragment>
      {/* 1) Section header row: muted band, uppercase, brand ink */}
      <TableRow className="bg-muted/50 hover:bg-muted/50">
        <TableCell colSpan={2} className="py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-brand-deep">
          {title}
        </TableCell>
      </TableRow>

      {/* empty section still says so */}
      {section.groups.length === 0 && (
        <TableRow><TableCell colSpan={2} className="py-3 text-sm text-muted-foreground">Belum ada saldo pada bagian ini.</TableCell></TableRow>
      )}

      {section.groups.map((group) => (
        <Fragment key={group.parentCode}>
          {/* 2) Parent group row: bold name + bold subtotal; honest note if brand-level */}
          <TableRow className="hover:bg-transparent">
            <TableCell className="pt-3 pb-1 align-top">
              <span className="text-sm font-medium text-foreground">{group.parentName}</span>
              {group.isBrandLevel && group.note && (
                <span className="mt-1 flex items-start gap-1.5 text-xs text-amber-700">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {group.note}
                </span>
              )}
            </TableCell>
            <TableCell className="pt-3 pb-1 text-right align-top"><Amount value={group.total} bold /></TableCell>
          </TableRow>

          {/* 3) Line items: indented pl-8, mono code + name */}
          {group.lines.map((line) => (
            <TableRow key={line.accountId} className="hover:bg-muted/20">
              <TableCell className="py-1.5 pl-8">
                <span className="font-mono text-xs text-muted-foreground">{line.accountCode}</span>{" "}
                <span className="text-sm">{line.accountName}</span>
              </TableCell>
              <TableCell className="py-1.5 text-right"><Amount value={line.amount} /></TableCell>
            </TableRow>
          ))}
        </Fragment>
      ))}

      {/* 4) Section subtotal row */}
      <TableRow className="border-t bg-muted/20 hover:bg-muted/20">
        <TableCell className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{totalLabel}</TableCell>
        <TableCell className="text-right">
          <span className="font-display text-base font-semibold tabular-nums text-brand-deep">{formatIDR(section.total)}</span>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}
```

**Weight ladder (lightest → heaviest):** line item → section header band → parent subtotal (bold) → section total (`border-t bg-muted/20`) → grand total (`border-t-2 border-brand-deep/40 bg-brand-deep/5`). The eye must be able to find the totals without reading.

## Running-balance ledger (General Ledger / Buku Besar shape)

A transaction list with Tanggal / Keterangan / Debit / Kredit / Saldo Berjalan, bookended by Saldo Awal and Saldo Akhir rows.

- Wrap in `overflow-x-auto` and make the date column **sticky-left** (`sticky left-0 z-10 bg-card`) so it survives horizontal scroll on mobile.
- First body row = **Saldo Awal** (opening balance), last = **Saldo Akhir** (closing) with the heavy total treatment.
- Debit/Kredit cells: `—` when zero, `formatIDR` otherwise, `tabular-nums`, right-aligned.
- Saldo Berjalan colored by sign (`balanceClass`).
- **The running balance is computed by the backend** (SQL window function), not accumulated in the FE.
- Show a header summary Card above the table with account code/name/type + Saldo Awal / Saldo Akhir KPIs.

## Print

The page uses `report-print` on the root and `print-hidden` on chrome. The global stylesheet isolates the statement:

```css
@media print {
  body:has(.report-print) * { visibility: hidden; }
  body:has(.report-print) .report-print,
  body:has(.report-print) .report-print * { visibility: visible; }
  body:has(.report-print) .report-print { position: absolute; left: 0; top: 0; width: 100%; }
  .print-hidden { display: none !important; }
  /* keep brand tints on totals rows when printed */
  .report-print { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
}
```

If the host app already has a print block, **add a `.report-print` allowlist** rather than relying on per-element `print-hidden` only — otherwise the whole page prints. Verify `print-color-adjust: exact` so the brand-tinted total rows don't drop to white.

## CSV export (Excel-safe)

Accountants open these in Excel id-ID. The two things that break them: missing BOM (mojibake on accented names) and unquoted fields. Both are handled here.

```ts
export function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const text = typeof value === "number" ? String(value) : value;
  return `"${text.replace(/"/g, '""')}"`;            // RFC-4180 quoting
}
export function buildCsv(rows: (string|number|null|undefined)[][]): string {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }); // ﻿ = BOM
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

CSV content rules:
- First rows = title, then `Per <date>`/`Periode <from> s/d <to>` + scope name, a blank row, then the header row, then data.
- **Amounts in CSV use 2 decimals** (`amount.toFixed(2)`) even though the screen shows none — keeps the spreadsheet numeric and locale-stable.
- Filename encodes statement + period: `neraca_2026-06-15.csv`, `buku-besar_<code>_<from>_<to>.csv`.
- If the host app standardizes on `.xlsx` (e.g. via a `sheetjs` exporter), keep that **and** offer CSV — CSV is the universal fallback and is what this standard guarantees.
