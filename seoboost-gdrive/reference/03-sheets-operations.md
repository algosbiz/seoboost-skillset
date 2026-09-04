# 03 — Sheets Operations (Battle-Tested Patterns)

## Setup (Dual Library: gspread + googleapiclient)

```python
import gspread
from googleapiclient.discovery import build

creds = get_credentials()
gc = gspread.authorize(creds)  # gspread: high-level (read/write data)
sheets = build("sheets", "v4", credentials=creds)  # raw API: batch updates, formatting
```

**Why both?** gspread = ergonomic for data CRUD. Raw API = required for batch formatting, complex updates.

## Create Sheet

### In Specific Drive Folder

```python
sheet = gc.create(
    "Form Final Matematika Dani",
    folder_id="<drive_folder_id>",  # required — Service Account note: see common-bugs.md
)
print(f"URL: {sheet.url}")
worksheet = sheet.sheet1
worksheet.update_title("Matematika")  # rename tab from "Sheet1"
```

### In Root Drive

```python
sheet = gc.create("Test Sheet")  # creates in user's My Drive root
```

## Write Data

### ⚠️ CRITICAL: USER_ENTERED for Formula

```python
# WRONG (default RAW) — formula akan tampil sebagai text "=A1+B1"
worksheet.update("C2", [["=A1+B1"]])

# RIGHT — formula execute as formula
worksheet.update(
    values=[["=A1+B1"]],
    range_name="C2",
    value_input_option="USER_ENTERED",
)
```

**Battle-tested rule:** ALWAYS pakai `USER_ENTERED` saat ada `=` di data. RAW only untuk plain text yang accidentally start dengan `=`.

### Batch Write (Header + Data)

```python
data = [
    ["NO", "KODE", "Nama", "Sekolah", "Nilai"],  # header row
    [1, "PUT_M01", "Alif", "SMP X", "=E2*0.3"],  # data row
    [2, "PUT_M02", "Budi", "SMA Y", "=E3*0.3"],
]
worksheet.update(values=data, range_name="A1", value_input_option="USER_ENTERED")
```

### Update Single Cell

```python
worksheet.update_cell(row=2, col=3, value="Halo")  # row+col 1-indexed
# OR
worksheet.update(values=[["Halo"]], range_name="C2")
```

### Append Row

```python
worksheet.append_row(["new", "row", "data"], value_input_option="USER_ENTERED")
```

## Read Data

### All Values

```python
data = worksheet.get_all_values()  # list of lists
for row in data:
    print(row)
```

### Specific Range

```python
# Header at row 1, data row 2+
header = worksheet.row_values(1)
data_rows = worksheet.get("A2:E100")  # explicit range
```

### Get Cell with Formula vs Value

```python
# Cell value (computed result)
val = worksheet.cell(2, 10).value  # default: computed

# Cell formula (raw)
formula = worksheet.cell(2, 10, value_render_option="FORMULA").value

# Unformatted value (no string conversion)
raw = worksheet.cell(2, 10, value_render_option="UNFORMATTED_VALUE").value
```

### Get Range with Render Option

```python
formulas = worksheet.get("J2:J7", value_render_option="FORMULA")
# Returns: [["=A2*0.3"], ["=A3*0.3"], ...]
```

## Clear Data

```python
# Single range
worksheet.batch_clear(["F2:I7"])

# Multiple ranges
worksheet.batch_clear(["A2:A100", "C5:D10"])

# Clear entire sheet (keep formatting)
worksheet.clear()
```

## Format Cells via Raw API

gspread doesn't expose formatting natively. Use raw `sheets_service.spreadsheets().batchUpdate()`:

```python
sheet_id_int = worksheet.id  # int property (worksheet tab ID)
spreadsheet_id = sheet.id    # string property (file ID)

requests = [
    # Header row bold + green background
    {
        "repeatCell": {
            "range": {
                "sheetId": sheet_id_int,
                "startRowIndex": 0, "endRowIndex": 1,
                "startColumnIndex": 0, "endColumnIndex": 10,
            },
            "cell": {
                "userEnteredFormat": {
                    "textFormat": {"bold": True, "fontSize": 11},
                    "backgroundColor": {"red": 0.85, "green": 0.92, "blue": 0.83},
                    "horizontalAlignment": "CENTER",
                    "verticalAlignment": "MIDDLE",
                    "wrapStrategy": "WRAP",
                }
            },
            "fields": "userEnteredFormat(textFormat,backgroundColor,horizontalAlignment,verticalAlignment,wrapStrategy)",
        }
    },
    # Freeze header row
    {
        "updateSheetProperties": {
            "properties": {
                "sheetId": sheet_id_int,
                "gridProperties": {"frozenRowCount": 1},
            },
            "fields": "gridProperties.frozenRowCount",
        }
    },
    # Set row height (header taller for wrapped text)
    {
        "updateDimensionProperties": {
            "range": {
                "sheetId": sheet_id_int,
                "dimension": "ROWS",
                "startIndex": 0, "endIndex": 1,
            },
            "properties": {"pixelSize": 60},
            "fields": "pixelSize",
        }
    },
]

sheets.spreadsheets().batchUpdate(
    spreadsheetId=spreadsheet_id,
    body={"requests": requests},
).execute()
```

### Column Widths

```python
col_widths = [40, 100, 180, 180, 200, 110, 130, 140, 130, 80]
requests = []
for col_idx, width in enumerate(col_widths):
    requests.append({
        "updateDimensionProperties": {
            "range": {
                "sheetId": sheet_id_int,
                "dimension": "COLUMNS",
                "startIndex": col_idx, "endIndex": col_idx + 1,
            },
            "properties": {"pixelSize": width},
            "fields": "pixelSize",
        }
    })
```

