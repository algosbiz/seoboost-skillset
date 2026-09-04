#!/usr/bin/env python3
"""
Pemeriksa Bahasa Indonesia: kalke, bentuk tidak baku, register, dan gejala ambiguitas.

Alat ini menandai KANDIDAT masalah, bukan vonis. Sebagian temuan akan benar
menurut konteksnya — kutipan langsung, nama produk, istilah hukum, atau
istilah teknis yang memang dipertahankan. Nilai setiap temuan.

Pemakaian:
    python3 periksa.py berkas.md --ragam konsultan
    python3 periksa.py berkas.html --ragam pemasaran
    cat teks.txt | python3 periksa.py - --ragam akademis

Ragam: konsultan, akademis, keuangan, pemasaran, founder, curah
"""
import argparse
import re
import sys
from collections import Counter

# Ragam formal menuntut diksi baku; ragam santai tidak.
RAGAM_FORMAL = {"konsultan", "akademis", "keuangan"}
RAGAM_SANTAI = {"pemasaran", "founder", "curah"}

# --- Kalke idiom: frasa Inggris yang diterjemahkan kata per kata -------------
KALKE = [
    (r"\bpada akhir hari\b", "pada akhirnya"),
    (r"\bmengambil tempat\b", "berlangsung, terjadi"),
    (r"\bbergerak maju\b", "selanjutnya, ke depan"),
    (r"\bdatang dengan\b", "disertai, mencakup"),
    (r"\bmembuat masuk akal\b", "masuk akal"),
    (r"\bmemetakan ke\b", "merujuk pada, sesuai dengan"),
    (r"\bmenjangkau ke\b", "menghubungi"),
    (r"\bmendorong jarum\b", "memberi dampak nyata"),
    (r"\bdi atas meja\b", "sedang dipertimbangkan"),
    (r"\bmembawa ke meja\b", "menyumbangkan, menawarkan"),
    (r"\bhalaman yang sama\b", "sepaham, sepakat"),
    (r"\bbuah yang menggantung rendah\b", "sasaran termudah"),
    # Tanpa batas kata di akhir, agar bentuk berimbuhan ikut tertangkap
    # ("benteng kompetitifnya", "pintu masuknya").
    (r"\bbenteng kompetitif", "keunggulan struktural"),
    (r"\bpintu masuk(?:nya)?\b(?!\s+gedung)", "celah masuk pasar, titik masuk"),
    (r"\bterbaca lintas\b", "relevansinya lintas"),
    (r"\bsudah jadi\b", "sudah tersedia, sudah rampung"),
    (r"\bdalam terang\b", "mengingat, berdasarkan"),
    (r"\bdalam rangka untuk\b", "untuk, guna"),
    (r"\bmemiliki dampak pada\b", "berdampak pada, memengaruhi"),
    (r"\bmengambil keuntungan dari\b", "memanfaatkan"),
    (r"\bberbasis pada\b", "berdasarkan"),
    (r"\btidak lain dan tidak bukan\b", "(biasanya dapat dihapus)"),
]

