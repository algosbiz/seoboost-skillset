# 01 — Auth Setup (OAuth Desktop Flow)

## Why OAuth Desktop (BUKAN Service Account)

Service Account FAILED untuk akun personal Google (non-Workspace) karena:
- SA tidak punya Drive storage quota — error 403 "storage quota exceeded" saat create Sheet
- Workaround Shared Drive cuma di paid Workspace
- Domain-wide Delegation butuh Workspace admin

**OAuth Desktop pakai user account (SEO Boost) yang punya 15GB free quota** — Sheet/Doc/Form di-create di user Drive, owned by user. Service Account approach abandoned per D-077.

## Cloud Project Existing

| Item | Value |
|---|---|
| Project ID | `drive-project-496915` |
| Project name | Drive Project |
| OAuth Client name | `SEO Boost Python CLI` |
| Client ID | `528849559165-632lsbngkdl73ped1od5okckkd6qm1ua.apps.googleusercontent.com` |
| Account owner | [your-email]@example.com |
| APIs enabled | Sheets, Drive, Docs, Forms |
| Consent screen status | External, Testing (test user: [your-email]@example.com) |
| Credentials file location | `~/Documents/WORKSPACE/SEOBoost/GoogleCloudConsole/DriveProject/client_secret_*.json` |
| Global token cache | `~/SEOBoost/GoogleCloudConsole/.seoboost-gdrive-token.json` |

## Cara Setup Project Baru (Future SEO Boost Engineers)

Skip kalau pakai project existing `drive-project-496915`. Buat new project kalau perlu separation.

### Step 1: Cloud Console — Create Project

1. https://console.cloud.google.com/
2. Top dropdown → "New Project"
3. Name: `SEO Boost Drive Automation` (atau client-specific)
4. Create + wait ~10 sec
5. Select new project

### Step 2: Enable APIs (4 total)

URL: https://console.cloud.google.com/apis/library?project=<PROJECT_ID>

Search + Enable each:
1. **Google Drive API**
2. **Google Sheets API**
3. **Google Docs API**
4. **Google Forms API**

(Sheets+Drive sudah enable kalau project ini sudah pernah dipakai untuk Final 2026.)

### Step 3: OAuth Consent Screen

1. APIs & Services → OAuth consent screen
2. User Type: **External** (untuk akun Gmail personal)
3. App information:
   - App name: `SEO Boost Drive Automation`
   - User support email: `[your-email]@example.com`
   - Developer contact: `[your-email]@example.com`
4. Scopes: SKIP (auto-detect dari code)
5. Test users: add `[your-email]@example.com`
6. Save & back to dashboard

### Step 4: Create OAuth Client ID

1. APIs & Services → Credentials
2. **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Desktop app**
4. Name: `SEO Boost Python CLI`
5. Create
6. **DOWNLOAD JSON** → save ke `~/Documents/WORKSPACE/SEOBoost/GoogleCloudConsole/<ProjectName>/client_secret_*.json`

### Step 5: Update .env Project

```env
GOOGLE_OAUTH_CLIENT_PATH=/full/path/to/client_secret_*.json
```

## First-Run OAuth Flow

Token global di `~/SEOBoost/GoogleCloudConsole/.seoboost-gdrive-token.json` — first time skill jalan di SEMUA SEO Boost projects, akan:

1. Detect no token → run OAuth flow
2. Print URL OAuth, auto-open browser
3. User login dengan `[your-email]@example.com`
4. Warning page muncul: "Google hasn't verified this app"
5. Click **"Advanced"** (kiri bawah)
6. Click **"Go to SEO Boost Drive Automation (unsafe)"**
7. Consent screen: allow semua scope (Drive + Sheets + Docs + Forms)
8. Click **"Continue"**
9. Browser redirect ke `http://localhost:XXXX/?code=...`
10. Page: "The authentication flow has completed. You may close this window."
11. Terminal: "✓ Authentication successful, ✓ Token saved"

Future runs: token cached, no browser needed (auto-refresh via refresh_token).

## Token Lifecycle

| State | Action |
|---|---|
| **Missing** | Run InstalledAppFlow.from_client_secrets_file().run_local_server(port=0) |
| **Valid** | Use directly |
| **Expired + refresh_token valid** | Call `creds.refresh(Request())` — silent |
| **Expired + refresh_token revoked/expired** | `creds.refresh()` raises `RefreshError('invalid_grant')` → CATCH it, delete stale token, re-run OAuth flow (browser) |

⚠️ **Refresh token expiry — NOT rare in Testing mode.** Access token valid ~1 jam (auto-refresh). Refresh_token: lives months IF OAuth consent screen is **Published**. But while consent screen is in **"Testing" mode, refresh tokens expire after 7 DAYS** (Google policy). Idle projects (mis. [Project Klien Verifikasi] tidak dipakai ~11 hari) akan kena `invalid_grant: Token has been expired or revoked` saat refresh.

**Implikasi:**
- `get_credentials()` WAJIB handle RefreshError dengan fallback ke OAuth flow baru (lihat `examples/auth.py` — sudah di-fix 01 Juni 2026). JANGAN biarkan `creds.refresh()` crash.
- Untuk **produksi** (akses Drive rutin, tidak boleh minta user re-login tiap minggu): **publish OAuth consent screen** di Google Cloud Console (Publishing status: "In production"). Setelah published, refresh_token tidak expire 7 hari lagi.
- Lesson dari [Project Klien Bali] (D-003): token [Project Klien Verifikasi] expired setelah idle, perlu re-auth manual. Fix sudah masuk skill.

## Adding New Scope

Kalau perlu scope baru (mis. Calendar API):

1. Edit SCOPES list di code
2. Delete `~/SEOBoost/GoogleCloudConsole/.seoboost-gdrive-token.json`
3. Re-run script → browser flow → consent with new scope
4. Token re-saved dengan scope baru

⚠️ **JANGAN** sekedar update SCOPES tanpa delete token — gspread/build will use old scope from cached token.

## Revoke Access

Kalau token leak atau hand-off project:

1. https://myaccount.google.com/permissions
2. Find "SEO Boost Drive Automation" / "SEO Boost Python CLI"
3. Click → **Remove Access**
4. Delete local token file
5. Re-issue: re-create OAuth client di Cloud Console (Client ID baru)

## Security Checklist

✅ `client_secret_*.json` di-gitignore (pattern `*credentials*`, `*client_secret*`)
✅ `.seoboost-gdrive-token.json` di-gitignore (pattern `*token*.json`)
✅ Project Cloud Console private (test users explicit)
✅ Akun SEO Boost secured dengan 2FA
✅ No client_secret di code/markdown/chat public
✅ Per project, sensitive folder `SEO Boost/GoogleCloudConsole/` di luar Git repo
