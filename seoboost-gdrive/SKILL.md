---
name: seoboost-gdrive
description: Use when working with Google Workspace APIs (Drive, Sheets, Docs, Forms) for SEO Boost client projects — handles OAuth setup, token management, CRUD operations, and battle-tested patterns from production ([Project Klien — Verifikasi Pipeline]). Triggers on phrases like "create google sheet", "upload to drive", "share drive folder", "generate google doc", "buat google form", "gspread", "Google Workspace API", "Drive SEO Boost", or any task involving programmatic interaction with Google Drive/Sheets/Docs/Forms via Python.
---

# SEO Boost Google Drive / Sheets / Docs / Forms Skill

Reusable automation patterns for Google Workspace API across SEO Boost client projects. Built from battle-tested [Project Klien — Verifikasi Pipeline] pipeline (10 bidang × 60 finalis, 30 Google Sheet, 10 BA Final upload — successfully delivered 21 Mei 2026).

## Core Principle

**SATU credential setup, semua project SEO Boost pakai.** Pak [Operator] OAuth sekali (browser flow), token cached global di `~/SEOBoost/GoogleCloudConsole/.seoboost-gdrive-token.json`. Future project just reference `GOOGLE_OAUTH_CLIENT_PATH` env var → skill handle rest.

## When to Use

Trigger SKILL ini saat user request involve **automasi Google Workspace** untuk klien SEO Boost:

| Use Case | Triggers |
|---|---|
| **Google Drive** | upload file, share folder, create folder, list contents, delete file |
| **Google Sheets** | create sheet, write data, read sheet, formula otomatis, format cells, batch update |
| **Google Docs** | create doc, populate template, batchUpdate text, share with edit access |
| **Google Forms** | create form, add questions (radio/checkbox/text/scale), batch update |
| **OAuth Setup** | first-time setup, re-auth, scope update, token refresh |

## When NOT to Use

❌ Cuma butuh **read Excel/CSV** local — pakai `openpyxl` atau `pandas` langsung
❌ Generate **DOCX/PDF** lokal — pakai `python-docx` + LibreOffice (lihat `seoboost-formal-docs`)
❌ Personal Google account (bukan SEO Boost) — skill ini specific untuk `[your-email]@example.com` setup

## Prerequisites (One-Time Setup)

Sebelum skill bisa dipakai, satu kali setup ini harus selesai:

### Phase 1: Google Cloud Console (SEO Boost akun)

Reference: `reference/01-auth-setup.md` untuk full walkthrough.

1. Project Cloud: `drive-project-496915` (existing) — atau create new untuk org lain
2. Enable APIs: **Google Drive API + Sheets API + Docs API + Forms API**
3. OAuth Consent Screen: External, app name `SEO Boost [Project Klien — Verifikasi Pipeline] Automation`, test users include `[your-email]@example.com`
4. OAuth Client ID Desktop: download `client_secret_*.json` → save di `~/SEOBoost/GoogleCloudConsole/DriveProject/`

### Phase 2: Env Var per Project

Add ke `.env` file project (jangan commit ke Git):

```env
# SEO Boost Google Workspace API
GOOGLE_OAUTH_CLIENT_PATH=~/Documents/WORKSPACE/SEOBoost/GoogleCloudConsole/DriveProject/client_secret_<CLIENT_ID>.apps.googleusercontent.com.json
GOOGLE_DRIVE_TARGET_FOLDER_ID=<folder_id_dari_url_drive>
```

### Phase 3: First-Run Auth (sekali per skill scope)

Token cached **GLOBAL** di `~/SEOBoost/GoogleCloudConsole/.seoboost-gdrive-token.json`. First time skill jalan:
1. Browser otomatis open Google sign-in
2. Login dengan akun SEO Boost
3. Warning "Google hasn't verified this app" → klik **Advanced** → **Go to ... (unsafe)**
4. Consent semua scope (drive + sheets + docs + forms)
5. Browser redirect ke localhost → success
6. Token disimpan di global path → next runs headless

## Skill Workflow

When user request match trigger phrase, ALWAYS follow this order:

```
1. CHECK existing token global path
   ↓
2. IF token valid → proceed action
   IF token expired → auto-refresh via refresh_token
   IF token missing → run OAuth flow first (browser)
   ↓
3. Build correct API service (drive / sheets / docs / forms)
   ↓
4. Execute action dengan defense-in-depth:
   - Retry on 503/429 (transient API errors) with exponential backoff
   - USER_ENTERED untuk formula (BUKAN RAW)
   - XPath traversal untuk multi-table DOCX
   - Validate response before proceed
   ↓
5. Report concrete output (file ID, URL, content verified)
```

