"""SEO Boost Google Workspace Auth — Centralized OAuth Desktop pattern.

Drop ini ke project SEO Boost yang butuh Google API (Drive/Sheets/Docs/Forms).

Token cached GLOBAL di ~/SEOBoost/GoogleCloudConsole/.seoboost-gdrive-token.json
→ 1x OAuth flow, semua project SEO Boost pakai token yang sama.

Per-project setup:
1. Set env var GOOGLE_OAUTH_CLIENT_PATH di .env (path ke client_secret_*.json)
2. .gitignore: pastikan token file + .env tidak ke-commit
3. Run first time → browser open → consent → token cached global
4. Future runs: headless via cached token + auto-refresh

Usage:
    from auth import get_credentials

    creds = get_credentials()
    from googleapiclient.discovery import build
    drive = build("drive", "v3", credentials=creds)
    sheets = build("sheets", "v4", credentials=creds)
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from google.auth.exceptions import RefreshError
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# Load env per-project
load_dotenv()

# Global token location (shared across SEO Boost projects)
TOKEN_PATH = Path.home() / "SEO Boost" / "GoogleCloudConsole" / ".seoboost-gdrive-token.json"

# OAuth client (per-project env var, points ke client_secret_*.json di SEO Boost central)
OAUTH_CLIENT_PATH = os.getenv("GOOGLE_OAUTH_CLIENT_PATH")

# Full scope: Drive + Sheets + Docs + Forms
SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/forms.body",
]


def get_credentials() -> Credentials:
    """Load credentials with caching + auto-refresh.

    Returns:
        google.oauth2.credentials.Credentials — ready for API use.

    Raises:
        SystemExit: kalau OAUTH_CLIENT_PATH tidak set atau file missing.

    Workflow:
        1. Try load cached token from global path
        2. If expired but refresh_token valid → auto-refresh (silent)
        3. If refresh FAILS (token revoked/expired) → delete stale token,
           fall through to fresh OAuth flow (browser) instead of crashing
        4. If invalid or missing → first-run OAuth flow (browser)
        5. Save token to global location for next runs

    Note:
        OAuth consent screen mode "Testing" makes refresh tokens expire after
        ~7 days. A RefreshError("invalid_grant: Token has been expired or
        revoked") is EXPECTED for idle projects — this function recovers by
        re-running the browser OAuth flow. For production (frequent Drive
        access), publish the OAuth app so refresh tokens don't expire.
    """
    creds: Credentials | None = None

    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)

    if creds and creds.valid:
        return creds

    # Try silent refresh; if the refresh token is revoked/expired, fall back to
    # a fresh OAuth flow instead of letting RefreshError crash the caller.
    refreshed = False
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            refreshed = True
        except RefreshError as exc:
            print(
                f"⚠️  Token refresh gagal ({exc}).\n"
                f"   Refresh token kemungkinan expired/revoked "
                f"(OAuth consent 'Testing' mode → token expire ~7 hari).\n"
                f"   Memulai OAuth flow baru via browser...",
                file=sys.stderr,
            )
            # Remove stale token so a clean re-auth happens
            try:
                TOKEN_PATH.unlink()
            except FileNotFoundError:
                pass
            creds = None

    if not refreshed and (not creds or not creds.valid):
        if not OAUTH_CLIENT_PATH or not Path(OAUTH_CLIENT_PATH).exists():
            print(
                f"❌ OAuth client file not found: {OAUTH_CLIENT_PATH}\n"
                f"   Set GOOGLE_OAUTH_CLIENT_PATH in .env to point ke client_secret_*.json",
                file=sys.stderr,
            )
            sys.exit(1)

        print("🔐 OAuth flow — browser akan terbuka...")
        print(f"   OAuth client: {OAUTH_CLIENT_PATH}")
        flow = InstalledAppFlow.from_client_secrets_file(OAUTH_CLIENT_PATH, SCOPES)
        creds = flow.run_local_server(port=0)

    # Save token global
    TOKEN_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(TOKEN_PATH, "w") as token_file:
        token_file.write(creds.to_json())
    print(f"✓ Token saved: {TOKEN_PATH}")

    return creds


def get_drive_folder_id(env_var: str = "GOOGLE_DRIVE_TARGET_FOLDER_ID") -> str:
    """Get Drive folder ID dari env var. Convention: 1 folder per project."""
    folder_id = os.getenv(env_var, "")
    if not folder_id:
        print(f"❌ {env_var} not set in .env", file=sys.stderr)
        sys.exit(1)
    return folder_id


if __name__ == "__main__":
    # Quick sanity test
    print("Testing OAuth flow...")
    creds = get_credentials()
    print(f"✓ Valid: {creds.valid}")
    print(f"  Scopes: {creds.scopes}")
    print(f"  Expiry: {creds.expiry}")
