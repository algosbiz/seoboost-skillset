---
name: seoboost-bahasa-jernih
description: Use when writing or revising ANY Indonesian text that leaves SEO Boost — client documents, chat replies, status updates, commit messages, WhatsApp drafts. Catches writer-only jargon, rhetorical tics, raw English calques, invented claims, and SEO Boost positioning itself as an authority it is not. Home of the delivered-text rule — any WhatsApp/email draft, even one requested casually mid-chat ("tolong buatkan balasannya"), counts as delivered text and must pass its checks.
---

# Bahasa Jernih — bahasa yang dimengerti penerimanya

## Satu uji, dipakai untuk semuanya

> **Apakah pembaca perlu tahu sejarah dokumen ini untuk memahami kalimatnya?**

Bila ya, ganti. Itu saja. Seluruh kelas kekeliruan di bawah turunan dari uji itu.

Skill ini lahir dari satu hari kerja pada project KLIEN A (PT Klien A,
26 Agustus 2026), ketika operator menunjuk **delapan** kekeliruan bahasa berturut-turut yang
tidak satu pun tertangkap gerbang mesin mana pun — sebab semuanya benar secara tata bahasa.
Contoh di bawah nyata, bukan karangan.

Skill ini **melengkapi** `seoboost-tulis-indonesia`, tidak menggantikannya. Yang itu mengurus
ragam, kalke, ejaan baku pada teks yang diserahkan. Yang ini mengurus **jarak antara penulis
dan pembaca** — plus seluruh aturan balasan chat dan draf pesan (§12–§14; dulu aturan 8/8b/8c
system prompt SEO Boost, kini rumahnya di sini).

---

## 1. Istilah ikut pembaca, bukan penyusun

Kiasan dan singkatan yang dipakai penyusun selalu terasa jelas baginya — ia tahu asal-usulnya.
Pembaca tidak, dan tidak perlu tahu.

| Ditulis | Benar bagi penyusun karena | Ganti |
|---|---|---|
| "Kartu Jabatan" | sebutan internal saat menguraikan dokumen sumber | **Uraian Jabatan** |
| "Fungsi yang melebur ke jabatan ini" | 27 fungsi usulan memang menyatu jadi 11 | **Fungsi yang ditangani jabatan ini** |
| kolom "KARTU" | nomor kartu pada dokumen asal | **NOMOR** |
| "FUNGSI PADA USULAN V0.9" | nomor draf penyusun | **FUNGSI PADA RANCANGAN AWAL** |
| "Mata 1 · Diminta lawan ditulis" | singkatan "mata rantai"; "lawan" = versus | **Mata rantai 1 · Yang diminta dibanding yang ditulis** |
| "settlement pada baris dua belas" | nomor baris di data penyusun | **settlement** (bagannya tidak menomori baris) |

**Jebakan yang sudah terjadi:** penggantian pertama berhenti di judul dan nama berkas; kepala
kolom di dalam tabel terlewat, dan operator harus menunjuknya untuk kedua kalinya. Lihat §11.

### 1b. Kiasan yang lahir saat menulis — bentukan sendiri, bukan istilah siapa pun

Kelas di atas soal istilah yang memang ada tetapi asing bagi pembaca. Yang ini lebih halus dan
lebih sering lolos: **kata yang bukan istilah siapa pun, lahir begitu saja saat menulis.** Ia
terasa tepat bagi penulisnya justru karena ia sudah tahu apa yang dimaksudkannya sebelum
menuliskannya. Pembaca tidak punya keuntungan itu.

Enam koreksi operator dalam satu sesi (KLIEN A, 1 Sep 2026), dan empat di antaranya kelas ini:

| Ditulis | Kenapa gagal | Ganti |
|---|---|---|
| "wadahnya belum dapat diisi" | "wadah" bukan istilah siapa pun; maksudnya menu Komponen Distribusi di Back Panel | **"komponennya belum dapat didaftarkan di sistem"** |
| "sistemnya belum menegakkan" | kata kerja dipaksakan; sistem tidak menegakkan, ia menerapkan | **"belum diterapkan di sistem"** |
| "pihak yang kebetulan menerima sisanya" | kabur; operator bertanya balik "maksudnya bagaimana?" | mekanismenya ditulis: potongan terambil lebih dulu, sisanya dibagi menurut delapan komponen |
| "tidak ada kewajiban menyatakan sinyalnya diterima" | berbelit; harus dibaca dua kali | **"tidak ada tanda bahwa sinyalnya sudah dibaca petugas"** |

**Uji sebelum kalimat keluar.** Kalau sebuah kata dipakai sebagai kiasan, tanyakan: **benda atau
tindakan sebenarnya apa?** Lalu tulis itu. "Wadah" menjadi "menu Komponen Distribusi".
"Menegakkan" menjadi "menerapkan". "Jembatan" menjadi "sambungan antara A dan B".

Kiasan menghemat kata bagi penulis dan menambah kerja bagi pembaca. Pertukaran itu hampir selalu
merugi pada dokumen yang dipakai bekerja.

**Sapuan pemeriksanya** — kata yang paling sering menjadi kiasan tanpa disadari:

```bash
grep -noE '.{0,50}(wadah|jembatan|payung|pintu masuk|tulang punggung|jantung|nadi|dipagari|menegakkan|penegak)\w*.{0,50}' <berkas>
```

Yang muncul belum tentu salah — "pintu masuk" pada alur pendaftaran bisa tepat. Yang ditanyakan
selalu sama: apakah pembaca tahu benda sebenarnya tanpa bertanya.

---

## 2. Jangan tempatkan SEO Boost sebagai pihak yang berwenang

**Nada menuntut bukti.** Kelas yang paling mudah lolos, sebab kalimatnya terdengar cermat.
Nyata (KLIEN A, 1 Sep 2026): baris temuan ditulis *"dilaporkan sudah diperbaiki, buktinya belum
diterima"*, dan operator mengoreksinya — "jangan terlalu menekan minta bukti seperti ini, kan sudah
masuk ke konvensi agar SEO Boost tidak seolah-olah terlihat arogan dikit-dikit minta bukti."

SEO Boost mendampingi; ia tidak mengaudit vendor atas nama siapa pun. "Bukti belum diterima" berbunyi
seperti pemeriksa yang menunggu setoran. Yang dimaksudkan sebenarnya cuma: kami belum melihatnya.

| Nada memeriksa | Nada mendampingi |
|---|---|
| "buktinya belum diterima" | "menunggu dipastikan pada demo berikutnya" |
| "belum ada konfirmasi tertulis" | "belum kami lihat sendiri" |
| "wajib dilampirkan sebelum ditutup" | "akan tertutup begitu terlihat di layar" |

Yang berubah hanya siapa yang menunggu: bukan pihak lain yang berutang bukti, melainkan kami
yang belum menyaksikan.


SEO Boost tim pendamping. Yang berhak menuntut, memeriksa, dan menyetujui adalah pemilik pekerjaan.

| Ditulis | Terbacanya | Ganti |
|---|---|---|
| "belum diperagakan **kepada SEO Boost**" | SEO Boost berwenang menuntut peragaan, seperti klien | "belum pernah diperagakan **pada sesi mana pun**" |
| "diperiksa SEO Boost" | SEO Boost pemeriksa resmi | "diperiksa" / sebut pemeriksa sebenarnya |
| "usulan SEO Boost" berulang di dokumen keluar | SEO Boost mengajukan, klien menyetujui | cukup sekali sebagai penanda status |

**Yang tetap boleh**, sebab menempatkan SEO Boost sebagai pihak yang **menahan diri**, bukan menuntut:

- "SEO Boost belum mengubah FIN-20 sampai itu ditegaskan"
- "SEO Boost tidak memiliki kepentingan komersial atas pilihan vendor"

Perbedaannya satu: apakah kalimatnya memberi SEO Boost **hak**, atau menyatakan SEO Boost **menunggu**.

