create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  first_name text not null check (length(trim(first_name)) > 0),
  last_name text not null check (length(trim(last_name)) > 0),
  phone text not null check (length(trim(phone)) > 0),
  email text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  city_id uuid not null references public.cities (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contacts_user_id_idx on public.contacts (user_id);
create index contacts_city_id_idx on public.contacts (city_id);
create index contacts_user_name_idx on public.contacts (user_id, last_name, first_name);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger contacts_set_updated_at before update on public.contacts
for each row execute function public.set_updated_at();

alter table public.cities enable row level security;
alter table public.contacts enable row level security;
create policy "Authenticated users can read cities" on public.cities for select to authenticated using (true);
create policy "Users can read their own contacts" on public.contacts for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own contacts" on public.contacts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own contacts" on public.contacts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their own contacts" on public.contacts for delete to authenticated using ((select auth.uid()) = user_id);

insert into public.cities (name) values
  ('Zagreb'), ('Split'), ('Rijeka'), ('Osijek'), ('Zadar'), ('Pula'), ('Dubrovnik'), ('Varaždin'), ('Sarajevo'), ('Beograd');
grant select on public.cities to authenticated;
grant select, insert, update, delete on public.contacts to authenticated;
