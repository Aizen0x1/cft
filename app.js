const $=(s,e=document)=>e.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sorted=POSTS.slice().sort((a,b)=>b.date.localeCompare(a.date));
const tally=f=>{const m={};POSTS.forEach(p=>[].concat(f(p)).forEach(v=>m[v]=(m[v]||0)+1));return m};
const cats={};(SITE.categories||[]).forEach(c=>cats[c]=0);POSTS.forEach(p=>cats[p.category]=(cats[p.category]||0)+1);
const tags=tally(p=>p.tags);
const hue=s=>[...s].reduce((a,c)=>a+c.charCodeAt(0)*7,0)%360;
const PER=5, page=document.body.dataset.page;

function nav(){
  $('#nav').innerHTML=`<div class="bar"><a class="logo" href="index.html">${esc(SITE.name)}'s blog</a>
  <div class="links"><button id="sb">Search</button><a href="index.html#list">Writeups</a><a href="index.html#about">whoami</a>
  <div class="dd"><button>Categories &#9662;</button><div class="menu">${Object.keys(cats).map(c=>`<a href="index.html#cat=${encodeURIComponent(c)}">${esc(c)}</a>`).join('')}</div></div>
  <div class="dd"><button>Links &#9662;</button><div class="menu">${SITE.socials.map(([n,u])=>`<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join('')}</div></div></div></div>
  <div id="so" hidden><input id="sq" placeholder="Search title, tag or category" aria-label="Search"><div id="sr"></div></div>`;
  $('#sb').onclick=()=>{const o=$('#so');o.hidden=!o.hidden;if(!o.hidden)$('#sq').focus()};
  $('#sq').oninput=e=>{const q=e.target.value.toLowerCase().trim();
    $('#sr').innerHTML=!q?'':(sorted.filter(p=>(p.title+p.category+p.tags.join(' ')+p.excerpt).toLowerCase().includes(q))
      .map(p=>`<a href="writeup.html?file=${p.file}">${esc(p.title)}</a>`).join('')||'<a>No matches</a>')};
}

function card(p){
  const t=esc(p.title.split('|')[0].trim());
  return `<a class="post" href="writeup.html?file=${p.file}"><div class="thumb">${p.cover?`<img src="${esc(p.cover)}" alt="">`:`<span>${t}</span>`}</div>
  <div class="pb"><h3>${esc(p.title)}</h3><div class="meta">Created ${p.date} &bull; ${esc(p.category)}</div>
  <div class="tl">${p.tags.map(x=>`<span># ${esc(x)}</span>`).join('')}</div>
  <div class="row"><span class="diff d-${p.difficulty.toLowerCase()}">${esc(p.difficulty)}</span><span>${esc(p.category)}</span><span>${esc(p.os)}</span></div>
  <p>${esc(p.excerpt)}</p></div></a>`;
}

function side(){
  const gh=SITE.socials[0][1];
  $('#side').innerHTML=`
  <div class="card prof"><div class="av"><img src="avatar.png" alt="" onerror="this.parentNode.textContent='${esc(SITE.name[0])}'"></div>
    <h2>${esc(SITE.name)}</h2><p class="mut">${esc(SITE.tagline)}</p>
    <div class="stats"><div>Articles<b>${POSTS.length}</b></div><div>Tags<b>${Object.keys(tags).length}</b></div><div>Categories<b>${Object.keys(cats).length}</b></div></div>
    <div class="soc">${SITE.socials.map(([n,u])=>`<a href="${u}" target="_blank" rel="noopener" title="${n}">${n.slice(0,2)}</a>`).join('')}</div></div>
  <div class="card"><h4>Announcement</h4><p class="mut">${esc(SITE.announce)}</p></div>
  <div class="card"><h4>Recent Posts</h4>${sorted.slice(0,5).map(p=>`<a class="rp" href="writeup.html?file=${p.file}">${esc(p.title)}<small>${p.date}</small></a>`).join('')}</div>
  <div class="card"><h4>Categories</h4>${Object.entries(cats).map(([c,n])=>`<a class="li" href="#cat=${encodeURIComponent(c)}">${esc(c)}<b>${n}</b></a>`).join('')}</div>
  <div class="card"><h4>Tags</h4><div class="cloud">${Object.keys(tags).map(t=>`<a href="#tag=${encodeURIComponent(t)}" style="color:hsl(${hue(t)} 70% 68%)">${esc(t)}</a>`).join('')}</div></div>`;
}

function render(){
  const h=new URLSearchParams(location.hash.slice(1));
  let l=sorted;
  if(h.get('cat'))l=l.filter(p=>p.category==h.get('cat'));
  if(h.get('tag'))l=l.filter(p=>p.tags.includes(h.get('tag')));
  if(h.get('arch'))l=l.filter(p=>p.date.startsWith(h.get('arch')));
  const filt=['cat','tag','arch'].map(k=>h.get(k)).find(Boolean);
  const pg=Math.max(1,+h.get('page')||1), pages=Math.ceil(l.length/PER)||1;
  const base=['cat','tag','arch'].filter(k=>h.get(k)).map(k=>`${k}=${encodeURIComponent(h.get(k))}&`).join('');
  $('#feed').innerHTML=`
  <div class="card intro"><small>BLOG INDEX</small><h1>${filt?'Filtered: '+esc(filt):'See my blog index.'}</h1><p class="mut">${esc(SITE.intro)}</p>
    <div class="btns"><a class="btn" href="#list">Explore writeups &rarr;</a><a class="btn" href="#about">About ${esc(SITE.name)}</a>${filt?'<a class="btn" href="#list">Clear filter</a>':''}</div></div>
  <div class="card" id="about" ${location.hash=='#about'?'':'hidden'}><h4>whoami</h4><p class="mut">${esc(SITE.about)}</p>
    <div class="handles">${SITE.socials.map(([n,u])=>`<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join('')}</div></div>
  <div id="list">${l.slice((pg-1)*PER,pg*PER).map(card).join('')||'<div class="card mut">No writeups here yet.</div>'}</div>
  <div class="pager">${Array.from({length:pages},(_,i)=>`<a class="${i+1==pg?'on':''}" href="#${base}page=${i+1}">${i+1}</a>`).join('')}</div>`;
  const t=location.hash=='#about'?'#about':(location.hash=='#list'||location.hash.includes('=')?'#list':null);
  if(t)$(t).scrollIntoView();
}

function hero(){
  const c=$('#cv'),x=c.getContext('2d'),red=matchMedia('(prefers-reduced-motion:reduce)').matches;let w,hh,pts;
  const rs=()=>{w=c.width=innerWidth;hh=c.height=c.parentNode.offsetHeight;pts=Array.from({length:Math.min(90,w/14|0)},()=>({x:Math.random()*w,y:Math.random()*hh,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3}))};
  rs();addEventListener('resize',rs);
  (function f(){x.clearRect(0,0,w,hh);pts.forEach((p,i)=>{if(!red){p.x=(p.x+p.vx+w)%w;p.y=(p.y+p.vy+hh)%hh}
    x.fillStyle='rgba(138,180,255,.55)';x.fillRect(p.x,p.y,2,2);
    for(let j=i+1;j<pts.length;j++){const q=pts[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<110){x.strokeStyle=`rgba(138,180,255,${.18*(1-d/110)})`;x.beginPath();x.moveTo(p.x,p.y);x.lineTo(q.x,q.y);x.stroke()}}});
    if(!red)requestAnimationFrame(f)})();
  if(red){$('#ty').textContent=SITE.typed[0];return}
  let wi=0,ci=0,del=0;
  (function t(){const s=SITE.typed[wi];ci+=del?-1:1;$('#ty').textContent=s.slice(0,ci);let d=del?40:90;
    if(!del&&ci==s.length){del=1;d=1400}else if(del&&ci==0){del=0;wi=(wi+1)%SITE.typed.length;d=400}setTimeout(t,d)})();
}

nav();
if(page=='home'){
  document.title=SITE.name+"'s blog";
  $('#hero-t').textContent=SITE.name+"'s blog";
  hero();side();render();addEventListener('hashchange',render);
}else{
  (async()=>{
    const el=$('#content'),file=new URLSearchParams(location.search).get('file');
    if(!file||file.includes('..')||!file.endsWith('.md')){el.textContent='No writeup selected.';return}
    try{
      const url=new URL(file,location.href),r=await fetch(url);if(!r.ok)throw 0;
      el.innerHTML=marked.parse(await r.text());
      el.querySelectorAll('img').forEach(i=>i.src=new URL(i.getAttribute('src'),url).href);
      el.querySelectorAll('pre code').forEach(b=>hljs.highlightElement(b));
      const t=el.querySelector('h1');if(t)document.title=t.textContent+' | '+SITE.name;
    }catch(e){el.textContent='Could not load '+file+'. Check the path in posts.js.'}
  })();
}
