# Istoric Auto PWA — Audi A4 B6 Avant 1.9 TDI AVF

PWA static (fără build): `index.html` + `js/` + `sw.js`. Merge direct pe Vercel.

## Funcții
- Bord: km curent, alerte ulei (10.000 km) + acte, scadențe, costuri pe an, ultimele lucrări
- Istoric filtrabil: categorie, stare (nouă / recondiționată / SH / manoperă), căutare text
- Adaugă: categorie → producători sugerați, spec (ex. 5W-40 505.01), hint "ultima oară", poză bon
- Consum: plinuri + medie L/100km din plinuri complete
- Acte: ITP / RCA / Rovinietă cu alerte 30/14 zile
- Preseturi AVF preîncărcate: ulei 10k/12l, combustibil 30k, aer 30k, polen anual, distribuție 120k/5ani, lichid frână 2ani, antigel 4ani
- Local-first: merge fără cont; cu Supabase URL+key + Login Google devine cloud (ca la pontaj)

## Rulare locală
`npx serve .` apoi deschide `http://localhost:3000`

## Deploy Vercel
Import repo → Framework: Other → fără build command. Gata, e PWA instalabil.

## Supabase
1. Rulează `supabase/schema.sql` în SQL editor
2. Auth → Providers → activează Google
3. Storage → creează bucket `receipts` pentru poze bonuri
4. În aplicație: Setări → lipește URL + anon key → Conectează → Login Google
