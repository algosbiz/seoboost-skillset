# Audit Bulanan Ekosistem Skill (macOS / Linux / Windows)

Otomasi ini menjalankan `automation/seoboost-monthly-audit.sh` tiap tanggal 1 pukul
07:00 waktu lokal. Penjadwalnya per OS: launchd (macOS), systemd user timer
(Linux), Task Scheduler (Windows) — lihat bagian per-OS di bawah. Script-nya
satu dan sama untuk ketiganya (bash, repo di-resolve dari lokasi file script). Script memanggil `claude -p` headless
dengan prompt: jalankan `seoboost-skill-ecosystem-audit`, panen pelajaran lewat
`seoboost-skill-evolution`, lalu tulis laporan ke
`ProjectDocs/skill-ecosystem-audit-<YYYY-MM>/LAPORAN-BULANAN.md`. Script
melarang push di dalam prompt; hasil audit tinggal di working tree sampai
operator meninjau dan mendorongnya sendiri.

## Status: BELUM DIMUAT

Wave-3 (29 Agu 2026) hanya menyiapkan file — plist ini TIDAK dimuat ke launchd.
Alasannya di bagian Biaya di bawah. Memuat adalah keputusan operator.

## Biaya — baca sebelum memuat

Tiap run headless memakai kuota API/langganan Claude yang sama dengan sesi
interaktif, dengan batas waktu 30 menit per run. Muat otomasi ini hanya setelah
operator menyetujui biayanya secara eksplisit.

## Cara memuat (setelah operator setuju)

```bash
mkdir -p ~/Library/LaunchAgents ~/.claude/logs
cp ~/.claude/seoboost-skill-set/automation/com.seoboost.monthly-audit.plist ~/Library/LaunchAgents/
launchctl load -w ~/Library/LaunchAgents/com.seoboost.monthly-audit.plist
```

Verifikasi terdaftar:

```bash
launchctl list | grep com.seoboost.monthly-audit
```

## Cara melepas

```bash
launchctl unload -w ~/Library/LaunchAgents/com.seoboost.monthly-audit.plist
rm ~/Library/LaunchAgents/com.seoboost.monthly-audit.plist
```

## Path per mesin — WAJIB disesuaikan

launchd tidak meng-expand `~` maupun `$HOME`, jadi plist memakai path literal
untuk mesin M4 Mac (user `hash`):

- `ProgramArguments`: `/Users/hash/.claude/seoboost-skill-set/automation/seoboost-monthly-audit.sh`
- `EnvironmentVariables.PATH`: memuat `/Users/hash/.local/bin` (lokasi binary `claude`)
- `StandardOutPath` / `StandardErrorPath`: `/Users/hash/.claude/logs/...`

Mesin lain harus mengganti semua path `/Users/hash/...` di plist sebelum
memuat — sesuaikan home user dan lokasi clone repo. Script-nya sendiri bebas
path mesin: repo di-resolve dari lokasi file script.

## Linux (Ubuntu) — systemd user timer

Untuk host seperti a Linux host (clone di
`~/Documents/Workspaces/SEOBoost/seoboost-skill-set`). Dua unit di
`~/.config/systemd/user/`:

`seoboost-monthly-audit.service`
```ini
[Unit]
Description=Audit bulanan ekosistem skill SEO Boost

[Service]
Type=oneshot
ExecStart=/bin/bash %h/Documents/Workspaces/SEOBoost/seoboost-skill-set/automation/seoboost-monthly-audit.sh
```

`seoboost-monthly-audit.timer`
```ini
[Unit]
Description=Jadwal audit bulanan SEO Boost (tanggal 1, 07:00)

[Timer]
OnCalendar=*-*-01 07:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Muat: `systemctl --user daemon-reload && systemctl --user enable --now seoboost-monthly-audit.timer`.
Verifikasi: `systemctl --user list-timers | grep seoboost-monthly-audit.timer`. Host headless
butuh `loginctl enable-linger <user>` (sudah kebiasaan di host Hermes). Lepas:
`systemctl --user disable --now seoboost-monthly-audit.timer`.

## Windows — Task Scheduler (template, belum diuji di mesin Windows SEO Boost)

Script-nya bash, jadi di Windows dijalankan lewat Git Bash (atau WSL). Dari
PowerShell/CMD sebagai user yang punya login `claude`:

```bat
schtasks /Create /TN "SEO Boost Monthly Audit" /SC MONTHLY /D 1 /ST 07:00 ^
  /TR "\"C:\Program Files\Git\bin\bash.exe\" -lc '~/.claude/seoboost-skill-set/automation/seoboost-monthly-audit.sh'"
```

Sesuaikan path bash.exe dan lokasi clone repo. Verifikasi: `schtasks /Query /TN "SEO Boost Monthly Audit"`.
Lepas: `schtasks /Delete /TN "SEO Boost Monthly Audit" /F`. Alternatif WSL: ganti
`/TR` menjadi `wsl.exe bash -lc '<path-repo-di-wsl>/automation/seoboost-monthly-audit.sh'`.
Tandai hasil uji perdana di file ini saat pertama kali dimuat di mesin Windows.

## Log

- Per run: `~/.claude/logs/seoboost-monthly-audit-<YYYY-MM-DD>.log` (ditulis script,
  berisi stdout+stderr `claude -p` plus ringkasan mulai/selesai).
- launchd: `~/.claude/logs/seoboost-monthly-audit-launchd.log` (keluaran di luar
  redirect script, biasanya kecil).

## Menjalankan manual (tanpa launchd)

```bash
bash ~/.claude/seoboost-skill-set/automation/seoboost-monthly-audit.sh
```

Guard yang sama berlaku: butuh binary `claude` di PATH, batas 30 menit,
exit code 142 berarti dihentikan alarm karena melewati batas.
