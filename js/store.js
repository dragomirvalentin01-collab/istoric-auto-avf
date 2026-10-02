// Ulei + Filtre + Notite: local-first + sync Supabase (proiect pontaj4)
const Store = (() => {
  const LS_KEY = 'ulei-filtre-v1';
  let cloud = null, user = null, vehicleRow = null;
  let state = loadLocal();
  function loadLocal(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)) || seed(); }catch{ return seed(); } }
  function seed(){ return { vehicle:{name:'Audi A4 B6 Avant 1.9 TDI AVF',currentKm:''}, oils:[], notes:[] }; }
  function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
  function uid(){ return Math.random().toString(36).slice(2)+Date.now().toString(36); }
  function cfg(){ try{ if(typeof SUPABASE_URL!=='undefined'&&SUPABASE_URL) return {url:SUPABASE_URL,key:SUPABASE_ANON_KEY}; }catch(e){} return null; }
  async function initCloud(){
    const c=cfg(); if(!(c&&window.supabase)) return null;
    cloud = window.supabase.createClient(c.url, c.key);
    const {data:{session}} = await cloud.auth.getSession();
    user = session&&session.user||null;
    if(user) await pullCloud();
    cloud.auth.onAuthStateChange(async (ev,s)=>{ user=s&&s.user||null; if(user) await pullCloud(); if(typeof renderAll==='function') renderAll(); });
    return session;
  }
  async function ensureVehicle(){
    if(!cloud||!user) return null;
    const {data} = await cloud.from('vehicles').select('*').order('created_at').limit(1).maybeSingle();
    if(data){ vehicleRow=data; return data; }
    const {data:created,error}=await cloud.from('vehicles').insert({user_id:user.id,name:state.vehicle.name,current_km:Number(state.vehicle.currentKm)||null}).select().single();
    if(!error){ vehicleRow=created; return created; }
    return null;
  }
  async function pullCloud(){
    try{
      const v=await ensureVehicle(); if(!v) return;
      if(v){ state.vehicle={name:v.name||state.vehicle.name,currentKm:v.current_km||state.vehicle.currentKm}; }
      const [o,n]=await Promise.all([
        cloud.from('oil_changes').select('*').eq('vehicle_id',v.id).order('date',{ascending:false}).limit(500),
        cloud.from('notes').select('*').eq('vehicle_id',v.id).order('date',{ascending:false}).limit(500)
      ]);
      if(o.data&&o.data.length||n.data){ /* cloud e sursa */ }
      if(o.data) state.oils=o.data.map(x=>({id:x.id,date:x.date,km:x.km,brand:x.brand,spec:x.spec,filters:x.filters||[],partCost:Number(x.part_cost)||0,laborCost:Number(x.labor_cost)||0,place:x.place||'',notes:x.notes||''}));
      if(n.data) state.notes=n.data.map(x=>({id:x.id,date:x.date,km:x.km||'',title:x.title,body:x.body||''}));
      save(); if(typeof renderAll==='function') renderAll();
    }catch(e){ console.warn('pull',e); }
  }
  return {
    get state(){ return state; }, get user(){ return user; }, getCloud(){ return cloud; },
    save, initCloud,
    async addOil(o){ o.id=o.id||uid(); state.oils.unshift(o); state.oils.sort((a,b)=>b.date.localeCompare(a.date)); save();
      if(cloud&&user){ const v=vehicleRow||await ensureVehicle(); if(v) await cloud.from('oil_changes').insert({user_id:user.id,vehicle_id:v.id,date:o.date,km:o.km,brand:o.brand||'',spec:o.spec||'',filters:o.filters||[],part_cost:o.partCost||0,labor_cost:o.laborCost||0,place:o.place||'',notes:o.notes||''}); } },
    async delOil(id){ state.oils=state.oils.filter(x=>x.id!==id); save();
      if(cloud&&user&&!String(id).startsWith('demo')) await cloud.from('oil_changes').delete().eq('id',id); },
    async addNote(n){ n.id=n.id||uid(); state.notes.unshift(n); state.notes.sort((a,b)=>b.date.localeCompare(a.date)); save();
      if(cloud&&user){ const v=vehicleRow||await ensureVehicle(); if(v) await cloud.from('notes').insert({user_id:user.id,vehicle_id:v.id,date:n.date,km:n.km?Number(n.km):null,title:n.title,body:n.body||''}); } },
    async delNote(id){ state.notes=state.notes.filter(x=>x.id!==id); save();
      if(cloud&&user) await cloud.from('notes').delete().eq('id',id); },
    async setVehicle(v){ state.vehicle={...state.vehicle,...v}; save();
      if(cloud&&user){ const row=vehicleRow||await ensureVehicle(); if(row) await cloud.from('vehicles').update({name:state.vehicle.name,current_km:Number(state.vehicle.currentKm)||null}).eq('id',row.id); } },
    wipe(){ state=seed(); save(); }
  };
})();
