-- Ulei + Filtre + Notite (simplificat, de la zero)
drop table if exists service_records;
drop table if exists fuel_entries;
drop table if exists documents;
create table if not exists vehicles(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null default 'Audi A4 B6 Avant 1.9 TDI AVF',
  year int, vin text, current_km int,
  created_at timestamptz default now()
);
create table if not exists oil_changes(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  date date not null, km int not null,
  brand text, spec text, filters text[] default '{}',
  part_cost numeric default 0, labor_cost numeric default 0,
  place text, notes text,
  created_at timestamptz default now()
);
create table if not exists notes(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  date date not null, km int,
  title text not null, body text,
  created_at timestamptz default now()
);
alter table vehicles enable row level security;
alter table oil_changes enable row level security;
alter table notes enable row level security;
drop policy if exists "own" on vehicles; create policy "own" on vehicles for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own" on oil_changes; create policy "own" on oil_changes for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own" on notes; create policy "own" on notes for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
