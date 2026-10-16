/* NetQuest — ai.js : integrasi Groq untuk mengolah materi guru
   - makeMaterial()  : teks mentah  -> materi terstruktur (JSON -> HTML aman)
   - makeQuestions() : teks mentah  -> soal pilihan ganda + pembahasan
   - readFile()      : .txt .md .csv .json .docx .pdf -> teks
   Kunci API disimpan di browser guru (localStorage). Lihat README untuk opsi proxy. */
const NQAI = (() => {
  const cfg = () => NQStore.aiConfig();

  class AIError extends Error { constructor(msg, code) { super(msg); this.code = code; } }
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- Panggilan API ---------- */
  async function chat(messages, o = {}) {
    const c = cfg();
    const isGroq = c.endpoint.includes('api.groq.com');
    if (!c.key && isGroq) throw new AIError('Kunci API Groq belum diisi. Buka tab Pengaturan AI.', 'nokey');

    let useJson = o.json !== false, tries = 0;
    for (;;) {
      const body = { model: c.model, messages, temperature: o.temperature ?? 0.4, max_tokens: o.max_tokens || 4096 };
      if (useJson) body.response_format = { type: 'json_object' };
      let res;
      try {
        res = await fetch(c.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(c.key ? { Authorization: 'Bearer ' + c.key } : {}) },
          body: JSON.stringify(body),
        });
      } catch (e) {
        throw new AIError('Tidak bisa terhubung ke server AI. Periksa koneksi internet atau alamat endpoint.', 'net');
      }
      if (res.ok) {
        const d = await res.json();
        const t = d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
        if (!t) throw new AIError('AI mengirim jawaban kosong. Coba lagi.', 'empty');
        return t;
      }
      let msg = ''; try { const j = await res.json(); msg = (j.error && j.error.message) || ''; } catch (e) {}
      if (res.status === 401 || res.status === 403) throw new AIError('Kunci API ditolak (' + res.status + '). Periksa kembali kunci di Pengaturan AI.', 'auth');
      if (res.status === 429 && tries < 2) {
        let wait = parseFloat(res.headers.get('retry-after')) || 0;
        const m = /try again in ([\d.]+)(ms|s|m)/i.exec(msg);
        if (!wait && m) wait = m[2] === 'ms' ? m[1] / 1000 : m[2] === 'm' ? m[1] * 60 : +m[1];
        if (wait && wait <= 25) { o.onWait && o.onWait(Math.ceil(wait)); await sleep(wait * 1000 + 400); tries++; continue; }
        throw new AIError('Batas pemakaian Groq tercapai (rate limit). Tunggu sebentar lalu coba lagi, atau pakai model yang lebih ringan.', 'rate');
      }
      if (res.status === 429) throw new AIError('Batas pemakaian Groq tercapai (rate limit). Tunggu beberapa saat.', 'rate');
      if (res.status === 400 && useJson && /json|response_format/i.test(msg)) { useJson = false; continue; }
      if (res.status === 413) throw new AIError('Materi terlalu panjang untuk model ini. Bagi per bab atau perkecil batas karakter.', 'size');
      if (res.status === 404 || (/model/i.test(msg) && /not found|decommission|exist/i.test(msg)))
        throw new AIError('Model "' + c.model + '" tidak tersedia. Pilih model lain di Pengaturan AI.', 'model');
      throw new AIError('Groq error ' + res.status + (msg ? ': ' + msg : ''), 'http');
    }
  }

  function parseJSON(t) {
    t = String(t).replace(/^\uFEFF/, '').trim();
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
    try { return JSON.parse(t); } catch (e) {}
    const a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (e) {} }
    throw new AIError('Jawaban AI tidak berformat JSON yang valid.', 'parse');
  }

  async function chatJSON(messages, o) {
    try { return parseJSON(await chat(messages, o)); }
    catch (e) {
      if (e.code !== 'parse') throw e;
      // coba sekali lagi dengan suhu lebih rendah
      return parseJSON(await chat(messages, { ...o, temperature: 0.1 }));
    }
  }

  /* ---------- Util ---------- */
  const str = x => (x == null ? '' : String(x)).trim();
  const arr = x => (Array.isArray(x) ? x : x ? [x] : []);
  const strs = x => arr(x).map(str).filter(Boolean);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clip = (t, n) => { t = t.replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim(); return t.length > n ? { text: t.slice(0, n), cut: true } : { text: t, cut: false }; };
  /* inline: **tebal** dan `kode` — setelah di-escape, jadi aman dari XSS */
  const inline = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<span class="inline-code">$1</span>');

  /* ---------- 1) Materi terstruktur ---------- */