# --- Bentuk tidak baku ------------------------------------------------------
BAKU = [
    (r"\banalisa\b", "analisis"), (r"\bpraktek\b", "praktik"),
    (r"\bresiko\b", "risiko"), (r"\bhutang\b", "utang"),
    (r"\bijin\b", "izin"), (r"\bnasehat\b", "nasihat"),
    (r"\bsilahkan\b", "silakan"), (r"\bsekedar\b", "sekadar"),
    (r"\bterlanjur\b", "telanjur"), (r"\bhandal\b", "andal"),
    (r"\bmerubah\b", "mengubah"), (r"\bmempengaruhi\b", "memengaruhi"),
    (r"\bmempopulerkan\b", "memopulerkan"), (r"\baktifitas\b", "aktivitas"),
    (r"\befektifitas\b", "efektivitas"), (r"\bkreatifitas\b", "kreativitas"),
    (r"\bproduktifitas\b", "produktivitas"), (r"\bstandarisasi\b", "standardisasi"),
    (r"\bkwalitas\b", "kualitas"), (r"\bkwantitas\b", "kuantitas"),
    (r"\bjaman\b", "zaman"), (r"\bazas\b", "asas"),
    (r"\bhimbau", "imbau"), (r"\btrampil\b", "terampil"),
    (r"\blembab\b", "lembap"), (r"\bnampak\b", "tampak"),
    (r"\bsistim\b", "sistem"), (r"\bmanagemen\b", "manajemen"),
    (r"\bkomplek\b", "kompleks"), (r"\bkonkrit\b", "konkret"),
    (r"\bobyektif\b", "objektif"), (r"\bpropinsi\b", "provinsi"),
    (r"\bPebruari\b", "Februari"), (r"\bNopember\b", "November"),
    # kata depan "di" yang keliru ditulis serangkai
    (r"\bdirumah\b", "di rumah"), (r"\bdikantor\b", "di kantor"),
    (r"\bdisini\b", "di sini"), (r"\bdisana\b", "di sana"),
    (r"\bdiatas\b", "di atas"), (r"\bdibawah\b", "di bawah"),
    (r"\bdidalam\b", "di dalam"), (r"\bdiluar\b", "di luar"),
    (r"\bdiantara\b", "di antara"), (r"\bdimana\b", "di mana"),
    (r"\bkemana\b", "ke mana"), (r"\bkeluar negeri\b", "ke luar negeri"),
    # gabungan yang seharusnya terpisah / serangkai
    (r"\bkerjasama\b", "kerja sama"), (r"\btanggungjawab\b", "tanggung jawab"),
    (r"\bterimakasih\b", "terima kasih"), (r"\bsumberdaya\b", "sumber daya"),
    (r"\banti\s+muka\b", "antarmuka"), (r"\bnara\s+sumber\b", "narasumber"),
    (r"\bnon\s+aktif\b", "nonaktif"),
]

# --- Diksi takformal: hanya relevan pada ragam formal -----------------------
TAKFORMAL = [
    (r"\bkenapa\b", "mengapa"), (r"\bkalau\b", "jika, apabila"),
    (r"\btapi\b", "tetapi, namun"), (r"\bbikin\b", "membuat"),
    (r"\bgampang\b", "mudah"), (r"\bnggak\b", "tidak"),
    (r"\bgak\b", "tidak"), (r"\budah\b", "sudah"),
    (r"\bkayak\b", "seperti"), (r"\bbanget\b", "sangat"),
    (r"\bngasih\b", "memberikan"), (r"\bdapetin\b", "memperoleh"),
    (r"\bbareng\b", "bersama"), (r"\bmakanya\b", "oleh karena itu"),
    (r"\bsoalnya\b", "karena"), (r"\bbilang\b", "menyatakan"),
    (r"\bngomongin\b", "membahas"), (r"\bcuma\b", "hanya"),
    (r"\bemang\b", "memang"), (r"\bkalian\b", "Anda, atau bentuk impersonal"),
    (r"\bkamu\b", "Anda, atau bentuk impersonal"), (r"\bgue\b", "saya"),
]

