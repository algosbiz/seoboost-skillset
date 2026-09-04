# Hooks

Skrip hook Claude Code yang dipakai lintas mesin. Repo ini cuma **menyimpan**; Claude Code
membacanya dari `~/.claude/hooks/`, jadi tiap mesin harus memasang sendiri.

## Pasang di mesin baru

    cp ~/.claude/seoboost-skill-set/agent-memory/hooks/seoboost-repo-status.sh ~/.claude/hooks/
    chmod +x ~/.claude/hooks/seoboost-repo-status.sh

Lalu tambahkan ke `~/.claude/settings.json`, di dalam larik `hooks.SessionStart[0].hooks`:

    { "type": "command", "command": "\"/Users/<user>/.claude/hooks/seoboost-repo-status.sh\"" }

## `seoboost-repo-status.sh`

Lapor sekali di awal sesi kalau repo ini punya kerja yang belum di-commit, belum di-push,
atau ada commit dari mesin lain yang belum ditarik. **Diam kalau semuanya bersih** — itu
disengaja; hook yang cerewet tiap sesi akan berhenti dibaca, dan saat benar-benar ada
masalah ikut terlewat.

Dipasang 2026-08-14. Sebabnya nyata: 18 hari hasil kerja pernah menumpuk di satu mesin
tanpa ada yang memberi tahu, termasuk dua skill yang sama sekali tidak punya cadangan.
