# 05 — Forms Operations (Create + batchUpdate Items)

⚠️ **Note:** Forms API patterns belum tested di production SEO Boost (as of 22 Mei 2026). Based on Google docs reference. Update saat first production use.

## Setup

```python
from googleapiclient.discovery import build
creds = get_credentials()

# Forms API need discovery doc explicit
DISCOVERY_DOC = "https://forms.googleapis.com/$discovery/rest?version=v1"
forms = build("forms", "v1", credentials=creds, discoveryServiceUrl=DISCOVERY_DOC, static_discovery=False)

drive = build("drive", "v3", credentials=creds)
```

## Create New Form

### Basic Form

```python
new_form = {"info": {"title": "Form Pendaftaran [Project Klien — Verifikasi Pipeline]"}}
result = forms.forms().create(body=new_form).execute()
form_id = result["formId"]
print(f"Form ID: {form_id}")
print(f"Editor URL: {result.get('responderUri')}")
```

### Move to Folder

Same pattern as Docs — create at root, move via Drive:

```python
file = drive.files().get(fileId=form_id, fields="parents").execute()
previous_parents = ",".join(file.get("parents", []))
drive.files().update(
    fileId=form_id,
    addParents="<folder_id>",
    removeParents=previous_parents,
    fields="id, parents",
).execute()
```

## Add Items via batchUpdate

### Multiple-Choice (Radio)

```python
update_request = {
    "requests": [
        {
            "createItem": {
                "item": {
                    "title": "Bidang penelitian:",
                    "questionItem": {
                        "question": {
                            "required": True,
                            "choiceQuestion": {
                                "type": "RADIO",
                                "options": [
                                    {"value": "Matematika"},
                                    {"value": "Fisika"},
                                    {"value": "Komputer"},
                                    {"value": "Ekonomi"},
                                ],
                                "shuffle": False,
                            },
                        }
                    },
                },
                "location": {"index": 0},  # 0 = first position
            }
        }
    ]
}
forms.forms().batchUpdate(formId=form_id, body=update_request).execute()
```

### Checkbox (Multiple Selection)

```python
{
    "createItem": {
        "item": {
            "title": "Pilih topik (boleh > 1):",
            "questionItem": {
                "question": {
                    "required": False,
                    "choiceQuestion": {
                        "type": "CHECKBOX",
                        "options": [
                            {"value": "Lingkungan"},
                            {"value": "AI/ML"},
                            {"value": "Kesehatan"},
                        ],
                    },
                }
            },
        },
        "location": {"index": 1},
    }
}
```

### Dropdown

```python
"choiceQuestion": {
    "type": "DROP_DOWN",
    "options": [{"value": f"Provinsi {i}"} for i in range(34)],
}
```

### Short Answer Text

```python
{
    "createItem": {
        "item": {
            "title": "Nama lengkap:",
            "questionItem": {
                "question": {
                    "required": True,
                    "textQuestion": {"paragraph": False},
                }
            },
        },
        "location": {"index": 0},
    }
}
```

### Paragraph (Long Text)

```python
"textQuestion": {"paragraph": True}
```

### Linear Scale (Skala 1-N)

```python
{
    "createItem": {
        "item": {
            "title": "Tingkat kepuasan:",
            "questionItem": {
                "question": {
                    "required": True,
                    "scaleQuestion": {
                        "low": 1,
                        "high": 5,
                        "lowLabel": "Sangat tidak puas",
                        "highLabel": "Sangat puas",
                    },
                }
            },
        },
        "location": {"index": 0},
    }
}
```

### Date

```python
{
    "createItem": {
        "item": {
            "title": "Tanggal kegiatan:",
            "questionItem": {
                "question": {
                    "required": True,
                    "dateQuestion": {
                        "includeTime": False,
                        "includeYear": True,
                    },
                }
            },
        },
        "location": {"index": 0},
    }
}
```

### File Upload (Drive)

```python
{
    "createItem": {
        "item": {
            "title": "Upload makalah penelitian (PDF):",
            "questionItem": {
                "question": {
                    "required": True,
                    "fileUploadQuestion": {
                        "maxFiles": 1,
                        "maxFileSize": 10485760,  # 10 MB
                        "types": ["PDF"],
                    },
                }
            },
        },
        "location": {"index": 0},
    }
}
```

### Section Header (Page Break)

```python
{
    "createItem": {
        "item": {
            "title": "BAGIAN 2: DATA PENELITIAN",
            "description": "Mohon lengkapi data riset di section ini.",
            "pageBreakItem": {},
        },
        "location": {"index": 5},
    }
}
```

## Update Form Settings

### Convert to Quiz

```python
{
    "updateSettings": {
        "settings": {"quizSettings": {"isQuiz": True}},
        "updateMask": "quizSettings.isQuiz",
    }
}
```

### Update Form Info (Title + Description)

