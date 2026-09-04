# 04 — Docs Operations (Create + batchUpdate)

⚠️ **Note:** Docs API patterns belum tested di production SEO Boost (as of 22 Mei 2026). Belum ada use case real, jadi rekomendasi based on Google docs reference + similar pattern dengan Sheets. Update doc ini saat first production use.

## Setup

```python
from googleapiclient.discovery import build
creds = get_credentials()
docs = build("docs", "v1", credentials=creds)
drive = build("drive", "v3", credentials=creds)
```

## Create New Doc

### In Specific Folder

Google Docs API `documents.create` tidak support `parents` field. Workaround: create di root → move via Drive API:

```python
# Step 1: Create document
doc_body = {"title": "Berita Acara Babak Final - Matematika"}
doc = docs.documents().create(body=doc_body).execute()
doc_id = doc["documentId"]
print(f"Doc ID: {doc_id}")
print(f"URL: https://docs.google.com/document/d/{doc_id}/edit")

# Step 2: Move to folder
file = drive.files().get(fileId=doc_id, fields="parents").execute()
previous_parents = ",".join(file.get("parents", []))
drive.files().update(
    fileId=doc_id,
    addParents="<target_folder_id>",
    removeParents=previous_parents,
    fields="id, parents",
).execute()
```

## Insert Text

```python
requests = [
    {
        "insertText": {
            "location": {"index": 1},  # 1 = beginning of doc (0 reserved)
            "text": "BERITA ACARA BABAK FINAL\nBidang: MATEMATIKA\n",
        }
    },
]
docs.documents().batchUpdate(documentId=doc_id, body={"requests": requests}).execute()
```

⚠️ **Index gotcha:** insertText `location.index = 1` means insert at start (index 0 reserved for sectionStart). Always use 1 for top-of-doc.

## Replace Text (Placeholder Replacement)

Pattern paling umum: template dengan placeholder `{{BIDANG}}`, `{{TANGGAL}}`, dll.

```python
requests = [
    {
        "replaceAllText": {
            "containsText": {"text": "{{BIDANG}}", "matchCase": True},
            "replaceText": "MATEMATIKA",
        }
    },
    {
        "replaceAllText": {
            "containsText": {"text": "{{TANGGAL}}", "matchCase": True},
            "replaceText": "22 Mei 2026",
        }
    },
    {
        "replaceAllText": {
            "containsText": {"text": "{{JURI_1}}", "matchCase": True},
            "replaceText": "<Nama Juri 1>",
        }
    },
]
docs.documents().batchUpdate(documentId=doc_id, body={"requests": requests}).execute()
```

## Format Text

### Make Range Bold

```python
{
    "updateTextStyle": {
        "range": {"startIndex": 1, "endIndex": 28},  # "BERITA ACARA BABAK FINAL"
        "textStyle": {"bold": True, "fontSize": {"magnitude": 16, "unit": "PT"}},
        "fields": "bold,fontSize",
    }
}
```

### Center Align Paragraph

```python
{
    "updateParagraphStyle": {
        "range": {"startIndex": 1, "endIndex": 30},
        "paragraphStyle": {"alignment": "CENTER"},
        "fields": "alignment",
    }
}
```

## Insert Table

```python
{
    "insertTable": {
        "rows": 7,
        "columns": 7,
        "location": {"index": <insertion_point>},
    }
}
```

After insert, refer to cells via `tableStartIndex` + cell index. Complex — recommended use placeholder + `replaceAllText` instead.

## Copy Template Pattern (Recommended)

Daripada build doc from scratch, COPY existing template doc → replace placeholders:

```python
# Step 1: Copy template
template_id = "<template_doc_id>"  # template di Drive dengan {{PLACEHOLDER}}
copy_body = {
    "name": "Berita Acara Babak Final - Matematika 22 Mei 2026",
    "parents": ["<target_folder_id>"],
}
new_doc = drive.files().copy(fileId=template_id, body=copy_body, fields="id").execute()
new_doc_id = new_doc["id"]

# Step 2: Replace placeholders
requests = [
    {"replaceAllText": {"containsText": {"text": "{{BIDANG}}", "matchCase": True}, "replaceText": "MATEMATIKA"}},
    {"replaceAllText": {"containsText": {"text": "{{TANGGAL}}", "matchCase": True}, "replaceText": "22 Mei 2026"}},
    # ... more replacements
]
docs.documents().batchUpdate(documentId=new_doc_id, body={"requests": requests}).execute()
```

