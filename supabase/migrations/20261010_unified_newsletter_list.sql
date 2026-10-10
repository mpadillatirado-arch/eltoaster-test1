-- One mailing list for everything El Toaster sends.
--
-- newsletter_subscribers becomes the single identity per email address: footer
-- signups, diagnostic leads who ticked the marketing box, and Mario's own test
-- addresses all live here. Opt-out is a state on that row, so there is exactly
-- one place to ask "may I email this person?".

alter table public.newsletter_subscribers
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid(),
  add column if not exists is_test boolean not null default false,
  add column if not exists unsubscribe_reason text;

create unique index if not exists newsletter_subscribers_token_key
  on public.newsletter_subscribers (unsubscribe_token);

alter table public.newsletter_subscribers
  drop constraint if exists newsletter_subscribers_reason_check;
alter table public.newsletter_subscribers
  add constraint newsletter_subscribers_reason_check
  check (unsubscribe_reason is null
         or unsubscribe_reason in ('unsubscribe', 'bounce', 'complaint', 'manual'));

comment on table public.newsletter_subscribers is
  'The one mailing list. A row is mailable when unsubscribed_at is null. source: footer (site signup), diagnostic (lead who opted in), seed (internal test address), optout (never subscribed, only recorded so we do not mail them).';
comment on column public.newsletter_subscribers.unsubscribe_token is
  'Random secret carried in every unsubscribe link. Never the row id, so a link cannot be guessed from another one.';
comment on column public.newsletter_subscribers.is_test is
  'Internal seed address. Receives test sends only and is excluded from live sends.';
comment on column public.newsletter_subscribers.unsubscribe_reason is
  'Why the row stopped being mailable. bounce and complaint are never cleared by a later opt-in.';

update public.newsletter_subscribers
   set email = lower(btrim(email))
 where email <> lower(btrim(email));

alter table public.leads
  add column if not exists subscriber_id uuid
  references public.newsletter_subscribers (id) on delete set null;
create index if not exists leads_subscriber_id_idx on public.leads (subscriber_id);
comment on column public.leads.subscriber_id is
  'The mailing-list row for this lead''s email, set when the lead opted in to marketing. Several leads from the same person share one subscriber.';

-- Opt in ---------------------------------------------------------------------

