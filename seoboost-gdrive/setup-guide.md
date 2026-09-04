# Setup Guide — seoboost-gdrive

Middle-ground guide untuk new SEO Boost engineer atau new project. Skip kalau pakai existing setup SEO Boost.

## Pre-Requisite Verification

```bash
# Python venv with required libs
.venv/bin/pip install \
    gspread \
    google-auth \
    google-auth-oauthlib \
    google-auth-httplib2 \
    google-api-python-client \
    python-dotenv
```

## Path 1: Pakai SEO Boost Existing Setup (Recommended untuk Project Baru)

### Cek apakah existing Cloud Project tersedia

Existing setup SEO Boost (per Mei 2026):
- **Project ID:** `drive-project-496915`
- **Project name:** Drive Project (SEO Boost)
- **OAuth Client:** `SEO Boost Python CLI` (Desktop type)
- **Credential file:** `~/Documents/WORKSPACE/SEOBoost/GoogleCloudConsole/DriveProject/client_secret_<CLIENT_ID>.apps.googleusercontent.com.json`
- **Token (global):** `~/SEOBoost/GoogleCloudConsole/.seoboost-gdrive-token.json`
- **APIs enabled:** Sheets, Drive, Docs, Forms

### Step 1: Cek credential file exist

```bash
ls -la ~/Documents/WORKSPACE/SEOBoost/GoogleCloudConsole/DriveProject/
```

Kalau ada `client_secret_2_*.json` → skip ke Step 3.

Kalau gak ada → coba minta access ke Pak [Operator] (sensitive file, jangan ke-commit).

### Step 2: Add credential to project `.env`

Create/edit `.env` di project root:

```env
GOOGLE_OAUTH_CLIENT_PATH=~/Documents/WORKSPACE/SEOBoost/GoogleCloudConsole/DriveProject/client_secret_<CLIENT_ID>.apps.googleusercontent.com.json

# Optional: kalau project pakai specific folder Drive
GOOGLE_DRIVE_TARGET_FOLDER_ID=<folder_id_dari_url>
```

### Step 3: Verify `.gitignore`

Pastikan ini exist:
```
.env
.env.local
*.env
credentials/
*token*.json
*client_secret*.json
```

### Step 4: Run first time

Run any script yang use `get_credentials()`:

```bash
.venv/bin/python -c "from auth import get_credentials; print(get_credentials())"
```

Behavior:
- Kalau token sudah ada di `~/SEOBoost/GoogleCloudConsole/.seoboost-gdrive-token.json` → silent success
- Kalau token belum ada → browser open → consent → save token → done

Future runs: headless, no browser.

---

## Path 2: Setup Cloud Project Baru (untuk Different SEO Boost Sub-Project / Test)

Skip kalau Path 1 OK.

### Step 1: Create Cloud Project

1. https://console.cloud.google.com/ (login dengan akun SEO Boost)
2. Top dropdown → **NEW PROJECT**
3. Name: `SEO Boost [SubProject] Drive` (e.g. `SEO Boost [Project A] Drive`)
4. Create + select

### Step 2: Enable APIs

URL: `https://console.cloud.google.com/apis/library?project=<PROJECT_ID>`

Enable 4 API:
1. **Google Drive API**
2. **Google Sheets API**
3. **Google Docs API**
4. **Google Forms API**

(Click each → ENABLE button)

### Step 3: OAuth Consent Screen

1. APIs & Services → OAuth consent screen
2. User Type: **External**
3. App info:
   - App name: `SEO Boost [SubProject] Automation`
   - User support email: `[your-email]@example.com`
   - Developer contact: `[your-email]@example.com`
4. Scopes: SKIP
5. Test users: add `[your-email]@example.com`
6. Save & back to dashboard

### Step 4: Create OAuth Client ID

1. APIs & Services → Credentials
2. **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Desktop app**
4. Name: `SEO Boost Python CLI`
5. CREATE
6. Download JSON → save di `~/Documents/WORKSPACE/SEOBoost/GoogleCloudConsole/<SubProject>/client_secret_*.json`

### Step 5: Continue from Path 1 Step 2

---

## Drive Folder Setup

### Option A: Pakai folder existing

Catat folder ID dari URL Drive folder:
```
https://drive.google.com/drive/folders/1EdxPUcFEc_MbFjYYCWG6jFDU2Ua_bt1d
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                       This is the folder ID
```

Add to `.env`:
```env
GOOGLE_DRIVE_TARGET_FOLDER_ID=1EdxPUcFEc_MbFjYYCWG6jFDU2Ua_bt1d
```

### Option B: Create folder via API

