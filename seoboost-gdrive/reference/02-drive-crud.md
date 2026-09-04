# 02 — Drive CRUD Operations

## Setup

```python
from googleapiclient.discovery import build
# from auth.py
creds = get_credentials()
drive = build("drive", "v3", credentials=creds)
```

## Create Folder

```python
folder_metadata = {
    "name": "Form Babak Final 2026-05-21",
    "mimeType": "application/vnd.google-apps.folder",
    "parents": ["<parent_folder_id>"],  # optional, default = root Drive
}
folder = drive.files().create(body=folder_metadata, fields="id, name, webViewLink").execute()
print(f"Folder ID: {folder['id']}")
print(f"URL: {folder['webViewLink']}")
```

## List Files in Folder

```python
folder_id = "1-pPj5ucRdFQ_xg66-3YCV61a5nC9ohNF"
result = drive.files().list(
    q=f"'{folder_id}' in parents and trashed=false",
    fields="files(id, name, mimeType, webViewLink, modifiedTime)",
    pageSize=100,
    orderBy="modifiedTime desc",
).execute()

for f in result.get("files", []):
    print(f"{f['name']} | {f['mimeType']} | {f['webViewLink']}")
```

### Common Query Filters

```python
# By name pattern
q=f"name contains 'BA_Final' and '{folder_id}' in parents"

# By mimeType (Sheets only)
q=f"mimeType='application/vnd.google-apps.spreadsheet' and '{folder_id}' in parents"

# By mimeType (Folders only)
q="mimeType='application/vnd.google-apps.folder' and trashed=false"

# Files modified after date
q=f"modifiedTime > '2026-05-21T00:00:00' and '{folder_id}' in parents"

# Owned by me
q="'me' in owners"
```

## Get File Metadata

```python
file_id = "1a-fr5COxmkPZGd3Y2Ez_aiMheaMyocw1bZ3BnlfoKWk"
file = drive.files().get(
    fileId=file_id,
    fields="id, name, mimeType, owners, capabilities, permissions, parents, modifiedTime, webViewLink",
).execute()

print(f"Name: {file['name']}")
print(f"Owners: {[o['emailAddress'] for o in file.get('owners', [])]}")
print(f"Can edit: {file.get('capabilities', {}).get('canEdit')}")
print(f"Parents: {file.get('parents')}")
```

## Move File to Folder

```python
file_id = "..."
target_folder_id = "..."

# Get current parents
file = drive.files().get(fileId=file_id, fields="parents").execute()
previous_parents = ",".join(file.get("parents", []))

# Move
drive.files().update(
    fileId=file_id,
    addParents=target_folder_id,
    removeParents=previous_parents,
    fields="id, parents",
).execute()
```

## Copy File

```python
copy_body = {
    "name": "BA_Final_Matematika_BACKUP_2026-05-21.docx",
    "parents": ["<target_folder_id>"],
}
new_file = drive.files().copy(fileId=source_id, body=copy_body, fields="id, webViewLink").execute()
print(f"Copy URL: {new_file['webViewLink']}")
```

## Share File/Folder

### Share to Specific Email

```python
permission = {
    "type": "user",
    "role": "writer",  # or "reader" (viewer), "commenter", "owner"
    "emailAddress": "klien@example.com",
}
drive.permissions().create(
    fileId=file_or_folder_id,
    body=permission,
    sendNotificationEmail=False,  # set True if want email notify
    fields="id",
).execute()
```

### Share via Link (Anyone with Link)

```python
permission = {
    "type": "anyone",
    "role": "reader",  # or "writer" for edit access
}
drive.permissions().create(
    fileId=file_or_folder_id,
    body=permission,
    fields="id",
).execute()
```

### List Existing Permissions

```python
perms = drive.permissions().list(
    fileId=file_or_folder_id,
    fields="permissions(id, type, role, emailAddress)",
).execute()
for p in perms.get("permissions", []):
    print(f"{p.get('emailAddress', 'anyone')} - {p['role']}")
```

### Remove Permission

```python
drive.permissions().delete(
    fileId=file_or_folder_id,
    permissionId="<permission_id>",
).execute()
```

## Upload File