# --- Campur bahasa: kata Inggris berpadanan lazim ---------------------------
# Sengaja tidak memuat istilah teknis yang memang dipertahankan
# (server, database, deploy, EBITDA, dsb).
CAMPUR = [
    (r"\bgrow\b", "tumbuh"), (r"\bgrowth\b", "pertumbuhan"),
    (r"\bscalable\b", "dapat diskalakan"), (r"\buser-friendly\b", "mudah dipakai"),
    (r"\bseamless\b", "mulus, tanpa hambatan"), (r"\bpowerful\b", "andal, bertenaga"),
    (r"\bfocus\b", "fokus"), (r"\beffort\b", "upaya"),
    (r"\binsight\b", "wawasan, temuan"), (r"\bdeadline\b", "tenggat"),
    (r"\bmeeting\b", "rapat"), (r"\bfeedback\b", "masukan"),
    (r"\bchallenge\b", "tantangan"), (r"\bconcern\b", "kekhawatiran"),
    (r"\bimpact\b", "dampak"), (r"\bleverage\b", "memanfaatkan"),
    (r"\balign\b", "menyelaraskan"), (r"\bstakeholder\b", "pemangku kepentingan"),
    (r"\bmilestone\b", "tonggak capaian"), (r"\broadmap\b", "peta jalan"),
    (r"\bbenchmark\b", "tolok ukur"), (r"\bmarketplace\b", "lokapasar"),
    (r"\bprototype\b", "purwarupa"), (r"\bdownload\b", "unduh"),
    (r"\bupload\b", "unggah"), (r"\bonline\b", "daring"),
    (r"\boffline\b", "luring"), (r"\bupdate\b", "pemutakhiran"),
    (r"\bincumbent\b", "pemain mapan, pemain lama"),
    (r"\bcompliance\b", "kepatuhan"),
    (r"\brevenue\b", "pendapatan"),
    (r"\bjourney\b", "perjalanan"), (r"\bawareness\b", "kesadaran"),
]

# --- Konvensi penulisan SEO Boost (mode --konvensi) -------------------------------
# Sumber: seoboost-formal-docs -> Document language. Hanya untuk dokumen project yang
# dibaca pihak klien; TIDAK berlaku pada catatan internal, itulah sebabnya
# aturan ini di balik flag, bukan default. Presedensi lengkap ada di SKILLS-SOP.md.

# Istilah yang JUSTRU salah bila diterjemahkan: pertahankan bentuk Inggrisnya.
KONVENSI_ISTILAH = [
    (r"\bkesenjangan\b", "GAP"),
    (r"\btitik keputusan\b", "decision point"),
    (r"\bdaftar periksa\b", "checklist"),
    (r"\bpemangku kepentingan\b", "stakeholder"),
    (r"\bambang(?: batas)?\b", "threshold"),
    (r"\bsanggahan\b", "dispute"),
    (r"\bpenyaringan\b", "filter"),
    (r"\bbagi hasil\b", "revenue share"),
    (r"\bbatas waktu tanggap\b", "response time"),
    (r"\bbarang tertinggal\b", "lost item"),
    (r"\bkebutuhan fungsional\b", "functional requirement"),
    (r"\baturan bisnis\b", "business rule"),
    (r"\bperangkat lunak\b", "software"),
    (r"\bperagaan\b", "demo"),
    (r"\buji terima\b", "UAT"),
]

# Istilah Inggris yang SAH dipertahankan pada dokumen klien — dikecualikan dari
# CAMPUR saat mode konvensi aktif, supaya aturan yang benar tidak saling menuduh.
KONVENSI_DIKECUALIKAN = {
    "gap", "checklist", "threshold", "stakeholder", "decision point",
    "revenue", "revenue share", "dispute", "filter", "response time",
    "lost item", "functional requirement", "business rule", "software",
    "demo", "uat",
}

# Sebut nama pihaknya, jangan "klien".
KONVENSI_PIHAK = [
    (r"\b(?:pihak\s+)?klien\b", "sebut nama pihaknya (mis. Klien A, TransTRACK, Koperasi)"),
    (r"\bthe client\b", "sebut nama pihaknya"),
]

# SEO Boost bukan pihak yang menuntut.
KONVENSI_KEPEMILIKAN = [
    (r"\b(?:kepada|ke|oleh)\s+SEO Boost\b", "tulis dari sudut pihak yang berkepentingan, bukan SEO Boost"),
    # "belum pernah diperiksa SEO Boost", "belum diperagakan SEO Boost" — pasif tanpa
    # preposisi, bentuk yang paling sering lolos.
    (r"\bdi[a-z]+\s+SEO Boost\b", "tulis dari sudut pihak yang berkepentingan, bukan SEO Boost"),
    (r"\busulan SEO Boost\b", "opsi yang diusulkan"),
    (r"\bprosedur SEO Boost\b", "Dokumen SOP"),
]