### Number Format (Currency, Date, Percentage)

```python
{
    "repeatCell": {
        "range": {"sheetId": sheet_id_int, "startColumnIndex": 4, "endColumnIndex": 5},
        "cell": {
            "userEnteredFormat": {
                "numberFormat": {
                    "type": "NUMBER",  # or DATE, CURRENCY, PERCENT
                    "pattern": "#,##0.000",  # 3 decimal
                }
            }
        },
        "fields": "userEnteredFormat.numberFormat",
    }
}
```

## Multiple Tabs (Worksheets)

### Create New Tab

```python
new_ws = sheet.add_worksheet(title="Stage 2 BA", rows=100, cols=20)
```

### Get Specific Tab

```python
ws = sheet.worksheet("Matematika")  # by title
# or
ws = sheet.get_worksheet(0)  # by index
```

### Delete Tab

```python
ws = sheet.worksheet("OldData")
sheet.del_worksheet(ws)
```

## Advanced: Conditional Format

```python
{
    "addConditionalFormatRule": {
        "rule": {
            "ranges": [{"sheetId": sheet_id_int, "startColumnIndex": 9, "endColumnIndex": 10}],
            "booleanRule": {
                "condition": {
                    "type": "NUMBER_GREATER",
                    "values": [{"userEnteredValue": "8"}],
                },
                "format": {
                    "backgroundColor": {"red": 0.7, "green": 1.0, "blue": 0.7},
                },
            },
        },
        "index": 0,
    }
}
```

## Open Existing Sheet

```python
# By URL
sh = gc.open_by_url("https://docs.google.com/spreadsheets/d/...")

# By Sheet ID
sh = gc.open_by_key("<spreadsheet_id>")

# By name (slow, searches Drive)
sh = gc.open("Form Final Matematika Dani")
```

## Battle-Tested Patterns ([Project Klien — Verifikasi Pipeline])

### Pattern: Generate 30 Sheet Form Penjurian

Mirror dari `scripts/penjurian_final/form_builder.py`:

```python
def build_form_for_juri(bidang, juri_nama, peserta_list, folder_id, gc, sheets_service):
    sheet_name = f"Form_Final_LPB_Program B_2026_{bidang}_{clean_juri_name(juri_nama)}"
    sheet = gc.create(sheet_name, folder_id=folder_id)
    worksheet = sheet.sheet1
    worksheet.update_title(bidang)
    
    HEADER = ["NO", "KODE RISET", "Peneliti 1", "Peneliti 2", "NAMA SEKOLAH",
              "Pendahuluan\n(nilai 1-10) 30%",
              "Metodologi Penelitian\n(nilai 1-10) 35%",
              "Data, Analisis, dan Simpulan\n(nilai 1-10) 20%",
              "Presentasi & QnA\n(nilai 1-10) 15%",
              "Nilai"]
    
    data = [HEADER]
    for idx, p in enumerate(peserta_list, start=1):
        row_in_sheet = idx + 1
        data.append([
            idx, p.kode_riset, p.peneliti_1, p.peneliti_2 or "", p.sekolah,
            "", "", "", "",  # juri akan isi
            f"=F{row_in_sheet}*0.3+G{row_in_sheet}*0.35+H{row_in_sheet}*0.2+I{row_in_sheet}*0.15",
        ])
    
    # CRITICAL: USER_ENTERED untuk formula
    worksheet.update(values=data, range_name="A1", value_input_option="USER_ENTERED")
    
    # Apply formatting batch
    apply_formatting(sheet.id, worksheet.id, sheets_service)
    
    return sheet.url
```

### Pattern: Read 30 Sheet + Aggregate

```python
def aggregate_3_juri(bidang, folder_id, gc):
    # Find sheets for bidang
    drive = build("drive", "v3", credentials=gc.auth)
    result = drive.files().list(
        q=f"'{folder_id}' in parents and name contains 'Form_Final_LPB_Program B_2026_{bidang}_'",
        fields="files(id, name)"
    ).execute()
    
    nilai_per_peserta = {}
    for sheet_info in result.get("files", []):
        sh = gc.open_by_key(sheet_info["id"])
        ws = sh.sheet1
        # Read data rows (skip header)
        data = ws.get("A2:J7", value_render_option="UNFORMATTED_VALUE")
        for row in data:
            kode = row[1]  # KODE RISET column
            nilai = {
                "pendahuluan": row[5],
                "metodologi": row[6],
                "data": row[7],
                "presentasi": row[8],
            }
            nilai_per_peserta.setdefault(kode, []).append(nilai)
    
    return nilai_per_peserta
```

### Pattern: Verify Formula Working

```python
def verify_formula(sheet_url, cell="J2"):
    sh = gc.open_by_url(sheet_url)
    ws = sh.sheet1
    formula = ws.cell(int(cell[1:]), 10, value_render_option="FORMULA").value
    is_ok = formula and formula.startswith("=") and not formula.startswith("'")
    print(f"{cell}: {repr(formula)} → {'✅' if is_ok else '❌'}")
    return is_ok
```

## Rate Limit Handling

Sheets API: 300 req/min per user. Untuk bulk operation:

```python
import time
for i, sheet_info in enumerate(many_sheets, 1):
    try:
        process_sheet(sheet_info)
        time.sleep(0.3)  # 0.3s × 30 sheets = 9s total delay
    except Exception as e:
        if "429" in str(e) or "503" in str(e):
            print(f"Rate limit hit at {i}, sleeping 60s")
            time.sleep(60)
            process_sheet(sheet_info)  # retry once
        else:
            raise
```

See `reference/examples/batch_with_retry.py` untuk pattern lengkap.