const MATERI_SYS = `Kamu adalah asisten guru untuk semua mata pelajaran dan jenjang pendidikan. Tugasmu membuat MATERI RINGKAS dari bahan mentah guru: padat, runtut, dan mudah dipahami siswa.
Aturan:
- Tulis dalam Bahasa Indonesia yang jelas dan ramah siswa.
- Dasarkan isi HANYA pada bahan dari guru; jangan menambah fakta baru dan jangan bertentangan dengannya.
- RINGKAS: hanya 2–4 bagian, tiap bagian maksimal 2 paragraf pendek (1–2 kalimat per paragraf) dan maksimal 4 poin. Buang detail yang tidak penting, ambil intinya saja.
- Urutkan dari konsep dasar ke penerapan.
- Gunakan tabel hanya jika ada data perbandingan.
- Gunakan "code" hanya jika bahan memuat kode, rumus, perintah, atau konfigurasi.
- Balas HANYA dengan satu objek JSON valid, tanpa teks lain.`;

  async function makeMaterial(rawText, o = {}) {
    const { text } = clip(rawText, cfg().maxChars);
    const schema = `{
 "title": "judul materi singkat",
 "description": "ringkasan 1 kalimat, maksimal 150 karakter",
 "level": "contoh: Menengah · Fase F",
 "objectives": ["2-3 tujuan pembelajaran singkat, diawali kata kerja"],
 "sections": [
  { "emoji": "1 emoji yang relevan", "heading": "judul bagian",
    "paragraphs": ["1-2 paragraf sangat pendek"],
    "bullets": ["maks 4 poin penting (boleh kosong)"],
    "table": { "headers": ["..."], "rows": [["..."]] },
    "code": "kode/perintah (atau null)",
    "tip": "tips atau analogi singkat (atau null)" }
 ],
 "glossary": [ { "term": "istilah", "definition": "arti singkat" } ],
 "summary": ["3-4 poin ringkasan inti seluruh materi"],
 "task": "satu tugas/latihan singkat untuk siswa"
}`;
    const opts = [
      o.title ? `Judul yang diinginkan guru: "${o.title}".` : 'Tentukan judul yang tepat.',
      o.level ? `Level/kelas: ${o.level}.` : '',
      o.glossary === false ? 'Kosongkan "glossary" ([]).' : 'Sertakan 3-5 istilah kunci di "glossary".',
      o.task === false ? 'Isi "task" dengan string kosong.' : '',
    ].filter(Boolean).join(' ');
    const d = await chatJSON([
      { role: 'system', content: MATERI_SYS },
      { role: 'user', content: `${opts}\n\nGunakan struktur JSON berikut (field "table" dan "code" isi null bila tidak perlu):\n${schema}\n\nMATERI DARI GURU:\n"""\n${text}\n"""` },
    ], { max_tokens: 2500, temperature: 0.3, onWait: o.onWait });
    return normalizeMaterial(d, o);
  }

const SUMMARY_SYS = `Kamu adalah asisten guru untuk semua mata pelajaran.
Buat ringkasan materi yang singkat, akurat, dan mudah dipahami siswa.
Aturan:
- Dasarkan HANYA pada materi yang diberikan.
- Buat 3–5 poin penting, tiap poin satu kalimat pendek.
- Bahasa Indonesia sederhana dan jelas.
- Jangan menambahkan fakta baru.
- Balas HANYA dengan JSON valid.`;

