-- Admin panel at eltoaster.com/admin: lets the site owner read every lead and
-- subscriber after signing in. Nothing here is reachable without a confirmed
-- login whose email is listed in public.admin_users.

-- Who may open the panel. Keyed by email; rows are added from the database
-- (never from the site), so there is no way to promote yourself.
create table if not exists public.admin_users (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
comment on table public.admin_users is
  'Emails allowed into eltoaster.com/admin. Add a row from the SQL editor: insert into public.admin_users (email) values (''name@example.com'');';

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
-- No policies on purpose: only is_admin() below reads this table.

-- True only for a signed-in user whose email is confirmed and listed above.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
      from auth.users u
      join public.admin_users a on a.email = lower(u.email)
     where u.id = auth.uid()
       and u.email_confirmed_at is not null
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Read-only access for admins. The public site keeps its insert-only policies.
do $$
declare t text;
begin
  foreach t in array array[
    'leads', 'calculator_leads', 'ranking_leads',
    'newsletter_subscribers', 'diagnostic_reports', 'privacy_requests'
  ] loop
    execute format('drop policy if exists "Admin can read" on public.%I', t);
    execute format(
      'create policy "Admin can read" on public.%I for select to authenticated using ((select public.is_admin()))',
      t
    );
    execute format('grant select on public.%I to authenticated', t);
  end loop;
end $$;

-- Which ranking each person opened, so the panel can segment by it.
alter table public.ranking_leads
  add column if not exists category text check (category is null or char_length(category) <= 40);
comment on column public.ranking_leads.category is
  'The ranking (tacos, mariscos, ...) whose PDF they asked for. Null for rows from before this was recorded.';
