// Store: localStorage by default, Supabase when configured. Same shape.
const Store = (() => {
  const LS_KEY = 'istoric-auto-v2';
  let cloud = null; // supabase client
  let state = loadLocal();
  function loadLocal(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)) || seed(); }catch{ return seed(); } }
  function seed(){ return { vehicle:{name:'Audi A4 B6 Avant 1.9 TDI AVF',year:2003,vin:'',currentKm:335200}, records:[
{id:'demo1',date:'2025-11-10',km:330000,category:'Ulei + filtre',part:'Ulei 5W-40 505.01',brand:'Castrol',spec:'5W-40 505.01',condition:'noua',partCost:280,laborCost:100,place:'Service Militari',notes:'Ulei + filtre (ulei/aer/combustibil/polen)'},
{id:'demo2',date:'2025-08-15',km:325000,category:'Injecție',part:'Injectoare PD',brand:'Bosch',spec:'',condition:'reconditionata',partCost:800,laborCost:400,place:'Service Diesel',notes:'Recondiționat injectoare PD, curățat EGR'},
{id:'demo3',date:'2025-06-02',km:322000,category:'Suspensie',part:'Arcuri + telescoape spate',brand:'Sachs',spec:'',condition:'noua',partCost:1200,laborCost:350,place:'Service Militari',notes:'Arcuri + telescoape spate, bielete antiruliu'},
{id:'demo4',date:'2024-12-01',km:310000,category:'Distribuție',part:'Kit distribuție',brand:'INA',spec:'',condition:'noua',partCost:950,laborCost:600,place:'Service Militari',notes:'Kit distribuție + pompă apă + termostat'}
], fuels:[
{id:'f1',date:'2026-09-28',km:335200,liters:55,total:390,full:true},
{id:'f2',date:'2026-09-15',km:334300,liters:52,total:370,full:true}
], docs:[{type:'ITP',date:'2026-11-20',km:'',note:''},{type:'RCA',date:'2026-10-25',km:'',note:''},{type:'Rovinietă',date:'2026-12-31',km:'',note:''}], cloudCfg:{} }; }
  function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
  function uid(){ return Math.random().toString(36).slice(2)+Date.now().toString(36); }
  async function initCloud(){
    const cfg = state.cloudCfg||{};
    if(cfg.url && cfg.key && window.supabase){
      cloud = window.supabase.createClient(cfg.url, cfg.key);
      const {data:{session}} = await cloud.auth.getSession();
      return session;
    }
    return null;
  }
  // For now cloud sync = optional pull/push of whole tables; local remains source for offline demo.
  return {
    get state(){ return state; },
    save, uid,
    addRecord(r){ r.id=uid(); state.records.unshift(r); save(); },
    addFuel(f){ f.id=uid(); state.fuels.unshift(f); save(); },
    setDocs(d){ state.docs=d; save(); },
    setVehicle(v){ state.vehicle={...state.vehicle,...v}; save(); },
    setCloudCfg(c){ state.cloudCfg=c; save(); },
    wipe(){ state=seed(); save(); },
    getCloud(){ return cloud; },
    initCloud
  };
})();
