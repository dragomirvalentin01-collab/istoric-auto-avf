-- Istoric Auto PWA: ruleaza in Supabase SQL editor
create table if not exists vehicles(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null default 'Audi A4 B6 Avant 1.9 TDI AVF',
  year int, vin text, current_km int,
  created_at timestamptz default now()
);
create table if not exists service_records(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  date date not null, km int not null,
  category text not null, part text, brand text, spec text,
  condition text default 'noua',
  part_cost numeric default 0, labor_cost numeric default 0,
  place text, notes text, receipt_url text,
  created_at timestamptz default now()
);
create table if not exists fuel_entries(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  date date not null, km int not null,
  liters numeric not null, total numeric not null,
  full_tank boolean default true,
  created_at timestamptz default now()
);
create table if not exists documents(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  type text not null, date date, km int, note text,
  created_at timestamptz default now()
);
alter table vehicles enable row level security;
alter table service_records enable row level security;
alter table fuel_entries enable row level security;
alter table documents enable row level security;
drop policy if exists "own" on vehicles; create policy "own" on vehicles for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own" on service_records; create policy "own" on service_records for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own" on fuel_entries; create policy "own" on fuel_entries for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own" on documents; create policy "own" on documents for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
-- Storage pentru poze bonuri: creeaza bucketul "receipts" (public sau privat) din Dashboard > Storage.

-- Bucket poze bonuri
insert into storage.buckets (id, name, public) values ('receipts','receipts', true)
on conflict (id) do update set public = true;
drop policy if exists "public read receipts" on storage.objects;
create policy "public read receipts" on storage.objects for select using (bucket_id='receipts');
drop policy if exists "own upload receipts" on storage.objects;
create policy "own upload receipts" on storage.objects for insert with check (bucket_id='receipts' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "own delete receipts" on storage.objects;
create policy "own delete receipts" on storage.objects for delete using (bucket_id='receipts' and auth.uid()::text = (storage.foldername(name))[1]);
