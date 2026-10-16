# NetQuest — Media Belajar TKJ + AI Groq

Situs statis (HTML/CSS/JS, tanpa build). Buka lewat server lokal atau hosting statis:

    python3 -m http.server 8000     # lalu buka http://localhost:8000

## Alur guru — dua jenis materi
1. Masuk sebagai guru (demo: `guru` / `guru123`; kode guru untuk daftar baru: `TKJ-GURU` — ganti di `login.html`).
2. **Pengaturan AI** → tempel kunci API Groq (gratis di console.groq.com/keys) → *Tes koneksi*.
3. Pilih salah satu cara membuat materi:
   - **✨ Dibuat dengan AI** (tab *Generator AI*): tempel teks atau unggah `.txt/.md/.docx/.pdf` → *Olah dengan AI*. AI menyusun **materi ringkas** (2–4 bagian) + soal pilihan ganda. Tinjau/edit → *Simpan ke NetQuest*. Ringkasan tampil di atas materi.
   - **✍️ Manual** (tab *Materi*): guru mengisi judul/deskripsi dan **mengunggah berkas DOCX/PDF** (maks. 1,5 MB) atau memberi URL berkas publik — tidak ada kolom konten HTML maupun ringkasan. Siswa menerima berkas guru apa adanya di halaman modul, dengan **ringkasan AI otomatis** di atasnya (dibuat saat materi disimpan; jika belum ada, guru melihat tombol *Buat ringkasan AI* di halaman modul).
4. Siswa melihat label **✨ AI** / **✍️ Manual** di kartu & halaman materi, dan bisa memfilter daftar materi berdasarkan jenisnya. Soal masuk Kuis Kilat (bisa dipilih per materi) lengkap dengan pembahasan.

## Struktur
- `css/style.css` — design system tunggal (token, shell, komponen, game)
- `js/store.js` — data (localStorage), `js/ui.js` — sidebar/topbar/ikon/toast
- `js/ai.js` — Groq: `makeMaterial`, `makeQuestions`, `readFile`, validasi & acak opsi jawaban
- `proxy/groq-worker.js` — contoh proxy Cloudflare Worker (opsional)

## Catatan penting
- **Kunci API** disimpan di browser guru. Aman untuk pemakaian pribadi; untuk sekolah, pakai proxy (`proxy/`) lalu isi *Endpoint*.
- **Data per-browser**: materi/soal tersimpan di localStorage perangkat yang dipakai, sehingga siswa di perangkat lain belum melihatnya. Gunakan *Ekspor/Impor JSON* di Pengaturan AI sebagai jembatan; untuk multi-perangkat sungguhan perlu backend (mis. Supabase/Firebase).
- Login masih sisi-klien (demo), bukan keamanan sungguhan.
- Materi dipotong sesuai *Batas karakter* (default 9.000) agar muat kuota token Groq gratis. Bagi materi panjang per bab.
