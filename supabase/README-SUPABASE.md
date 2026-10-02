# Supabase setup (2 minute, o singură dată)

1. intră pe https://supabase.com → New project (sau folosește proiectul de la pontaj, e ok același)
2. SQL Editor → New query → lipește tot din `schema.sql` → Run
3. Authentication → Providers → Google → Enable
   - Google Cloud Console → Credentials → OAuth client (Web) → redirect URL-ul dat de Supabase
   - pune Client ID + Secret în Supabase
   - la Site URL în Supabase pune domeniile finale:
     - `https://dragomirvalentin01-collab.github.io/istoric-auto-avf/`
     - (după ce faci Vercel) `https://istoric-auto-avf.vercel.app`
4. Storage → New bucket `receipts` → Public (bifează) — pentru poze bonuri
5. Project Settings → API → copiază URL + anon key → în aplicație la Setări → Conectează → Login Google

Tabele: vehicles, service_records, fuel_entries, documents (RLS pe user_id).
