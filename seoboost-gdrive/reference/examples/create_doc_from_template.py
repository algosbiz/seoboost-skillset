"""Example: Copy Doc template + replace placeholders.

Pattern recommended (vs build from scratch via insertText) — more maintainable.

Template Doc di Drive dengan placeholder format {{NAMA}}, {{TANGGAL}}, dst.
Code copy template → batch replace placeholders → save sebagai doc baru di folder.

⚠️ Belum production-tested di SEO Boost — pattern based on Google docs reference.
"""

from auth import get_credentials, get_drive_folder_id
from googleapiclient.discovery import build


def copy_doc_template(
    template_doc_id: str,
    new_doc_name: str,
    target_folder_id: str,
    placeholders: dict[str, str],
    drive_service,
    docs_service,
) -> dict:
    """Copy Doc template + replace placeholders.

    Args:
        template_doc_id: ID Doc template (master at Drive)
        new_doc_name: Nama Doc baru
        target_folder_id: Folder Drive destination
        placeholders: {"{{NAMA}}": "Pak [Operator]", "{{TANGGAL}}": "22 Mei 2026"}
        drive_service: Drive API service
        docs_service: Docs API service

    Returns:
        {"id", "url", "name"}
    """
    # Step 1: Copy template
    copy_body = {
        "name": new_doc_name,
        "parents": [target_folder_id],
    }
    new_doc = drive_service.files().copy(
        fileId=template_doc_id,
        body=copy_body,
        fields="id, name, webViewLink",
    ).execute()
    new_doc_id = new_doc["id"]

    # Step 2: Build replace requests
    replace_requests = [
        {
            "replaceAllText": {
                "containsText": {"text": placeholder, "matchCase": True},
                "replaceText": value,
            }
        }
        for placeholder, value in placeholders.items()
    ]

    # Step 3: Batch execute
    if replace_requests:
        docs_service.documents().batchUpdate(
            documentId=new_doc_id,
            body={"requests": replace_requests},
        ).execute()

    return {
        "id": new_doc_id,
        "url": new_doc["webViewLink"],
        "name": new_doc["name"],
    }


def main():
    # Setup
    creds = get_credentials()
    docs = build("docs", "v1", credentials=creds)
    drive = build("drive", "v3", credentials=creds)
    folder_id = get_drive_folder_id()

    # Configure
    TEMPLATE_ID = "<paste_template_doc_id_here>"  # Doc template di Drive

    # Example: Generate Berita Acara untuk bidang Matematika
    placeholders = {
        "{{BIDANG}}": "MATEMATIKA",
        "{{TANGGAL}}": "22 Mei 2026",
        "{{LOKASI}}": "Semarang",
        "{{JURI_1}}": "<Nama Juri 1> (Program B)",
        "{{JURI_2}}": "<Nama Juri 2> ([Project A])",
        "{{JURI_3}}": "<Nama Juri 3> (Eksternal)",
        "{{JUARA_1_KODE}}": "PUT_M07",
        "{{JUARA_1_NAMA}}": "<Nama Peserta>",
        "{{JUARA_1_SEKOLAH}}": "<Nama Sekolah>",
        # ... 5 predikat lainnya
    }

    result = copy_doc_template(
        template_doc_id=TEMPLATE_ID,
        new_doc_name="BA_Final_Matematika_22-Mei-2026",
        target_folder_id=folder_id,
        placeholders=placeholders,
        drive_service=drive,
        docs_service=docs,
    )

    print(f"✓ Doc created: {result['url']}")
    print(f"  Name: {result['name']}")
    print(f"  Verify: open URL, semua placeholder should be replaced")


if __name__ == "__main__":
    main()