# Kalimat kosmetik: menampilkan keseriusan tanpa membawa informasi.
KOSMETIK = [
    (r"\bhal ini (?:menjadi )?penting (?:untuk dicatat |karena|bahwa)", "langsung sebut sebabnya"),
    (r"\bperlu (?:untuk )?dicatat bahwa\b", "hapus, langsung ke isinya"),
    (r"\bpada dasarnya\b", "hapus"),
    (r"\bperlu digarisbawahi\b", "hapus"),
    (r"\bpatut (?:untuk )?dicermati\b", "hapus"),
    (r"\btidak dapat dipungkiri\b", "hapus"),
    (r"\bsebagaimana (?:telah )?diketahui\b", "hapus"),
    (r"\badu pernyataan\b", "sulit dibuktikan kedua pihak"),
    (r"\bdalam rangka (?:untuk )?\b", "untuk"),
    (r"\bguna (?:untuk )?meningkatkan\b", "untuk meningkatkan"),
    (r"\bmerupakan (?:suatu|sebuah) hal yang\b", "hapus, langsung sifatnya"),
]

# --- Gejala ambiguitas ------------------------------------------------------
SAMAR_JUMLAH = r"\b(beberapa|sebagian besar|banyak|sedikit|mayoritas|cukup banyak|sejumlah|hampir semua)\b"
SAMAR_WAKTU = r"\b(segera|secepatnya|dalam waktu dekat|nanti|belakangan ini|beberapa waktu lalu|ke depannya)\b"

BATAS_KATA_KALIMAT = 30
BATAS_YANG = 3


def bersihkan(teks):
    """Buang elemen yang bukan prosa agar tidak menimbulkan temuan palsu."""
    teks = re.sub(r"<script.*?</script>|<style.*?</style>", "", teks, flags=re.S | re.I)
    teks = re.sub(r"<!--.*?-->", "", teks, flags=re.S)
    teks = re.sub(r"```.*?```", "", teks, flags=re.S)      # blok kode Markdown
    teks = re.sub(r"`[^`\n]*`", "", teks)                   # kode sebaris
    teks = re.sub(r"https?://\S+", "", teks)
    # Tag blok menjadi batas kalimat. Tanpa ini, sel tabel dan butir daftar
    # menyatu menjadi satu "kalimat" raksasa dan memicu temuan PANJANG palsu.
    teks = re.sub(r"</(?:td|th|tr|li|p|h[1-6]|div|caption)>|<br\s*/?>",
                  ".\n", teks, flags=re.I)
    teks = re.sub(r"<[^>]+>", " ", teks)                    # sisa tag HTML

    # Baris Markdown yang bukan prosa mengalir — baris tabel, judul, butir
    # daftar — diberi batas kalimat. Tanpa ini, sel tabel menyatu dan memicu
    # temuan PANJANG palsu, persis seperti pada tabel HTML.
    baris_baru = []
    for b in teks.split("\n"):
        s = b.strip()
        if s.startswith("|"):
            s = ". ".join(p.strip() for p in s.strip("|").split("|") if p.strip())
        if s and re.match(r"^(#{1,6}\s|[-*+]\s|>\s|\d+\.\s)", b.strip()):
            s = re.sub(r"^(#{1,6}\s|[-*+]\s|>\s|\d+\.\s)", "", s)
        if s and s[-1] not in ".!?:;":
            s += "."
        baris_baru.append(s)
    teks = "\n".join(baris_baru)

    teks = re.sub(r"\.\s*\.(\s*\.)*", ".", teks)            # rapikan titik beruntun
    return teks


