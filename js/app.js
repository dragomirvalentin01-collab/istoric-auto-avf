const $ = s => document.querySelector(s);
const toast = m => { const t=$('#toast'); t.textContent=m; t.style.display='block'; setTimeout(()=>t.style.display='none',2200); };
const fmtD = d => d?new Date(d+'T12:00:00').toLocaleDateString('ro-RO'):'—';
const selFilters = () => [...document.querySelectorAll('#filterChips .chip.active')].map(c=>c.dataset.v);
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#tab-'+b.dataset.tab).classList.add('active');});
$('#filterChips').addEventListener('click',e=>{const b=e.target.closest('.chip');if(b)b.classList.toggle('active');});
function renderAll(){
  const s=Store.state;
  $('#kmBadge').textContent=s.vehicle.currentKm?Number(s.vehicle.currentKm).toLocaleString('ro-RO')+' km':'— km';
  $('#currentKm').value=s.vehicle.currentKm||''; $('#vehicleSubtitle').textContent=s.vehicle.name||''; $('#sName').value=s.vehicle.name||'';
  const u=Store.user;
  $('#authBtn').textContent=u?('✔ '+(u.email||'Conectat')):'Login Google';
  $('#cloudStatus').textContent=u?('Sincronizat ca '+(u.email||'')):'Local — apasă Login Google pentru sincronizare.';
  renderStatus(); renderHistory(); renderNotes();
}
function renderStatus(){
  const s=Store.state, cur=Number(s.vehicle.currentKm)||0, last=s.oils[0];
  if(!last){ $('#oilStatus').innerHTML='<div class="item warn">Adaugă primul schimb de ulei ca să pornească calculul.</div>'; $('#recentNotes').innerHTML='<p class="muted">Nicio notiță.</p>'; return; }
  const nextKm=Number(last.km)+OIL_INTERVAL_KM, d=new Date(last.date); d.setMonth(d.getMonth()+OIL_INTERVAL_LUNI);
  let cls='',txt='';
  if(cur){ const ram=nextKm-cur;
    if(ram<=0){cls='bad';txt=`Schimb ulei DEPĂȘIT cu ${(-ram).toLocaleString('ro-RO')} km (ultimul la ${Number(last.km).toLocaleString('ro-RO')} km, ${fmtD(last.date)})`;}
    else if(ram<=1000){cls='warn';txt=`Mai ai ${ram.toLocaleString('ro-RO')} km până la schimb (la ${nextKm.toLocaleString('ro-RO')} km sau ${d.toLocaleDateString('ro-RO')})`;}
    else{txt=`Ulei OK — următorul la ${nextKm.toLocaleString('ro-RO')} km sau ${d.toLocaleDateString('ro-RO')} (mai ai ${ram.toLocaleString('ro-RO')} km)`;}
  } else txt=`Ultimul schimb: ${fmtD(last.date)} @ ${Number(last.km).toLocaleString('ro-RO')} km → următorul la ${nextKm.toLocaleString('ro-RO')} km`;
  $('#oilStatus').innerHTML=`<div class="item ${cls}"><b>${last.brand||'Ulei'} ${last.spec||''}</b><br><span class="meta">Filtre: ${(last.filters||[]).join(', ')||'—'} • ${(last.partCost||0)+(last.laborCost||0)} lei • ${last.place||'—'}</span><br>${txt}</div>`;
  $('#recentNotes').innerHTML=Store.state.notes.slice(0,3).map(noteHTML).join('')||'<p class="muted">Nicio notiță.</p>';
}
function renderHistory(){
  $('#historyList').innerHTML=Store.state.oils.map(o=>`<div class="item"><b>${o.brand||'Ulei'} ${o.spec||''}</b> <span class="meta">${fmtD(o.date)} @ ${Number(o.km).toLocaleString('ro-RO')} km</span><br><span class="meta">Filtre: ${(o.filters||[]).join(', ')||'—'} • ${(o.partCost||0)+(o.laborCost||0)} lei • ${o.place||'—'}</span>${o.notes?`<br><small>${o.notes}</small>`:''}<br><button class="btn small" onclick="delOil('${o.id}')">Șterge</button></div>`).join('')||'<p class="muted">Niciun schimb încă.</p>';
}
function noteHTML(n){ return `<div class="item"><b>${n.title}</b> <span class="meta">${fmtD(n.date)}${n.km?' @ '+Number(n.km).toLocaleString('ro-RO')+' km':''}</span>${n.body?`<br><small>${n.body}</small>`:''}<br><button class="btn small" onclick="delNote('${n.id}')">Șterge</button></div>`; }
function renderNotes(){
  const q=($('#searchNotes').value||'').toLowerCase();
  let list=[...Store.state.notes]; if(q) list=list.filter(n=>(n.title+' '+n.body).toLowerCase().includes(q));
  $('#notesList').innerHTML=list.map(noteHTML).join('')||'<p class="muted">Nicio notiță.</p>';
}
window.delOil=async id=>{ if(confirm('Ștergi înregistrarea?')){ await Store.delOil(id); renderAll(); } };
window.delNote=async id=>{ if(confirm('Ștergi notița?')){ await Store.delNote(id); renderAll(); } };
$('#oilForm').onsubmit=async e=>{ e.preventDefault();
  const o={date:$('#oDate').value,km:Number($('#oKm').value),brand:$('#oBrand').value,spec:$('#oSpec').value,filters:selFilters(),partCost:Number($('#oPartCost').value)||0,laborCost:Number($('#oLaborCost').value)||0,place:$('#oPlace').value,notes:$('#oNotes').value};
  if(!o.date||!o.km){toast('Completează data și km');return;}
  await Store.addOil(o); e.target.reset(); $('#oDate').value=new Date().toISOString().slice(0,10); renderAll(); toast('Salvat ✔'); document.querySelector('[data-tab="history"]').click();
};
$('#noteForm').onsubmit=async e=>{ e.preventDefault();
  await Store.addNote({date:$('#nDate').value,km:$('#nKm').value,title:$('#nTitle').value,body:$('#nBody').value});
  e.target.reset(); $('#nDate').value=new Date().toISOString().slice(0,10); renderAll(); toast('Notiță salvată ✔');
};
$('#saveKm').onclick=async()=>{ await Store.setVehicle({currentKm:Number($('#currentKm').value)||''}); renderAll(); toast('KM actualizat'); };
$('#saveVehicle').onclick=async()=>{ await Store.setVehicle({name:$('#sName').value}); renderAll(); toast('Salvat'); };
$('#wipeLocal').onclick=()=>{ if(confirm('Sigur ștergi tot local?')){ Store.wipe(); renderAll(); } };
$('#searchNotes').oninput=renderNotes;
$('#authBtn').onclick=async()=>{ const c=Store.getCloud(); if(!c){ await Store.initCloud(); } const cc=Store.getCloud(); if(cc){ const {error}=await cc.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href}}); if(error) toast(error.message); } };
(function init(){ $('#oBrand').innerHTML=OIL_BRANDS.map(b=>`<option>${b}</option>`).join(''); $('#oSpec').innerHTML=OIL_SPECS.map(b=>`<option>${b}</option>`).join(''); const t=new Date().toISOString().slice(0,10); $('#oDate').value=t; $('#nDate').value=t; renderAll(); Store.initCloud().then(()=>renderAll()); })();
