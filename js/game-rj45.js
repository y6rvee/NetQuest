/* ============ SIMULATOR CRIMPING RJ45 ============ */
const WIRES=[
 {id:'po',name:'Putih-Oranye',c:'#FF8C42',striped:true},
 {id:'o', name:'Oranye',      c:'#FF8C42',striped:false},
 {id:'ph',name:'Putih-Hijau', c:'#2EAD4B',striped:true},
 {id:'b', name:'Biru',        c:'#2B6CB0',striped:false},
 {id:'pb',name:'Putih-Biru',  c:'#2B6CB0',striped:true},
 {id:'h', name:'Hijau',       c:'#2EAD4B',striped:false},
 {id:'pc',name:'Putih-Coklat',c:'#8D5A2B',striped:true},
 {id:'c', name:'Coklat',      c:'#8D5A2B',striped:false}
];
const SEQ={B:['po','o','ph','b','pb','h','pc','c'],
           A:['ph','h','po','b','pb','o','pc','c']};
const LEVELS=[
 {mode:'B',time:75},
 {mode:'A',time:60},
 {mode:'B',time:45}
];
let level=0, score=0, combo=0, timeLeft=75, timerId=null;
let placed=[null,null,null,null,null,null,null,null];
let selectedWire=null;

const $=id=>document.getElementById(id);

function wireById(id){return WIRES.find(w=>w.id===id)}

function startLevel(){
  clearInterval(timerId);
  placed=[null,null,null,null,null,null,null,null];
  selectedWire=null;
  $('btnCrimp').disabled=true;
  $('overlay').classList.remove('show');
  $('stLevel').textContent=level+1;
  $('stMode').textContent='T568'+LEVELS[level].mode;
  timeLeft=LEVELS[level].time;
  $('stTime').textContent=timeLeft;
  setMsg(`Level ${level+1}: Susun kabel sesuai standar T568${LEVELS[level].mode}!`,'');

  // kabel diacak
  const wl=$('wireList'); wl.innerHTML='';
  [...WIRES].sort(()=>Math.random()-.5).forEach(w=>{
    const b=document.createElement('button');
    b.className='wire '+(w.striped?'striped':'solid');
    b.style.setProperty('--wc',w.c);
    b.dataset.wid=w.id;
    b.draggable=true;
    b.innerHTML=`<span class="wire-dot"></span>${w.name}`;
    b.addEventListener('click',()=>selectWire(w.id,b));
    b.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',w.id);b.classList.add('dragging');});
    b.addEventListener('dragend',()=>b.classList.remove('dragging'));
    wl.appendChild(b);
  });

  // slot
  const sl=$('slots'); sl.innerHTML='';
  for(let i=0;i<8;i++){
    const d=document.createElement('div');d.className='slot';
    d.innerHTML=`<span class="slot-label-num">${i+1}</span>`;
    d.addEventListener('dragover',e=>{e.preventDefault();d.classList.add('hover');});
    d.addEventListener('dragleave',()=>d.classList.remove('hover'));
    d.addEventListener('drop',e=>{e.preventDefault();d.classList.remove('hover');placeWire(e.dataTransfer.getData('text/plain'),i);});
    d.addEventListener('click',()=>{
      if(placed[i]!==null){removeWire(i);return;}
      if(selectedWire){placeWire(selectedWire,i);}
    });
    sl.appendChild(d);
  }
  updatePins();
  timerId=setInterval(tick,1000);
}

function tick(){
  timeLeft--;
  $('stTime').textContent=timeLeft;
  if(timeLeft<=10)$('stTime').parentElement.style.color='var(--red)';
  if(timeLeft<=0){
    clearInterval(timerId);
    gameOver('⏰ Waktu habis! Konektor belum selesai dibereskan.');
  }
}

function selectWire(id,btn){
  if(btn.classList.contains('used'))return;
  document.querySelectorAll('.wire').forEach(w=>w.classList.remove('selected'));
  if(selectedWire===id){selectedWire=null;return;}
  selectedWire=id; btn.classList.add('selected');
  setMsg('Kabel '+wireById(id).name+' dipilih — sekarang klik slot tujuannya.','');
}

function placeWire(id,slotIdx){
  if(id==null||id==='')return;
  const btn=document.querySelector(`.wire[data-wid="${id}"]`);
  if(!btn||btn.classList.contains('used'))return;
  const correct=SEQ[LEVELS[level].mode][slotIdx];
  const slot=document.querySelectorAll('.slot')[slotIdx];
  if(placed[slotIdx]!==null)return;

  if(id===correct){
    const w=wireById(id);
    combo++;
    const pts=50+combo*10;
    score+=pts;
    placed[slotIdx]=id;
    btn.classList.remove('selected');btn.classList.add('used');
    selectedWire=null;
    slot.classList.add('filled');
    slot.innerHTML= w.striped
      ? `<div class="slot-stripes" style="background:repeating-linear-gradient(0deg,${w.c} 0 4px,#fff 4px 8px)"></div><span class="slot-num">${slotIdx+1}</span>`
      : `<div class="slot-stripes" style="background:${w.c}"></div><span class="slot-num">${slotIdx+1}</span>`;
    updatePins();
    setMsg(`✅ Benar! +${pts} poin (combo x${combo})`,'ok');
    updateHUD();
    if(placed.every(p=>p!==null)){
      $('btnCrimp').disabled=false;
      setMsg('🎉 Semua kabel terpasang! Sekarang tekan tombol "Crimp Konektor"!','ok');
    }
  }else{
    combo=0; score=Math.max(0,score-15);
    slot.classList.add('wrong-slot');
    const plug=$('plug');plug.classList.remove('shake');void plug.offsetWidth;plug.classList.add('shake');
    setTimeout(()=>slot.classList.remove('wrong-slot'),600);
    setMsg(`❌ Salah! Posisi ${slotIdx+1} menurut T568${LEVELS[level].mode} bukan kabel itu. (-15 poin)`,'no');
    updateHUD();
  }
}