**Dua turunan yang sama wajibnya:**

**Jangan pernah tulis "klien" pada teks yang diserahkan — sebut nama pihaknya.** "Klien"
menyebut hubungan dagang, bukan orangnya; pemilik usaha yang membacanya merasa jadi nomor
berkas. Tulis "Klien A", "narahubung klien", "tim KLIEN A".

**Jangan menggurui.** Rekomendasi boleh — itu pekerjaan pendamping. Perintah dan penilaian
tidak:

| Ditulis | Terbacanya | Ganti |
|---|---|---|
| "Bapak perlu segera menindaklanjuti..." | SEO Boost menyuruh pemilik usaha | "Langkah berikutnya menunggu keputusan Bapak mengenai..." |
| "Seharusnya tim internal sudah menyiapkan..." | SEO Boost menilai kinerja klien | sebut faktanya tanpa penilaian: "Berkas X belum kami terima" |

---

## 3. Terjemahan mentah dan jargon paksa

Dua arah, dua-duanya salah.

**Inggris dipaksa jadi Indonesia** sampai pembaca berhenti:

| Ditulis | Ganti | Sebab |
|---|---|---|
| kode respons cepat | **QRIS** | terjemahan harfiah "QR code" |
| peladen | **server** | tidak dipakai siapa pun di bidangnya |
| antarmuka program | **API** | sama |
| pemeriksaan tangan | **pemeriksaan manual** | kalke "hand inspection" |
| emisi suara | **kebisingan** | istilah uji berkala yang sebenarnya |

**Bentukan yang tidak dipakai siapa pun.** Awalan *ber-* mudah dipakai berlebihan sampai
melahirkan kata yang terdengar resmi tetapi tidak pernah didengar pembacanya:

| Ditulis | Persoalannya | Ganti |
|---|---|---|
| "kewenangan menyetujuinya belum **berpemilik**" | kewenangan tidak punya *pemilik*, ia punya *pemegang* | "belum jelas siapa yang berwenang menyetujui" |
| "satu GAP dapat **berpemilik** lebih dari satu" | sama | "dapat **ditanggung** lebih dari satu pihak" |
| "seluruhnya berotorisasi dua orang dan **berberita acara**" | bentukan karangan | "dan **disertai** berita acara" |
| "pemberitahuan yang tidak **menunaikan apa pun**" | menunaikan butuh objek: kewajiban | "belum **memenuhi kewajibannya**" |
| "dashboard memperluas **lingkaran akses**" | kiasan yang menyembunyikan pokoknya | "memperluas **siapa saja yang dapat melihat data**" |

**Ujinya:** apakah kata itu pernah kamu dengar diucapkan orang di rapat? Bila tidak, ia
bentukan sendiri.

**Inggris dibiarkan padahal ada kata kerjanya:**

| Ditulis | Ganti |
|---|---|
| "Klien A tidak mengubah, Klien A **request**" | Klien A **meminta** |
| "kontrol ganda" | **dua otorisasi** — istilah rumah yang sudah dipakai FIN-17 |

**Aturan pemilihnya:** pakai kata yang dipakai orang di rapat. Bila seluruh berkas dan
percakapan klien menyebut *settlement*, *wallet*, *stakeholder*, *GAP*, *threshold*,
*faremeter*, *payment gateway*, *disbursement*, *MDT*, *argometer* — pertahankan. Menerjemahkannya
membuat dokumen terbaca seperti ditulis orang luar. Berlaku juga di chat: *deploy*, *endpoint*,
*commit*, *database* tetap Inggris bila itu kata kerja industrinya; yang wajib Indonesia
adalah kalimat di sekelilingnya.

---

**Sapuan mekanis untuk §3.** Aturan di atas sudah ada sejak awal, tetapi §3 satu-satunya kelas
tanpa grep, dan itu terbukti tidak cukup: pada satu proposal (30 Agu 2026) tiga kata karangan lolos
berturut-turut sampai dikoreksi operator satu per satu, yaitu "imbalan jasa" untuk *management fee*,
"berselubung" untuk *cover*, dan "berspesifikasi warna". Pembacaan ulang oleh penulis yang sama akan
selalu meloloskan kata yang ia sendiri karang. Jalankan dua arah:

```bash
# arah 1: bentukan sendiri yang tidak lazim
python3 - "$berkas" <<'EOF'
import re, sys, html
t = html.unescape(re.sub(r'<[^>]+>', ' ', open(sys.argv[1], encoding='utf-8').read()))
for w in sorted(set(re.findall(r'\b(?:ber|memper|ter)[a-z]{4,}\b', t))):
    print(w)
EOF
# baca daftarnya: kata yang tidak pernah kamu dengar diucapkan di rapat adalah karanganmu

# arah 2: istilah rumah yang terlanjur diterjemahkan
grep -oiE 'management fee|settlement|cover|stakeholder|deploy|endpoint' <log-komunikasi-klien>
# istilah yang dipakai klien di log WAJIB dipakai apa adanya di dokumen
```

**Bandingkan daftar istilah dokumen dengan istilah yang benar-benar dipakai klien di log komunikasi.**
Log itu bukti apa yang mereka ucapkan; dokumen yang memakai kata lain terbaca seperti ditulis orang luar.

**Sebutan yang sudah dipakai klien tidak diganti atas pertimbangan kerapian.** Pada proposal yang sama,
dua tingkatan paket yang sejak awal disebut "Paket A" dan "Paket B" sempat diubah menjadi "Pilihan 1"
dan "Pilihan 2", dengan alasan Paket A justru lebih mahal sehingga penamaannya terbalik. Kekhawatiran
itu sah, tetapi jalan keluarnya **menambah keterangan di sebelah sebutan**, bukan mengganti sebutannya.
Klien sudah memakai A dan B selama seminggu di grup; dokumen yang memakai sebutan lain memaksa mereka
menerjemahkan sendiri saat memeriksa. Penggantian sebutan hanya atas permintaan klien.

---

## 4. Kata yang punya dua arti berlawanan

Yang paling berbahaya, sebab pembaca tidak merasa salah baca.

| Kata | Dua arti | Contoh nyata |
|---|---|---|
| **melewati** | melalui / melangkahi | "membuka jalan masuk yang melewati verifikasi" → dibaca *bypass*. Diganti "tidak melalui verifikasi". **Tetapi** "perubahan tarif melewati verifikasi Dishub" berarti *melalui* dan benar — jangan diganti buta |
| **menurunkan** | memerinci / mengurangi | "prosedur asal menurunkan pemeriksaan mesin bakar" → dibaca *menurunkan standar*. Diganti **memerinci** |
| **pemadam** | alat / petugas | "bukan pemadam biasa" → dibaca *bukan petugas biasa*. Diganti **alat pemadam biasa** |
| **antar** | kata depan / mengantar | "antar unit ke bengkel" → dibaca *antar-unit*. Diganti **pengantaran unit** |
| **tertutup** | ditutupi / terjamin | "larangan itu tertutup oleh struktur" → diganti **terjamin oleh struktur** |
| **dibenarkan** | dikonfirmasi / diperbolehkan | **JANGAN diganti** bila dipakai sebagai istilah status proyek. Lihat §5 |

**Cara memeriksanya:** baca kalimatnya dengan arti yang SALAH lebih dulu. Bila masih masuk akal,
pembaca akan sampai ke sana juga.

---

## 4b. Angka dan frasa yang tidak membawa jangkarnya

Kelas yang dekat dengan §4, tetapi bukan kata bermakna ganda. Katanya cuma satu arti; yang
hilang **acuan yang dibutuhkan pembaca untuk menempatkannya**. Penulis punya acuan itu di
kepalanya, jadi kalimatnya terasa lengkap baginya.

Dua kejadian dalam satu sesi, keduanya membuat operator harus bertanya balik, Klien B 1 September 2026.

