-- AyuNexa Supabase Auth profiles and role access.
-- Default new signups to patient. Elevated roles are assigned only by trusted administrators.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'patient'
    check (role in ('patient', 'caregiver', 'doctor', 'super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon;
grant select, insert, update on table public.profiles to authenticated;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can create their own patient profile" on public.profiles;
create policy "Users can create their own patient profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id and role = 'patient');

revoke update on table public.profiles from authenticated;
grant update (display_name) on table public.profiles to authenticated;

drop policy if exists "Users can update their own display name" on public.profiles;
create policy "Users can update their own display name"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), ''),
    'patient'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();