**Why this pattern:**
- Template designed visually di Google Docs (typography, colors, layout)
- Code cuma replace placeholder — simple, robust
- Easy update template: edit Google Doc, no code change

## Read Doc Content

```python
doc = docs.documents().get(documentId=doc_id).execute()
content = doc.get("body", {}).get("content", [])

# Extract all text
def extract_text(elements):
    text = ""
    for el in elements:
        if "paragraph" in el:
            for run in el["paragraph"]["elements"]:
                if "textRun" in run:
                    text += run["textRun"]["content"]
    return text

full_text = extract_text(content)
print(full_text)
```

## Export Doc as PDF / DOCX

Use Drive API export_media:

```python
import io
from googleapiclient.http import MediaIoBaseDownload

# Export as PDF
request = drive.files().export_media(fileId=doc_id, mimeType="application/pdf")
buffer = io.BytesIO()
downloader = MediaIoBaseDownload(buffer, request)
done = False
while not done:
    status, done = downloader.next_chunk()

with open("output.pdf", "wb") as f:
    f.write(buffer.getvalue())

# Or export as DOCX
# mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
```

## Common Use Cases (SEO Boost)

### Use Case 1: Generate BA Final per Bidang (10 Doc)

```python
TEMPLATE_DOC_ID = "<seoboost_template_ba_final>"
FOLDER_ID = "<bidang_outputs_folder>"

for bidang_data in all_bidang_data:
    # Copy template
    new_doc = drive.files().copy(
        fileId=TEMPLATE_DOC_ID,
        body={
            "name": f"BA_Final_{bidang_data['name']}_22-Mei-2026",
            "parents": [FOLDER_ID],
        },
    ).execute()
    
    # Replace placeholders
    requests = [
        {"replaceAllText": {"containsText": {"text": "{{BIDANG}}", "matchCase": True}, "replaceText": bidang_data["name"].upper()}},
        {"replaceAllText": {"containsText": {"text": "{{JURI_1}}", "matchCase": True}, "replaceText": bidang_data["juri"][0]}},
        {"replaceAllText": {"containsText": {"text": "{{JURI_2}}", "matchCase": True}, "replaceText": bidang_data["juri"][1]}},
        {"replaceAllText": {"containsText": {"text": "{{JURI_3}}", "matchCase": True}, "replaceText": bidang_data["juri"][2]}},
        # ... 6 peserta with predikat
        {"replaceAllText": {"containsText": {"text": "{{JUARA_1_NAMA}}", "matchCase": True}, "replaceText": bidang_data["juara_1"]["nama"]}},
        # etc.
    ]
    docs.documents().batchUpdate(documentId=new_doc["id"], body={"requests": requests}).execute()
    time.sleep(1)  # Docs API rate limit: 60 req/min
```

### Use Case 2: Surat Resmi SEO Boost

Template di Drive dengan placeholder:
```
{{NOMOR_SURAT}}
{{TANGGAL}}
{{KEPADA_NAMA}}
{{KEPADA_INSTANSI}}
{{ISI_PARAGRAF_1}}
{{ISI_PARAGRAF_2}}
{{PENGIRIM_NAMA}}
{{PENGIRIM_JABATAN}}
```

Same copy-and-replace pattern.

## Rate Limits

Docs API: **60 batchUpdate/minute per user** (lebih ketat dari Sheets).

Untuk bulk (10+ docs):
```python
for i, item in enumerate(items, 1):
    process_doc(item)
    time.sleep(1.0)  # 1s × 60 = 60 ops/min, safe
```

## Anti-Patterns

❌ Build doc from scratch via insertText — fragile, hard to maintain
✅ Copy template → replace placeholder

❌ Multiple separate batchUpdate calls — wastes rate limit
✅ Combine all changes into 1 batchUpdate request

❌ Replace placeholder dengan multi-line text — break paragraph styling
✅ Pre-format multi-line content sebagai separate paragraphs di template

## Examples

See `reference/examples/create_doc_from_template.py` for full working example.