## Reference Documents

Skill ini punya 6 reference docs untuk deep-dive:

| Doc | When to read |
|---|---|
| `reference/01-auth-setup.md` | First-time setup atau token issues |
| `reference/02-drive-crud.md` | Folder + file CRUD operations |
| `reference/03-sheets-operations.md` | Sheets advanced (formula, format, batch) |
| `reference/04-docs-operations.md` | Docs template populate via batchUpdate |
| `reference/05-forms-operations.md` | Forms create + items (radio/text/scale) |
| `reference/06-common-bugs.md` | Battle-tested bug patterns + fixes |

## Examples Code (Reusable Snippets)

`reference/examples/`:

| File | Description |
|---|---|
| `auth.py` | Centralized OAuth get_credentials() — drop ke project |
| `create_sheet_with_formula.py` | Create Sheet + header + formula USER_ENTERED |
| `create_doc_from_template.py` | Read template DOCX → populate placeholder → save to Drive |
| `create_form_with_questions.py` | Create Form + add multiple-choice + text input |
| `share_to_email.py` | Share folder/file ke email tertentu (Editor/Commenter/Viewer) |
| `batch_with_retry.py` | Production-ready retry pattern (503/429 backoff) |

## Iron Laws (Non-Negotiable)

1. ❌ **JANGAN commit `client_secret_*.json`** ke Git — must di `.gitignore` (already covered: `*credentials*`, `*client_secret*`)
2. ❌ **JANGAN commit `.seoboost-gdrive-token.json`** — must di `.gitignore` (`*token*.json`)
3. ❌ **JANGAN share OAuth client secret di public channel** (chat WA group OK kalau private, tapi prefer not)
4. ✅ **SELALU pakai `value_input_option="USER_ENTERED"`** saat write formula ke Sheets (RAW = literal text bug)
5. ✅ **SELALU pakai XPath traversal `body.findall('.//' + qn('w:tbl'))`** untuk multi-table DOCX (python-docx `doc.tables` cuma top-level)
6. ✅ **SELALU implement retry** dengan exponential backoff untuk 503/429 (Google API rate limits)
7. ✅ **SELALU validate response** before claim success (read back, check ID, verify URL)
8. ✅ **SELALU request scope list LENGKAP yang sama di SEMUA skrip yang share satu token** — token menyimpan scope request terakhir saja; deteksi drift dari file token JSON, BUKAN `creds.scopes` (Bug 9)
9. ✅ **SELALU set + verifikasi permission SETELAH create→move, dan update artefak ter-share IN-PLACE** — izin tidak diwariskan saat pindah folder, dan link lama tidak menunjuk file baru (Bug 10 + 11)

## Decision Tree (Cepat)

```
User mention "Drive/Sheet/Doc/Form"?
├── YES + execute mode → Invoke this skill
└── NO → skip

User di project SEO Boost (.env ada `GOOGLE_OAUTH_CLIENT_PATH`)?
├── YES → proceed
└── NO → guide user setup .env first (lihat Phase 2 atas)

Token exists di `~/SEOBoost/GoogleCloudConsole/.seoboost-gdrive-token.json`?
├── YES → load + try refresh kalau expired
└── NO → run OAuth flow first (browser)

Action involves formula/multi-table/batch?
├── YES → reference common-bugs.md FIRST
└── NO → straight to operation
```

## Quick Start Template

Untuk project SEO Boost baru, paste ini ke project script:

