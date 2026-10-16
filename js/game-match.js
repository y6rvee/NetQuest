const PAIRS=[
 ['IP Address','Alamat unik perangkat di jaringan, contoh: 192.168.1.1'],
 ['Router','Perangkat penghubung antar jaringan / jalur internet'],
 ['Switch','Perangkat hubungkan banyak komputer dalam 1 LAN'],
 ['UTP','Kabel jaringan dengan 8 urat warna, ujungnya RJ45'],
 ['Firewall','Penjaga keamanan yang memfilter lalu lintas jaringan'],
 ['DNS','Penerjemah nama domain menjadi alamat IP'],
 ['LAN','Jaringan area lokal, misalnya 1 laboratorium sekolah'],
 ['HTTP','Protokol untuk transfer halaman web di internet']
];
let mFirst=null,mLock=false,mDone=0,mTries=0;
function initMatch(){
  mFirst=null;mLock=false;mDone=0;mTries=0;
  updateStatus();
  const cards=[];
  PAIRS.forEach((p,i)=>{
    cards.push({t:p[0],k:'term',i});
    cards.push({t:p[1],k:'def',i});
  });
  cards.sort(()=>Math.random()-.5);
  const g=document.getElementById('matchGrid');g.innerHTML='';
  cards.forEach(c=>{
    const el=document.createElement('div');el.className='mcard';
    el.innerHTML=`<div class="mcard-inner">
      <div class="mface mfront">?</div>
      <div class="mface mback">${c.t}</div></div>`;
    el.onclick=()=>flipCard(el,c);
    g.appendChild(el);
  });
}
function updateStatus(){
  let t=`Terpasang: ${mDone} / 8 · Percobaan: ${mTries}`;
  if(mDone===8)t+=' — 🏆 Kamu menang!';
  document.getElementById('matchStatus').textContent=t;
}
function flipCard(el,c){
  if(mLock||el.classList.contains('flip')||el.classList.contains('done'))return;
  el.classList.add('flip');
  if(!mFirst){mFirst={el,c};return;}
  mTries++;updateStatus();
  if(mFirst.c.i===c.i && mFirst.c.k!==c.k){
    el.classList.add('done');mFirst.el.classList.add('done');
    mDone++;updateStatus();mFirst=null;
  }else{
    mLock=true;
    const a=mFirst.el;
    setTimeout(()=>{a.classList.remove('flip');el.classList.remove('flip');mFirst=null;mLock=false;},850);
  }
}
initMatch();
