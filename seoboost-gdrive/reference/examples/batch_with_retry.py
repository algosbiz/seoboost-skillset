"""Example: Production-ready batch operations dengan retry pattern.

Pattern dari [Project Klien — Verifikasi Pipeline] — 30 Sheet auto-fix (formula bug recovery).
Handle transient 429 (rate limit) + 503 (service unavailable) errors.
"""

import time
from typing import Callable, TypeVar

T = TypeVar("T")


def call_with_retry(
    operation: Callable[[], T],
    max_retries: int = 3,
    operation_name: str = "operation",
    base_delay: float = 1.0,
) -> T:
    """Execute operation dengan exponential backoff retry untuk transient errors.

    Retry on: 429 (rate limit), 503 (service unavailable)
    Don't retry on: 401 (auth), 403 (permission), 404 (not found), 400 (bad request)

    Args:
        operation: Callable yg return result
        max_retries: Total attempts (default 3)
        operation_name: Untuk logging
        base_delay: Initial delay sebelum first retry (akan exponential)

    Returns:
        Result dari operation
    """
    last_exception = None

    for attempt in range(max_retries):
        try:
            return operation()
        except Exception as e:
            last_exception = e
            err_str = str(e)

            # Check if retryable
            is_retryable = any(code in err_str for code in ["429", "503", "500", "502", "504"])

            if not is_retryable or attempt == max_retries - 1:
                # Non-retryable or last attempt: raise
                raise

            # Exponential backoff: 1s, 2s, 4s, 8s...
            wait = base_delay * (2 ** attempt)
            print(f"  ⚠ {operation_name} retry {attempt+1}/{max_retries-1} after {wait}s: {err_str[:80]}")
            time.sleep(wait)

    # Shouldn't reach here, but just in case
    raise last_exception  # type: ignore


def batch_process(
    items: list,
    process_fn: Callable,
    rate_limit_delay: float = 0.3,
    label_fn: Callable[[any], str] = str,
    max_retries: int = 3,
) -> dict:
    """Process list of items dengan rate limit + retry.

    Args:
        items: List items to process
        process_fn: Function(item) → result
        rate_limit_delay: Sleep between successful items (avoid hit quota)
        label_fn: Function(item) → display label untuk logging
        max_retries: Per-item retry count

    Returns:
        {
            "success": [{"item": ..., "result": ...}, ...],
            "failed": [{"item": ..., "error": "..."}, ...],
            "total_time_s": float,
        }
    """
    start_time = time.time()
    success = []
    failed = []

    for i, item in enumerate(items, 1):
        label = label_fn(item)
        try:
            result = call_with_retry(
                lambda: process_fn(item),
                max_retries=max_retries,
                operation_name=f"[{i}/{len(items)}] {label}",
            )
            success.append({"item": item, "result": result})
            print(f"  ✓ [{i}/{len(items)}] {label}")
        except Exception as e:
            failed.append({"item": item, "error": str(e)[:200]})
            print(f"  ✗ [{i}/{len(items)}] {label}: FAILED — {str(e)[:80]}")

        # Rate limit safety
        if i < len(items):
            time.sleep(rate_limit_delay)

    total_time = time.time() - start_time
    return {
        "success": success,
        "failed": failed,
        "total_time_s": round(total_time, 1),
        "total": len(items),
    }


def main():
    """Example usage: bulk read 30 Sheet formula state."""
    import gspread
    from auth import get_credentials, get_drive_folder_id
    from googleapiclient.discovery import build

    creds = get_credentials()
    gc = gspread.authorize(creds)
    drive = build("drive", "v3", credentials=creds)
    folder_id = get_drive_folder_id()

    # List all sheets in folder
    result = drive.files().list(
        q=f"'{folder_id}' in parents and mimeType='application/vnd.google-apps.spreadsheet'",
        fields="files(id, name)",
        pageSize=100,
    ).execute()
    sheets_list = result.get("files", [])

    print(f"Processing {len(sheets_list)} sheets...")

    def check_formula(sheet_info: dict) -> dict:
        """Check kalau formula di kolom J working."""
        sh = gc.open_by_key(sheet_info["id"])
        ws = sh.sheet1
        formula = ws.cell(2, 10, value_render_option="FORMULA").value
        is_ok = formula and formula.startswith("=") and not formula.startswith("'")
        return {"name": sheet_info["name"], "formula_ok": is_ok, "formula": formula}

    result = batch_process(
        items=sheets_list,
        process_fn=check_formula,
        rate_limit_delay=0.2,
        label_fn=lambda s: s["name"][:50],
        max_retries=3,
    )

    print(f"\n✓ Total time: {result['total_time_s']}s")
    print(f"  Success: {len(result['success'])}, Failed: {len(result['failed'])}")
    if result["failed"]:
        for f in result["failed"]:
            print(f"  ✗ {f['item'].get('name')}: {f['error']}")


if __name__ == "__main__":
    main()
