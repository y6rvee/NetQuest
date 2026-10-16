/* NetQuest — main.js : animasi muncul (reveal) */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .08 });
function observeReveal() { document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el)); }
observeReveal();
