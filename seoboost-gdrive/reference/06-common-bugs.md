# 06 — Common Bugs + Fixes (Battle-Tested)

## Bug 1: Formula as Literal Text (gspread USER_ENTERED)

### Symptom
Cell shows `'=A1+B1` (dengan leading apostrophe) instead of computing formula.

### Root Cause
gspread `worksheet.update()` default `value_input_option="RAW"` — treat `=` sebagai literal string.

### Fix
ALWAYS pass `value_input_option="USER_ENTERED"`:

```python
# WRONG
worksheet.update("J2", [["=F2*0.3+G2*0.35"]])

# RIGHT
worksheet.update(
    values=[["=F2*0.3+G2*0.35"]],
    range_name="J2",
    value_input_option="USER_ENTERED",
)
```

### Source
[Project Klien — Verifikasi Pipeline], malam 20 Mei 23:55 — Pak [Operator] detect bug via screenshot. Fix di 30 Sheet via clear+rewrite.

Decision: D-077 (lessons learned).

---

## Bug 2: Service Account Storage Quota Exceeded

### Symptom
```
APIError: [403]: The user's Drive storage quota has been exceeded.
```

### Root Cause
Service Account TIDAK punya Drive storage di akun gratis (non-Workspace).

Service Account = robot account, tidak ada storage assignment.

### Fix
Switch ke OAuth Desktop (user-auth). User Google account has 15GB free quota.

```python
# WRONG (untuk personal Google account)
creds = service_account.Credentials.from_service_account_file("sa.json", scopes=SCOPES)

# RIGHT
flow = InstalledAppFlow.from_client_secrets_file("oauth_client.json", SCOPES)
creds = flow.run_local_server(port=0)
```

### Alternative Workarounds
- **Workspace Shared Drive** (paid): Service Account dapat create di Shared Drive (storage di-bill ke org)
- **Domain-wide Delegation**: Service Account impersonate user (need Workspace admin)

### Source
[Project Klien — Verifikasi Pipeline], malam 20 Mei 22:30 — Setup Service Account first, then switch ke OAuth karena bug ini.

Decision: D-074 (Opsi A OAuth confirmed).

---

## Bug 3: python-docx doc.tables Miss Nested Tables

### Symptom
```python
doc = Document("template.docx")
print(len(doc.tables))  # Returns 1, but actual file has 2 tables
```

### Root Cause
`python-docx` `doc.tables` cuma return **top-level tables** dari body. Tables nested di sections/textboxes/headers missed.

### Detection
```python
from docx.oxml.ns import qn

# Check ALL via XPath
all_tbl = doc.element.body.findall(".//" + qn("w:tbl"))
print(f"Actual count: {len(all_tbl)}")  # might be different from doc.tables
```

### Fix
Use XPath traversal untuk get all tables:

```python
from docx.oxml.ns import qn
from docx.table import Table as _Table

all_tbl_elements = doc.element.body.findall(".//" + qn("w:tbl"))
all_tables = [_Table(tbl, doc) for tbl in all_tbl_elements]

# Now process all tables
for table in all_tables:
    for row in table.rows:
        for cell in row.cells:
            # ...
```

### Source
[Project Klien — Verifikasi Pipeline], 21 Mei 13:45 — Bu [Klien] flag TTD juri table tidak ke-replace. Template nama orang punya 2 tables, `doc.tables` cuma read 1.

Decision: D-077.

---

## Bug 4: Transient API Errors (429 / 503)

### Symptom
```
APIError: [429]: Quota exceeded for quota metric 'Read requests'
APIError: [503]: The service is currently unavailable
```

### Root Cause
- **429**: Rate limit hit (Google API per-minute quota)
- **503**: Transient server issue (Google side, rare)

### Fix
Implement retry with exponential backoff:

```python
import time

def call_with_retry(operation, max_retries=3):
    for attempt in range(max_retries):
        try:
            return operation()
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "503" in err_str:
                if attempt < max_retries - 1:
                    wait = 2 ** attempt  # 1s, 2s, 4s
                    print(f"  Retry {attempt+1} after {wait}s: {err_str[:60]}")
                    time.sleep(wait)
                    continue
            raise  # non-retryable or max retries

# Usage:
result = call_with_retry(lambda: gc.open_by_key(sheet_id).sheet1.update(values=data))
```