def nama_diri(baris, awal, akhir):
    """Apakah kecocokan merupakan bagian dari rangkaian nama diri?

    Nama produk, perusahaan, dan acara sering memuat kata Inggris yang tidak
    boleh diganti — "Imperial Global Challenge Lab", "Bali Investment Club".
    Penandanya: kata itu berhuruf kapital dan bertetangga dengan kata
    berkapital lain.
    """
    if not baris[awal:akhir][:1].isupper():
        return False
    sebelum = baris[:awal].rstrip().split()
    sesudah = baris[akhir:].lstrip().split()
    tetangga = (sebelum[-1] if sebelum else "", sesudah[0] if sesudah else "")
    return any(k[:1].isupper() or k[:1].isdigit() for k in tetangga if k)


def periksa_baris(baris, ragam, konvensi=False):
    """Kembalikan daftar temuan (kategori, cuplikan, saran) untuk satu baris."""
    hasil = []
    rendah = baris.lower()

    aturan = [("KALKE", KALKE), ("BAKU", BAKU), ("CAMPUR", CAMPUR)]
    if ragam in RAGAM_FORMAL:
        aturan.append(("TAKFORMAL", TAKFORMAL))
    if konvensi:
        aturan += [
            ("ISTILAH", KONVENSI_ISTILAH),
            ("PIHAK", KONVENSI_PIHAK),
            ("KEPEMILIKAN", KONVENSI_KEPEMILIKAN),
            ("KOSMETIK", KOSMETIK),
        ]

    for kategori, daftar in aturan:
        for pola, saran in daftar:
            for m in re.finditer(pola, rendah, flags=re.I):
                if nama_diri(baris, m.start(), m.end()):
                    continue
                # Mode konvensi: istilah Inggris yang memang WAJIB dipertahankan
                # tidak boleh dilaporkan sebagai campur bahasa.
                if konvensi and kategori == "CAMPUR" and m.group(0).lower() in KONVENSI_DIKECUALIKAN:
                    continue
                hasil.append((kategori, m.group(0), saran))

    # Gejala ambiguitas. Ragam curah gagasan dikecualikan karena catatan
    # cepat memang belum dituntut presisi.
    if ragam != "curah":
        for m in re.finditer(SAMAR_JUMLAH, rendah):
            hasil.append(("AMBIGU", m.group(0), "ganti dengan angka bila tersedia"))
        for m in re.finditer(SAMAR_WAKTU, rendah):
            hasil.append(("AMBIGU", m.group(0), "ganti dengan tanggal"))
        if re.match(r"^\s*Ini\s+(adalah|bukan|menunjukkan|berarti|membuat|akan)", baris):
            hasil.append(("AMBIGU", "Ini …", "sebutkan acuannya secara eksplisit"))

    return hasil


def periksa_kalimat(teks, ragam):
    """Gejala tingkat kalimat: panjang berlebih dan rantai 'yang'."""
    hasil = []
    if ragam == "curah":
        return hasil
    for kal in re.split(r"(?<=[.!?])\s+", teks):
        kal = kal.strip()
        if not kal:
            continue
        jml_kata = len(kal.split())
        # Ragam akademis sah berkalimat lebih panjang; ambangnya dilonggarkan
        # agar temuan tetap bermakna dan tidak sekadar ramai.
        batas = 40 if ragam == "akademis" else BATAS_KATA_KALIMAT
        if jml_kata > batas and ragam != "pemasaran":
            hasil.append(("PANJANG", f"{jml_kata} kata", kal[:70] + "…"))
        if len(re.findall(r"\byang\b", kal, flags=re.I)) >= BATAS_YANG:
            hasil.append(("RANTAI-YANG", "≥3 'yang'", kal[:70] + "…"))
    return hasil


