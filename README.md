# Istoric Auto PWA — Audi A4 B6 Avant 1.9 TDI AVF

Live: https://dragomirvalentin01-collab.github.io/istoric-auto-avf/
Repo: https://github.com/dragomirvalentin01-collab/istoric-auto-avf

PWA static, fără build. Aceeași rețetă ca la pontaj: GitHub + Vercel + Supabase + Login Google.

## Ce știe
- Bord: km curent, alertă ulei (10.000 km / 12 luni), acte, scadențe, costuri pe an
- Istoric filtrabil: categorie, stare (nouă / recondiționată / SH / manoperă), căutare
- Adaugă: categorie → producători sugerați + spec (5W-40 505.01) + hint "ultima oară" + poză bon
- Consum: plinuri + medie L/100km • Acte: ITP/RCA/Rovinietă cu alerte
- Preseturi AVF: ulei 10k/12l, combustibil 30k, aer 30k, polen anual, distribuție 120k/5ani, lichid frână 2ani, antigel 4ani
- Local-first: merge și fără cont; cu Supabase devine cloud cu sincronizare

## Deploy Vercel (1 min)
Vercel → Add New Project → Import `istoric-auto-avf` → Framework: Other, fără build → Deploy.
Domeniu: `https://istoric-auto-avf.vercel.app` (sau custom).

## Supabase (detalii în supabase/README-SUPABASE.md)
1. SQL Editor → rulează `supabase/schema.sql`
2. Auth → Google provider ON (+ redirect URL-urile GitHub Pages + Vercel la Site URL)
3. Storage → bucket public `receipts`
4. În aplicație Setări → URL + anon key → Conectează → Login Google