async function makeSummary(rawText, o = {}) {
  const { text } = clip(rawText, cfg().maxChars);
  const d = await chatJSON([
    { role: 'system', content: SUMMARY_SYS },
    {
      role: 'user',
      content: `Buat ringkasan untuk materi "${o.title || 'materi ini'}".
Format:
{"summary":["poin ringkasan 1","poin ringkasan 2","poin ringkasan 3"]}

MATERI:
"""
${text}
"""`
    }
  ], {
    max_tokens: 1200,
    temperature: 0.25,
    onWait: o.onWait
  });

  const summary = arr(d.summary).map(str).filter(Boolean);
  if (!summary.length) {
    throw new AIError('AI tidak menghasilkan ringkasan yang valid.', 'empty');
  }
  return summary;
}

  function normalizeMaterial(d, o) {
    const sections = arr(d.sections).map(s => {
      const t = s.table && arr(s.table.headers).length && arr(s.table.rows).length
        ? { headers: strs(s.table.headers), rows: arr(s.table.rows).map(r => arr(r).map(str)).filter(r => r.length) } : null;
      return { emoji: str(s.emoji) || '📖', heading: str(s.heading), paragraphs: strs(s.paragraphs).slice(0, 2), bullets: strs(s.bullets).slice(0, 4),
               table: t, code: str(s.code) && str(s.code).toLowerCase() !== 'null' ? String(s.code).replace(/\s+$/, '') : '', tip: str(s.tip) && str(s.tip).toLowerCase() !== 'null' ? str(s.tip) : '' };
    }).filter(s => s.heading && (s.paragraphs.length || s.bullets.length || s.table || s.code)).slice(0, 4);
    if (!sections.length) throw new AIError('AI tidak berhasil menyusun bagian materi. Coba lagi atau perjelas materinya.', 'empty');
    return {
      title: str(o.title) || str(d.title) || 'Materi Baru',
      description: str(d.description).slice(0, 180) || 'Materi hasil olahan AI.',
      level: str(o.level) || str(d.level) || 'Umum',
      objectives: strs(d.objectives).slice(0, 3), sections,
      glossary: o.glossary === false ? [] : arr(d.glossary).map(g => ({ term: str(g.term), definition: str(g.definition) })).filter(g => g.term && g.definition),
      summary: strs(d.summary).slice(0, 4), task: o.task === false ? '' : str(d.task),
    };
  }

  /* JSON materi -> HTML (semua teks di-escape) */
  function materialToHTML(m, opt = {}) {
    const list = a => '<ul>' + a.map(x => '<li>' + inline(x) + '</li>').join('') + '</ul>';
    let h = '';
    if (m.objectives.length) h += '<div class="lesson obj"><h4>🎯 Tujuan Pembelajaran</h4>' + list(m.objectives) + '</div>';
    m.sections.forEach(s => {
      h += '<div class="lesson"><h4>' + esc(s.emoji) + ' ' + esc(s.heading) + '</h4>';
      s.paragraphs.forEach(p => h += '<p>' + inline(p) + '</p>');
      if (s.bullets.length) h += list(s.bullets);
      if (s.table) h += '<div class="tbl-scroll"><table class="mini"><tr>' + s.table.headers.map(x => '<th>' + esc(x) + '</th>').join('') + '</tr>'
        + s.table.rows.map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</table></div>';
      if (s.code) h += '<div class="code">' + esc(s.code) + '</div>';
      if (s.tip) h += '<div class="tip">💡 ' + inline(s.tip) + '</div>';
      h += '</div>';
    });
    if (m.glossary.length) h += '<div class="lesson"><h4>📘 Glosarium</h4><div class="tbl-scroll"><table class="mini"><tr><th>Istilah</th><th>Arti</th></tr>'
      + m.glossary.map(g => '<tr><td><b>' + esc(g.term) + '</b></td><td>' + inline(g.definition) + '</td></tr>').join('') + '</table></div></div>';
    if (m.summary.length && !opt.noSummary) h += '<div class="lesson sum"><h4>📝 Rangkuman</h4>' + list(m.summary) + '</div>';
    if (m.task) h += '<div class="lesson task"><h4>✏️ Tugas Kecil</h4><p>' + inline(m.task) + '</p></div>';
    return h;
  }

  /* ---------- 2) Soal otomatis ---------- */
