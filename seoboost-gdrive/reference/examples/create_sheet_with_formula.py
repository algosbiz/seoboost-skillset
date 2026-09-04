"""Example: Create Google Sheet dengan formula auto-compute.

Pattern dari [Project Klien — Verifikasi Pipeline] Form Builder.
"""

import time
from auth import get_credentials, get_drive_folder_id

import gspread
from googleapiclient.discovery import build


def create_sheet_with_formula(
    name: str,
    folder_id: str,
    gc: gspread.Client,
    sheets_service,
    header: list[str],
    data_rows: list[list],
    formula_col_idx: int,  # 0-indexed column dengan formula
    formula_template: str,  # e.g. "=F{row}*0.3+G{row}*0.35"
) -> str:
    """Generate Sheet dengan header + data + formula column.

    Args:
        name: Sheet title
        folder_id: Drive folder destination
        gc: gspread Client (from auth)
        sheets_service: Sheets API service (untuk formatting)
        header: List nama kolom
        data_rows: List of lists (1 row per peserta)
        formula_col_idx: Index kolom yg punya formula (0-indexed)
        formula_template: String formula dengan {row} placeholder (1-indexed sheet row)

    Returns:
        URL Sheet yang ke-created.
    """
    # Step 1: Create Sheet
    sheet = gc.create(name, folder_id=folder_id)
    worksheet = sheet.sheet1

    # Step 2: Build data with formula injected
    full_data = [header]
    for i, row in enumerate(data_rows, start=1):
        sheet_row_num = i + 1  # row 1 = header, row 2+ = data
        # Replace formula placeholder
        formula = formula_template.format(row=sheet_row_num)
        # Inject formula at formula_col_idx
        new_row = list(row)
        if formula_col_idx < len(new_row):
            new_row[formula_col_idx] = formula
        else:
            new_row.append(formula)
        full_data.append(new_row)

    # Step 3: Write — CRITICAL USER_ENTERED untuk formula
    worksheet.update(
        values=full_data,
        range_name="A1",
        value_input_option="USER_ENTERED",
    )

    # Step 4: Format header (bold + freeze)
    spreadsheet_id = sheet.id
    sheet_id_int = worksheet.id

    format_requests = [
        # Header bold + background
        {
            "repeatCell": {
                "range": {
                    "sheetId": sheet_id_int,
                    "startRowIndex": 0,
                    "endRowIndex": 1,
                    "startColumnIndex": 0,
                    "endColumnIndex": len(header),
                },
                "cell": {
                    "userEnteredFormat": {
                        "textFormat": {"bold": True, "fontSize": 11},
                        "backgroundColor": {
                            "red": 0.85, "green": 0.92, "blue": 0.83
                        },
                        "horizontalAlignment": "CENTER",
                        "verticalAlignment": "MIDDLE",
                        "wrapStrategy": "WRAP",
                    }
                },
                "fields": "userEnteredFormat(textFormat,backgroundColor,horizontalAlignment,verticalAlignment,wrapStrategy)",
            }
        },
        # Freeze header
        {
            "updateSheetProperties": {
                "properties": {
                    "sheetId": sheet_id_int,
                    "gridProperties": {"frozenRowCount": 1},
                },
                "fields": "gridProperties.frozenRowCount",
            }
        },
        # Header row taller
        {
            "updateDimensionProperties": {
                "range": {
                    "sheetId": sheet_id_int,
                    "dimension": "ROWS",
                    "startIndex": 0,
                    "endIndex": 1,
                },
                "properties": {"pixelSize": 60},
                "fields": "pixelSize",
            }
        },
    ]

    sheets_service.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={"requests": format_requests},
    ).execute()

    return sheet.url


def main():
    # Setup
    creds = get_credentials()
    gc = gspread.authorize(creds)
    sheets_service = build("sheets", "v4", credentials=creds)
    folder_id = get_drive_folder_id()

    # Example: Create Form Penjurian
    header = [
        "NO",
        "KODE",
        "Nama Peneliti",
        "Sekolah",
        "Pendahuluan (1-10, 30%)",
        "Metodologi (1-10, 35%)",
        "Data (1-10, 20%)",
        "Presentasi (1-10, 15%)",
        "Nilai",
    ]

    data = [
        [1, "PUT_M01", "Alif", "SMP X", "", "", "", "", None],  # juri isi
        [2, "PUT_M02", "Budi", "SMA Y", "", "", "", "", None],
        [3, "PUT_M03", "Citra", "SMP Z", "", "", "", "", None],
    ]

    formula_template = "=E{row}*0.3+F{row}*0.35+G{row}*0.2+H{row}*0.15"
    formula_col_idx = 8  # Kolom "Nilai" (0-indexed)

    url = create_sheet_with_formula(
        name="Form Test SEO Boost-GDrive",
        folder_id=folder_id,
        gc=gc,
        sheets_service=sheets_service,
        header=header,
        data_rows=data,
        formula_col_idx=formula_col_idx,
        formula_template=formula_template,
    )
    print(f"✓ Sheet created: {url}")
    print(f"  Verify formula: open URL, isi kolom E-H dengan angka 1-10, kolom I should auto-compute.")


if __name__ == "__main__":
    main()
