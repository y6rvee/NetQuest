/* NetQuest — store.js : data materi, soal, akun, & pengaturan AI (localStorage) */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const NQStore = (() => {
  const K = {
  mat:'nq_materials_v1',
  q:'nq_questions_v1',
  u:'nq_users_v1',
  s:'nq_session_v1',
  ai:'nq_ai_v1',
  c:'nq_comments_v1'
};

  const DEF_MAT = [
  {
    slug:'belajar-efektif',
    title:'Cara Belajar Efektif',
    desc:'Mengenal strategi membaca, mencatat, mengulang, dan latihan aktif.',
    level:'Umum',
    color:'var(--red)',
    icon:'doc',
    url:'materi-detail.html?s=belajar-efektif',
    summary:'• Tentukan tujuan belajar sebelum memulai.\n• Baca materi secara bertahap dan tandai poin penting.\n• Buat ringkasan dengan bahasa sendiri.\n• Ulangi materi melalui latihan atau diskusi.'
  },
  {
    slug:'berpikir-kritis',
    title:'Berpikir Kritis',
    desc:'Melatih cara menganalisis informasi, menilai bukti, dan menarik kesimpulan.',
    level:'Umum',
    color:'var(--orange)',
    icon:'doc',
    url:'materi-detail.html?s=berpikir-kritis',
    summary:'• Kenali masalah atau pertanyaan utama.\n• Kumpulkan informasi dari sumber yang dapat dipercaya.\n• Bedakan fakta, opini, dan asumsi.\n• Ambil kesimpulan berdasarkan bukti.'
  },
  {
    slug:'presentasi',
    title:'Teknik Presentasi',
    desc:'Menyusun isi presentasi, berbicara dengan percaya diri, dan menggunakan visual.',
    level:'Umum',
    color:'var(--sky-deep)',
    icon:'doc',
    url:'materi-detail.html?s=presentasi',
    summary:'• Tentukan tujuan dan sasaran presentasi.\n• Susun alur pembuka, isi, dan penutup.\n• Gunakan visual yang sederhana dan relevan.\n• Berlatih untuk meningkatkan kelancaran.'
  }
];

  const DEF_Q = [
    { id:1, materi:'html', q:'Tag HTML untuk membuat paragraf adalah...', o:['<para>','<p>','<par>','<text>'], a:1 },
    { id:2, materi:'css', q:'Properti CSS untuk mengubah warna teks adalah...', o:['font-color','text-style','color','background'], a:2 },
    { id:3, materi:'topologi', q:'Berapa jumlah urat kabel pada UTP standar?', o:['4','6','8','10'], a:2 },
    { id:4, materi:'topologi', q:'Urutan kabel T568B dimulai dari...', o:['Putih-Hijau','Putih-Oranye','Biru','Coklat'], a:1 },
    { id:5, materi:'topologi', q:'Perangkat yang menghubungkan banyak komputer dalam satu LAN adalah...', o:['Router','Modem','Switch','Repeater'], a:2 },
    { id:6, materi:'topologi', q:'DNS berfungsi untuk...', o:['Menerjemahkan domain menjadi IP','Mempercepat koneksi','Mengamankan jaringan','Membagikan IP otomatis'], a:0 },
    { id:7, materi:'topologi', q:'Konektor yang dipakai pada kabel UTP adalah...', o:['BNC','RJ11','RJ45','HDMI'], a:2 },
    { id:8, materi:'js', q:'Variabel JavaScript yang nilainya tidak bisa diubah dideklarasikan dengan...', o:['let','var','const','int'], a:2 },
    { id:9, materi:'topologi', q:'Topologi jaringan yang paling umum dipakai pada LAN modern adalah...', o:['Bus','Star','Ring','Mesh penuh'], a:1 },
    { id:10, materi:'topologi', q:'Ciri khas topologi Ring adalah...', o:['Semua node terhubung ke switch pusat','Node terhubung melingkar membentuk cincin','Satu kabel backbone panjang','Tanpa kabel sama sekali'], a:1 },
    { id:11, materi:'topologi', q:'Topologi yang tidak memiliki titik pusat (setiap node saling terhubung) adalah...', o:['Star','Tree','Mesh','Bus'], a:2 },
    { id:12, materi:'topologi', q:'Kelemahan utama topologi Bus adalah...', o:['Butuh kabel paling banyak','Jika backbone putus, seluruh jaringan bermasalah','Sulit dipasang di rumah','Tidak bisa ditambah node baru'], a:1 },
  ];
  const AI_DEF = { key:'', model:'llama-3.3-70b-versatile', endpoint:'https://api.groq.com/openai/v1/chat/completions', maxChars:9000 };

const mem = {};
const get = (k, d) => {
  if (k in mem) return mem[k];
  try { const v = localStorage.getItem(k); return mem[k] = v ? JSON.parse(v) : d; }
  catch (e) { return d; }
};
const set = (k, v) => {
  const prev = mem[k];
  mem[k] = v;
  try { localStorage.setItem(k, JSON.stringify(v)); return true; }
  catch (e) { console.warn('Gagal menyimpan:', e); if (prev === undefined) delete mem[k]; else mem[k] = prev; return false; }
};

  const has = k => { try { return localStorage.getItem(k) !== null; } catch (e) { return false; } };
  if (!has(K.mat)) set(K.mat, DEF_MAT);
  if (!has(K.q))   set(K.q, DEF_Q);
  if (!has(K.u))   set(K.u, [{ name:'Guru TKJ', user:'guru', pass:'guru123', role:'guru' }]);

  const slugify = s => (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || ('m' + Date.now());
  let _last = 0;
  const uid = () => { let n = Date.now() * 1000 + Math.floor(Math.random() * 1000); if (n <= _last) n = _last + 1; return _last = n; };

  return {
    materials: () => get(K.mat, DEF_MAT),
    material: slug => get(K.mat, DEF_MAT).find(m => m.slug === slug),

    /** Simpan materi. Mengembalikan slug. Materi baru otomatis mendapat slug unik. */
    saveMaterial(m) {
      const l = get(K.mat, DEF_MAT);
      let slug = m.slug;
      if (!slug) {
        const base = slugify(m.title); slug = base; let n = 2;
        while (l.some(x => x.slug === slug)) slug = base + '-' + (n++);
      }
      const i = l.findIndex(x => x.slug === slug);
      const custom = (m.url || '').trim();
      const item = { icon:'doc', ...(i >= 0 ? l[i] : {}), ...m, slug };
      item.source = item.source === 'ai' ? 'ai' : 'manual';   // hanya 2 jenis: 'ai' (dibuat AI) atau 'manual' (dibuat guru)
      item.url = custom || 'materi-detail.html?s=' + slug;
      const next = l.slice();
      if (i >= 0) next[i] = item;
      else {
        next.push(item);
        /* materi baru: buang soal/komentar yatim lama yang kebetulan memakai slug yang sama */
        set(K.q, get(K.q, DEF_Q).filter(x => x.materi !== slug));
        set(K.c, get(K.c, []).filter(x => x.materi !== slug));
      }
      if (!set(K.mat, next)) throw new Error('Penyimpanan browser penuh. Perkecil/hapus berkas materi atau gunakan URL berkas publik.');
      return slug;
    },
    deleteMaterial(slug) {
  set(K.mat, get(K.mat, DEF_MAT).filter(m => m.slug !== slug));
  set(K.q, get(K.q, DEF_Q).filter(x => x.materi !== slug));
  set(K.c, get(K.c, []).filter(x => x.materi !== slug));
},
    questions: () => get(K.q, DEF_Q),
    questionsOf: slug => get(K.q, DEF_Q).filter(x => x.materi === slug),
    saveQuestion(q) {
      const l = get(K.q, DEF_Q);
      if (q.id) { const i = l.findIndex(x => x.id === q.id); if (i >= 0) l[i] = q; else l.push(q); }
      else { q.id = uid(); l.push(q); }
      set(K.q, l);
      return q.id;
    },
    saveQuestions(arr) { // simpan banyak sekaligus
      const l = get(K.q, DEF_Q).slice();
      arr.forEach(q => { q.id = uid(); l.push(q); });
      if (!set(K.q, l)) throw new Error('Penyimpanan browser penuh. Soal tidak tersimpan.');
    },
    deleteQuestion(id) { set(K.q, get(K.q, DEF_Q).filter(x => x.id !== id)); },

    users: () => get(K.u, []),
    register(name, user, pass, role) {
      const l = get(K.u, []);
      if (l.some(u => u.user === user)) return { ok:false, msg:'Username sudah dipakai.' };
      l.push({ name, user, pass, role }); set(K.u, l); return { ok:true };
    },
    login(user, pass) {
      const u = get(K.u, []).find(x => x.user === user && x.pass === pass);
      if (!u) return { ok:false, msg:'Username atau password salah.' };
      set(K.s, { name:u.name, user:u.user, role:u.role }); return { ok:true, role:u.role };
    },
    logout() { localStorage.removeItem(K.s); },
    current: () => get(K.s, null),
    isGuru() { const c = get(K.s, null); return !!c && c.role === 'guru'; },

    /* Pengaturan AI (disimpan di browser guru) */
    aiConfig: () => ({ ...AI_DEF, ...get(K.ai, {}) }),
    saveAiConfig(c) { set(K.ai, { ...get(K.ai, {}), ...c }); },
    aiDefaults: AI_DEF,

    /* Cadangan data (tanpa akun & kunci API) */
    exportAll() {
  return JSON.stringify({
    app:'netquest',
    v:1,
    materials:get(K.mat, DEF_MAT),
    questions:get(K.q, DEF_Q),
    comments:get(K.c, [])
  }, null, 1);
},

importAll(text) {
  const d = JSON.parse(text);
  if (d.app !== 'netquest' || !Array.isArray(d.materials) || !Array.isArray(d.questions)) {
    throw new Error('Format berkas tidak dikenali.');
  }

  set(K.mat, d.materials);
  set(K.q, d.questions);
  set(K.c, Array.isArray(d.comments) ? d.comments : []);

  return {
    m:d.materials.length,
    q:d.questions.length,
    c:Array.isArray(d.comments) ? d.comments.length : 0
  };
},
    
    comments(materi) {
  return get(K.c, []).filter(x => x.materi === materi);
},

saveComment(c) {
  const l = get(K.c, []);
  const item = {
    id: uid(),
    materi: c.materi,
    name: c.name,
    text: String(c.text || '').trim(),
    time: new Date().toISOString()
  };
  if (!item.text) return null;
  l.push(item);
  set(K.c, l);
  return item.id;
},

deleteComment(id) {
  set(K.c, get(K.c, []).filter(x => x.id !== id));
},
  };
  
})();
