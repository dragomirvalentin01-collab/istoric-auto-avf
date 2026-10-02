const $ = s => document.querySelector(s);
const toast = m => { const t=$('#toast'); t.textContent=m; t.style.display='block'; setTimeout(()=>t.style.display='none',2200); };
let condVal='noua';

// Tabs
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#tab-'+b.dataset.tab).classList.add('active');});
$('#condChips').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;document.querySelectorAll('#condChips .chip').forEach(x=>x.classList.remove('active'));b.classList.add('active');condVal=b.dataset.v;});

function fmtDate(d){ if(!d) return '—'; return new Date(d+'T12:00:00').toLocaleDateString('ro-RO'); }
function monthsDiff(a,b){ return (new Date(b)-new Date(a))/(1000*3600*24*30.44); }

// Init form selects
function initForm(){
  const cats=Object.keys(CATEGORIES);
  $('#fCat').innerHTML=cats.map(c=>`<option>${c}</option>`).join('');
  $('#filterCat').innerHTML='<option value="">Toate categoriile</option>'+cats.map(c=>`<option>${c}</option>`).join('');
  const upd=()=>{
    const c=CATEGORIES[$('#fCat').value]||{brands:[],parts:[],specs:[]};
    $('#fBrand').innerHTML='<option value="">— alege —</option>'+c.brands.map(b=>`<option>${b}</option>`).join('')+'<option>Altul…</option>';
    $('#partSuggestions').innerHTML=c.parts.map(p=>`<option value="${p}">`).join('');
    $('#specSuggestions').innerHTML=(c.specs||[]).map(p=>`<option value="${p}">`).join('');
    const last=[...Store.state.records].find(r=>r.category===$('#fCat').value);
    $('#lastUsedHint').textContent=last?`Ultima oară: ${last.brand||'—'} ${last.part||''} ${last.spec||''} • ${fmtDate(last.date)} @ ${last.km} km`:'Nicio înregistrare pe categoria asta încă.';
  };
  $('#fCat').onchange=upd; upd();
  $('#fDate').value=new Date().toISOString().slice(0,10);
  $('#fuDate').value=new Date().toISOString().slice(0,10);
}
function totalOf(r){ return (Number(r.partCost)||0)+(Number(r.laborCost)||0); }
function condLabel(c){ return {noua:'Nouă',reconditionata:'Recondiționată',sh:'Second-hand',manopera:'Manoperă'}[c]||c; }

function renderAll(){
  const s=Store.state;
  $('#kmBadge').textContent=s.vehicle.currentKm?Number(s.vehicle.currentKm).toLocaleString('ro-RO')+' km':'— km';
  $('#currentKm').value=s.vehicle.currentKm||'';
  $('#vehicleSubtitle').textContent=s.vehicle.name||'';
  $('#sName').value=s.vehicle.name||''; $('#sYear').value=s.vehicle.year||''; $('#sVin').value=s.vehicle.vin||'';
  $('#sUrl').value=(s.cloudCfg&&s.cloudCfg.url)||''; $('#sKey').value=(s.cloudCfg&&s.cloudCfg.key)||'';
  renderDashboard(); renderHistory(); renderFuel(); renderDocs(); renderPresets();
}

function lastByCat(cat){ return [...Store.state.records].filter(r=>r.category===cat).sort((a,b)=>b.date.localeCompare(a.date))[0]; }

