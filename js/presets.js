// Preseturi motor AVF 1.9 TDI PD 131CP + liste producatori
const CATEGORIES = {
  "Ulei + filtre": { intervalKm: 10000, intervalLuni: 12, brands: ["Castrol","Motul","Liqui Moly","Mobil","Shell","Total","Elf","Valvoline","Ravenol","Mann","Mahle","Bosch","Febi"], parts: ["Ulei 5W-40 505.01","Filtru ulei","Filtru aer","Filtru combustibil","Filtru polen"], specs: ["5W-40 505.01","5W-30 505.01","0W-30 506.01"] },
  "Distribuție": { intervalKm: 120000, intervalLuni: 60, brands: ["INA","Contitech","Gates","SKF","Dayco","Febi"], parts: ["Kit distribuție","Pompă apă","Rolă întinzătoare","Curea accesorii","Termostat"], specs: [] },
  "Injecție": { intervalKm: null, intervalLuni: null, brands: ["Bosch","Siemens VDO","Febi","Bosio"], parts: ["Injectoare PD","Pompă tandem","Senzor ax came","Fascicul injectoare"], specs: [] },
  "Suspensie": { intervalKm: null, intervalLuni: null, brands: ["Sachs","Bilstein","Lemförder","Febi","Meyle","TRW","SKF"], parts: ["Arcuri față/spate","Telescoape față/spate","Brațe multilink","Bucșe","Bielete antiruliu","Flanșe amortizor"], specs: [] },
  "Frâne": { intervalKm: null, intervalLuni: 24, brands: ["Brembo","TRW","ATE","Bosch","Textar","Febi"], parts: ["Plăcuțe față/spate","Discuri față/spate","Lichid frână DOT4","Etrier","Furtun frână"], specs: ["DOT4"] },
  "Anvelope": { intervalKm: null, intervalLuni: 6, brands: ["Michelin","Continental","Bridgestone","Hankook","Nokian","Goodyear","Pirelli"], parts: ["Anvelope vară","Anvelope iarnă","All-season","Jante","Echilibrat + geometrie"], specs: ["205/55 R16","215/55 R16"] },
  "Electric": { intervalKm: null, intervalLuni: null, brands: ["Varta","Bosch","Exide","Banner"], parts: ["Baterie","Alternator","Electromotor","Bujii incandescente"], specs: ["74Ah 680A","80Ah"] },
  "Transmisie": { intervalKm: null, intervalLuni: null, brands: ["Sachs","Luk","Febi","SKF"], parts: ["Kit ambreiaj","Volantă masă dublă","Planetară","Ulei cutie"], specs: ["75W-90"] },
  "Răcire": { intervalKm: null, intervalLuni: 48, brands: ["Behr","Febi","Gates","INA"], parts: ["Antigel G12/G13","Radiator","Vâsco-cuplaj","Pompa apă"], specs: ["G12+","G13"] },
  "Evacuare": { intervalKm: null, intervalLuni: null, brands: ["Bosal","Walker","Febi"], parts: ["Tobă finală/intermediară","EGR","Debimetru"], specs: [] },
  "ITP / Acte": { intervalKm: null, intervalLuni: 12, brands: [], parts: ["ITP","RCA","Rovinietă"], specs: [] },
  "Altele": { intervalKm: null, intervalLuni: null, brands: [], parts: [], specs: [] }
};
const DOC_PRESETS = [{type:"ITP",luni:12,alertaZile:30},{type:"RCA",luni:12,alertaZile:30},{type:"Rovinietă",luni:12,alertaZile:14}];
