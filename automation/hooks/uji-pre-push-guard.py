#!/usr/bin/env python3
"""Kontrol positif dan negatif untuk pre-push-guard.sh.

Pakai:
    python3 automation/hooks/uji-pre-push-guard.py            # hook di sebelah berkas ini
    python3 automation/hooks/uji-pre-push-guard.py <path>     # hook lain, mis. versi lama

Kenapa ada. Hook ini menegakkan Iron Law #4, dan penjaga yang salah lebih berbahaya
daripada tidak ada penjaga: positif palsu memaksa orang memakai token SEOBOOST_PUSH_OK=1
sebagai kebiasaan, dan token yang jadi kebiasaan berhenti menjadi persetujuan.

Delapan kasus pertama WAJIB deny, delapan berikutnya WAJIB allow. Saat mengubah hook,
jalankan set ini terhadap versi lama DAN versi baru: kalau keduanya lolos penuh, set
ujinya tidak membedakan apa pun dan belum membuktikan perbaikan.
"""
import json
import pathlib
import subprocess
import sys

DEFAULT_HOOK = pathlib.Path(__file__).resolve().parent / "pre-push-guard.sh"
HOOK = sys.argv[1] if len(sys.argv) > 1 else str(DEFAULT_HOOK)

# Dirakit dari potongan supaya berkas uji ini sendiri tidak menyalakan hook saat
# seseorang membacanya lewat perintah Bash.
G = "git"
P = "push"

DOK_HEREDOC = (
    "O=~/out.md\n"
    "cat > \"$O\" <<'DOC'\n"
    "## Never without asking me\n"
    "\n"
    "1. `" + G + " " + P + "`, merge to a production branch, deploy, or any irreversible action.\n"
    "2. Deleting anything you did not create in this session.\n"
    "DOC\n"
    "echo \"baris: $(wc -l < \\\"$O\\\")\"\n"
)

BASH_HEREDOC = "bash <<'EOF'\n" + G + " " + P + " origin main\nEOF\n"

COMMIT_HEREDOC = (
    G + " commit -q -F - <<'EOF'\n"
    "Ringkasan kerja\n"
    "\n"
    "Belum di-" + P + ": 17 commit lokal.\n"
    "EOF\n"
)

KASUS = [
    (P + " telanjang",            G + " " + P,                                      "deny"),
    (P + " origin main",          G + " " + P + " origin main",                     "deny"),
    (P + " dengan -C",            G + " -C /repo " + P + " --force",                "deny"),
    (P + " sesudah &&",           "cd /x && " + G + " " + P,                        "deny"),
    (P + " sesudah ;",            "echo hi; " + G + " " + P + " origin main",       "deny"),
    (P + " dengan env",           "env FOO=1 " + G + " " + P,                       "deny"),
    (P + " dalam backtick",       "echo `" + G + " " + P + "`",                     "deny"),
    (P + " via heredoc bash",     BASH_HEREDOC,                                     "deny"),

    ("token persetujuan",         "SEOBOOST_PUSH_OK=1 " + G + " " + P + " origin main",  "allow"),
    ("tulis dokumen",             DOK_HEREDOC,                                      "allow"),
    ("pesan commit sebut " + P,   COMMIT_HEREDOC,                                   "allow"),
    ("git status",                G + " status --short",                            "allow"),
    ("git pull",                  G + ' -C "$REPO" pull --ff-only',                 "allow"),
    ("salin berkas hook",         "cp automation/hooks/pre-" + P + "-guard.sh /tmp/", "allow"),
    ("echo kata " + P,            'echo "' + P + ' dulu"',                          "allow"),
    ("git log --grep",            G + ' log --grep="' + P + '"',                    "allow"),
]


def jalankan(cmd):
    payload = json.dumps({"tool_name": "Bash", "tool_input": {"command": cmd}})
    hasil = subprocess.run([HOOK], input=payload, capture_output=True, text=True)
    return "deny" if "permissionDecision" in hasil.stdout else "allow"


def main():
    gagal = 0
    print(f"hook: {HOOK}")
    print(f"{'kasus':<28}{'harap':<8}{'hasil':<8}status")
    print("-" * 56)
    for nama, cmd, harap in KASUS:
        hasil = jalankan(cmd)
        cocok = hasil == harap
        gagal += 0 if cocok else 1
        print(f"{nama:<28}{harap:<8}{hasil:<8}{'OK' if cocok else 'GAGAL'}")
    print("-" * 56)
    print(f"{len(KASUS) - gagal}/{len(KASUS)} lolos")
    return 1 if gagal else 0


if __name__ == "__main__":
    sys.exit(main())
