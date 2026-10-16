/* Kuis Kilat — soal diambil dari bank soal (guru / AI), bisa dipilih per materi */
const root = document.getElementById('quizBody');
const params = new URLSearchParams(location.search);
let Q = [], qi = 0, score = 0, wrongs = [], topicName = '', topicSlug = '', perRound = 10, answered = false;

const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* hanya soal yang materinya masih ada (soal bawaan lama bisa yatim) */
function validQs() {
  const slugs = new Set(NQStore.materials().map(m => m.slug));
  return NQStore.questions().filter(q => slugs.has(q.materi));
}

function topics() {
  const qs = validQs();
  return NQStore.materials().map(m => ({ slug: m.slug, title: m.title, n: qs.filter(q => q.materi === m.slug).length })).filter(t => t.n > 0);
}

function showPick() {
  const ts = topics(), total = validQs().length;
  document.getElementById('quizTitle').textContent = 'Kuis Kilat';
  if (!total) {
    root.innerHTML = '<div class="empty"><b>Belum ada soal</b>Guru belum membuat soal. Minta guru mengolah materi lewat Generator AI.</div>';
    return;
  }
  root.innerHTML = `
    <div class="q-top"><span>Pilih topik</span>
      <span>Jumlah soal:
        <span class="seg" id="cntSeg">${[5, 10, 15].map(n => `<button class="${n === perRound ? 'active' : ''}" onclick="setCount(${n})">${n}</button>`).join('')}</span>
      </span></div>
    <div class="topic-grid">
      <button class="topic all" onclick="start('')"><b>🎲 Semua materi</b><span>${total} soal · diacak</span></button>
      ${ts.map(t => `<button class="topic" data-s="${esc(t.slug)}" onclick="start(this.dataset.s)"><b>${esc(t.title)}</b><span>${t.n} soal</span></button>`).join('')}
    </div>`;
}
function setCount(n) {
  perRound = n;
  document.querySelectorAll('#cntSeg button').forEach(b => b.classList.toggle('active', +b.textContent === n));
}

function start(slug) {
  topicSlug = slug;
  const all = validQs().filter(q => !slug || q.materi === slug);
  if (!all.length) { showPick(); return; }
  const m = slug ? NQStore.material(slug) : null;
  topicName = m ? m.title : 'Semua Materi';
  /* acak urutan soal & urutan opsi */
  Q = shuffle(all).slice(0, perRound).map(x => {
    const idx = shuffle(x.o.map((_, i) => i));
    return { q: x.q, o: idx.map(i => x.o[i]), a: idx.indexOf(x.a), e: x.e || '' };
  });
  qi = 0; score = 0; wrongs = [];
  render();
}

function render() {
  if (qi >= Q.length) return result();
  answered = false;
  const q = Q[qi];
  document.getElementById('quizTitle').textContent = topicName;
  root.innerHTML = `
    <div class="q-top"><span>Soal ${qi + 1} dari ${Q.length}</span><span class="q-score">Skor: ${score}</span></div>
    <div class="q-progress"><i style="width:${qi / Q.length * 100}%"></i></div>
    <div class="q-text">${esc(q.q)}</div>
    <div class="q-opts">${q.o.map((o, i) => `<button class="q-opt" onclick="pick(${i})"><span class="ltr">${String.fromCharCode(65 + i)}</span><span>${esc(o)}</span></button>`).join('')}</div>
    <div id="qFb"></div>`;
}

function pick(i) {
  if (answered) return; answered = true;
  const q = Q[qi], btns = document.querySelectorAll('.q-opt');
  btns.forEach(b => b.disabled = true);
  btns[q.a].classList.add('correct');
  if (i === q.a) score++; else { btns[i].classList.add('wrong'); wrongs.push({ q: q.q, you: q.o[i], right: q.o[q.a], e: q.e }); }
  document.querySelector('.q-score').textContent = 'Skor: ' + score;
  const last = qi === Q.length - 1;
  document.getElementById('qFb').innerHTML =
    (q.e ? `<div class="q-explain"><b>${i === q.a ? '✅ Benar!' : '❌ Belum tepat.'}</b>${esc(q.e)}</div>`
         : `<div class="q-explain"><b>${i === q.a ? '✅ Benar!' : '❌ Belum tepat.'}</b>Jawaban yang benar: ${esc(q.o[q.a])}</div>`)
    + `<div class="q-next"><button class="btn btn-red" onclick="next()">${last ? 'Lihat hasil' : 'Lanjut →'}</button></div>`;
}
function next() { qi++; render(); }

function result() {
  const pct = Math.round(score / Q.length * 100);
  document.getElementById('quizTitle').textContent = 'Hasil — ' + topicName;
  root.innerHTML = `<div class="q-result">
      <div class="big">${score}/${Q.length}</div>
      <p style="font-weight:800;margin:10px 0 4px">${pct >= 80 ? '🏆 Luar biasa! Kamu menguasai materi ini.' : pct >= 50 ? '👍 Bagus! Tinggal sedikit lagi.' : '💪 Jangan menyerah, pelajari materinya lagi.'}</p>
      <p class="muted" style="font-size:.9rem">Skor akhir: ${pct}%</p>
      <div class="btn-row" style="justify-content:center">
        <button class="btn btn-red" onclick="start(topicSlug)">🔄 Main lagi</button>
        <button class="btn btn-outline" onclick="showPick()">Pilih topik lain</button>
      </div></div>
    ${wrongs.length ? `<div class="review"><h4>Perlu dipelajari lagi (${wrongs.length})</h4>${wrongs.map(w => `
      <div class="review-item"><b>${esc(w.q)}</b>Jawabanmu: ${esc(w.you)}<br><span class="ok">Benar: ${esc(w.right)}</span>${w.e ? `<br><span class="muted">💬 ${esc(w.e)}</span>` : ''}</div>`).join('')}</div>` : ''}`;
}

if (params.get('m')) start(params.get('m')); else showPick();