create or replace function public.newsletter_opt_in(
  p_email text,
  p_lang text default 'es',
  p_source text default 'footer'
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(btrim(p_email));
  v_id uuid;
begin
  if v_email is null or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then
    return null;
  end if;

  insert into newsletter_subscribers (email, lang, source)
  values (v_email, case when p_lang = 'en' then 'en' else 'es' end, coalesce(p_source, 'footer'))
  on conflict (lower(email)) do update
    set unsubscribed_at = null,
        unsubscribe_reason = null
    -- A dead mailbox or a spam complaint is not undone by ticking a box again.
    where newsletter_subscribers.unsubscribe_reason is null
       or newsletter_subscribers.unsubscribe_reason not in ('bounce', 'complaint')
  returning id into v_id;

  if v_id is null then
    select id into v_id from newsletter_subscribers where lower(email) = v_email;
  end if;
  return v_id;
end;
$$;

-- Opt out --------------------------------------------------------------------

create or replace function public.newsletter_opt_out(
  p_email text,
  p_reason text default 'unsubscribe'
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(btrim(p_email));
  v_reason text := case
    when p_reason in ('unsubscribe', 'bounce', 'complaint', 'manual') then p_reason
    else 'unsubscribe'
  end;
  v_id uuid;
begin
  if v_email is null or v_email = '' then
    return null;
  end if;

  -- Insert-or-update so an address that never subscribed (a lead who did not
  -- tick the box) is still remembered as "do not mail".
  insert into newsletter_subscribers (email, source, unsubscribed_at, unsubscribe_reason)
  values (v_email, 'optout', now(), v_reason)
  on conflict (lower(email)) do update
    set unsubscribed_at = coalesce(newsletter_subscribers.unsubscribed_at, now()),
        unsubscribe_reason = case
          when excluded.unsubscribe_reason in ('bounce', 'complaint') then excluded.unsubscribe_reason
          else coalesce(newsletter_subscribers.unsubscribe_reason, excluded.unsubscribe_reason)
        end
  returning id into v_id;

  update leads
     set marketing_consent = false,
         unsubscribed_at = coalesce(unsubscribed_at, now())
   where lower(email) = v_email
     and marketing_consent;

  return v_id;
end;
$$;

-- These run with the owner's rights, so they must not be callable through the
-- public API with the publishable key: anyone could unsubscribe anyone.
revoke all on function public.newsletter_opt_in(text, text, text) from public, anon, authenticated;
revoke all on function public.newsletter_opt_out(text, text) from public, anon, authenticated;
grant execute on function public.newsletter_opt_in(text, text, text) to service_role;
grant execute on function public.newsletter_opt_out(text, text) to service_role;

-- Leads who opt in join the list automatically --------------------------------

create or replace function public.leads_link_subscriber() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Never trust a value sent by the browser.
  new.subscriber_id := null;
  if new.marketing_consent then
    begin
      new.subscriber_id := newsletter_opt_in(new.email, new.preferred_language, 'diagnostic');
    exception when others then
      -- The diagnostic request matters more than the list: never let a list
      -- problem reject a lead.
      raise warning 'leads_link_subscriber failed for %: %', new.email, sqlerrm;
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists leads_link_subscriber on public.leads;
create trigger leads_link_subscriber
  before insert on public.leads
  for each row execute function public.leads_link_subscriber();

-- Sends ----------------------------------------------------------------------

create table if not exists public.newsletter_sends (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'draft'
    check (status in ('draft', 'test_sent', 'sending', 'sent', 'failed', 'cancelled')),
  token uuid not null default gen_random_uuid(),
  post_ids uuid[] not null,
  posts_through timestamptz not null,
  test_sent_at timestamptz,
  started_at timestamptz,
  sent_at timestamptz,
  recipients integer,
  error text
);
comment on table public.newsletter_sends is
  'One newsletter issue. Created as a draft with a frozen set of blog posts, sent to the test addresses first, then approved for the live list. posts_through is the newest post included, so the next issue only picks up newer stories.';
comment on column public.newsletter_sends.token is
  'Secret that authorises testing and approving this issue. Only reachable from the database or from the test email in Mario''s inbox.';

create table if not exists public.newsletter_deliveries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  send_id uuid not null references public.newsletter_sends (id) on delete cascade,
  subscriber_id uuid not null references public.newsletter_subscribers (id) on delete cascade,
  mode text not null check (mode in ('test', 'live')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  resend_id text,
  error text,
  sent_at timestamptz,
  unique (send_id, subscriber_id, mode)
);
comment on table public.newsletter_deliveries is
  'One row per issue per recipient. The unique key is what stops an issue from reaching the same person twice if a send is retried.';
create index if not exists newsletter_deliveries_subscriber_idx
  on public.newsletter_deliveries (subscriber_id);

alter table public.newsletter_sends enable row level security;
alter table public.newsletter_deliveries enable row level security;

create or replace function public.newsletter_create_send() returns public.newsletter_sends
language plpgsql
security definer
set search_path = public
as $$
declare
  v_since timestamptz;
  v_ids uuid[];
  v_through timestamptz;
  v_row newsletter_sends;
begin
  select coalesce(max(posts_through), '-infinity') into v_since
    from newsletter_sends where status in ('sending', 'sent');

  select array_agg(id), max(published_at) into v_ids, v_through
    from (
      select id, published_at,
             row_number() over (partition by lang order by published_at desc) as rn
        from blog_posts
       where published and published_at > v_since and published_at <= now()
    ) t
   where rn <= 5;

  if v_ids is null then
    raise exception 'No published posts newer than the last newsletter';
  end if;

  insert into newsletter_sends (post_ids, posts_through)
  values (v_ids, v_through)
  returning * into v_row;
  return v_row;
end;
$$;

revoke all on function public.newsletter_create_send() from public, anon, authenticated;
grant execute on function public.newsletter_create_send() to service_role;

-- Backfill -------------------------------------------------------------------

do $$
declare r record;
begin
  for r in
    select distinct on (lower(email)) lower(email) as e, preferred_language as l
      from leads
     where marketing_consent and unsubscribed_at is null
     order by lower(email), created_at
  loop
    perform newsletter_opt_in(r.e, r.l, 'diagnostic');
  end loop;
end $$;

update public.leads l
   set subscriber_id = s.id
  from public.newsletter_subscribers s
 where lower(l.email) = lower(s.email)
   and l.marketing_consent
   and l.subscriber_id is distinct from s.id;

-- Internal test addresses. Two languages across them so every test shows both.
select public.newsletter_opt_in('mpadillatirado@gmail.com', 'es', 'seed');
select public.newsletter_opt_in('mario@eltoaster.com', 'es', 'seed');
select public.newsletter_opt_in('mario.padilla@toasttab.com', 'en', 'seed');

update public.newsletter_subscribers
   set is_test = true
 where lower(email) in ('mpadillatirado@gmail.com', 'mario@eltoaster.com', 'mario.padilla@toasttab.com');
update public.newsletter_subscribers
   set lang = 'en'
 where lower(email) = 'mario.padilla@toasttab.com';