```python
from auth import get_credentials
from googleapiclient.discovery import build

creds = get_credentials()
drive = build("drive", "v3", credentials=creds)

folder = drive.files().create(
    body={
        "name": "SEO Boost Project Outputs",
        "mimeType": "application/vnd.google-apps.folder",
    },
    fields="id, webViewLink",
).execute()

print(f"Folder ID: {folder['id']}")
print(f"URL: {folder['webViewLink']}")
print(f"Add to .env: GOOGLE_DRIVE_TARGET_FOLDER_ID={folder['id']}")
```

---

## Verification

### Test Auth

```bash
.venv/bin/python ~/.claude/skills/seoboost-gdrive/reference/examples/auth.py
```

Expected:
```
✓ Valid: True
  Scopes: ['drive', 'spreadsheets', 'documents', 'forms.body']
  Expiry: 2026-05-29 ...
```

### Test Create Sheet

Copy `reference/examples/create_sheet_with_formula.py` ke project, modify untuk include `auth` module, run:

```bash
.venv/bin/python create_sheet_with_formula.py
```

Expected: Sheet URL printed, browse to verify formula auto-compute.

### Test Drive Folder Access

```python
from auth import get_credentials, get_drive_folder_id
from googleapiclient.discovery import build

creds = get_credentials()
drive = build("drive", "v3", credentials=creds)
folder_id = get_drive_folder_id()

# Test list files in folder
result = drive.files().list(
    q=f"'{folder_id}' in parents",
    fields="files(id, name)",
    pageSize=5,
).execute()

for f in result.get("files", []):
    print(f"- {f['name']}")

print(f"\n✓ Folder access OK")
```

---

## Common Setup Issues

### Issue 1: "OAuth client file not found"

**Cause:** Path di `.env` salah atau file belum ada.

**Fix:**
```bash
# Verify file exists
ls -la "$(grep GOOGLE_OAUTH_CLIENT_PATH .env | cut -d'=' -f2)"
```

Path harus absolute (start dengan `/`), bukan relative.

### Issue 2: Browser tidak auto-open saat first run

**Cause:** Headless terminal atau remote shell.

**Fix:** Copy URL OAuth dari terminal output, paste manual ke browser di local machine.

### Issue 3: "App hasn't been verified by Google"

**Cause:** Normal — OAuth consent screen di status "Testing".

**Fix:**
1. Klik **Advanced**
2. Klik **Go to SEO Boost [App Name] (unsafe)**
3. Allow scopes

(Untuk skip warning: submit OAuth for Google verification — long process, skip kalau cuma internal SEO Boost use.)

### Issue 4: 403 Permission Denied saat akses Drive folder

**Cause:** Folder belum di-share ke akun SEO Boost, atau akun login bukan SEO Boost.

**Fix:**
- Verify login dengan `[your-email]@example.com`
- Owner folder Drive harus share Editor access ke akun SEO Boost

### Issue 5: Token cached tapi scope error

**Cause:** Update SCOPES di code tapi token belum re-issue.

**Fix:**
```bash
rm ~/SEOBoost/GoogleCloudConsole/.seoboost-gdrive-token.json
# Run script → re-auth dengan scope baru
```

---

## Maintenance

### Refresh Token Manual

Token typically valid 7 days. Auto-refresh selama refresh_token valid (months).

Kalau perlu force re-auth:
```bash
rm ~/SEOBoost/GoogleCloudConsole/.seoboost-gdrive-token.json
```

### Update OAuth Client

Kalau client_secret leak atau need rotate:

1. Cloud Console → Credentials → delete old OAuth Client
2. Create new OAuth Client (same name)
3. Download new JSON, save ke same path
4. Delete token (force re-auth)

### Add New Scope (e.g. Calendar API)

1. Cloud Console → enable Calendar API
2. Edit `SCOPES` list di `auth.py`:
   ```python
   SCOPES = [
       # existing...
       "https://www.googleapis.com/auth/calendar",
   ]
   ```
3. Delete token, re-auth

---

## Security Reminders

✅ **DO:**
- Use `.env` per project (gitignored)
- Token di lokasi terpisah dari Git repo
- 2FA enabled pada akun SEO Boost
- Rotate OAuth client kalau team member leave

❌ **DON'T:**
- Commit `client_secret_*.json` ke Git
- Share token file via WA/chat
- Use Service Account untuk personal Drive (broken karena no quota)
- Pakai akun pribadi untuk SEO Boost projects

---

## Resources

- **OAuth setup detail:** `reference/01-auth-setup.md`
- **Common bugs:** `reference/06-common-bugs.md`
- **Examples:** `reference/examples/*.py`
- **Decision log:** Project `ProjectDocs/agent-documentation/03-DECISIONS-LOG.md` — D-074, D-077 (project legacy pra-25 Jul 2026 yang belum dimigrasi: `.implementation-plan/<project>/agent-documentation/03-DECISIONS-LOG.md`)
