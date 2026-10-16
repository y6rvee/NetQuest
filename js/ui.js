/* NetQuest — ui.js : shell (sidebar + topbar), ikon, toast */
const I = {
  home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  book:'<path d="M4 4h6a3 3 0 013 3v13a2 2 0 00-2-2H4z"/><path d="M20 4h-6a3 3 0 00-3 3v13a2 2 0 012-2h7z"/>',
  flask:'<path d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 006.2 21h11.6a2 2 0 001.7-2.5L14 9V3"/><path d="M7.5 15h9"/>',
  game:'<rect x="2" y="7" width="20" height="12" rx="4"/><path d="M7 11v4M5 13h4"/><circle cx="16" cy="12" r="1"/><circle cx="18.5" cy="14.5" r="1"/>',
  bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  tools:'<path d="M14.7 6.3a4 4 0 005 5L21 13l-8 8-3-3 8-8"/><path d="M3 21l6-6"/><path d="M5 8l3-3 3 3-3 3z"/>',
  logout:'<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  login:'<path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  check:'<path d="M20 6L9 17l-5-5"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  cog:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 015.8 1c0 2-3 2.5-3 4M12 17h.01"/>',
  arrow:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
};
const ic = (n, extra = '') => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' + extra + '>' + (I[n] || '') + '</svg>';

/* ikon putih untuk kartu materi */
const NQ_ICONS = {
  html:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M8 6 3 12l5 6M16 6l5 6-5 6M13 4l-2 16"/></svg>',
  css:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M4 4h16l-2 12-6 4-6-4L4 4z"/><path d="M8 9h8"/></svg>',
  js:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M8 6 3 12l5 6M16 6l5 6-5 6"/></svg>',
  web:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18"/></svg>',
  topo:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round"><circle cx="12" cy="5" r="2.6"/><circle cx="4.5" cy="18" r="2.6"/><circle cx="19.5" cy="18" r="2.6"/><path d="M10.6 7 6 15.8M13.4 7l4.6 8.8M7.1 18h9.8"/></svg>',
  doc:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h7M9 17h7"/></svg>',
};
const nqIcon = k => NQ_ICONS[k] || NQ_ICONS.doc;

/* Toast */
function toast(msg, type = '') {
  let w = document.querySelector('.toast-wrap');
  if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); }
  const t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = msg; w.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3600);
}

/* Shell halaman: sidebar + topbar + footer */
function renderDash(active, title) {
  const user = NQStore.current(), role = user ? user.role : null;
  const item = (k, h, icon, label, extra = '') =>
    '<li><a href="' + h + '" class="' + (active === k ? 'active' : '') + '">' + ic(icon) + '<span>' + label + '</span>' + extra + '</a></li>';

let nav = '<div class="side-label">Belajar</div><ul class="side-nav">'
  + item('beranda', 'index.html', 'home', 'Beranda')
  + item('materi', 'materi.html', 'book', 'Materi')
  + item('tools', 'tools.html', 'tools', 'Tools')
  + item('kuis', 'game-quiz.html', 'bolt', 'Kuis Kilat')
  + '</ul>';
  if (role === 'guru') {
    nav += '<div class="side-label">Panel Guru</div><ul class="side-nav">'
      + item('guru-ai', 'guru.html?tab=ai', 'spark', 'Generator AI', '<em class="pill-ai">AI</em>')
      + item('guru', 'guru.html?tab=materi', 'tools', 'Kelola Materi & Soal')
      + item('guru-set', 'guru.html?tab=set', 'cog', 'Pengaturan AI') + '</ul>';
  }

  const sb = document.getElementById('sideBar');
  sb.innerHTML = '<a class="logo side-logo" href="index.html"><div class="logo-badge">⚡</div><span><b>Net</b>Quest</span></a>' + nav
    + '<div class="side-spacer"></div><div class="side-bottom">' + (user
      ? '<div class="side-user"><div class="avatar">' + esc((user.name || '?')[0].toUpperCase()) + '</div><div style="min-width:0"><b>' + esc(user.name) + '</b><span class="badge-' + role + '">' + role + '</span></div></div>'
        + '<button class="btn btn-outline" onclick="NQStore.logout();location.href=\'login.html\'">' + ic('logout', 'width="16" height="16"') + ' Keluar</button>'
      : '<a class="btn btn-red" href="login.html">' + ic('login', 'width="16" height="16"') + ' Masuk / Daftar</a>') + '</div>';

  document.getElementById('topBar').innerHTML =
    '<div class="topbar-left"><button class="burger" aria-label="Menu" onclick="toggleSide()">' + ic('menu') + '</button><h1>' + esc(title) + '</h1></div>'
    + '<div class="topbar-user">' + (user
      ? '<span class="badge-' + role + '">' + (role === 'guru' ? 'Guru' : 'Siswa') + '</span><span class="tu-name">' + esc(user.name) + '</span>'
      : '<a href="login.html" class="tu-login">Masuk</a>') + '</div>';

  if (!document.getElementById('scrim')) {
    const s = document.createElement('div'); s.id = 'scrim'; s.className = 'scrim'; s.onclick = toggleSide;
    sb.after(s);
  }
  const f = document.getElementById('pageFoot');
  if (f) f.innerHTML = '<span><b>⚡ NetQuest</b> · Media belajar interaktif SMK TKJ · Kurikulum Merdeka</span><span>Materi &amp; soal dibantu AI Groq</span>';
  document.querySelectorAll('.side-nav a').forEach(a => a.addEventListener('click', () => toggleSide(false)));
}
function toggleSide(force) {
  const sb = document.getElementById('sideBar'), sc = document.getElementById('scrim');
  if (!sb) return;
  const open = typeof force === 'boolean' ? force : !sb.classList.contains('open');
  sb.classList.toggle('open', open);
  if (sc) sc.classList.toggle('show', open);
}