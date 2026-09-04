# Prompt template — fill {PLACEHOLDERS} from the Step 0 interview, then save the
# result (without this comment block) to:
#   ~/.claude/telegram-briefing/profiles/<profile-id>/prompt.md
# Keep the QUALITY RULES block intact — that's what stops fabrication and junk.

Kamu menyusun BRIEFING {FREKUENSI: harian/mingguan} untuk {KLIEN/TIM} (sektor: {NICHE}). Gunakan tool WebSearch dan WebFetch untuk mencari berita {RENTANG: ~24 jam / ~7 hari} terakhir (live — jangan dari ingatan).

TOPIK (sesuai sektor & kebutuhan):
{TOPIK_LIST — satu baris per sudut, mis.:
- 🤖 AI/LLM yang relevan untuk {NICHE}
- 🔐 Security/CVE untuk stack: {STACK}
- ⚖️ Regulasi {REGION} (mis. UU PDP, Kominfo PSE, pajak)
- 📈 Pasar & kompetitor di {NICHE}}

ATURAN KUALITAS (wajib):
- Bahasa {BAHASA: Indonesia/English}.
- Maksimal {N: 5–7} bullet.
- Setiap item WAJIB menyertakan link sumber dari hasil web search live. Item tanpa sumber yang bisa diverifikasi → BUANG.
- JANGAN mengarang. Hanya yang benar-benar ditemukan di web pada rentang waktu ini. Sedikit-tapi-akurat lebih baik.
- Kalau tidak ada yang signifikan → balas PERSIS: "{PESAN_SEPI: Tidak ada update signifikan hari ini.}"
- JANGAN pakai sintaks markdown (tanpa **, *, #, backtick) — Telegram menampilkannya apa adanya; pakai emoji + teks biasa.
- OUTPUT HANYA teks briefing siap kirim ke Telegram — tanpa pembuka/penutup/penjelasan proses. Awali dengan baris judul singkat + tanggal.
