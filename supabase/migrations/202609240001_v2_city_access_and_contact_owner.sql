-- New contact rows inherit their owner from the authenticated Supabase request.
alter table public.contacts
  alter column user_id set default auth.uid();

-- The city table is a shared authenticated catalog. Existing contacts keep their
-- foreign key, and the existing ON DELETE RESTRICT prevents deleting a used city.
create unique index if not exists cities_normalized_name_key
  on public.cities (lower(trim(name)));

create policy "Authenticated users can create cities"
  on public.cities for insert to authenticated
  with check (true);

create policy "Authenticated users can update cities"
  on public.cities for update to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete cities"
  on public.cities for delete to authenticated
  using (true);

grant insert, update, delete on public.cities to authenticated;