### Prevention
- Add `time.sleep(0.3)` between bulk requests
- Batch operations into single API call where possible
- Cache reads (don't poll)

### Source
[Project Klien — Verifikasi Pipeline], 20 Mei 23:00 — 30 Sheet auto-fix loop hit 503 at sheet 7. Fix dengan retry pattern.

---

## Bug 5: Forms API "discoveryServiceUrl Required"

### Symptom
```
google.auth.exceptions.GoogleAuthError: Forms API requires explicit discoveryServiceUrl
```

### Root Cause
Forms API tidak include di default Google API client discovery. Need explicit URL.

### Fix
```python
# WRONG
forms = build("forms", "v1", credentials=creds)

# RIGHT
DISCOVERY_DOC = "https://forms.googleapis.com/$discovery/rest?version=v1"
forms = build("forms", "v1", credentials=creds, discoveryServiceUrl=DISCOVERY_DOC, static_discovery=False)
```

---

## Bug 6: Docs API Create Doesn't Support `parents`

### Symptom
```python
docs.documents().create(body={"title": "Doc", "parents": ["folder_id"]}).execute()
# Doc created but in ROOT Drive, not target folder
```

### Root Cause
`documents.create` API doesn't honor `parents` field. Need 2-step: create → move via Drive API.

### Fix
```python
# Step 1: Create doc (di root)
doc = docs.documents().create(body={"title": "Doc"}).execute()
doc_id = doc["documentId"]

# Step 2: Move ke folder via Drive API
file = drive.files().get(fileId=doc_id, fields="parents").execute()
prev = ",".join(file.get("parents", []))
drive.files().update(
    fileId=doc_id,
    addParents="<target_folder_id>",
    removeParents=prev,
    fields="id, parents",
).execute()
```

---

## Bug 7: Sheet Token Cached with Wrong Scopes

### Symptom
```
HttpError 403: The caller does not have permission
```
Padahal sudah authorize OAuth flow.

### Root Cause
Token cached dengan **scope lama**. Update SCOPES list di code, tapi token belum re-issued.

### Fix
Delete token file → re-run OAuth flow:

```bash
rm ~/SEOBoost/GoogleCloudConsole/.seoboost-gdrive-token.json
# Run script again → browser flow → consent dengan scope baru
```

---

## Bug 8: Drive Folder Share to Service Account Returns 403

### Symptom
Already shared folder ke Service Account email dengan role Editor, tapi:
```
APIError: [403]: Insufficient permissions for the specified parent
```

### Root Cause
Saat share Drive folder, kalau check **"Notify people"** + Service Account email = bukan akun real:
- Google reject email notification (bounce back)
- Share might fail silently atau partial

### Fix
**UNCHECK "Notify people"** saat share ke Service Account.

Atau via API:
```python
drive.permissions().create(
    fileId=folder_id,
    body={"type": "user", "role": "writer", "emailAddress": sa_email},
    sendNotificationEmail=False,  # IMPORTANT
).execute()
```

---

## Bug 9: Shared Token Menyempit — Scope Ter-evict oleh Skrip Lain

### Symptom
```
HttpError 403: Request had insufficient authentication scopes
```
Kemarin bisa akses Drive, hari ini 403 — padahal skrip yang gagal tidak berubah. Muncul setelah skrip LAIN (yang share token sama) jalan dan refresh token.

### Root Cause
Token file menyimpan scopes dari **request terakhir**, BUKAN union semua scope yang pernah di-consent. Satu token global dipakai banyak skrip → skrip dengan SCOPES lebih sempit yang refresh terakhir meng-evict scope lainnya.

Jebakan kedua saat mau deteksi: `Credentials.from_authorized_user_file(path, SCOPES).scopes` mengembalikan scopes yang **DIREQUEST** (echo argumen), bukan yang tersimpan di file — jadi `set(SCOPES) - set(creds.scopes)` selalu kosong dan tidak pernah mendeteksi eviction.

### Fix
1. **Semua skrip yang share satu token request scope list LENGKAP yang sama** — jangan ada skrip yang minta subset.
2. Deteksi drift dengan baca scopes dari **file token JSON langsung**:

```python
import json
tersimpan = set(json.loads(TOKEN_PATH.read_text()).get("scopes", []))
creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)
if not creds.valid or creds.expired or set(SCOPES) - tersimpan:
    creds.refresh(Request())
    TOKEN_PATH.write_text(creds.to_json())
```

3. Regression test: sengaja tulis token ber-scope sempit, jalankan urutan skrip produksi, pastikan semua pulih sendiri.

### Source
[Project Klien — Lomba 2026], 15-16 Jul — 403 baca folder pada H-1 malam event. Fix pertama pakai `creds.scopes` GAGAL diam-diam (check selalu lolos); fix kedua baca file token. Bug 7 adalah varian sederhananya (scope berubah di code); Bug 9 ini varian multi-skrip yang kambuh sendiri.

---

## Bug 10: Izin Folder Tidak Diwariskan saat Create-lalu-Pindah

### Symptom
File dibuat akun sendiri lalu dipindah (`files.update` + `addParents`) ke folder klien yang sudah shared. Penerima link dapat halaman "Request access" — 0/N file bisa dibuka, padahal folder induknya bisa.

### Root Cause
File yang dibuat di My Drive lalu **dipindah** ke folder shared tidak selalu inherit permission folder tujuan (beda dengan create langsung di dalam folder). Tidak ada error saat move — gagalnya baru ketahuan waktu orang lain buka link.

### Fix
Setelah create→move, set permission eksplisit dan **verifikasi SEMUA file** (bukan sampel):

```python
drive.permissions().create(
    fileId=file_id,
    body={"type": "anyone", "role": "writer"},  # sesuaikan kebutuhan
).execute()
# verifikasi balik:
perms = drive.permissions().list(fileId=file_id).execute()["permissions"]
assert any(p["type"] == "anyone" for p in perms), file_id
```

Daftar file yang diverifikasi ambil dari `files.list` folder Drive langsung — JANGAN dari registry lokal (lihat Bug 12; pernah "verifikasi OK" padahal cuma 2 dari 20 file yang tercek karena registry-nya kurang).

### Source
[Project Klien — Lomba 2026], 16 Jul 15.14 WITA — 20 sheet juri tidak bisa dibuka saat undangan email juri sudah terkirim; fix live ok=20.

---

## Bug 11: Link Ter-share Menampilkan Data Lama (Recreate vs Update-In-Place)

### Symptom
"Sheet sudah saya update" tapi klien masih lihat data lama di link yang mereka pegang.

### Root Cause
Generator create spreadsheet **BARU** tiap run. Link lama yang terlanjur dibagikan tetap menunjuk file lama — dan tidak ada error apa pun.

### Fix
Setiap generator sheet WAJIB punya mode update-in-place (mis. flag `--sheet <ID>`):

```python
sheets.spreadsheets().values().batchClear(
    spreadsheetId=SHEET_ID,
    body={"ranges": [f"'{tab}'!A:Z" for tab in tabs]},
).execute()
# lalu rewrite values; tab baru via batchUpdate addSheet.
# JANGAN delete tab yang mungkin sedang dibuka orang — clear + rewrite.
```

Recreate hanya untuk publish PERTAMA. Saat verifikasi sinkron, **bandingkan NILAI sel, bukan proxy metadata** — jumlah baris / kolom ringkasan bisa identik padahal nilainya beda.

### Source
[Project Klien — Lomba 2026], 16 Jul — dua kejadian di hari yang sama: sheet daftar juara ter-share menampilkan 6 grup saat data live sudah 8; sheet rekap masih menampilkan nilai pre-koreksi saat link-nya beredar di grup juri (check "sinkron" sebelumnya membandingkan kolom ringkasan, bukan nilai).

---

## Bug 12: Registry Lokal Tertimpa — Downstream Memproses Subset Tanpa Error

### Symptom
Langkah downstream sukses tapi hanya memproses sebagian entitas (mis. 1 dari 10 grup). Tidak ada exception — output-nya saja yang kurang.

### Root Cause
Registry JSON lokal (map grup → sheet ID) ditulis **whole-file per batch run**. Batch terakhir menimpa entri batch-batch sebelumnya.

### Fix
1. **Drive folder listing = source of truth.** Rebuild registry dari `files.list` (parse nama file) saat ragu — jangan percaya cache lokal.
2. Kalau menulis registry: **merge per key**, jangan overwrite whole-file.
3. Gate downstream: `assert len(registry) == jumlah file di folder` sebelum proses.

### Source
[Project Klien — Lomba 2026], 16 Jul — output pemenang sempat kehilangan 9 dari 10 grup; registry tertimpa DUA KALI di hari yang sama sebelum akhirnya di-rebuild dari Drive listing.

---

## General Defensive Patterns

### Always Validate Token Before Use

```python
creds = get_credentials()
if not creds.valid:
    raise RuntimeError("Credentials invalid after refresh attempt")
```

### Verify Response

```python
result = sheets.spreadsheets().values().update(...).execute()
if "updatedRange" not in result:
    raise RuntimeError(f"Update unclear: {result}")
```

### Log Operations

```python
import logging
log = logging.getLogger("seoboost_gdrive")

log.info(f"Creating sheet '{name}' in folder {folder_id[:8]}...")
sheet = gc.create(name, folder_id=folder_id)
log.info(f"  ✓ Created: id={sheet.id}, url={sheet.url}")
```

### Defensive Cleanup

```python
try:
    sheet = gc.create("Test")
    # ... operations
except Exception as e:
    # Cleanup partial state
    if sheet:
        try:
            drive.files().delete(fileId=sheet.id).execute()
        except:
            pass
    raise
```

## Anti-Patterns

❌ **Hardcode credential path in code** → use env var
❌ **Catch all exceptions silently** → re-raise or log specifically
❌ **Multiple separate API calls** → batch where possible
❌ **Polling for state change** → use webhook/notification API
❌ **Single retry for all errors** → only retry transient (429/503)

## When to Update This Doc

Add bug + fix saat:
- Encounter new API quirk
- Discover edge case in production
- Find Google API docs unclear / incorrect

Format: Symptom → Root Cause → Fix → Source (project + decision log).