| Ditulis | Terbacanya | Yang hilang | Ganti |
|---|---|---|---|
| "Untuk surat keterangan **11 pengamat**" | pengamatnya ada 11 | pembilangnya, padahal pengamatnya 45 | "**Dari 45 pengamat, 11** yang suratnya belum masuk" |
| "urusan server **tutup sampai 7 September**" | servernya dimatikan | apa yang tutup | "**tidak ada yang perlu dikerjakan di server** sampai 7 September" |

Keduanya lolos tata bahasa dan lolos `periksa.py`. Yang menangkapnya cuma pembaca yang tidak
punya isi kepala penulisnya.

**Dua uji, murah dan mekanis:**

1. **Tiap angka yang berdiri sendiri: pembilangnya mana?** Angka yang menyebut bagian dari
   sesuatu wajib menyebut keseluruhannya di kalimat yang sama. "11 pengamat" salah, "11 dari 45
   pengamat" benar. Berlaku juga untuk angka yang membandingkan diam-diam: "turun jadi 1,43 MB"
   menuntut "dari 9,72 MB".

2. **Tiap kata berstatus, apa subjeknya?** *Tutup, selesai, aman, jalan, mati* menerangkan
   sesuatu, dan yang diterangkan wajib disebut. "Urusan server tutup" tidak menyebut apakah yang
   tutup pekerjaannya, layanannya, atau aksesnya.

**Kenapa ini penting justru di balasan chat.** Di dokumen, kalimat sebelumnya biasanya sudah
memasang jangkarnya. Di chat, tiap pesan dibaca berdiri sendiri, sering di ponsel, sering
berjam-jam sesudah pesan sebelumnya. Jangkar yang "sudah disebut di atas" tidak ikut terbaca.

## 5. Klaim yang tidak punya pijakan

Yang paling merusak kepercayaan, dan paling sulit dilihat penulisnya sendiri.

**Ringkasan yang kamu susun sendiri BUKAN sumber.** Kekeliruan nyata: catatan kerja menulis
"Supervisor: Operational Manager". Berkas jawaban klien tidak pernah mengatakan itu — bunyinya
"4 nama agent bergantian tiap shift, 1 sebagai supervisor". Ringkasan itu menjadi rujukan tiga
belas pemeriksa sekaligus, lalu masuk ke lima dokumen. Angkanya ikut rusak: tabel memuat "4 Agent"
DAN "1 Supervisor" — berjumlah lima, padahal seluruhnya empat.

**Dugaan ditulis sebagai keadaan:**

| Ditulis | Persoalannya | Ganti |
|---|---|---|
| "Tiket CRM **lazimnya memuat** identitas dan nomor telepon" | isi tiketnya belum pernah dilihat | "Isi tiketnya belum kami lihat. **Bila** memuat…" |
| glosarium: jeda settlement "**biasanya** satu sampai beberapa hari" | dokumen kami sendiri menyatakan jedanya tidak tercantum di berkas mana pun | "Jedanya **belum tercantum** dan masih ditanyakan" |
| "sebab **biasanya** menyangkut regulasi" | itu kata klien, ditulis tanpa pemilik | "**menurut Klien A sendiri**, sebabnya…" |

**Kepastian yang melebihi dasarnya.** Pernah nyaris terjadi: mengganti "dibenarkan atas nama
KLIEN A" menjadi "terdaftar". Dasarnya jawaban lisan — *"Betul atas nama KLIEN A"* — bukan
pemeriksaan berkas pendaftaran. "Terdaftar" menaikkan derajat klaim. Ditolak.

**Sapuan mekanis yang terbukti paling murah:** `grep` sepuluh kata berhedge — *umumnya,
biasanya, lazimnya, diperkirakan, seharusnya, idealnya, cenderung* — lalu baca tiap temuan
di konteksnya. Di KLIEN A, satu detik grep menemukan tiga kalimat karangan nyata yang
sapuan berbiaya jutaan token lewatkan.

**Cara memeriksa sebelum menulis:** cari dasarnya di catatan keputusan, berkas klien, atau
data terhitung. Bila tidak ketemu, tulis ketidaktahuannya — itu selalu boleh, dan lebih berguna.

---

## 5b. Angka milik satu penyedia ditulis sebagai angka umum

Angka yang berasal dari satu penyedia, ditulis tanpa menyebut penyedianya, membaca seperti hukum
alam. Pembaca tidak tahu ia akan berubah bila penyedianya berganti, sehingga tidak ada yang
menandainya sebagai risiko saat penyedia itu sedang dibahas.

Kejadian yang membukanya (KLIEN A, 1 Sep 2026): dokumen menulis **"Biaya QRIS 0,777 persen"**.
Operator bertanya, *"ini QRIS dari Xendit kan maksudnya?"* Betul — 0,7 persen tarif Xendit
ditambah PPN 11 persen atas potongan itu. Dan Xendit sendiri sedang ditimbang ulang terhadap QRIS
bank, sehingga angkanya belum tentu bertahan. Sapuan yang mengikutinya menemukan dua lagi di kelas
yang sama: biaya penarikan Rp 5.550 dan jeda pencairan T+1 sampai T+3, dua-duanya milik Xendit.

| Salah | Benar |
|---|---|
| Biaya QRIS 0,777 persen | Potongan QRIS lewat Xendit 0,777 persen |
| Jeda pencairan T+1 sampai T+3 | Jeda pencairan T+1 sampai T+3 menurut ketentuan umum Xendit |
| Biaya penarikan Rp 5.550 | Biaya penarikan Rp 5.550, tarif Xendit |

**Aturannya.** Setiap angka yang berasal dari satu penyedia ditulis dengan menyebut penyedianya.
Bila status penyedia itu sedang terbuka, ketergantungannya disebut **di kalimat yang sama**, bukan
di catatan kaki.

**Sapuan pemeriksanya**, dijalankan atas dokumen keluar:

```bash
# angka dan ketentuan yang mungkin milik satu penyedia
grep -noE '.{0,40}(QRIS|payment gateway|gerbang pembayaran|T\+[0-9]|Virtual Account).{0,40}' <berkas> \
  | grep -viE 'Xendit|nama penyedia lain yang dipakai'
```

Yang tersisa sesudah saringan itu adalah kalimat yang menyebut kategori padahal memaksudkan satu
penyedia tertentu.

**Kelas yang berdekatan:** angka yang tidak dapat dilacak ke sumbernya sama sekali. Lihat butir 5
tentang klaim tanpa pijakan, dan `seoboost-verification-instruments` bagian gerbang dokumen.

## 6. Tic retoris dan pola khas mesin

Gaya berulang membuat dokumen terdengar berpola, bukan menerangkan. Diukur pada satu paket
KLIEN A:

```
bukan X, melainkan Y    29 kali
sekaligus               45
persis                  37
justru                  35
Yang belum / Yang tersisa  50
```

Kalimat-kalimatnya sendiri benar. Yang salah **kepadatannya** — pembaca merasa sedang dibujuk,
bukan diberi tahu. **Jangan sapu semuanya.** Ganti hanya bila kalimat dapat dipendekkan tanpa
kehilangan isi. "Bukan X melainkan Y" sering justru bentuk paling padat untuk mengoreksi
dugaan pembaca.