```python
{
    "updateFormInfo": {
        "info": {
            "title": "Form Pendaftaran [Project Klien — Verifikasi Pipeline] — Updated",
            "description": "Deadline 30 Juni 2026. Mohon isi semua field required.",
        },
        "updateMask": "title,description",
    }
}
```

## Read Form Structure

```python
form = forms.forms().get(formId=form_id).execute()
print(f"Title: {form['info']['title']}")
print(f"Items: {len(form.get('items', []))}")
for item in form.get("items", []):
    print(f"  - {item.get('title')}")
```

## Read Responses

```python
responses = forms.forms().responses().list(formId=form_id).execute()
for resp in responses.get("responses", []):
    print(f"Response from {resp.get('respondentEmail')}:")
    for question_id, answer in resp.get("answers", {}).items():
        text_answers = answer.get("textAnswers", {}).get("answers", [])
        values = [a.get("value") for a in text_answers]
        print(f"  Q{question_id}: {values}")
```

## Quiz Answer Key (untuk Form Quiz)

```python
{
    "updateItem": {
        "item": {
            "questionItem": {
                "question": {
                    "grading": {
                        "pointValue": 10,
                        "correctAnswers": {
                            "answers": [{"value": "1969"}],
                        },
                        "whenRight": {"text": "Benar! Apollo 11 mendarat di bulan 20 Juli 1969."},
                        "whenWrong": {"text": "Coba lagi"},
                    }
                }
            }
        },
        "location": {"index": 0},
        "updateMask": "questionItem.question.grading",
    }
}
```

## Common Use Cases (SEO Boost Potential)

### Use Case 1: Form Pendaftaran Lomba

```python
form_id = create_form("Pendaftaran [Project Klien Verifikasi] 2027")
move_to_folder(form_id, "<seoboost_lomba_folder>")

requests = [
    # Nama
    {"createItem": {"item": {"title": "Nama lengkap:", "questionItem": {"question": {"required": True, "textQuestion": {"paragraph": False}}}}, "location": {"index": 0}}},
    # Email
    {"createItem": {"item": {"title": "Email aktif:", "questionItem": {"question": {"required": True, "textQuestion": {"paragraph": False}}}}, "location": {"index": 1}}},
    # Bidang
    {"createItem": {"item": {"title": "Bidang penelitian:", "questionItem": {"question": {"required": True, "choiceQuestion": {"type": "DROP_DOWN", "options": [{"value": b} for b in BIDANG_LIST]}}}}, "location": {"index": 2}}},
    # Upload makalah
    {"createItem": {"item": {"title": "Upload makalah (PDF):", "questionItem": {"question": {"required": True, "fileUploadQuestion": {"maxFiles": 1, "types": ["PDF"]}}}}, "location": {"index": 3}}},
]
forms.forms().batchUpdate(formId=form_id, body={"requests": requests}).execute()
```

### Use Case 2: Form Penilaian Juri (Alternative ke Sheet)

Sebagai alternative ke 30 Sheet pattern (D-074), juri input via Form:

Pro: Form UI lebih familiar untuk non-tech juri
Con: Tidak bisa formula otomatis di Form (need post-processing read responses)

### Use Case 3: Feedback Klien Post-Event

```python
form_id = create_form("Feedback [Project Klien — Verifikasi Pipeline]")
requests = [
    # Skala kepuasan
    {"createItem": {"item": {"title": "Penilaian keseluruhan:", "questionItem": {"question": {"scaleQuestion": {"low": 1, "high": 10, "lowLabel": "Sangat buruk", "highLabel": "Sangat baik"}}}}, "location": {"index": 0}}},
    # Saran terbuka
    {"createItem": {"item": {"title": "Saran untuk tahun depan:", "questionItem": {"question": {"textQuestion": {"paragraph": True}}}}, "location": {"index": 1}}},
]
forms.forms().batchUpdate(formId=form_id, body={"requests": requests}).execute()
```

## Get Responses as CSV

Use Drive export:

```python
# Get linked Spreadsheet for responses (Forms auto-create)
form = forms.forms().get(formId=form_id).execute()
linked_sheet_id = form.get("linkedSheetId")

if linked_sheet_id:
    sh = gc.open_by_key(linked_sheet_id)
    ws = sh.sheet1
    data = ws.get_all_values()
    
    import csv
    with open("responses.csv", "w") as f:
        writer = csv.writer(f)
        for row in data:
            writer.writerow(row)
```

## Rate Limits

Forms API: **60 batchUpdate/minute per user** (sama dengan Docs).

Untuk batch create banyak forms:
```python
for item in items:
    create_form(item)
    time.sleep(1.0)
```

## Anti-Patterns

❌ Add 1 item per batchUpdate request — wastes rate limit
✅ Combine 10+ items into 1 batchUpdate

❌ Polling responses every minute — hit rate limit
✅ Subscribe to push notifications (advanced — see Google Forms API webhook docs)

## Examples

See `reference/examples/create_form_with_questions.py` for full working example.
