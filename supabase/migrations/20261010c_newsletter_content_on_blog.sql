-- Everything a newsletter says also lives on the blog, so every link in the
-- email lands on eltoaster.com.
--
-- blog_posts gains a kind: 'news' is a curated industry story (as before); the
-- other three are an issue's own sections, written once in
-- newsletter_sends.content and published here by newsletter_publish_issue().

alter table public.blog_posts
  add column if not exists kind text not null default 'news',
  add column if not exists teaser text,
  add column if not exists image_credit text,
  add column if not exists image_credit_url text,
  add column if not exists send_id uuid references public.newsletter_sends (id) on delete set null;

alter table public.blog_posts drop constraint if exists blog_posts_kind_check;
alter table public.blog_posts
  add constraint blog_posts_kind_check check (kind in ('news', 'fun_fact', 'pos', 'business'));

comment on column public.blog_posts.kind is
  'news = curated industry story with an external source. fun_fact / pos / business = a newsletter issue''s own sections, published from newsletter_sends.content.';
comment on column public.blog_posts.teaser is
  'One or two short sentences for the newsletter and the blog card. The full text stays in excerpt and is what the post page shows.';
comment on column public.blog_posts.image_credit is
  'Attribution line shown under the image. Required when the licence asks for it (e.g. Creative Commons).';
comment on column public.blog_posts.send_id is
  'The newsletter issue this post was published from, for the non-news kinds.';

-- One post per issue, section and language, so republishing updates in place.
create unique index if not exists blog_posts_issue_section_key
  on public.blog_posts (send_id, kind, lang)
  where send_id is not null;

create or replace function public.newsletter_publish_issue(p_send uuid) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_content jsonb;
  l text;
  c jsonb;
  v_business text;
  v_count integer := 0;
begin
  select content into v_content from newsletter_sends where id = p_send;
  if v_content is null then
    return 0;
  end if;

  foreach l in array array['es', 'en'] loop
    c := v_content -> l;
    continue when c is null;

    -- `more` is optional extra text that only the blog shows.
    insert into blog_posts (send_id, kind, lang, source, title, teaser, excerpt,
                            image_url, image_credit, image_credit_url)
    values (p_send, 'fun_fact', l, 'El Toaster',
            c #>> '{fun_fact,title}',
            substring(c #>> '{fun_fact,body}' from '^.*?[.!?](?=\s|$)'),
            concat_ws(E'\n\n', c #>> '{fun_fact,body}', c #>> '{fun_fact,more}'),
            c #>> '{fun_fact,image_url}',
            c #>> '{fun_fact,image_credit}',
            c #>> '{fun_fact,image_credit_url}')
    on conflict (send_id, kind, lang) where send_id is not null do update
      set title = excluded.title, teaser = excluded.teaser, excerpt = excluded.excerpt,
          image_url = excluded.image_url, image_credit = excluded.image_credit,
          image_credit_url = excluded.image_credit_url;

    insert into blog_posts (send_id, kind, lang, source, title, teaser, excerpt)
    values (p_send, 'pos', l, 'El Toaster',
            c #>> '{pos,title}',
            substring(c #>> '{pos,body}' from '^.*?[.!?](?=\s|$)'),
            concat_ws(E'\n\n', c #>> '{pos,body}', c #>> '{pos,more}'))
    on conflict (send_id, kind, lang) where send_id is not null do update
      set title = excluded.title, teaser = excluded.teaser, excerpt = excluded.excerpt;

    select string_agg((b.ord)::text || '. ' || (b.item ->> 'title') || E'\n' || (b.item ->> 'body'),
                      E'\n\n' order by b.ord)
      into v_business
      from jsonb_array_elements(c -> 'business') with ordinality as b(item, ord);

    insert into blog_posts (send_id, kind, lang, source, title, teaser, excerpt)
    values (p_send, 'business', l, 'El Toaster',
            case when l = 'en' then '3 things every owner should know this week'
                 else '3 cosas que todo dueño debe saber esta semana' end,
            (select string_agg(b.item ->> 'title', ' · ' order by b.ord)
               from jsonb_array_elements(c -> 'business') with ordinality as b(item, ord)),
            v_business)
    on conflict (send_id, kind, lang) where send_id is not null do update
      set title = excluded.title, teaser = excluded.teaser, excerpt = excluded.excerpt;

    v_count := v_count + 3;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.newsletter_publish_issue(uuid) from public, anon, authenticated;
grant execute on function public.newsletter_publish_issue(uuid) to service_role;

-- An issue's news section must only draw on real news, never on its own or an
-- earlier issue's sections.
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
       where published and kind = 'news'
         and published_at > v_since and published_at <= now()
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
