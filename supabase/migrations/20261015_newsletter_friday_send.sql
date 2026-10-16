-- Subscribers read the news first. An issue goes out on Friday morning and its
-- stories appear on the blog list the Monday after.
--
--   newsletter_sends.send_at          when an approved issue is mailed
--   newsletter_sends.blog_publish_at  when its posts show up on the blog list
--
-- Approving the test before send_at only schedules the issue (status
-- 'scheduled'); a cron job mails it once send_at has passed. Embargoed posts are
-- still readable by direct link, which is what the email links to.

alter table public.newsletter_sends
  add column if not exists send_at timestamptz,
  add column if not exists blog_publish_at timestamptz;

comment on column public.newsletter_sends.send_at is
  'When the issue is mailed once approved. Null = as soon as it is approved.';
comment on column public.newsletter_sends.blog_publish_at is
  'When the issue''s posts appear on the blog list (published_at). Null = now.';

alter table public.newsletter_sends drop constraint if exists newsletter_sends_status_check;
alter table public.newsletter_sends add constraint newsletter_sends_status_check
  check (status in ('draft', 'test_sent', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'));

/** Friday 8:00 and Monday 8:00 Arizona time (no daylight saving) after a moment. */
create or replace function public.newsletter_next_friday(p_from timestamptz default now())
returns timestamptz
language sql
stable
set search_path = public
as $$
  select ((date_trunc('day', p_from at time zone 'America/Phoenix')
           + make_interval(days => (5 - extract(isodow from p_from at time zone 'America/Phoenix')::int + 7) % 7)
           + interval '8 hours') at time zone 'America/Phoenix')
         + case when (date_trunc('day', p_from at time zone 'America/Phoenix')
                      + make_interval(days => (5 - extract(isodow from p_from at time zone 'America/Phoenix')::int + 7) % 7)
                      + interval '8 hours') at time zone 'America/Phoenix' <= p_from
                then interval '7 days' else interval '0' end;
$$;

-- New issues take the newest news, including stories written ahead and held
-- for the coming Monday, and are timed for the next Friday.
create or replace function public.newsletter_create_send()
returns newsletter_sends
language plpgsql
security definer
set search_path = public
as $$
declare
  v_since timestamptz;
  v_ids uuid[];
  v_through timestamptz;
  v_friday timestamptz := newsletter_next_friday();
  v_row newsletter_sends;
begin
  select coalesce(max(posts_through), '-infinity') into v_since
    from newsletter_sends where status in ('scheduled', 'sending', 'sent');

  select array_agg(id), max(published_at) into v_ids, v_through
    from (
      select id, published_at,
             row_number() over (partition by lang order by published_at desc) as rn
        from blog_posts
       where published and kind = 'news'
         and published_at > v_since and published_at <= v_friday + interval '3 days'
    ) t
   where rn <= 5;

  if v_ids is null then
    raise exception 'No published posts newer than the last newsletter';
  end if;

  insert into newsletter_sends (post_ids, posts_through, send_at, blog_publish_at)
  values (v_ids, v_through, v_friday, v_friday + interval '3 days')
  returning * into v_row;
  return v_row;
end;
$$;

revoke all on function public.newsletter_create_send() from public, anon, authenticated;
revoke all on function public.newsletter_next_friday(timestamptz) from public, anon, authenticated;

-- The issue's own sections go on the blog dated blog_publish_at, like its news.
-- A post already published keeps its date.
create or replace function public.newsletter_publish_issue(p_send uuid) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_content jsonb;
  v_when timestamptz;
  l text;
  c jsonb;
  v_business text;
  v_refs jsonb;
  v_count integer := 0;
begin
  select content, coalesce(blog_publish_at, now()) into v_content, v_when
    from newsletter_sends where id = p_send;
  if v_content is null then
    return 0;
  end if;

  foreach l in array array['es', 'en'] loop
    c := v_content -> l;
    continue when c is null;

    insert into blog_posts (send_id, kind, lang, source, title, teaser, excerpt, source_links,
                            image_url, image_credit, image_credit_url, published_at)
    values (p_send, 'fun_fact', l, 'El Toaster',
            c #>> '{fun_fact,title}',
            coalesce(c #>> '{fun_fact,teaser}', newsletter_teaser(c #>> '{fun_fact,body}')),
            concat_ws(E'\n\n', c #>> '{fun_fact,body}', c #>> '{fun_fact,more}'),
            c #> '{fun_fact,references}',
            c #>> '{fun_fact,image_url}',
            c #>> '{fun_fact,image_credit}',
            c #>> '{fun_fact,image_credit_url}',
            v_when)
    on conflict (send_id, kind, lang) where send_id is not null do update
      set title = excluded.title, teaser = excluded.teaser, excerpt = excluded.excerpt,
          source_links = excluded.source_links,
          image_url = excluded.image_url, image_credit = excluded.image_credit,
          image_credit_url = excluded.image_credit_url;

    insert into blog_posts (send_id, kind, lang, source, title, teaser, excerpt, source_links, published_at)
    values (p_send, 'pos', l, 'El Toaster',
            c #>> '{pos,title}',
            coalesce(c #>> '{pos,teaser}', newsletter_teaser(c #>> '{pos,body}')),
            concat_ws(E'\n\n', c #>> '{pos,body}', c #>> '{pos,more}'),
            c #> '{pos,references}',
            v_when)
    on conflict (send_id, kind, lang) where send_id is not null do update
      set title = excluded.title, teaser = excluded.teaser, excerpt = excluded.excerpt,
          source_links = excluded.source_links;

    select string_agg(
             (b.ord)::text || '. ' || (b.item ->> 'title') || E'\n' ||
               concat_ws(' ', b.item ->> 'body', b.item ->> 'more'),
             E'\n\n' order by b.ord),
           jsonb_agg(b.item -> 'ref' order by b.ord) filter (where b.item ? 'ref')
      into v_business, v_refs
      from jsonb_array_elements(c -> 'business') with ordinality as b(item, ord);

    insert into blog_posts (send_id, kind, lang, source, title, teaser, excerpt, source_links, published_at)
    values (p_send, 'business', l, 'El Toaster',
            case when l = 'en' then '3 things every owner should know this week'
                 else '3 cosas que todo dueño debe saber esta semana' end,
            coalesce(c ->> 'business_teaser',
                     (select string_agg(b.item ->> 'title', ' · ' order by b.ord)
                        from jsonb_array_elements(c -> 'business') with ordinality as b(item, ord))),
            v_business,
            v_refs,
            v_when)
    on conflict (send_id, kind, lang) where send_id is not null do update
      set title = excluded.title, teaser = excluded.teaser, excerpt = excluded.excerpt,
          source_links = excluded.source_links;

    v_count := v_count + 3;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.newsletter_publish_issue(uuid) from public, anon, authenticated;
grant execute on function public.newsletter_publish_issue(uuid) to service_role;

-- Every ten minutes, mail any approved issue whose Friday has come. The
-- function itself refuses anything not approved or not yet due, so a stray
-- call cannot send early.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('newsletter-friday-send')
 where exists (select 1 from cron.job where jobname = 'newsletter-friday-send');

select cron.schedule(
  'newsletter-friday-send',
  '*/10 * * * *',
  $cron$
  select net.http_post(
           url := 'https://oichxzrvbvauazvvysll.supabase.co/functions/v1/newsletter-send',
           body := jsonb_build_object('send', id, 'token', token, 'action', 'live'),
           headers := '{"Content-Type": "application/json"}'::jsonb,
           timeout_milliseconds := 120000)
    from public.newsletter_sends
   where status = 'scheduled' and send_at <= now();
  $cron$
);
