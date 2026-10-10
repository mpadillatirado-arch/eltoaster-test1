-- El Toaster's own posts (fun fact, point of sale, business points) have no
-- outside article behind them, so each one carries the sources that back up
-- what it says, and a written teaser for its blog card.
--
-- In newsletter_sends.content, per language:
--   fun_fact / pos:  { title, body, more?, teaser?, references?: [{label, url}] }
--   business:        [{ title, body, more?, ref?: {label, url} }]  (three)
--   business_teaser: text
-- `body` is what the email shows. `more` is extra text only the blog shows.

alter table public.blog_posts add column if not exists source_links jsonb;
comment on column public.blog_posts.source_links is
  'Sources that back up the post, as [{ "label": ..., "url": ... }]. Shown under El Toaster''s own posts; news posts use external_url instead.';

-- Used when a section has no written teaser. Cuts at a word, never mid-word
-- and never at the first full stop: "…inspirado en Mr." is where splitting on
-- sentences left a card.
create or replace function public.newsletter_teaser(p_text text) returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p_text is null then null
    when length(p_text) <= 190 then p_text
    else regexp_replace(left(p_text, 190), '\s+\S*$', '') || '…'
  end;
$$;

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
  v_refs jsonb;
  v_count integer := 0;
begin
  select content into v_content from newsletter_sends where id = p_send;
  if v_content is null then
    return 0;
  end if;

  foreach l in array array['es', 'en'] loop
    c := v_content -> l;
    continue when c is null;

    insert into blog_posts (send_id, kind, lang, source, title, teaser, excerpt, source_links,
                            image_url, image_credit, image_credit_url)
    values (p_send, 'fun_fact', l, 'El Toaster',
            c #>> '{fun_fact,title}',
            coalesce(c #>> '{fun_fact,teaser}', newsletter_teaser(c #>> '{fun_fact,body}')),
            concat_ws(E'\n\n', c #>> '{fun_fact,body}', c #>> '{fun_fact,more}'),
            c #> '{fun_fact,references}',
            c #>> '{fun_fact,image_url}',
            c #>> '{fun_fact,image_credit}',
            c #>> '{fun_fact,image_credit_url}')
    on conflict (send_id, kind, lang) where send_id is not null do update
      set title = excluded.title, teaser = excluded.teaser, excerpt = excluded.excerpt,
          source_links = excluded.source_links,
          image_url = excluded.image_url, image_credit = excluded.image_credit,
          image_credit_url = excluded.image_credit_url;

    insert into blog_posts (send_id, kind, lang, source, title, teaser, excerpt, source_links)
    values (p_send, 'pos', l, 'El Toaster',
            c #>> '{pos,title}',
            coalesce(c #>> '{pos,teaser}', newsletter_teaser(c #>> '{pos,body}')),
            concat_ws(E'\n\n', c #>> '{pos,body}', c #>> '{pos,more}'),
            c #> '{pos,references}')
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

    insert into blog_posts (send_id, kind, lang, source, title, teaser, excerpt, source_links)
    values (p_send, 'business', l, 'El Toaster',
            case when l = 'en' then '3 things every owner should know this week'
                 else '3 cosas que todo dueño debe saber esta semana' end,
            coalesce(c ->> 'business_teaser',
                     (select string_agg(b.item ->> 'title', ' · ' order by b.ord)
                        from jsonb_array_elements(c -> 'business') with ordinality as b(item, ord))),
            v_business,
            v_refs)
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
