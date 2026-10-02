// Store v2: local-first + Supabase sync real (când e configurat + login Google)
const Store = (() => {
  const LS_KEY = 'istoric-auto-v2';
  let cloud = null, user = null, vehicleRow = null;
  let state = loadLocal();
  try{ if(state.cloudCfg&&!state.cloudCfg.url&&typeof SUPABASE_URL!=='undefined'&&SUPABASE_URL){ state.cloudCfg={url:SUPABASE_URL,key:SUPABASE_ANON_KEY}; save(); } }catch(e){}
  function loadLocal(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)) || seed(); }catch{ return seed(); } }
  function defaultCloud(){ try{ if(typeof SUPABASE_URL!=='undefined'&&SUPABASE_URL&&typeof SUPABASE_ANON_KEY!=='undefined'&&SUPABASE_ANON_KEY) return {url:SUPABASE_URL,key:SUPABASE_ANON_KEY}; }catch(e){} return {}; }
  function seed(){ return { vehicle:{name:'Audi A4 B6 Avant 1.9 TDI AVF',year:2003,vin:'',currentKm:335200}, records:[
{id:'demo1',date:'2025-11-10',km:330000,category:'Ulei + filtre',part:'Ulei 5W-40 505.01',brand:'Castrol',spec:'5W-40 505.01',condition:'noua',partCost:280,laborCost:100,place:'Service Militari',notes:'Ulei + filtre (ulei/aer/combustibil/polen)'},
{id:'demo2',date:'2025-08-15',km:325000,category:'Injecție',part:'Injectoare PD',brand:'Bosch',spec:'',condition:'reconditionata',partCost:800,laborCost:400,place:'Service Diesel',notes:'Recondiționat injectoare PD'},
{id:'demo3',date:'2025-06-02',km:322000,category:'Suspensie',part:'Arcuri + telescoape spate',brand:'Sachs',spec:'',condition:'noua',partCost:1200,laborCost:350,place:'Service Militari',notes:'Arcuri + telescoape spate'}],
fuels:[{id:'f1',date:'2026-09-28',km:335200,liters:55,total:390,full:true}], docs:[{type:'ITP',date:'2026-11-20',km:'',note:''},{type:'RCA',date:'2026-10-25',km:'',note:''}], cloudCfg:defaultCloud() }; }
  function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
  function uid(){ return Math.random().toString(36).slice(2)+Date.now().toString(36); }
  async function initCloud(){
    const cfg = state.cloudCfg||{};
    if(!(cfg.url&&cfg.key&&window.supabase)) return null;
    cloud = window.supabase.createClient(cfg.url, cfg.key);
    const {data:{session}} = await cloud.auth.getSession();
    user = session&&session.user||null;
    if(user) await pullCloud();
    cloud.auth.onAuthStateChange(async (ev,s)=>{ user=s&&s.user||null; if(user) await pullCloud(); });
    return session;
  }
  async function ensureVehicle(){
    if(!cloud||!user) return null;
    const {data} = await cloud.from('vehicles').select('*').order('created_at').limit(1).maybeSingle();
    if(data){ vehicleRow=data; return data; }
    const ins={user_id:user.id,name:state.vehicle.name,year:Number(state.vehicle.year)||null,vin:state.vehicle.vin||'',current_km:Number(state.vehicle.currentKm)||null};
    const {data:created,error}=await cloud.from('vehicles').insert(ins).select().single();
    if(!error){ vehicleRow=created; return created; }
    return null;
  }
  async function pullCloud(){
    try{
      const v=await ensureVehicle();
      if(v){ state.vehicle={name:v.name,year:v.year,vin:v.vin||'',currentKm:v.current_km||''}; }
      const vid=v&&v.id;
      if(!vid) return;
      const [r,f,d]=await Promise.all([
        cloud.from('service_records').select('*').eq('vehicle_id',vid).order('date',{ascending:false}).limit(500),
        cloud.from('fuel_entries').select('*').eq('vehicle_id',vid).order('date',{ascending:false}).limit(500),
        cloud.from('documents').select('*').eq('vehicle_id',vid).order('date',{ascending:true}).limit(100)
      ]);
      if(r.data) state.records=r.data.map(x=>({id:x.id,date:x.date,km:x.km,category:x.category,part:x.part,brand:x.brand,spec:x.spec,condition:x.condition,partCost:Number(x.part_cost),laborCost:Number(x.labor_cost),place:x.place,notes:x.notes}));
      if(f.data) state.fuels=f.data.map(x=>({id:x.id,date:x.date,km:x.km,liters:Number(x.liters),total:Number(x.total),full:x.full_tank}));
      if(d.data&&d.data.length) state.docs=d.data.map(x=>({id:x.id,type:x.type,date:x.date,km:x.km||'',note:x.note||''}));
      save();
      if(typeof renderAll==='function') renderAll();
    }catch(e){ console.warn('pullCloud',e); }
  }
  async function uploadReceipt(file){
    if(!cloud||!user||!file) return null;
    const path=user.id+'/'+Date.now()+'-'+file.name;
    const {error}=await cloud.storage.from('receipts').upload(path,file);
    if(error) return null;
    const {data}=cloud.storage.from('receipts').getPublicUrl(path);
    return data.publicUrl;
  }
  return {
    get state(){ return state; }, get user(){ return user; }, getCloud(){ return cloud; },
    save, uid, initCloud, pullCloud, uploadReceipt,
    async addRecord(r){ r.id=r.id||uid(); state.records.unshift(r); save();
      if(cloud&&user){ const v=vehicleRow||await ensureVehicle(); if(v){ await cloud.from('service_records').insert({user_id:user.id,vehicle_id:v.id,date:r.date,km:r.km,category:r.category,part:r.part||'',brand:r.brand||'',spec:r.spec||'',condition:r.condition,part_cost:r.partCost||0,labor_cost:r.laborCost||0,place:r.place||'',notes:r.notes||'',receipt_url:r.receiptUrl||''}); } } },
    async addFuel(f){ f.id=f.id||uid(); state.fuels.unshift(f); save();
      if(cloud&&user){ const v=vehicleRow||await ensureVehicle(); if(v){ await cloud.from('fuel_entries').insert({user_id:user.id,vehicle_id:v.id,date:f.date,km:f.km,liters:f.liters,total:f.total,full_tank:f.full}); } } },
    async setDocs(d){ state.docs=d; save();
      if(cloud&&user){ const v=vehicleRow||await ensureVehicle(); if(v){ await cloud.from('documents').delete().eq('vehicle_id',v.id); if(d.length) await cloud.from('documents').insert(d.map(x=>({user_id:user.id,vehicle_id:v.id,type:x.type,date:x.date||null,km:x.km?Number(x.km):null,note:x.note||''}))); } } },
    async setVehicle(v){ state.vehicle={...state.vehicle,...v}; save();
      if(cloud&&user){ const row=vehicleRow||await ensureVehicle(); if(row){ await cloud.from('vehicles').update({name:state.vehicle.name,year:Number(state.vehicle.year)||null,vin:state.vehicle.vin||'',current_km:Number(state.vehicle.currentKm)||null}).eq('id',row.id); } } },
    setCloudCfg(c){ state.cloudCfg=c; save(); },
    wipe(){ state=seed(); save(); }
  };
})();