function renderDashboard(){
  const s=Store.state, cur=Number(s.vehicle.currentKm)||0;
  // alerte
  let alerts=[];
  const oil=lastByCat('Ulei + filtre');
  if(oil&&cur){ const parcurs=cur-Number(oil.km); const ramas=10000-parcurs;
    if(ramas<=0) alerts.push({cls:'bad',t:`Schimb ulei DEPĂȘIT cu ${-ramas} km (ultimul la ${oil.km} km)`});
    else if(ramas<=1000) alerts.push({cls:'warn',t:`Ulei: mai ai ${ramas} km (schimb la ${Number(oil.km)+10000} km)`});
  } else if(!oil) alerts.push({cls:'warn',t:'Adaugă primul schimb de ulei ca să pornească calculul.'});
  // acte
  s.docs.forEach(d=>{ if(!d.date) return; const zile=Math.round((new Date(d.date)-new Date())/86400000);
    if(zile<0) alerts.push({cls:'bad',t:`${d.type} EXPIRAT din ${fmtDate(d.date)}`});
    else if(zile<=30) alerts.push({cls:'warn',t:`${d.type} expiră în ${zile} zile (${fmtDate(d.date)})`}); });
  $('#alerts').innerHTML=alerts.map(a=>`<div class="item ${a.cls}">${a.t}</div>`).join('')||'<div class="item">Totul e la zi. 🎉</div>';

  // upcoming din preseturi
  const up=[];
  Object.entries(CATEGORIES).forEach(([cat,p])=>{ const last=lastByCat(cat); if(!last) return;
    if(p.intervalKm&&cur) up.push({cat,txt:`${cat}: următorul la ${Number(last.km)+p.intervalKm} km`,km:Number(last.km)+p.intervalKm-cur});
    if(p.intervalLuni){ const d=new Date(last.date); d.setMonth(d.getMonth()+p.intervalLuni); up.push({cat,txt:`${cat}: următorul în ${d.toLocaleDateString('ro-RO')}`,km:null}); }
  });
  s.docs.forEach(d=>up.push({cat:d.type,txt:`${d.type}: expiră ${fmtDate(d.date)}`,km:null}));
  $('#upcoming').innerHTML=up.slice(0,6).map(u=>`<div class="item">${u.txt}</div>`).join('')||'<div class="item">Nicio scadență calculată încă.</div>';

  const y=new Date().getFullYear();
  const tot=s.records.filter(r=>r.date&&r.date.startsWith(String(y))).reduce((a,r)=>a+totalOf(r),0)
    + s.fuels.filter(f=>f.date&&f.date.startsWith(String(y))).reduce((a,f)=>a+Number(f.total||0),0);
  $('#totalCostYear').textContent=tot.toLocaleString('ro-RO')+' lei';
  $('#recentList').innerHTML=s.records.slice(0,5).map(recordHTML).join('')||'<p class="muted">Nicio lucrare încă. Apasă + Adaugă.</p>';
}
function recordHTML(r){
  return `<div class="item"><b>${r.part||r.category}</b> <span class="meta">• ${r.category} • ${r.brand||''} ${r.spec||''}</span><br><span class="meta">${fmtDate(r.date)} @ ${Number(r.km).toLocaleString('ro-RO')} km • ${condLabel(r.condition)} • ${totalOf(r)} lei (${r.partCost||0}+${r.laborCost||0} manoperă) • ${r.place||'—'}</span>${r.notes?`<br><small>${r.notes}</small>`:''}</div>`;
}
function renderHistory(){
  const q=($('#searchHistory').value||'').toLowerCase(), fc=$('#filterCat').value, fcond=$('#filterCondition').value;
  let list=[...Store.state.records];
  if(fc) list=list.filter(r=>r.category===fc);
  if(fcond) list=list.filter(r=>r.condition===fcond);
  if(q) list=list.filter(r=>JSON.stringify(r).toLowerCase().includes(q));
  $('#historyList').innerHTML=list.map(recordHTML).join('')||'<p class="muted">Nimic găsit.</p>';
}
function renderFuel(){
  const fl=[...Store.state.fuels].sort((a,b)=>b.date.localeCompare(a.date)||b.km-a.km);
  // medie: doar plinuri complete consecutive
  const fulls=fl.filter(f=>f.full).sort((a,b)=>a.km-b.km);
  let avg='—';
  if(fulls.length>=2){ const l=fulls[fulls.length-1], p=fulls[fulls.length-2]; const c=(Number(l.liters)/(Number(l.km)-Number(p.km))*100); if(isFinite(c)&&c>0&&c<30) avg=c.toFixed(1)+' L/100km'; }
  $('#avgCons').textContent=avg;
  $('#fuelList').innerHTML=fl.map(f=>`<div class="item"><b>${Number(f.liters)} L</b> • ${Number(f.total)} lei <span class="meta">${fmtDate(f.date)} @ ${f.km} km ${f.full?'• plin':'• parțial'}</span></div>`).join('')||'<p class="muted">Niciun plin încă.</p>';
}
function renderDocs(){
  $('#docsList').innerHTML=Store.state.docs.map((d,i)=>`<div class="item"><b>${d.type}</b> <span class="meta">expiră ${fmtDate(d.date)} ${d.km?'@ '+d.km+' km':''} ${d.note||''}</span></div>`).join('')||'<p class="muted">Adaugă ITP / RCA / Rovinietă.</p>';
}
function renderPresets(){
  $('#presetsList').innerHTML=Object.entries(CATEGORIES).map(([k,p])=>`<div class="item"><b>${k}</b><br><span class="meta">${p.intervalKm?p.intervalKm.toLocaleString('ro-RO')+' km':"—"} ${p.intervalLuni?'/ '+p.intervalLuni+' luni':''}</span></div>`).join('');
}

