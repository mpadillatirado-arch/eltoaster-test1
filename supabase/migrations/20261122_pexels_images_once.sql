-- Blog photos from Pexels: each photo may appear on one post per language, so
-- two different stories never share a picture.
--
-- Only Pexels photos are covered (the older Wikimedia stock images repeat by
-- design and are left alone). The photo is identified by its Pexels id, so the
-- same photo cannot slip back in with different size parameters in the URL.

create unique index if not exists blog_posts_pexels_photo_once
  on public.blog_posts (lang, (substring(image_url from '/photos/([0-9]+)/')))
  where image_url like 'https://images.pexels.com/photos/%';

-- The issue's "POS" and "3 business points" posts can now carry their own
-- photo, like the fun fact already could:
--   content.<lang>.pos.image_url / image_credit / image_credit_url
--   content.<lang>.business_image.image_url / image_credit / image_credit_url
-- Without them nothing changes: the post gets a stock image as before, and a
-- re-publish never swaps a photo that is already on the post.
create or replace function public.newsletter_publish_issue(p_send uuid)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_content jsonb;
  v_when timestamptz;
  l text;
  c jsonb;
  v_business text;
  v_refs jsonb;
  v_count integer := 0;
  v_pos_img text;
  v_biz_img text;
begin
  select content, coalesce(blog_publish_at, now()) into v_content, v_when
    from newsletter_sends where id = p_send;
  if v_content is null then
    return 0;
  end if;

  foreach l in array array['es', 'en'] loop
    c := v_content -> l;
    continue when c is null;

    v_pos_img := nullif(btrim(coalesce(c #>> '{pos,image_url}', '')), '');
    v_biz_img := nullif(btrim(coalesce(c #>> '{business_image,image_url}', '')), '');

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

    insert into blog_posts (send_id, kind, lang, source, title, teaser, excerpt, source_links,
                            image_url, image_credit, image_credit_url, published_at)
    values (p_send, 'pos', l, 'El Toaster',
            c #>> '{pos,title}',
            coalesce(c #>> '{pos,teaser}', newsletter_teaser(c #>> '{pos,body}')),
            concat_ws(E'\n\n', c #>> '{pos,body}', c #>> '{pos,more}'),
            c #> '{pos,references}',
            v_pos_img,
            case when v_pos_img is not null then c #>> '{pos,image_credit}' end,
            case when v_pos_img is not null then c #>> '{pos,image_credit_url}' end,
            v_when)
    on conflict (send_id, kind, lang) where send_id is not null do update
      set title = excluded.title, teaser = excluded.teaser, excerpt = excluded.excerpt,
          source_links = excluded.source_links,
          image_url = case when v_pos_img is not null then excluded.image_url else blog_posts.image_url end,
          image_credit = case when v_pos_img is not null then excluded.image_credit else blog_posts.image_credit end,
          image_credit_url = case when v_pos_img is not null then excluded.image_credit_url else blog_posts.image_credit_url end;

    select string_agg(
             (b.ord)::text || '. ' || (b.item ->> 'title') || E'\n' ||
               concat_ws(' ', b.item ->> 'body', b.item ->> 'more'),
             E'\n\n' order by b.ord),
           jsonb_agg(b.item -> 'ref' order by b.ord) filter (where b.item ? 'ref')
      into v_business, v_refs
      from jsonb_array_elements(c -> 'business') with ordinality as b(item, ord);

    insert into blog_posts (send_id, kind, lang, source, title, teaser, excerpt, source_links,
                            image_url, image_credit, image_credit_url, published_at)
    values (p_send, 'business', l, 'El Toaster',
            case when l = 'en' then '3 things every owner should know this week'
                 else '3 cosas que todo dueño debe saber esta semana' end,
            coalesce(c ->> 'business_teaser',
                     (select string_agg(b.item ->> 'title', ' · ' order by b.ord)
                        from jsonb_array_elements(c -> 'business') with ordinality as b(item, ord))),
            v_business,
            v_refs,
            v_biz_img,
            case when v_biz_img is not null then c #>> '{business_image,image_credit}' end,
            case when v_biz_img is not null then c #>> '{business_image,image_credit_url}' end,
            v_when)
    on conflict (send_id, kind, lang) where send_id is not null do update
      set title = excluded.title, teaser = excluded.teaser, excerpt = excluded.excerpt,
          source_links = excluded.source_links,
          image_url = case when v_biz_img is not null then excluded.image_url else blog_posts.image_url end,
          image_credit = case when v_biz_img is not null then excluded.image_credit else blog_posts.image_credit end,
          image_credit_url = case when v_biz_img is not null then excluded.image_credit_url else blog_posts.image_credit_url end;

    v_count := v_count + 3;
  end loop;

  return v_count;
end;
$function$;