**Berapa dari temuan sapuan yang benar-benar tic — angkanya, supaya harapannya benar.** Sapuan
kedua atas paket KLIEN A (1 September 2026) menemukan **103** kemunculan "bukan X melainkan Y".
Sesudah tiap satu dibaca di konteksnya, yang benar-benar kontras kosong hanya **3**. Sisanya
mengoreksi dugaan yang memang akan dibuat pembaca, dan salah satunya justru dikutip skill ini
sendiri sebagai bentuk terpadat yang tidak boleh disentuh ("bukan hanya total, melainkan setiap
komponen" pada FIN-01).

**Ujinya satu kalimat: apakah X itu dugaan yang benar-benar akan dibuat pembaca?**

| Kosong — X tidak pernah terpikir pembaca | Nyata — X memang dugaan pertama pembaca |
|---|---|
| "kebocorannya bukan sekadar persoalan kerapian" | "Yang tertahan bukan aturannya, melainkan alat untuk menjalankannya" |
| "usulannya, bukan sekadar daftar pertanyaan" | "Bukan cacat, melainkan tanda sistemnya dibangun untuk model operasi lain" |
| "BUTIR DAFTAR PERIKSA, bukan sekadar catatan" | "Bukan sanksi, melainkan syarat yang tidak lagi terpenuhi" |

Kolom kiri memakai kontras untuk menaikkan derajat, dan dua di antaranya menempatkan SEO Boost memuji
hasil kerjanya sendiri (§2). Kolom kanan mencegah salah baca yang nyata.

**Kepadatan diukur di PDF terbitan, bukan di berkas sumber.** Pada paket yang sama: median
**0,76 per 1000 kata**, tertinggi 2,54. Di bawah kira-kira 2 per 1000 kata, kepadatannya bukan
persoalan; yang tersisa hanya kontras kosong satu per satu. Menyapu seluruh 103 berarti merusak
seratus kalimat untuk memperbaiki tiga.

**Angka kepadatan itu berlaku untuk satu konstruksi saja, bukan untuk seluruh daftar.** Dua
aturan berbeda hidup berdampingan di bagian ini, dan membacanya sebagai satu aturan membuat
salah satunya lumpuh:

| | Diatur kepadatan | Nol toleransi |
|---|---|---|
| Yang termasuk | Konstruksi kontras "bukan X, melainkan Y" dan variannya | Pembuka dan transisi hafalan: "Penting/Perlu untuk dicatat", "Tidak dapat dipungkiri", "Dalam era", "Hal ini menunjukkan …", kata kerja pameran |
| Alasannya | Kontras bisa sah — 103 temuan, 3 yang benar-benar kosong | Tidak punya pemakaian sah; kalimatnya selalu utuh tanpa mereka |
| Cara memutus | Baca satu per satu di konteksnya; di bawah ~2 per 1000 kata jangan menyapu massal | Buang semuanya, tanpa membaca konteks |
| Penegaknya | Mata manusia | `ci/check-ai-patterns.mjs` + butir "Nol filler dari daftar §6" pada daftar periksa penyerahan |

Yang keliru dilakukan: memakai ambang 2 per 1000 kata untuk membiarkan satu "Perlu dicatat
bahwa" tetap berdiri karena "kepadatannya masih rendah". Ambang itu tidak pernah berlaku
untuk kolom kanan.

**Daftar buru-dan-ganti.** Arahan operator, 29 Agu 2026: pola bahasa AI harus lenyap dari
dokumen resmi, formal, maupun balasan chat; hasilnya harus senatural tulisan manusia,
bagaimanapun caranya. Daftar ini berlaku pada semua keluaran, termasuk balasan chat dan draf WA.
Cari tiap pola, baca di konteksnya, ganti dengan kalimat lurus:

| Pola | Ditulis | Ganti |
|---|---|---|
| Kontras semu | "Ini bukan sekadar dashboard; ini cara baru melihat operasi" | "Dashboard ini menampilkan posisi kas per hari" — tulis fungsinya |
| Varian kontras semu | "bukan hanya mempercepat, tetapi juga menyederhanakan" | "memangkas proses input dari lima langkah menjadi dua" — kontras hanya bila kontrasnya nyata |
| Tiga serangkai sifat | "cepat, aman, dan terukur" | "waktu proses turun dari 40 menit menjadi 6 menit" — satu klaim, ada dasarnya |
| Pembuka formula | "Perlu diingat bahwa jadwal UAT bergantung pada kesiapan data" | "Jadwal UAT bergantung pada kesiapan data" |
| Penutup formula | "Sebagai kesimpulan, …" / "Singkatnya, …" / "Semoga membantu" | buang; akhiri pada fakta atau langkah berikutnya |
| Kata kerja pameran | "Temuan ini **menegaskan** pentingnya backup" | "Backup harian belum berjalan sejak 12 Agustus" — fakta baru, bukan penilaian atas kalimat sebelumnya |
| Pertanyaan retoris transisi | "Lalu, bagaimana dengan keamanannya?" | subjudul atau kalimat berita: "Keamanan: …" |
| Paralelisme bullet berlebihan | lima butir berturut-turut diawali "Meningkatkan… / Memastikan… / Mengoptimalkan…" | tiap butir menyebut hal konkret; bentuk kalimatnya boleh berbeda |
| Hedging bertumpuk | "Mungkin sebaiknya kita bisa mempertimbangkan untuk menunda" | "Saya sarankan menunda ke 5 September, sebab data X belum masuk" — satu penanda ragu cukup |
| Kalimat kosmetik | "Hal ini tentu sangat menarik untuk dicermati" | buang seluruh kalimatnya |
| Pembuka "Perlu dicatat bahwa" | "Perlu dicatat bahwa komponen waktu justru cocok" | "Komponen waktu justru cocok" — buang pembukanya, kalimatnya sudah utuh |
| Transisi "Hal ini …" | "Tarifnya konsisten. **Hal ini menunjukkan** mesinnya bertahan" | "Tarifnya konsisten, jadi mesinnya bertahan" — gabung, jangan beri kalimat kedua tugas menilai kalimat pertama |

**Sapuan grep termurah** untuk pola yang bisa digrep. Temuannya kandidat, bukan vonis:
"melainkan" pada kontras yang nyata justru dipertahankan.

```bash
grep -nE 'bukan (hanya|sekadar|cuma)|melainkan|tetapi juga' <berkas>
grep -nE '[Pp]enting untuk dicatat|[Pp]erlu (diingat|dicatat) bahwa|[Tt]idak dapat dipungkiri|[Ss]ebagai kesimpulan|Semoga membantu|[Dd]alam era' <berkas>
grep -nE 'Hal ini (menunjukkan|menutup|menjelaskan|menambah|berkaitan|berpotensi|menjadi|membuat)' <berkas>
grep -nE 'menegaskan|menggarisbawahi|menyoroti|mencerminkan' <berkas>
grep -nE '[Mm]ungkin.{0,40}(sebaiknya|bisa|dapat dipertimbangkan)' <berkas>
```

Pertanyaan retoris dan paralelisme bullet tidak tergrep; keduanya hanya tertangkap
dengan membaca ulang keluaran sendiri.

**Yang tidak boleh ada sama sekali** — filler yang menampilkan keseriusan tanpa membawa
informasi. Pada paket KLIEN A hitungannya nol, dan harus tetap nol:

> krusial · holistik · komprehensif · robust · optimal · penting untuk dicatat ·
> pada dasarnya · perlu digarisbawahi · dalam rangka untuk · secara signifikan ·
> tidak dapat dipungkiri · seiring berjalannya waktu · dalam konteks ini

"Secara signifikan" tanpa pembanding tidak menerangkan apa pun. Beri pembandingnya, atau buang
keterangannya.

---

### 6b. Pemborosan kata: satu gagasan ditulis dua kali

Kelas ini lolos dari §6 karena kalimatnya tidak terdengar seperti mesin. Ia terdengar
seperti bahasa Indonesia yang sedang berusaha sopan, dan itulah yang membuatnya luput.

**Ujinya satu dan mekanis:** buang kata yang dicurigai. Kalau arti kalimatnya tetap utuh,
kata itu memang mubazir. Rumusan ini dari Keraf, *Diksi dan Gaya Bahasa* (2000:133),
dibakukan Permendiknas 46/2009:106.

| Bentuk | Ditulis | Ganti |
|---|---|---|
| Dua kata bersinonim | "amat sangat", "sejak dari", "sangat besar sekali", "agar supaya" | pilih salah satu |
| Jamak dinyatakan dua kali | "para peserta-peserta", "beragam jenis-jenis", "saling tolong-menolong" | satu penanda jamak |
| Keterangan pada kata yang sudah memuatnya | "maju ke depan", "menepi ke pinggir", "kambuh kembali" | buang keterangannya |
| Isi akronim diulang di luar akronim | "Kepala sekolah SMAN 1", "klub sepak bola Sriwijaya FC" | buang kata yang sudah masuk akronim |
| Hipernim diulang pada tiap hiponim | "bunga anggrek, bunga melati, bunga mawar" | sebut hipernimnya sekali di depan |

**Bentuk keempat punya jebakannya sendiri di project SEO Boost.** Program B adalah Program B,
jadi "seluruh lomba Program B" secara harfiah berbunyi "seluruh lomba Program B".
Bentuknya sama persis dengan contoh "klub sepak bola ... FC" pada Keraf. Tetapi Program B sudah
berfungsi sebagai nama seri di mata Klien B, dan "seluruh Program B" belum tentu lebih terbaca.
Keputusannya milik manusia, bukan pekerjaan linter. Delapan kemunculan tercatat di
ProjectDocs Klien B per 2 September 2026 dan sengaja dibiarkan.

**Yang sudah ditegakkan mesin.** Sepuluh rule berawalan `pleonasme-` di
`ci/check-ai-patterns.mjs` menangkap contoh yang paling sering muncul dari tiga bentuk
pertama. Bentuk keempat dan kelima tidak ditegakkan, sebab keduanya menuntut pengetahuan
tentang isi akronim dan hubungan hipernim yang tidak dimiliki regex. Keduanya dibaca manusia.

### 6c. Ejaan yang menyamar jadi soal gaya

"di mana" selalu ditulis terpisah. Bentuk serangkainya tidak pernah benar, apa pun fungsinya
dalam kalimat. Aturan fungsinya sebagai kata hubung sudah lama ada di
`seoboost-tulis-indonesia`, tetapi sampai 2 September 2026 tidak ada yang menegakkannya, dan
empat pelanggaran bertahan di dokumen Klien B selama berbulan-bulan.

Pelajarannya melampaui satu kata: **aturan tanpa penegak akan luntur.** Sejak 2 September
2026 rule `dimana-serangkai` berjalan juga di ProjectDocs, tempat dokumen klien berada.

**Kutipan literal tidak pernah disunting.** Pemeriksa meloloskan seluruh baris yang diawali
`>`, sebab konvensi log keputusan dan log komunikasi mewajibkan kutipan klien ditulis apa
adanya, lengkap dengan kekeliruannya. Kalau klien menulis bentuk serangkai itu, biarkan.

---

## 7. Tanda pisah panjang: tanda paling khas tulisan mesin

operator mengenalinya seketika: *"kenapa masih ada em dash yang looks AI banget?"*

Ia benar. Pada satu paket KLIEN A ada **989 tanda pisah panjang**, **313 di dalam prosa
mengalir** — hampir semuanya menempelkan penjelasan di ekor kalimat. Itu kebiasaan penulisnya,
bukan kebutuhan bahasa Indonesia.

**Pilih penggantinya menurut tata bahasanya, bukan seragam:**

| Yang menyusul | Ganti dengan |
|---|---|
| konjungsi: dan, tetapi, sehingga, sebab, jadi, bukan, sedangkan | **koma** |
| rincian atau daftar | **titik dua** |
| klausa setara yang erat | **titik koma** |
| kalimat penuh | **titik**, huruf berikutnya kapital |
| sisipan yang dapat dibuang | **kurung** |

**Yang TETAP memakai tanda pisah, dan jangan disentuh:** label klasifikasi ("RAHASIA —
terbatas para pihak"), sel tabel, judul dan label pendek ("Bagian 4.1.6 — Analis Pembiayaan"),
kutipan literal klien. Di situ ia pemisah, bukan jeda dramatis.

**Batasnya:** di dalam prosa mengalir, **paling banyak satu tanda pisah per paragraf; nol lebih
baik**. Bila sebuah paragraf butuh dua, paragrafnya yang perlu dipecah.

**Cari tiga bentuk penulisannya sekaligus, bukan satu** — karakter langsung, entitas bernama,
entitas bernomor; ketiganya tercetak sama:

```bash
for b in '—' '&mdash;' '&#8212;' '–' '&ndash;'; do
  printf '%-10s %s\n' "$b" "$(grep -o "$b" *.mjs *.html | wc -l)"
done
```

Sapuan pertama saya hanya mencari karakter langsung dan melaporkan selesai; sepuluh kemunculan
lolos sebagai `&mdash;`, tujuh di antaranya prosa yang dibaca klien. **Nol pada satu bentuk
adalah temuan, bukan alasan berhenti mencari.**

Dua jebakan build: **jangan menyunting jangkar pencarian** (yang boleh dirapikan hanya
potongan pengganti; merapikan potongan yang dicari mematahkan build), dan **periksa hasilnya
di PDF terbitan** — berkas sumber bersih tidak membuktikan apa pun bila naskah asal atau
kerangka dokumen masih menyumbang tanda pisahnya sendiri.

---

## 8. Judul yang membantah isinya sendiri

Kelas paling memalukan, dan tidak satu pun alat menangkapnya. Judul ditulis pada premis lama,
premisnya berubah, badan paragrafnya diperbarui — judulnya tidak.

Dua yang ditemukan operator pada satu paket:

| Judul | Badannya berkata | Ganti |
|---|---|---|
| "Jaminan berpindah bentuk, **satu batas** belum ada" | butirnya **dua** | "…**dua hal** belum selesai" |
| "Kepentingan dua jenis Driver **tidak sama**" | "keduanya mitra yang mengoperasikan dan **tidak menuju kepemilikan**" — jadi kepentingannya sama | "**Yang berbeda cara memegangnya, bukan kepentingannya**" |

Yang kedua lebih dalam daripada salah kata: judul itu sisa premis lama yang sudah dicabut,
dan frasa lain yang menunjuk balik ke klaim judul ikut kehilangan jangkar.

**Aturannya:** setiap kali premis berubah, **judul dan angka di dalam judul ikut diperiksa**,
bukan hanya badan teksnya. Pemeriksaan mekanisnya ada: judul yang menyebut jumlah dicocokkan
dengan jumlah butir di bawahnya. Bila judul berkata "dua", hitung.

---

**Pertentangan tidak berhenti di pasangan judul dan badan.** Dua bagian berjauhan di berkas yang sama
bisa menyatakan hal berlawanan tentang satu hal, dan keduanya benar secara tata bahasa. Nyata: satu
berkas kerja menulis di bagian 1 bahwa dokumen sumber menggambarkan Paket A, dan di bagian 7.1 bahwa
dokumen yang sama menggambarkan Paket B, lengkap dengan alasan yang membalik pembedanya. Keduanya
ditulis pada sesi yang sama dan bertahan enam hari. Bagian 7.1 itulah yang akan disalin ke dokumen
klien, sehingga isi paket akan tertukar di dokumen yang dibaca pihak luar.

**Aturannya:** sebelum menyalin bagian mana pun dari berkas kerja ke dokumen keluar, cari pernyataan
lain di berkas yang sama tentang hal yang sama, lalu baca keduanya berdampingan. Berkas kerja tumbuh
bertahap, dan bagian yang ditulis pada jam berbeda bisa berpangkal pada premis berbeda.

---

## 9. Tanggal telanjang

Installation Assessment Report dikutip di berkas kami dengan **dua tanggal berbeda** — 11 dan
13 Agustus. Sekilas kontradiksi; sebenarnya keduanya benar: 11 Agustus tanggal laporannya,
13 Agustus tanggal kami menerimanya. Yang salah: tidak satu pun kutipan menyebut yang mana.

**Aturannya:** tanggal yang menyertai sebuah berkas wajib menyebut sifatnya — *tertanggal*,
*diterima*, *disepakati*, *berlaku sejak*. Tanggal telanjang membuat pembaca menebak, dan
membuat pemeriksa berikutnya melaporkan kontradiksi yang tidak ada.

---

## 10. Empat pertanyaan baca ulang

Diadopsi dari `seoboost-tulis-indonesia`. Keempatnya menangkap ambiguitas yang tidak terlihat mesin.

**1. Tiap "ini", "itu", "hal tersebut", "keduanya" — mengacu ke apa persisnya?**
Bila pembaca harus mundur satu kalimat, sebut bendanya.

> Nyata di KLIEN A: "Wallet adalah satu-satunya penutup **selisih** itu" — kata "selisih"
> merujuk dua hal berbeda dalam satu paragraf. Diganti **utang**.

**2. Tiap kalimat pasif — siapa pelakunya?**
"Diputuskan bahwa anggaran dipotong" menyembunyikan pihak yang memutuskan.

> Nyata: "belum diperagakan" — oleh siapa, kepada siapa? Menyebut "kepada SEO Boost" justru salah
> arah (§2). Yang benar melepas penerimanya: "belum pernah diperagakan pada sesi mana pun."

**3. Tiap perbandingan — dibandingkan dengan apa?**
*meningkat, menurun, membaik, lebih hemat* — semuanya menuntut pembanding.

> Nyata: "menyederhanakan pekerjaan **secara signifikan**" tanpa pembanding. Diganti
> "memperkecil cakupan pekerjaannya".

**4. Tiap keterangan waktu — kapan tepatnya?**
"Segera", "dalam waktu dekat", "nanti" berubah makna menurut pembacanya. Pakai tanggal.

---

## 11. Ejaan, penjelasan istilah, dan yang tidak diubah

**Lima ejaan yang paling sering lolos:**

- **merubah** → *mengubah* (kata dasarnya "ubah", bukan "rubah")
- **mempengaruhi** → *memengaruhi*
- **analisa, praktek, resiko, hutang, ijin** → *analisis, praktik, risiko, utang, izin*
- **di** kata depan terpisah (*di rumah*, *di mana*), awalan serangkai (*dibuat*)
- **kerja sama, tanggung jawab, sumber daya** terpisah; **antarmuka, nonaktif** serangkai

**Arah penjelasan istilah:** kata Indonesianya jadi kata utama, istilah asingnya **sekali
saja** dalam kurung miring — "biaya akuisisi pelanggan (*customer acquisition cost*)", bukan
sebaliknya. Sesudah pemunculan pertama, pakai kata Indonesianya saja. Kecuali §3: istilah yang
konvensi klien tahan bentuk Inggrisnya tidak perlu diperkenalkan sama sekali. Pada prosa tulis
**"47 dolar AS"**, bukan "$47"; lambang mata uang tetap wajar di tabel.

**Yang TIDAK pernah diubah:**

1. **Kutipan literal klien** — termasuk salah ketik, huruf besar, dan emoji aslinya. Kutipan
   adalah bukti; merapikannya menghapus jejak ke tulisan tangan orangnya.
2. **Nama resmi pihak luar** — "Kartu Pengawasan" adalah dokumen izin angkutan, bukan sebutan kita.
3. **Istilah yang konvensi klien tahan bentuk Inggrisnya** — lihat `seoboost-formal-docs`.
4. **Riwayat dan tanggal historis** — mengubah baris riwayat membuat dokumen berbohong tentang
   dirinya sendiri.
5. **Angka, kode prosedur, nama jabatan.**

---

## 12. Balasan chat kepada operator

operator menyampaikan 26 Agustus 2026: balasan yang panjang dan padat **susah dicerna**. Ini
aturan tersendiri, bukan catatan tambahan — dan berlaku **sekalipun balasannya satu baris**.

**Jawab dulu, jelaskan sesudahnya.** Kalimat pertama harus berisi jawabannya. Bukan latar,
bukan apa yang sedang dikerjakan, bukan persiapan menuju jawaban.

| Susah dicerna | Lebih baik |
|---|---|
| "Waktu memeriksa hasilnya, ternyata bagian 4.1.6 masih menyuruh membuat akta fidusia — yang justru sudah ditolak Klien A — jadi saya koreksi saat merender." | "Sudah saya perbaiki. Bagian 4.1.6 masih menyuruh membuat akta fidusia, padahal Klien A sudah menolaknya." |
| "Bukan ketiadaan gerbang yang membuatnya luput, melainkan gerbang yang memeriksa hal yang salah." | "Gerbangnya ada, tapi memeriksa hal yang salah." |

**Batas yang dipegang:**

- Satu gagasan satu kalimat. Kalimat panjang berlapis dipecah.
- Tanda pisah panjang (—) paling banyak **satu** per paragraf. Nol lebih baik.
- "Bukan X melainkan Y" paling banyak **satu** per balasan.
- Tabel hanya bila membandingkan tiga baris atau lebih. Dua baris cukup ditulis sebagai kalimat.
- Angka penting ditebalkan. Sisanya jangan.
- Balasan rutin: **di bawah 150 kata**. Laporan besar boleh panjang, tetapi wajib dibuka
  ringkasan tiga baris.
- Jangan mengulang pertanyaannya sebelum menjawab.
- **Nol kalke chat:** "Hal ini penting untuk dicatat bahwa", "pada akhir hari", "bergerak
  maju", "datang dengan", "mengambil tempat", "Ini adalah…" berulang — semuanya kalimat
  Inggris yang diterjemahkan, bukan kalimat Indonesia yang disusun.
- Istilah teknis tetap Inggris bila itu kata kerja industrinya (deploy, endpoint, commit,
  database, framework); kalimat di sekelilingnya tetap Indonesia.

**Uji cepat lima detik sebelum kirim:**

1. Kalimat pertama = jawabannya?
2. Ada kalimat yang bisa dibuang tanpa kehilangan makna?
3. Tanda pisah atau "bukan X melainkan Y" lebih dari satu?
4. Rutin dan di atas 150 kata?
5. Hasilnya akan disalin ke orang lain? → pindah ke §13.

**Yang paling sering saya langgar sendiri:** membangun konteks lebih dulu supaya kesimpulannya
terasa beralasan. Pembaca tidak meminta itu. Ia meminta jawabannya, dan akan bertanya sendiri
bila butuh alasannya.

---

**Kelengkapan angka.** Bila sebuah angka dihitung untuk beberapa kasus, laporkan semuanya, jangan
hanya kasus yang sedang dibahas. Nyata: margin efektif dihitung untuk Paket A dan Paket B, keduanya
tercatat di berkas kerja, tetapi hanya angka Paket A yang ikut ke draf pesan. Koreksi operator datang
dalam satu kalimat, *"paket B bagaimana?"*, dan itu satu putaran tanya jawab yang tidak perlu.

Turunannya: **sebelum menggabung beberapa hal di bawah satu label, periksa apakah keadaannya memang
sama.** "Yang sudah ditunggu: A dan B" ternyata menutupi dua keadaan berbeda, yaitu harga yang sudah
ada tetapi notanya tidak terbaca, dan harga yang belum dihitung sama sekali. Label yang menyatukan
keduanya tidak menjelaskan apa-apa, dan operator harus bertanya balik apa maksudnya.

---

## 13. Draf WA/email = teks yang diserahkan, sekalipun diminta santai

**Setiap teks WhatsApp/email yang operator minta susunkan adalah teks yang diserahkan — termasuk
saat ia cuma bilang "tolong buatkan balasannya" atau "jawab ini gimana".** Ini jalur yang
paling sering terlewat: permintaannya datang di tengah obrolan santai, lalu draf ikut memakai
ragam obrolan padahal teksnya akan ditempel ke grup klien. Begitu keluarannya akan disalin ke
orang lain, ragam obrolan berhenti berlaku — sekalipun percakapan sebelumnya santai, dan
sekalipun penerimanya tim internal.

**Sebelum menyerahkan draf, periksa cepat:** nol kalke · acuan kata ganti jelas · waktu
bertanggal · ejaan baku · tanpa emoji · tidak ada kata "klien" — sebut nama pihaknya.

**Kalau penerimanya belum jelas, tanyakan dulu.** Ragam untuk mitra berbeda dari ragam untuk
tim internal.

---

## 14. Pesan ke klien atau mitra — grup maupun japri

Berlaku penuh: `seoboost-tulis-indonesia` (ragam **pemasaran** untuk sapaan dan kabar, ragam
**konsultan** untuk status dan rekomendasi) plus konvensi penulisan SEO Boost (`seoboost-formal-docs` →
Document language). Rinciannya:

- **Sapaan:** "Salam Sehat Ibu/Bapak <Nama>"; untuk paman/prajuru/krama Bali:
  "Om Swastyastu / Salam Sehat, Pak/Buk …". Indonesia formal, tanpa slang.
- **Tanpa emoji.** Emoji hanya boleh di dalam kutipan literal klien.
- **Jangan terjemahkan istilah yang lazim Inggris** (§3).
- **Jangan pernah tulis "klien" — sebut nama pihaknya** (§2).
- **Tidak ada kalimat kosmetik**, dan SEO Boost bukan pihak yang menuntut (§2).
- Draf pesan panjang dilewatkan pemeriksa dulu:

```bash
python3 ~/.claude/skills/seoboost-tulis-indonesia/scripts/periksa.py <berkas> --ragam pemasaran
```

---

## 15. Pemeriksa otomatis untuk dokumen

```bash
python3 ~/.claude/skills/seoboost-tulis-indonesia/scripts/periksa.py <berkas> --ragam konsultan
```

**Dokumen yang dibaca pihak klien WAJIB memakai `--konvensi`** — tanpa flag itu, alatnya
melaporkan *stakeholder*, *settlement*, *GAP*, *threshold* sebagai campur bahasa, padahal
konvensi klien justru mewajibkan bentuk Inggrisnya. **Jangan pakai `--konvensi` pada catatan
internal** — di ProjectDocs ia hanya menghasilkan temuan palsu ke arah sebaliknya.

Temuannya **kandidat, bukan vonis**. Alat menangkap yang mekanis; kelas §1–§9 tidak tertangkap
alat mana pun.

---

## 16. Verifikasi — masuk ke keluaran, bukan berhenti di sumber

Penggantian istilah **wajib** diperiksa pada berkas terbitannya:

```bash
pdftotext keluaran.pdf - | grep -ci "istilah-lama"    # harus 0
```

**Perbaiki SELURUH kemunculan, bukan yang pertama.** Nyata: "pemadam biasa" diperbaiki di satu
tempat, tiga tempat lain dibiarkan; ketahuan hanya karena audit mekanis dijalankan ulang.
Hitung dulu kemunculannya (`grep -c`), perbaiki semuanya, lalu grep ulang sampai kosong.

Dua hal yang sudah menipu di sini:

- **Kepala kolom di dalam tabel terlewat** ketika penggantian berhenti di judul dan nama berkas.
- **`letter-spacing` memecah huruf**, sehingga `grep` persis tidak menemukan teks yang tercetak:
  `M ATA R A N TA I 1`. Periksa dengan `grep -i` dan pola longgar sebelum menyimpulkan hilang.

---

## 17. Cara mengaudit satu paket dokumen

Diturunkan dari audit nyata atas seluruh paket KLIEN A, 26 Agustus 2026.

**Langkah 0 — tentukan korpusnya dari apa yang DIBACA PEMBANGUN, bukan dari akhiran berkas.**
Kekeliruan yang paling mahal dan paling tidak terasa. Di KLIEN A tiga sapuan bahasa berturut-turut
menyaring `build/**/*.mjs`, dan pola itu benar untuk hampir semua dokumen di sana. Dua pembangun
tidak memuat prosanya sama sekali: keduanya membaca `content-pembedahan.html` dan
`content-laporan-mvp.html`. Akibatnya **14.723 kata lolos dari tiga sapuan**, membawa 34 pola
kontras, 25 tic kelas lain, dan 44 tanda pisah panjang di prosa mengalir — padahal sapuan tanda
pisah sebelumnya sudah dilaporkan selesai dengan "148 titik pada 24 berkas".

Cara termurah memastikannya, dan tidak dapat berbohong:

```bash
# hitung polanya di PDF TERBITAN lebih dulu, baru telusuri balik ke sumbernya
for f in <direktori keluaran>/**/*.pdf; do
  printf '%4s  %s\n' "$(pdftotext "$f" - | grep -coE '<pola>')" "$(basename "$f")"
done | sort -rn | head
```

PDF adalah yang dibaca orang. Bila sebuah PDF memuat pola yang tidak ada di berkas sumber yang
kamu sapu, prosanya datang dari tempat lain — cari `readFileSync` di pembangunnya.

**Langkah 1 — keluarkan prosanya.** Ekstrak setiap untai yang dibaca klien ke satu berkas.
Untuk data berstruktur, pakai penelusur generik yang mengambil setiap untai >30 huruf pada
seluruh medan — daftar medan yang ditulis tangan **akan meleset** (di audit SOP, penelusur
generik menemukan 1.927 potongan; daftar tangan menemukan nol). Untuk dokumen jadi, ambil dari
PDF terbitannya (`pdftotext -layout`) — itu yang dibaca orang.

**Langkah 2 — audit pola.** Jalankan kelas §1–§9 sebagai regex atas hasil ekstraksi.

**Langkah 3 — baca tiap temuan di dalam konteksnya.** Ini yang tidak boleh dilewati.

**Hasil nyata, supaya harapannya benar:** dari tiga korpus (179 + 1.927 potongan + 433 ribu
huruf), temuan mentah 75, nyata sesudah dibaca **8**. Audit pola menemukan **kandidat**.
Menerapkannya tanpa membaca berarti merusak tujuh kalimat untuk memperbaiki satu.

**Prosa berkerangka lebih bersih daripada prosa bebas.** SOP nol cacat, bagan enam — bukan
kebetulan. Kerangka tetap (tujuan, lingkup, langkah, kendali) menahan kiasan; catatan pembaca
yang ditulis bebas adalah tempat seluruh metafora pribadi muncul. **Semakin bebas bentuk
sebuah teks, semakin keras ia perlu diperiksa** — catatan pembaca, pengantar, ringkasan
eksekutif; bukan tabel dan daftar langkah.

**Yang tampak cacat tetapi benar — jangan disentuh:**

- **Nama fitur sistem dan kutipan klien.** "Request Withdrawal" pada FSD, "tombol request
  cancel" dari Klien A.
- **Pernyataan tidak-tahu yang jujur.** "Lama proses tidak dapat diperkirakan, karena tidak
  ada standar waktu yang dipublikasikan" bukan hedge — ia menyebut sebab ketidaktahuannya.
- **Kiasan yang justru bentuk terpadat.** "bukan hanya total, melainkan setiap komponen"
  mengoreksi dugaan pembaca dalam enam kata.

---

## 18. Bila memakai sapuan berbantuan mesin

Sapuan paralel berguna untuk menemukan **kelas**, bukan untuk memutuskan. Protokolnya:

1. Penyapu mengusulkan; **penyangkal berlensa berbeda** menguji — makna, pembaca, aturan.
   Tugas penyangkal **membantah**. Ragu berarti tolak.
2. **Baca sendiri yang lolos.** Pada sapuan KLIEN A, 136 usulan → 20 lolos → **18 diterapkan**;
   dua ditolak sendiri sesudah membaca alasan penyangkalnya.
3. **Laporan sapuan wajib dibaca bersama jumlah agen yang benar-benar selesai.** Sapuan kedua
   hari itu mati di tengah jalan — 160 dari 166 agen gagal, nol penyangkal berjalan — dan tetap
   melaporkan `usulan 76 · lolos 0`. "Lolos 0" terbaca seperti *dokumennya bersih*; yang
   sebenarnya: tidak ada yang pernah diuji. **Nol dari kegagalan tidak dapat dibedakan dari
   nol dari pemeriksaan bila yang dibaca hanya ringkasannya.**

---

## Sebelum menyerahkan apa pun

- ☐ Tiap judul, kepala kolom, dan label dibaca seolah baru pertama kali melihat dokumen ini
- ☐ Judul yang menyebut jumlah dicocokkan dengan jumlah butirnya (§8)
- ☐ Tiap kata bermakna ganda dibaca dengan arti yang salah lebih dulu
- ☐ Tiap klaim ditelusuri ke kutipan klien, catatan keputusan, atau angka terhitung
- ☐ Tidak ada kalimat yang memberi SEO Boost wewenang yang tidak dimilikinya; tidak ada kata "klien"
- ☐ Penggantian istilah diperiksa masuk ke PDF terbitannya, bukan berhenti di sumber
- ☐ Nol filler dari daftar §6; tiap tanggal menyebut sifatnya (§9)
- ☐ Sapuan grep pola mesin (§6) dijalankan; tiap temuan dibaca di konteksnya

## Berlaku juga di luar dokumen

Skill ini mengatur **seluruh** keluaran Bahasa Indonesia: balasan chat, laporan status, pesan
WhatsApp, pesan commit, catatan internal. Kebiasaan bahasa tidak menyala dan padam menurut jenis
berkas. Frasa yang lolos di balasan chat akan muncul lagi di dokumen yang dibaca klien.

## Antipola

1. Menyapu istilah dengan ganti-semua tanpa membaca konteks — "melewati verifikasi Dishub"
   berarti *melalui*, dan penggantian buta membalik maknanya
2. Menerapkan usulan mesin tanpa membaca alasan penyangkalnya
3. Membaca "lolos 0" sebagai bersih tanpa memeriksa berapa agen yang selesai
4. Berhenti di berkas sumber tanpa memeriksa keluaran terbitannya
5. Menyunting kutipan klien supaya rapi
6. Mengganti kiasan yang justru bentuk terpadat, hanya karena ia kiasan
7. Menulis draf WA/email dengan ragam obrolan karena permintaannya datang santai (§13)
8. Menulis kata "klien" pada teks yang diserahkan — sebut nama pihaknya

---

*Direvisi 28 Agu 2026 via council review. Direvisi 29 Agu 2026 via council review (wave 2).*
*Direvisi 2 Sep 2026 dari panen KLIEN A (A49): dua tic baru pada §6 ("Perlu dicatat bahwa",
transisi "Hal ini …"), angka kalibrasi 103 temuan menjadi 3 tic nyata, dan Langkah 0 pada §17 —
batas korpus ditentukan dari apa yang dibaca pembangun, bukan dari akhiran berkas.*
*Ditinjau 2 Sep 2026 (sesi seoboost-skill-set): §4b dipindah dari ekor berkas ke tempatnya
setelah §4, mengikuti pola §1b dan §5b; §6 diberi satu paragraf batas antara pola nol-toleransi
dan konstruksi yang diatur kepadatan.*

## 2b. Meminta sesuatu dari klien, tanpa terdengar menetapkan syarat

§2 menutup klaim yang memberi SEO Boost wewenang. Ia **tidak** menutup bentuk yang paling sering
muncul di percakapan sehari-hari: **permintaan**. operator menangkapnya 2 September 2026:

> "jangan seperti itu bahasanya, bilang saja 'yang masih kami tunggu ...'"

Yang ditolak:

> "Bu, boleh minta daftar jurinya dengan bentuk yang sama seperti Program B Bali: nama, kategori
> yang dinilai, lembaga, mode, dan email."

Kalimatnya sopan, ada "boleh minta", dan tetap salah. Ia menaruh SEO Boost pada posisi yang
**menetapkan bentuk** yang harus dipenuhi klien, lalu memerincinya seperti daftar syarat.
Yang meminta jadi terdengar seperti yang berwenang.

Yang benar:

> "Bu, yang masih kami tunggu tinggal daftar jurinya.
> Isinya sama seperti Program B Bali kemarin: nama, kategori yang dinilai, lembaga, mode, email."

Isinya sama persis. Yang berubah **siapa yang sedang menunggu siapa**. Perinciannya tetap
ada, tetapi datang sebagai keterangan, bukan sebagai syarat.

**Ujinya satu pertanyaan:** kalimat ini menggambarkan **keadaan SEO Boost** (kami menunggu, kami
belum bisa lanjut, kami butuh ini untuk mengerjakan itu), atau menggambarkan **kewajiban
klien** (mohon kirimkan, dengan bentuk berikut, harap dilengkapi)? Yang pertama benar.

| Terdengar menetapkan | Terdengar menunggu |
|---|---|
| "Mohon dikirimkan daftar X dengan format berikut" | "Yang masih kami tunggu tinggal daftar X" |
| "Kami memerlukan konfirmasi sebelum lanjut" | "Kami belum lanjut karena masih menunggu konfirmasinya" |
| "Harap dipastikan tidak ada nomor terbit sesudah 13 Agustus" | "Kami ingin memastikan tidak ada nomor terbit sesudah 13 Agustus" |

**Yang tetap boleh menyebut bentuk atau tenggat**, karena menerangkan sebab dan bukan
menuntut: "kami butuh teksnya paling lambat 4 September karena sertifikat dicetak tanggal 5".
Tenggatnya milik pekerjaan, bukan milik SEO Boost.

**Kenapa ini gampang lolos:** permintaan yang sopan terasa sudah cukup rendah hati, jadi tidak
memicu pemeriksaan ulang. Yang menentukan bukan kesopanannya, melainkan siapa yang ditempatkan
sebagai pihak yang berhak.

## 6d. Frasa penyambung yang mengumumkan penjelasan, bukan memberikannya

Ditangkap operator 2 September 2026:

> "ini bahasanya masih aneh 'Itu disengaja: bla bla bla' dan ini tidak straight to the point"

Bentuknya: kalimat pernyataan, lalu **frasa stok**, lalu titik dua, baru isinya. Frasa stoknya
tidak membawa informasi. Ia hanya memberi tahu pembaca bahwa penjelasan akan datang, padahal
titik dua sudah melakukan itu sendiri.

| Ditulis | Ganti |
|---|---|
| "Urutannya mengikuti hari acara, bukan bidang. **Itu disengaja:** kesalahan paling sering muncul di sambungan." | "Urutannya mengikuti hari acara, bukan bidang. Kesalahan paling sering muncul di sambungan." |
| "Kerangka ini untuk rapat teknis, bukan koordinasi. **Bedanya satu:** koordinasi membagi pekerjaan, teknis memastikan..." | "Kerangka ini untuk rapat teknis, bukan koordinasi. Koordinasi membagi pekerjaan. Teknis memastikan..." |

Sekerabatnya, dan semuanya dibuang dengan cara yang sama: **Alasannya satu:** · **Sebabnya
begini:** · **Yang terjadi:** · **Perlu diketahui:** · **Ini bukan kebetulan:** · **Dan itu
disengaja.**

**Ujinya:** buang frasanya, biarkan kalimat berikutnya berdiri sendiri. Kalau maknanya tidak
berkurang, frasanya memang tidak membawa apa-apa. Hampir selalu tidak.

**Yang TETAP boleh**, karena membawa isi dan bukan sekadar mengumumkan:
"Alasannya bukan biaya, melainkan waktu" menyebut dua hal sekaligus. Yang dibuang frasa yang
kosong, bukan frasa yang menerangkan.

**Kenapa mudah lolos:** frasa ini terasa membantu pembaca, seolah menuntun. Yang sebenarnya
terjadi, penulisnya sedang menyiapkan diri sendiri sebelum menyebut intinya.