function removeWire(slotIdx){
  const id=placed[slotIdx]; if(id===null)return;
  placed[slotIdx]=null;
  document.querySelector(`.wire[data-wid="${id}"]`).classList.remove('used');
  const slot=document.querySelectorAll('.slot')[slotIdx];
  slot.className='slot';
  slot.innerHTML=`<span class="slot-label-num">${slotIdx+1}</span>`;
  $('btnCrimp').disabled=true;
  updatePins();
  setMsg('Kabel '+wireById(id).name+' dilepas kembali.','');
}

function updatePins(){
  document.querySelectorAll('.pin').forEach((p,i)=>p.classList.toggle('on',placed[i]!==null));
}

function updateHUD(){
  $('stScore').textContent=score;
  $('stCombo').textContent='x'+combo;
}

function crimp(){
  clearInterval(timerId);
  $('btnCrimp').disabled=true;
  // animasi crimp lalu test koneksi
  const oc=$('ovContent');
  oc.innerHTML=`<div class="crimp-anim">🔧</div>
    <h2>Crimping...</h2><p>Konektor dijepit, kabel terkunci. Menguji koneksi...</p>
    <div class="link-test"><span>🖥️</span><div class="link-line"></div><span class="led" id="led"></span><span>🖥️</span></div>`;
  $('overlay').classList.add('show');
  setTimeout(()=>{
    document.getElementById('led').classList.add('on');
    const bonus=timeLeft*2;
    score+=bonus; updateHUD();
    setTimeout(()=>{
      confetti();
      const last=level===LEVELS.length-1;
      oc.innerHTML=`<div style="font-size:3.2rem">🏆</div>
        <h2>Level ${level+1} Berhasil!</h2>
        <p>Koneksi terhubung sempurna — urutan T568${LEVELS[level].mode} benar!</p>
        <div class="overlay-stats">
          <div><b>+${bonus}</b><span>Bonus Waktu</span></div>
          <div><b>${timeLeft}</b><span>Sisa Detik</span></div>
          <div><b>${score}</b><span>Total Skor</span></div>
        </div>
        ${last
          ?`<p style="font-weight:800;color:var(--orange-deep)">🎓 Kamu menyelesaikan semua level! Kamu resmi Master Crimping!</p>
            <button class="btn btn-red" onclick="restartGame()">🔄 Main dari Awal</button>`
          :`<button class="btn btn-red" onclick="nextLevel()">Level ${level+2} →</button>`}
        <div style="margin-top:12px"><a href="games.html" style="font-size:.85rem;color:var(--ink-soft)">← kembali ke Arena Game</a></div>`;
    },900);
  },2200);
}

function nextLevel(){level++;startLevel();}
function resetLevel(){combo=0;updateHUD();startLevel();}
function restartGame(){level=0;score=0;combo=0;updateHUD();startLevel();}

function gameOver(reason){
  $('overlay').classList.add('show');
  $('ovContent').innerHTML=`<div style="font-size:3.2rem">😵</div>
    <h2>Game Over</h2><p>${reason}</p>
    <div class="overlay-stats"><div><b>${score}</b><span>Skor Akhir</span></div><div><b>${level+1}</b><span>Level</span></div></div>
    <button class="btn btn-red" onclick="restartGame()">🔄 Coba Lagi</button>
    <div style="margin-top:12px"><a href="games.html" style="font-size:.85rem;color:var(--ink-soft)">← kembali ke Arena Game</a></div>`;
}

function toggleHelp(){
  const h=$('rjHelp');
  h.style.display=h.style.display==='none'?'block':'none';
}

function confetti(){
  const colors=['#8DE6FF','#FFEE92','#FFA335','#FF5556','#2EAD4B'];
  const box=document.querySelector('.game-card-hub');
  for(let i=0;i<50;i++){
    const c=document.createElement('div');c.className='confetti';
    c.style.left=Math.random()*100+'%';
    c.style.background=colors[i%colors.length];
    c.style.animationDuration=(1.2+Math.random()*1.6)+'s';
    c.style.animationDelay=(Math.random()*.6)+'s';
    c.style.width=c.style.height=(6+Math.random()*8)+'px';
    box.appendChild(c);
    setTimeout(()=>c.remove(),3500);
  }
}

function setMsg(t,cls){const m=$('rjMsg');m.textContent=t;m.className='msg '+(cls||'')}

startLevel();