### Upload Local File (Excel, PDF, DOCX, etc.)

```python
from googleapiclient.http import MediaFileUpload

file_metadata = {
    "name": "BA_Final_Matematika.pdf",
    "parents": ["<folder_id>"],
}
media = MediaFileUpload("local/path/BA_Final_Matematika.pdf", mimetype="application/pdf")

file = drive.files().create(
    body=file_metadata,
    media_body=media,
    fields="id, webViewLink",
).execute()
print(f"Uploaded: {file['webViewLink']}")
```

### Upload + Convert (Excel → Google Sheet, DOCX → Google Doc)

```python
file_metadata = {
    "name": "Ranking Final Matematika",
    "parents": ["<folder_id>"],
    "mimeType": "application/vnd.google-apps.spreadsheet",  # target = Google Sheet
}
media = MediaFileUpload("local/Ranking_Final_Matematika.xlsx",
                       mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

file = drive.files().create(body=file_metadata, media_body=media, fields="id").execute()
```

Common mime type mappings:
| Source (local) | Target (Drive) |
|---|---|
| `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (xlsx) | `application/vnd.google-apps.spreadsheet` |
| `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (docx) | `application/vnd.google-apps.document` |
| `application/pdf` | (no convert — stays PDF) |
| `text/csv` | `application/vnd.google-apps.spreadsheet` |

## Download File

### Download Native Google File (Sheet/Doc/Form) as Excel/DOCX/PDF

```python
import io
from googleapiclient.http import MediaIoBaseDownload

file_id = "<google_sheet_id>"
export_mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"  # Sheet → xlsx
# Atau: "application/pdf" (Sheet → PDF), "text/csv" (single sheet → CSV)

request = drive.files().export_media(fileId=file_id, mimeType=export_mime)
buffer = io.BytesIO()
downloader = MediaIoBaseDownload(buffer, request)
done = False
while not done:
    status, done = downloader.next_chunk()

with open("downloaded.xlsx", "wb") as f:
    f.write(buffer.getvalue())
```

### Download Non-Native File (uploaded PDF, etc.)

```python
request = drive.files().get_media(fileId=file_id)
# ... same MediaIoBaseDownload pattern
```

## Delete File

```python
# Soft delete (move to trash)
drive.files().update(fileId=file_id, body={"trashed": True}).execute()

# Permanent delete (skip trash)
drive.files().delete(fileId=file_id).execute()
```

## Common Mime Types Reference

| Mime Type | File Kind |
|---|---|
| `application/vnd.google-apps.folder` | Drive Folder |
| `application/vnd.google-apps.spreadsheet` | Google Sheet |
| `application/vnd.google-apps.document` | Google Doc |
| `application/vnd.google-apps.form` | Google Form |
| `application/vnd.google-apps.presentation` | Google Slides |
| `application/pdf` | PDF |
| `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | XLSX |
| `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | DOCX |
| `text/csv` | CSV |
| `image/png`, `image/jpeg` | Images |

## Battle-Tested Patterns ([Project Klien — Verifikasi Pipeline])

### Pattern: Generate 30 Sheet di Drive Folder

```python
for bidang in BIDANG_LIST:
    for juri in juri_config:
        sheet = gc.create(
            f"Form_Final_LPB_Program B_2026_{bidang}_{juri['nama_clean']}",
            folder_id=DRIVE_FOLDER_ID
        )
        # populate sheet ...
        time.sleep(0.3)  # rate limit safety
```

### Pattern: Cleanup Test Files

```python
result = drive.files().list(
    q=f"'{folder_id}' in parents and name contains 'TEST_DELETE_ME'",
    fields="files(id, name)"
).execute()
for f in result.get("files", []):
    drive.files().delete(fileId=f["id"]).execute()
```

### Pattern: Bulk Share to Email List

```python
emails = ["juri1@example.com", "juri2@example.com", ...]
for email in emails:
    try:
        drive.permissions().create(
            fileId=file_id,
            body={"type": "user", "role": "writer", "emailAddress": email},
            sendNotificationEmail=False,
        ).execute()
        time.sleep(0.3)  # avoid rate limit
    except Exception as e:
        print(f"Failed share to {email}: {e}")
```