//Events
$('#recordForm').onsubmit=e=>{e.preventDefault();
  const r={date:$('#fDate').value,km:Number($('#fKm').value),category:$('#fCat').value,part:$('#fPart').value,brand:$('#fBrand').value,spec:$('#fSpec').value,condition:condVal,partCost:Number($('#fPartCost').value)||0,laborCost:Number($('#fLaborCost').value)||0,place:$('#fPlace').value,notes:$('#fNotes').value};
  if(!r.date||!r.km){toast('Completează data și km');return;}
  Store.addRecord(r); e.target.reset(); $('#fDate').value=new Date().toISOString().slice(0,10); renderAll(); toast('Salvat ✔');
  document.querySelector('[data-tab="history"]').click();
};
$('#fuelForm').onsubmit=e=>{e.preventDefault();
  Store.addFuel({date:$('#fuDate').value,km:Number($('#fuKm').value),liters:Number($('#fuLiters').value),total:Number($('#fuTotal').value),full:$('#fuFull').checked});
  e.target.reset(); $('#fuDate').value=new Date().toISOString().slice(0,10); $('#fuFull').checked=true; renderAll(); toast('Plin salvat ✔');
};
$('#saveKm').onclick=()=>{Store.setVehicle({currentKm:Number($('#currentKm').value)||''});renderAll();toast('KM actualizat');};
$('#saveVehicle').onclick=()=>{Store.setVehicle({name:$('#sName').value,year:$('#sYear').value,vin:$('#sVin').value});renderAll();toast('Mașină salvată');};
$('#addDoc').onclick=()=>{const d=[...Store.state.docs].filter(x=>x.type!==$('#dType').value);d.unshift({type:$('#dType').value,date:$('#dDate').value,km:$('#dKm').value,note:$('#dNote').value});Store.setDocs(d);renderAll();toast('Act salvat');};
$('#saveCloud').onclick=async()=>{Store.setCloudCfg({url:$('#sUrl').value.trim(),key:$('#sKey').value.trim()});await Store.initCloud();toast(Store.getCloud()?'Conectat la cloud ✔':'Salvat local (verifică cheile)');renderAll();};
$('#wipeLocal').onclick=()=>{if(confirm('Sigur ștergi tot local?')){Store.wipe();renderAll();}};
$('#searchHistory').oninput=renderHistory;$('#filterCat').onchange=renderHistory;$('#filterCondition').onchange=renderHistory;
// Auth Google
$('#authBtn').onclick=async()=>{
  const c=Store.getCloud();
  if(!c){toast('Setează mai întâi Supabase în Setări');document.querySelector('[data-tab="settings"]').click();return;}
  const {error}=await c.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href}});
  if(error) toast(error.message);
};
(async()=>{initForm();renderAll();const s=await Store.initCloud();if(s){$('#authBtn').textContent='✔ '+((s.user&&s.user.email)||'Conectat');}})();
