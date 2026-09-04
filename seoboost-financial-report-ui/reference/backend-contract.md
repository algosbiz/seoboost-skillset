# Backend Contract (BE computes, FE renders)

The report UI is only as trustworthy as the contract behind it. This file defines the BE→FE shape, the scope params, consolidation, and performance. Stack-agnostic in principle; examples use NestJS + Prisma (Postgres) since that's the SEO Boost default.

## Precondition: a double-entry ledger must exist

These reports recompute from **POSTED journal lines as the immutable source of truth**. Before building any report UI, confirm the product has:
- A **chart of accounts** (`account_code`, `account_type`, self-referential `parent_id` hierarchy, `is_contra` for contra accounts, per-legal-entity uniqueness).
- A **journal** (header + lines) with `debit_amount`/`credit_amount` as `Decimal`, posting status (DRAFT/POSTED), and reversal links.
- **Dimensional tags** on journal lines for any non-legal-entity slicing you need (`project_id`, `department_id`, `unit_id`, `customer_id`).
- A **period-close** mechanism so closed periods are immutable (enables aggressive caching).

If only invoices/expenses exist with no GL, the report UI is premature — building the ledger is the prerequisite project.

## Presentation-ready DTOs (freeze these first)

Each statement returns ONE fully-computed shape. The FE renders it verbatim. **Freeze these as exported interfaces/types shared by BE and FE before building either side** — contract drift (sign of contra accounts, header-row totals, consolidated vs scoped) is the #1 failure mode.

```ts
interface BalanceSheetReport {
  asOf: string;
  balanced: boolean;                 // BE decides. FE never recomputes.
  assets: Section; liabilities: Section; equity: Section;
  currentYearEarnings: { accountCode: string; amount: number };
}
interface Section {
  total: number;
  groups: {
    parentCode: string; parentName: string; total: number;
    isBrandLevel?: boolean; note?: string;   // honest disclosure metadata
    lines: { accountId: string; accountCode: string; accountName: string; amount: number }[];
  }[];
}

interface CashFlowReport {
  from: string; to: string;
  reconciled: boolean;               // computed cash change == actual cash change
  netProfit: number;
  operating: CashFlowSection; investing: CashFlowSection; financing: CashFlowSection;
  netCashChange: number; actualCashChange: number;
}
interface CashFlowSection { total: number; lines: { accountCode: string; accountName: string; amount: number }[]; }

interface GeneralLedgerReport {
  accountCode: string; accountName: string; accountType: string;
  from: string; to: string;
  openingBalance: number;
  lines: { postedAt: string; description: string; memo?: string; debit: number; credit: number; runningBalance: number }[];
  closingBalance: number;
}
```

Server-side responsibilities the FE must NEVER duplicate:
- Resolve **`is_contra` sign flips** and **`parent_id` rollups** — FE must not re-derive sign or hierarchy.
- Compute every subtotal, total, opening/closing balance, and **running balance** (SQL window function).
- Decide `balanced` / `reconciled` and attach `note` / `isBrandLevel` disclosure metadata.

## Scope params

The scope dimension is product-specific but the *convention* is fixed: **a required tenant key + an optional sub-scope; absent sub-scope = consolidated.**

- A salon/POS product: `locationId | null` (null = all outlets consolidated).
- Multi-company platform: `companyId` (required, the legal-entity boundary) + `unitId?` (optional; absent = consolidated across all units of that company). Often passed as headers (`company-uuid` required, `unit-uuid` optional).
- Do not invent a new param name when the product already has one wired — reuse it.

Consolidation across sub-scopes = aggregate POSTED lines `WHERE company_id = ? AND (unit_id = ? OR :unitId IS NULL)`.

## Multi-tenancy, isolation, eliminations

- Every financial endpoint: `JwtAuthGuard + PermissionGuard` with an `accounting:read` (or equivalent) permission. Every query filters by the tenant key.
- **Validate the requested sub-scope belongs to the tenant** before querying (e.g. `unitId ∈ companyId` via the junction table). Otherwise a user can read another tenant's data by guessing a UUID. This is a real, easy-to-miss hardening.
- **Intercompany elimination** only matters at a *group* (parent-company) roll-up. If tenancy tops out at a single legal entity, cross-company consolidation is out of scope until a group/parent model exists — flag it as a future entity, not a v1 concern. When it does exist: eliminate intercompany AR↔AP and intra-group margin, but **never eliminate the tax liability** (an intercompany invoice still carries real PPN/PPh with the tax authority).

## Performance

- **General Ledger:** keyset-paginate by `(entry_date, id)` — never `OFFSET`. Running balance = SQL window `SUM(debit-credit) OVER (ORDER BY entry_date, id)` seeded by an opening-balance subquery at period start, computed in Postgres, not Node.
- **Indexes:** ensure journal lines have a covering index for GL (`(account_id)` + composite on `(journal_entry_id)`) and the header has `(tenant, status, entry_date)`. Missing line indexes = full table scan at volume.
- **Cache computed reports** (Trial Balance / Balance Sheet / P&L) keyed on `(tenant, sub-scope?, period)` **off the period-close watermark**: closed periods are immutable → cache indefinitely; only the open period invalidates on a new POST.

## Sequencing (when extending an existing ledger to reach report parity)

1. Add the sub-scope-∈-tenant guard + the missing journal-line indexes (correctness + perf foundation).
2. Freeze the exported report DTO interfaces (shared BE/FE).
3. Build the missing endpoints to reach parity (commonly Cash Flow + General Ledger if Trial Balance / P&L / Balance Sheet already exist).
4. Add report caching keyed on the close watermark.
