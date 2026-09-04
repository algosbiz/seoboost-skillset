"""Example: Share Drive folder/file ke email tertentu dengan role specific.

Pattern dari [Project Klien — Verifikasi Pipeline] — share 30 Sheet ke 30 juri dengan Editor access.
"""

import time
from auth import get_credentials
from googleapiclient.discovery import build


def share_to_email(
    file_or_folder_id: str,
    email: str,
    role: str = "writer",  # "reader" (viewer), "commenter", "writer" (editor), "owner"
    notify: bool = False,
    drive_service=None,
) -> dict:
    """Share Drive item ke single email.

    Args:
        file_or_folder_id: Drive file/folder ID
        email: Target email
        role: "reader" | "commenter" | "writer" | "owner"
        notify: True kalau mau Google kirim email notify (recipient akan dapat email)
        drive_service: optional, auto-create kalau None

    Returns:
        Permission object {"id", ...}
    """
    if drive_service is None:
        creds = get_credentials()
        drive_service = build("drive", "v3", credentials=creds)

    permission = {
        "type": "user",
        "role": role,
        "emailAddress": email,
    }
    result = drive_service.permissions().create(
        fileId=file_or_folder_id,
        body=permission,
        sendNotificationEmail=notify,
        fields="id",
    ).execute()

    return result


def share_to_anyone_with_link(
    file_or_folder_id: str,
    role: str = "reader",
    drive_service=None,
) -> dict:
    """Make file/folder accessible via link (anyone with URL bisa akses)."""
    if drive_service is None:
        creds = get_credentials()
        drive_service = build("drive", "v3", credentials=creds)

    permission = {
        "type": "anyone",
        "role": role,
    }
    return drive_service.permissions().create(
        fileId=file_or_folder_id,
        body=permission,
        fields="id",
    ).execute()


def bulk_share_to_emails(
    file_or_folder_id: str,
    emails: list[str],
    role: str = "writer",
    notify: bool = False,
    rate_limit_delay: float = 0.3,
) -> dict:
    """Share single file/folder ke multiple emails.

    Returns:
        {"success": [emails...], "failed": [{"email", "error"}...]}
    """
    creds = get_credentials()
    drive_service = build("drive", "v3", credentials=creds)

    result = {"success": [], "failed": []}

    for email in emails:
        try:
            share_to_email(file_or_folder_id, email, role, notify, drive_service)
            result["success"].append(email)
            print(f"  ✓ Shared to {email}")
        except Exception as e:
            err_str = str(e)
            result["failed"].append({"email": email, "error": err_str[:100]})
            print(f"  ✗ Failed {email}: {err_str[:80]}")
        time.sleep(rate_limit_delay)  # avoid rate limit

    return result


def share_multiple_files_to_email(
    file_ids: list[str],
    email: str,
    role: str = "writer",
    notify: bool = False,
) -> dict:
    """Share multiple files ke 1 email (e.g. 1 juri dapet 1 sheet bidang)."""
    creds = get_credentials()
    drive_service = build("drive", "v3", credentials=creds)

    result = {"success": [], "failed": []}

    for fid in file_ids:
        try:
            share_to_email(fid, email, role, notify, drive_service)
            result["success"].append(fid)
        except Exception as e:
            result["failed"].append({"file_id": fid, "error": str(e)[:100]})
        time.sleep(0.3)

    return result


def revoke_access(
    file_or_folder_id: str,
    email: str,
    drive_service=None,
) -> bool:
    """Remove email's access from file/folder."""
    if drive_service is None:
        creds = get_credentials()
        drive_service = build("drive", "v3", credentials=creds)

    # Find permission ID for this email
    perms = drive_service.permissions().list(
        fileId=file_or_folder_id,
        fields="permissions(id, emailAddress)",
    ).execute()

    for p in perms.get("permissions", []):
        if p.get("emailAddress") == email:
            drive_service.permissions().delete(
                fileId=file_or_folder_id,
                permissionId=p["id"],
            ).execute()
            print(f"  ✓ Revoked {email}")
            return True

    print(f"  ⚠ Email {email} not found in permissions")
    return False


def list_permissions(file_or_folder_id: str, drive_service=None) -> list[dict]:
    """List semua people/links yang punya akses."""
    if drive_service is None:
        creds = get_credentials()
        drive_service = build("drive", "v3", credentials=creds)

    perms = drive_service.permissions().list(
        fileId=file_or_folder_id,
        fields="permissions(id, type, role, emailAddress, displayName)",
    ).execute()

    return perms.get("permissions", [])


def main():
    # Example usage
    FOLDER_ID = "<paste_drive_folder_id_here>"

    # Share folder ke 1 email
    share_to_email(FOLDER_ID, "klien@example.com", role="reader", notify=False)

    # Bulk share ke 30 juri
    juri_emails = [
        "juri1@example.com",
        "juri2@example.com",
        # ... 30 emails
    ]
    result = bulk_share_to_emails(FOLDER_ID, juri_emails, role="writer")
    print(f"Success: {len(result['success'])}, Failed: {len(result['failed'])}")


if __name__ == "__main__":
    main()