```python
import os
from pathlib import Path
from dotenv import load_dotenv
from google.auth.exceptions import RefreshError
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

load_dotenv()

# Global token location (shared across SEO Boost projects)
TOKEN_PATH = Path.home() / "SEO Boost" / "GoogleCloudConsole" / ".seoboost-gdrive-token.json"
CLIENT_PATH = os.getenv("GOOGLE_OAUTH_CLIENT_PATH")

SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/forms.body",
]

def get_credentials():
    """Load credentials, refresh if expired, or run OAuth flow.

    Handles revoked/expired refresh tokens gracefully: if refresh fails
    (RefreshError "invalid_grant"), the stale token is deleted and a fresh
    browser OAuth flow runs instead of crashing. This is EXPECTED when the
    OAuth consent screen is in "Testing" mode (refresh tokens expire ~7 days).
    """
    creds = None
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)

    if creds and creds.valid:
        return creds

    refreshed = False
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            refreshed = True
        except RefreshError:
            # Refresh token revoked/expired → re-auth from scratch
            try:
                TOKEN_PATH.unlink()
            except FileNotFoundError:
                pass
            creds = None

    if not refreshed and (not creds or not creds.valid):
        if not CLIENT_PATH or not Path(CLIENT_PATH).exists():
            raise SystemExit(
                f"GOOGLE_OAUTH_CLIENT_PATH tidak valid: {CLIENT_PATH}. "
                "Set di .env ke path client_secret_*.json"
            )
        flow = InstalledAppFlow.from_client_secrets_file(CLIENT_PATH, SCOPES)
        creds = flow.run_local_server(port=0)

    TOKEN_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(TOKEN_PATH, "w") as f:
        f.write(creds.to_json())

    return creds


# Use:
# from googleapiclient.discovery import build
# import gspread
# 
# creds = get_credentials()
# drive = build("drive", "v3", credentials=creds)
# sheets = build("sheets", "v4", credentials=creds)
# docs = build("docs", "v1", credentials=creds)
# forms = build("forms", "v1", credentials=creds, discoveryServiceUrl="https://forms.googleapis.com/$discovery/rest?version=v1")
# gc = gspread.authorize(creds)
```

## Cost Awareness

Google Workspace API rate limits (free tier):
- **Sheets API**: 300 read/write per minute per user
- **Drive API**: 1000 queries per 100 seconds per user
- **Docs API**: 60 batchUpdate per minute per user (lebih ketat)
- **Forms API**: 60 batchUpdate per minute per user

Untuk bulk operations (30+ Sheets), implement retry + delay (0.3s) antara request — referensi `reference/examples/batch_with_retry.py`.

## Project References (Battle-Tested)

- **[Project Klien — Verifikasi Pipeline]** (workspace Klien B: `.implementation-plan/program-b-2026-verification/scripts/penjurian_final/` — cek `ProjectDocs/` lebih dulu kalau workspace itu sudah dimigrasi ke konvensi 25 Jul 2026):
  - Generated 30 Google Sheet (urutan acak, formula auto-compute)
  - Read 30 Excel hari H + aggregate weighted
  - Output 10 BA Final + upload-ready
- Decisions log: D-074, D-077 (skill ini codify lessons)

## Anti-Patterns

1. ❌ **Service Account untuk personal Google account** — SA tidak punya Drive storage quota, akan error 403 (lihat D-077). Use OAuth Desktop instead.
2. ❌ **Service Account share to folder** untuk create Sheet di personal account — same issue. Workaround: OAuth user-auth.
3. ❌ **Polling Sheet every second** — hit rate limit. Use batch read.
4. ❌ **Hardcoded folder ID in code** — pakai env var `GOOGLE_DRIVE_TARGET_FOLDER_ID`.
5. ❌ **Single token shared antar tool unrelated** — SEO Boost projects OK (same scopes), tapi jangan reuse untuk personal tool.

## Related Skills

- `seoboost-decision-tracking` — log keputusan klien (mis. saat user decide config Drive)
- `seoboost-fork-checkpoint` — update docs sebelum fork
- `seoboost-formal-docs` — generate DOCX lokal (sebelum upload via gdrive)
- `seoboost-versioned-output` — naming file output

## Trigger Phrases That Match This Skill

- "create google sheet untuk client"
- "upload ke Drive SEO Boost"
- "share folder Drive"
- "buat google doc dari template"
- "generate google form questions"
- "gspread / Google API setup"
- "kirim ke Drive klien"
- "automasi Google Workspace"
- "OAuth Google setup"
- "Drive folder SEO Boost private"
- "batch update Google Sheet"
- "format cells Sheet via API"

## Honest Acknowledgment

Skill ini built **dari satu use case real** ([Project Klien — Verifikasi Pipeline]). Patterns proven untuk:
✅ Sheets create + write + formula + format
✅ Drive folder CRUD + share permission
✅ OAuth Desktop flow + token caching
✅ Multi-table DOCX populate

Belum ter-test secara extensive untuk:
🟡 Docs API batchUpdate (added based on Google docs, belum production use)
🟡 Forms API create/update (added based on Google docs, belum production use)

Saat first real use case Docs/Forms muncul, update skill dengan **lessons learned** + edge cases.
