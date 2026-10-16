/* Daftar materi + pencarian */
const guru = NQStore.isGuru();
const grid = document.getElementById('matGrid');

function card(m, i, qn) {
  const acts = guru ? `<div class="admin-acts">
      <button class="mini-act edit" title="Edit" data-s="${esc(m.slug)}" onclick="event.preventDefault();location.href='guru.html?tab=materi&edit='+encodeURIComponent(this.dataset.s)">${ic('edit')}</button>
      <button class="mini-act del" title="Hapus" data-s="${esc(m.slug)}" onclick="event.preventDefault();delMat(this.dataset.s)">${ic('trash')}</button></div>` : '';
  return `<a class="modul reveal" style="--mc:${esc(m.color)}" href="${esc(m.url)}">${acts}
    <div class="icon">${nqIcon(m.icon)}</div><h3>${i + 1}. ${esc(m.title)}</h3><p>${esc(m.desc)}</p>
    <div class="modul-meta"><span class="tag">${esc(m.level)}</span>${m.source === 'ai' ? '<span class="tag ai">✨ AI</span>' : '<span class="tag manual">✍️ Manual</span>'}${qn ? `<span class="tag q">${qn} soal</span>` : ''}</div>
    <span class="go">Buka modul →</span></a>`;
}
function delMat(slug) {
  if (confirm('Hapus materi ini beserta soal terkait?')) { NQStore.deleteMaterial(slug); draw(); }
}
function draw() {
  const term = (document.getElementById('q').value || '').toLowerCase().trim();
  const qs = NQStore.questions();
  const list = NQStore.materials();
  const html = list.map((m, i) => ({ m, i })).filter(x => (srcFilter === 'all' || (x.m.source === 'ai' ? 'ai' : 'manual') === srcFilter) && (!term || (x.m.title + ' ' + x.m.desc + ' ' + x.m.level).toLowerCase().includes(term)))
    .map(x => card(x.m, x.i, qs.filter(q => q.materi === x.m.slug).length)).join('');
  const add = guru && !term && srcFilter === 'all' ? `<a class="modul add" href="guru.html?tab=ai">${ic('spark', 'width="28" height="28"')}<b style="margin-top:8px">Tambah materi dengan AI</b><span class="muted" style="font-size:.8rem">Bahan guru → materi ringkas + soal otomatis</span></a>
    <a class="modul add" href="guru.html?tab=materi">${ic('plus', 'width="28" height="28"')}<b style="margin-top:8px">Tambah materi manual</b><span class="muted" style="font-size:.8rem">Tulis/unggah sendiri → AI hanya meringkas</span></a>` : '';
  grid.innerHTML = html + add || '<div class="empty" style="grid-column:1/-1"><b>Materi tidak ditemukan</b>Coba kata kunci lain.</div>';
  observeReveal();
}
let srcFilter = 'all';
function setSrc(v) {
  srcFilter = v;
  document.querySelectorAll('#srcSeg button').forEach(b => b.classList.toggle('active', b.dataset.v === v));
  draw();
}
let _deb;
document.getElementById('q').addEventListener('input', () => { clearTimeout(_deb); _deb = setTimeout(draw, 150); });
draw();
