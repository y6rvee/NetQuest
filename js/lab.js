const SNIPPETS={
html:`<h1>Halo, aku siswa TKJ!</h1>
<p>Ini <b>halaman pertamaku</b> yang kubuat sendiri.</p>
<ul>
  <li>Belajar HTML</li>
  <li>Belajar CSS</li>
  <li>Belajar JavaScript</li>
</ul>
<a href="#">Tautan contoh</a>`,
css:`<style>
  body { font-family: Arial; background: #FFEE92; padding: 24px; }
  h1   { color: #FF5556; text-align: center; }
  p    { color: #2B3A42; font-size: 18px; }
  li   { color: #E8830C; font-weight: bold; }
  a    { color: #4FC3E8; }
</style>

<h1>Judul Berwarna</h1>
<p>Paragraf dengan gaya CSS.</p>
<ul><li>Poin satu</li><li>Poin dua</li></ul>
<a href="#">Sebuah tautan</a>`,
js:`<script>
  let nama = "Budi";
  let nilai = 85;

  alert("Halo, " + nama + "! Nilaimu: " + nilai);

  if (nilai >= 75) {
    alert("Selamat, kamu LULUS! 🎉");
  } else {
    alert("Belum lulus, tetap semangat!");
  }

  for (let i = 1; i <= 3; i++) {
    alert("Perulangan ke-" + i);
  }
<\/script>

<p>Buka halaman ini dan lihat kotak dialog muncul!</p>`,
kosong:`<!-- Mulai menulis kode-mu di sini! -->
`
};
const editor=document.getElementById('editor'),preview=document.getElementById('preview');
function loadSnippet(k,btn){
  document.querySelectorAll('.lab-col:first-child .chip').forEach(c=>c.classList.remove('active'));
  btn.classList.add('active');
  editor.value=SNIPPETS[k];
  runCode();
}
function runCode(){
  preview.srcdoc='<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>'+editor.value+'</body></html>';
}
editor.value=SNIPPETS.html; runCode();
