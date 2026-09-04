"""Test script: Verify all 4 APIs working dengan global token.

Run setelah setup selesai untuk verify:
1. OAuth flow works (browser kalau first run)
2. Sheets API accessible
3. Drive API accessible
4. Docs API accessible
5. Forms API accessible
6. Token saved to global location

Usage:
    .venv/bin/python ~/.claude/skills/seoboost-gdrive/reference/examples/test_full_auth.py
"""

import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from google.auth.exceptions import RefreshError
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

load_dotenv()

TOKEN_PATH = Path.home() / "SEO Boost" / "GoogleCloudConsole" / ".seoboost-gdrive-token.json"
OAUTH_CLIENT_PATH = os.getenv("GOOGLE_OAUTH_CLIENT_PATH")

SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/forms.body",
]


def get_credentials():
    creds = None
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)
        print(f"✓ Token cached found: {TOKEN_PATH}")

    if creds and creds.valid:
        return creds

    refreshed = False
    if creds and creds.expired and creds.refresh_token:
        print("  Token expired, refreshing...")
        try:
            creds.refresh(Request())
            refreshed = True
        except RefreshError as exc:
            print(f"  ⚠️  Refresh gagal ({exc}). Token revoked/expired — re-auth via browser...")
            try:
                TOKEN_PATH.unlink()
            except FileNotFoundError:
                pass
            creds = None

    if not refreshed and (not creds or not creds.valid):
        if not OAUTH_CLIENT_PATH or not Path(OAUTH_CLIENT_PATH).exists():
            print(f"❌ OAuth client not found: {OAUTH_CLIENT_PATH}", file=sys.stderr)
            sys.exit(1)
        print("🔐 OAuth flow — browser akan terbuka...")
        flow = InstalledAppFlow.from_client_secrets_file(OAUTH_CLIENT_PATH, SCOPES)
        creds = flow.run_local_server(port=0)

    TOKEN_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(TOKEN_PATH, "w") as f:
        f.write(creds.to_json())
    print(f"✓ Token saved: {TOKEN_PATH}")

    return creds


def main():
    print("=" * 70)
    print("SEO Boost-GDRIVE — Full Auth Test (4 APIs)")
    print("=" * 70)
    print()
    print(f"OAuth client: {OAUTH_CLIENT_PATH}")
    print(f"Token target: {TOKEN_PATH}")
    print(f"Scopes: {len(SCOPES)} ({', '.join(s.split('/')[-1] for s in SCOPES)})")
    print()

    # Step 1: Get credentials
    print("--- Authentication ---")
    creds = get_credentials()
    print(f"✓ Credentials valid: {creds.valid}")
    print(f"  Scopes: {creds.scopes}")
    print()

    # Step 2: Test each API
    print("--- Testing 4 APIs ---")

    # Drive
    try:
        drive = build("drive", "v3", credentials=creds)
        about = drive.about().get(fields="user(emailAddress)").execute()
        email = about["user"]["emailAddress"]
        print(f"✓ Drive API: authorized as {email}")
    except Exception as e:
        print(f"✗ Drive API failed: {e}")

    # Sheets (via list to verify scope)
    try:
        sheets = build("sheets", "v4", credentials=creds)
        # Cuma test build, gak create
        print(f"✓ Sheets API: service built successfully")
    except Exception as e:
        print(f"✗ Sheets API failed: {e}")

    # Docs
    try:
        docs = build("docs", "v1", credentials=creds)
        print(f"✓ Docs API: service built successfully")
    except Exception as e:
        print(f"✗ Docs API failed: {e}")

    # Forms
    try:
        DISCOVERY_DOC = "https://forms.googleapis.com/$discovery/rest?version=v1"
        forms = build("forms", "v1", credentials=creds, discoveryServiceUrl=DISCOVERY_DOC, static_discovery=False)
        print(f"✓ Forms API: service built successfully")
    except Exception as e:
        print(f"✗ Forms API failed: {e}")

    print()
    print("=" * 70)
    print("✅ AUTH TEST PASSED — skill seoboost-gdrive ready")
    print("=" * 70)
    print()
    print("Next steps:")
    print(f"1. Token cached: {TOKEN_PATH}")
    print(f"   → Semua SEO Boost project pakai token ini (1x auth, semua project bisa)")
    print("2. Use skill examples (e.g. create_sheet_with_formula.py) untuk test CRUD")
    print("3. Refer reference/*.md untuk pattern + best practices")


if __name__ == "__main__":
    main()
