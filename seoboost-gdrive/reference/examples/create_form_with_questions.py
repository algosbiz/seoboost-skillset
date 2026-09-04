"""Example: Create Google Form dengan multiple question types.

Pattern: create form → batchUpdate untuk add questions → move ke folder.

⚠️ Belum production-tested di SEO Boost — based on Google Forms API docs reference.
"""

from auth import get_credentials, get_drive_folder_id
from googleapiclient.discovery import build


DISCOVERY_DOC = "https://forms.googleapis.com/$discovery/rest?version=v1"


def create_form_with_questions(
    title: str,
    description: str,
    questions: list[dict],
    folder_id: str,
    forms_service,
    drive_service,
) -> dict:
    """Create Form + add questions + move ke folder.

    Args:
        title: Form title
        description: Form description (kosong = no description)
        questions: List of question dicts (lihat format below)
        folder_id: Drive folder destination
        forms_service: Forms API service
        drive_service: Drive API service

    Returns:
        {"form_id", "editor_url", "responder_url"}
    """
    # Step 1: Create form
    form_body = {"info": {"title": title}}
    result = forms_service.forms().create(body=form_body).execute()
    form_id = result["formId"]

    # Step 2: Build requests (description + questions)
    requests = []

    if description:
        requests.append({
            "updateFormInfo": {
                "info": {"description": description},
                "updateMask": "description",
            }
        })

    for idx, q in enumerate(questions):
        requests.append({
            "createItem": {
                "item": q,
                "location": {"index": idx},
            }
        })

    # Step 3: Batch execute
    if requests:
        forms_service.forms().batchUpdate(
            formId=form_id,
            body={"requests": requests},
        ).execute()

    # Step 4: Move ke folder (Drive API workaround)
    file = drive_service.files().get(fileId=form_id, fields="parents").execute()
    prev_parents = ",".join(file.get("parents", []))
    drive_service.files().update(
        fileId=form_id,
        addParents=folder_id,
        removeParents=prev_parents,
        fields="id, parents",
    ).execute()

    # Get final URLs
    form = forms_service.forms().get(formId=form_id).execute()

    return {
        "form_id": form_id,
        "editor_url": f"https://docs.google.com/forms/d/{form_id}/edit",
        "responder_url": form.get("responderUri", ""),
    }


# Helper functions untuk build question types
def q_multiple_choice(title: str, options: list[str], required: bool = True, shuffle: bool = False) -> dict:
    return {
        "title": title,
        "questionItem": {
            "question": {
                "required": required,
                "choiceQuestion": {
                    "type": "RADIO",
                    "options": [{"value": v} for v in options],
                    "shuffle": shuffle,
                },
            }
        },
    }


def q_checkbox(title: str, options: list[str], required: bool = False) -> dict:
    return {
        "title": title,
        "questionItem": {
            "question": {
                "required": required,
                "choiceQuestion": {
                    "type": "CHECKBOX",
                    "options": [{"value": v} for v in options],
                },
            }
        },
    }


def q_dropdown(title: str, options: list[str], required: bool = True) -> dict:
    return {
        "title": title,
        "questionItem": {
            "question": {
                "required": required,
                "choiceQuestion": {
                    "type": "DROP_DOWN",
                    "options": [{"value": v} for v in options],
                },
            }
        },
    }


def q_short_text(title: str, required: bool = True) -> dict:
    return {
        "title": title,
        "questionItem": {
            "question": {
                "required": required,
                "textQuestion": {"paragraph": False},
            }
        },
    }


def q_paragraph(title: str, required: bool = False) -> dict:
    return {
        "title": title,
        "questionItem": {
            "question": {
                "required": required,
                "textQuestion": {"paragraph": True},
            }
        },
    }


def q_scale(title: str, low: int = 1, high: int = 5, low_label: str = "", high_label: str = "", required: bool = True) -> dict:
    return {
        "title": title,
        "questionItem": {
            "question": {
                "required": required,
                "scaleQuestion": {
                    "low": low,
                    "high": high,
                    "lowLabel": low_label,
                    "highLabel": high_label,
                },
            }
        },
    }


def q_date(title: str, include_year: bool = True, required: bool = True) -> dict:
    return {
        "title": title,
        "questionItem": {
            "question": {
                "required": required,
                "dateQuestion": {
                    "includeTime": False,
                    "includeYear": include_year,
                },
            }
        },
    }


def q_file_upload(title: str, max_files: int = 1, types: list[str] = None, max_size_mb: int = 10, required: bool = True) -> dict:
    return {
        "title": title,
        "questionItem": {
            "question": {
                "required": required,
                "fileUploadQuestion": {
                    "maxFiles": max_files,
                    "maxFileSize": max_size_mb * 1024 * 1024,
                    "types": types or ["PDF"],
                },
            }
        },
    }


def main():
    creds = get_credentials()
    forms = build("forms", "v1", credentials=creds, discoveryServiceUrl=DISCOVERY_DOC, static_discovery=False)
    drive = build("drive", "v3", credentials=creds)
    folder_id = get_drive_folder_id()

    # Example: Form Feedback Klien
    questions = [
        q_short_text("Nama lengkap:"),
        q_short_text("Email:"),
        q_dropdown("Bidang yang Anda nilai:", ["Matematika", "Fisika", "Komputer", "Ekonomi"]),
        q_scale("Tingkat kepuasan keseluruhan:", low=1, high=10, low_label="Sangat buruk", high_label="Sangat baik"),
        q_multiple_choice("Apakah Anda mau ikut lomba berikutnya?", ["Ya", "Tidak", "Mungkin"]),
        q_checkbox("Apa saja yang perlu di-improve? (boleh > 1)", ["Komunikasi", "Format dokumen", "Timeline", "Lainnya"]),
        q_paragraph("Saran/masukan terbuka:", required=False),
        q_date("Tanggal Anda submit feedback ini:"),
    ]

    result = create_form_with_questions(
        title="Feedback [Project Klien — Verifikasi Pipeline]",
        description="Mohon berikan feedback Anda untuk improvement lomba ini. Anonymous OK, tapi prefer dengan identitas.",
        questions=questions,
        folder_id=folder_id,
        forms_service=forms,
        drive_service=drive,
    )

    print(f"✓ Form created: {result['form_id']}")
    print(f"  Editor URL: {result['editor_url']}")
    print(f"  Responder URL: {result['responder_url']}")


if __name__ == "__main__":
    main()
