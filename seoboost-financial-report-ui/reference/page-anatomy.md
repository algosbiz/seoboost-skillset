# Page Anatomy

The skeleton every SEO Boost financial-report page follows. Distilled from a reference salon-ERP product's `balance-sheet`, `cash-flow`, and `general-ledger` pages. Framework shown is Next App Router + React; translate idioms to the host stack (e.g. `.jsx` + JSDoc for a JS repo) but keep the structure.

## The page skeleton

```tsx
export default function BalanceSheetPage() {
  // 1) State: period + scope. Compute "today"/"month start" with useMemo, not inline.
  const today = useMemo(() => toIsoDate(new Date()), []);
  const [asOf, setAsOf] = useState(today);
  const [scopeId, setScopeId] = useState<string | null>(null); // null = consolidated

  // 2) One react-query hook per statement. The hook returns the computed DTO.
  const { data, isLoading, isError, refetch } = useBalanceSheet({ asOf, scopeId });
  const scopeName = useScopeName(scopeId);

  // 3) Derive emptiness from the DTO (no groups + no earnings = empty, not error).
  const isEmpty = data != null && /* all sections empty */;
  const hasData = data != null && !isEmpty;

  return (
    <div className="report-print flex flex-col gap-4">   {/* print wrapper */}
      <PageHeader
        title="Neraca (Balance Sheet)"
        description={`Per ${formatDate(asOf, "long")} · ${scopeName}`}
        actions={
          <div className="print-hidden flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm"><Link href="/reports"><ArrowLeft/>Kembali</Link></Button>
            <Button variant="outline" size="sm" disabled={!hasData} onClick={() => window.print()}><Printer/>Cetak</Button>
            <Button variant="outline" size="sm" disabled={!hasData} onClick={() => data && exportCsv(data, scopeName)}><Download/>Ekspor CSV</Button>
          </div>
        }
      />

      {/* Filter card — stripped from print */}
      <Card className="print-hidden">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          {/* date control(s) */}
          <DateField id="bs-asof" label="Per Tanggal" value={asOf} onChange={setAsOf} />
          <ScopeFilter value={scopeId} onChange={setScopeId} />
          <Button variant="outline" size="sm" onClick={() => setAsOf(today)}>Hari ini</Button>

          {hasData && (
            <div role="status" aria-live="polite" className="ml-auto flex items-end">
              <IntegrityBadge balanced={data.balanced} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Four states — ALWAYS all four */}
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <SkeletonCard rows={8} />
      ) : isEmpty ? (
        <Card><CardContent className="py-12">
          <EmptyState
            icon={FileSpreadsheet}
            title="Belum ada saldo"
            description="Belum ada transaksi yang membentuk neraca pada tanggal ini. Catat jurnal manual atau selesaikan transaksi terlebih dahulu."
            action={<Button asChild variant="outline"><Link href="/accounting/journal/new">Catat Jurnal Manual</Link></Button>}
          />
        </CardContent></Card>
      ) : (
        <>
          {scopeId && <PartialScopeCaveat />}   {/* honest disclosure when filtered */}
          <BalanceSheetTable report={data} caption={`Neraca per ${formatDate(asOf,"long")}, ${scopeName}`} />
        </>
      )}
    </div>
  );
}
```

## Rules embedded above

- **`report-print` wrapper on the page root, `print-hidden` on toolbar + filter card.** The print stylesheet (see `table-and-export.md`) keys off these to print only the statement.
- **Description line always states period + scope.** This is what makes a printed page self-describing.
- **Cetak / Ekspor disabled until `hasData`.** Never export an empty or loading report.
- **Emptiness is derived from the DTO, not from a 404.** An empty period is a valid state with its own onboarding copy, not an error.
- **The integrity badge only renders with data**, right-aligned (`ml-auto`), wrapped in `role="status" aria-live="polite"`.
- **The partial-scope caveat renders only when a scope filter is active** and the statement becomes partial.

## The four states (verbatim discipline)

1. **Error** → `<ErrorState onRetry={refetch} />`. Always retryable.
2. **Loading** → skeleton rows inside a Card (`Array.from({length:N}).map(... <Skeleton/>)`), N ≈ the statement's row count so layout doesn't jump.
3. **Empty** → `<EmptyState icon title description action />`. The `action` points to the next logical step (record a journal, pick an account, choose a period). The empty state is onboarding.
4. **Data** → the statement table (+ caveat if scoped).

For reports that require a selection before they can run (General Ledger needs an account), the "no selection yet" state is its own empty state shown *before* loading: "Pilih akun untuk menelusuri" with an action to open the Trial Balance. Gate the query with `{ enabled: Boolean(accountId) }`.

## Period & date controls

- Single `as-of` date for point-in-time statements (Neraca, Trial Balance).
- `Dari`/`Sampai` range for period statements (P&L, Arus Kas, Buku Besar), preceded by `ReportPeriodPresets` (Bulan Ini / Bulan Lalu / Kuartal Ini / Tahun Ini).
- A "Hari ini" / "Bulan ini" reset button.
- **Preset ranges are computed inside the click handler, never at render** — render-time `new Date()` causes hydration mismatch.

## The report index page

A landing page that (a) shows the headline statement inline (e.g. a P&L summary with the same filter card) and (b) links out to each detailed statement as cards (icon + title + one-line description + arrow). It is the table of contents for the financial surface.