const SOAL_SYS = `Kamu adalah pembuat soal untuk semua mata pelajaran dan jenjang pendidikan. Buat soal pilihan ganda berkualitas dari materi yang diberikan.
Aturan:
- Setiap soal punya TEPAT 4 opsi dan TEPAT satu jawaban benar.
- Pengecoh harus masuk akal, panjang opsi mirip, dan tidak menggunakan "semua jawaban benar/salah".
- Variasikan pengetahuan, pemahaman, penerapan, dan analisis sesuai tingkat kesulitan.
- Gunakan HANYA informasi dari materi.
- Soal harus berdiri sendiri dan tidak merujuk pada "teks di atas".
- Sertakan pembahasan 1–2 kalimat.
- Balas HANYA dengan satu objek JSON valid.`;

  const DIFF = { campuran: 'Campuran: sekitar 30% mudah, 50% sedang, 20% sulit.', mudah: 'Tingkat mudah (mengingat & memahami).', sedang: 'Tingkat sedang (memahami & menerapkan).', sulit: 'Tingkat sulit (menerapkan & menganalisis, soal kasus).' };

  async function makeQuestions(rawText, title, o = {}) {
    const total = Math.max(1, Math.min(30, o.count || 10));
    const { text } = clip(rawText, cfg().maxChars);
    const out = [], seen = new Set();
    let guard = 0;
    while (out.length < total && guard++ < 3) {
      const n = Math.min(10, total - out.length);
      const avoid = out.length ? `\nJANGAN mengulang soal-soal berikut:\n${out.map(q => '- ' + q.q).join('\n')}\n` : '';
      o.onProgress && o.onProgress(out.length, total);
      const d = await chatJSON([
        { role: 'system', content: SOAL_SYS },
        { role: 'user', content: `Buat ${n} soal pilihan ganda tentang "${title || 'materi ini'}". ${DIFF[o.difficulty] || DIFF.campuran}${avoid}\nFormat:\n{"questions":[{"q":"pertanyaan","options":["A","B","C","D"],"answer":0,"explanation":"pembahasan"}]}\n\nMATERI:\n"""\n${text}\n"""` },
      ], { max_tokens: 4000, temperature: 0.5, onWait: o.onWait });
      validateQuestions(arr(d.questions || d.soal || d)).forEach(q => {
        const k = q.q.toLowerCase().replace(/\W+/g, ' ');
        if (!seen.has(k) && out.length < total) { seen.add(k); out.push(q); }
      });
    }
    if (!out.length) throw new AIError('AI tidak menghasilkan soal yang valid. Coba lagi atau gunakan materi yang lebih jelas.', 'empty');
    o.onProgress && o.onProgress(out.length, total);
    return out;
  }

  /* validasi + acak ulang opsi (menghindari bias posisi jawaban) */
  function validateQuestions(list) {
    const res = [];
    list.forEach(x => {
      const q = str(x.q || x.question || x.pertanyaan);
      let o = strs(x.options || x.o || x.opsi).map(s => s.replace(/^[A-Da-d][\).:]\s+/, ''));
      let a = x.answer ?? x.a ?? x.jawaban;
      if (typeof a === 'string') { const L = a.trim().toUpperCase(); a = /^[A-D]$/.test(L) ? L.charCodeAt(0) - 65 : parseInt(a, 10); }
      if (!q || o.length !== 4 || new Set(o.map(s => s.toLowerCase())).size !== 4 || !Number.isInteger(a) || a < 0 || a > 3) return;
      const correct = o[a];
      o = shuffle(o);
      res.push({ q, o, a: o.indexOf(correct), e: str(x.explanation || x.e || x.pembahasan) });
    });
    return res;
  }

  /* ---------- 3) Pembaca berkas ---------- */
  const loaded = {};
  const loadScript = src => loaded[src] || (loaded[src] = new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new AIError('Gagal memuat pustaka pembaca berkas (butuh internet).', 'lib')); document.head.appendChild(s);
  }));

  async function readFile(file) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (file.size > 15 * 1024 * 1024) throw new AIError('Ukuran berkas maksimal 15 MB.', 'size');
    if (['txt', 'md', 'csv', 'json', 'html', 'htm'].includes(ext)) {
      let t = await file.text();
      if (ext === 'html' || ext === 'htm') t = new DOMParser().parseFromString(t, 'text/html').body.textContent || '';
      return t;
    }
    if (ext === 'docx') {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
      const r = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return r.value;
    }
    if (ext === 'pdf') {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      let t = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const c = await (await pdf.getPage(i)).getTextContent();
        t += c.items.map(s => s.str).join(' ') + '\n\n';
      }
      if (t.trim().length < 30) throw new AIError('PDF ini tampaknya hasil scan (tanpa teks). Salin teksnya secara manual.', 'scan');
      return t;
    }
    throw new AIError('Format .' + ext + ' belum didukung. Gunakan .txt, .md, .docx, atau .pdf.', 'fmt');
  }

  /* Teks sumber sebuah materi manual: berkas unggahan (data URL) atau URL berkas publik, plus konten HTML bila ada.
     Tidak melempar error — mengembalikan { text, err } agar pemanggil bisa memberi pesan ramah. */
  async function textFromMaterial(m) {
    const parts = []; let err = '';
    try {
      let blob = null, name = m.fileName || '';
      if (m.fileData) blob = await (await fetch(m.fileData)).blob();
      else if (m.fileUrl) {
        const r = await fetch(m.fileUrl);
        if (!r.ok) throw new Error('berkas tidak bisa diunduh (' + r.status + ')');
        blob = await r.blob(); name = name || m.fileUrl.split('?')[0].split('/').pop();
      }
      if (blob) parts.push(await readFile(new File([blob], name || 'materi.pdf')));
    } catch (e) {
      err = e instanceof AIError ? e.message : (m.fileUrl && !m.fileData ? 'berkas dari URL diblokir browser (CORS) — unggah berkas langsung' : e.message);
    }
    if (m.content) parts.push(new DOMParser().parseFromString(m.content, 'text/html').body.textContent || '');
    return { text: parts.join('\n\n').replace(/\s+\n/g, '\n').trim(), err };
  }

  /* Tes koneksi singkat */
  async function ping() {
    const t = await chat([{ role: 'user', content: 'Balas hanya dengan JSON: {"ok":true}' }], { max_tokens: 20, temperature: 0 });
    return /ok/i.test(t);
  }

  return { makeMaterial, makeQuestions, makeSummary, materialToHTML, readFile, textFromMaterial, ping, clip, AIError };
})();