def main():
    p = argparse.ArgumentParser(description="Pemeriksa Bahasa Indonesia baku dan jernih.")
    p.add_argument("berkas", help="berkas .md/.html/.txt, atau '-' untuk stdin")
    p.add_argument("--ragam", default="konsultan",
                   choices=sorted(RAGAM_FORMAL | RAGAM_SANTAI),
                   help="ragam sasaran (memengaruhi pemeriksaan diksi)")
    p.add_argument("--ringkas", action="store_true", help="tampilkan rekap saja")
    p.add_argument("--konvensi", action="store_true",
                   help="tegakkan Konvensi penulisan SEO Boost (seoboost-formal-docs -> Document "
                        "language): istilah yang harus tetap Inggris, larangan kata "
                        "'klien', framing kepemilikan, dan kalimat kosmetik. "
                        "WAJIB untuk dokumen project yang dibaca pihak klien; "
                        "JANGAN dipakai pada catatan internal.")
    a = p.parse_args()

    mentah = sys.stdin.read() if a.berkas == "-" else open(a.berkas, encoding="utf-8").read()
    teks = bersihkan(mentah)

    temuan, rekap = [], Counter()
    for i, baris in enumerate(teks.split("\n"), 1):
        if not baris.strip():
            continue
        for kategori, cuplikan, saran in periksa_baris(baris, a.ragam, a.konvensi):
            temuan.append((i, kategori, cuplikan, saran))
            rekap[kategori] += 1
    for kategori, cuplikan, saran in periksa_kalimat(teks, a.ragam):
        temuan.append((None, kategori, cuplikan, saran))
        rekap[kategori] += 1

    # Dua tingkat. PERBAIKI bersifat mekanis dan hampir selalu benar.
    # TINJAU bersifat gejala dan menuntut penilaian manusia — dipisahkan agar
    # tidak menenggelamkan tingkat pertama, yang justru paling menentukan.
    PERBAIKI = {"KALKE", "BAKU", "TAKFORMAL", "CAMPUR"}
    # Pada dokumen klien, konvensi SEO Boost bukan gejala melainkan pelanggaran:
    # kata "klien", istilah yang salah diterjemahkan, framing yang menempatkan
    # SEO Boost sebagai penuntut, dan kalimat kosmetik semuanya keputusan penulis,
    # bukan tafsir konteks. Naikkan ke Tingkat 1 supaya aturan "Tingkat 1 harus
    # nol sebelum diserahkan" benar-benar menegakkannya.
    if a.konvensi:
        PERBAIKI |= {"ISTILAH", "PIHAK", "KEPEMILIKAN", "KOSMETIK"}
    tingkat1 = [t for t in temuan if t[1] in PERBAIKI]
    tingkat2 = [t for t in temuan if t[1] not in PERBAIKI]

    def cetak(judul, butir, catatan):
        print(f"\n{judul}  ({len(butir)})")
        print("-" * 72)
        if not butir:
            print("  tidak ada")
            return
        print(f"  {catatan}\n")
        if a.ringkas:
            return
        for baris, kategori, cuplikan, saran in butir:
            lokasi = f"baris {baris}" if baris else "kalimat"
            print(f"  [{kategori:12}] {lokasi:12} {cuplikan!r}")
            print(f"  {'':27}-> {saran}")

    print(f"Ragam: {a.ragam}   Berkas: {a.berkas}")
    print("=" * 72)

    if not temuan:
        print("Tidak ada temuan. Lanjutkan ke pemeriksaan manual, SKILL.md langkah 4.")
        return 0

    cetak("TINGKAT 1 — PERBAIKI", tingkat1,
          "Kesalahan mekanis: kalke, bentuk tidak baku, diksi di luar ragam, campur bahasa.")
    cetak("TINGKAT 2 — TINJAU", tingkat2,
          "Gejala, bukan pelanggaran. Sebagian akan benar menurut konteksnya.")

    print("\n" + "=" * 72)
    print("Rekap: " + ", ".join(f"{k}={v}" for k, v in rekap.most_common()))
    if not tingkat1:
        print("Tingkat 1 bersih. Sisanya perlu penilaian, bukan koreksi otomatis.")
    print("Lanjutkan ke pemeriksaan manual di SKILL.md langkah 4 —")
    print("acuan kata ganti, pelaku kalimat pasif, pembanding, dan tenggat.")
    return 1 if tingkat1 else 0


if __name__ == "__main__":
    sys.exit(main())
