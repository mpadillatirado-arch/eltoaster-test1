-- News posts arrive from the weekly blog job without a photo, and
-- blog_posts_default_image used to fill them with the site's hero poster
-- (the flautas), so every story of a week showed the same unrelated picture.
-- Now any post left without a real photo (empty, or still the hero poster)
-- gets one from blog_stock_images, with its credit, the same way El Toaster's
-- own posts already did. The Spanish and English copies of a story share it:
-- the pick is keyed by the story's link (news) or the issue (our own posts).

insert into public.blog_stock_images (kind, image_url, author, license, credit_url) values
  ('business', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Restaurant_interior_with_empty_tables_prepared_for_guests.jpg/960px-Restaurant_interior_with_empty_tables_prepared_for_guests.jpg', 'Shixart1985', 'CC BY 2.0', 'https://commons.wikimedia.org/wiki/File:Restaurant_interior_with_empty_tables_prepared_for_guests.jpg'),
  ('business', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Midnight_Line_Cook.jpg/960px-Midnight_Line_Cook.jpg', 'Visitor7', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Midnight_Line_Cook.jpg'),
  ('business', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Chicken_Wings-_It%27s_been_a_while._Baton_Rouge_LA_2026.jpg/960px-Chicken_Wings-_It%27s_been_a_while._Baton_Rouge_LA_2026.jpg', 'Paul Lowry', 'CC BY 4.0', 'https://commons.wikimedia.org/wiki/File:Chicken_Wings-_It%27s_been_a_while._Baton_Rouge_LA_2026.jpg'),
  ('business', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Vino_tinto_en_Valle_de_Guadalupe.jpg/960px-Vino_tinto_en_Valle_de_Guadalupe.jpg', 'Orlando Reynoso Orozco', 'CC0', 'https://commons.wikimedia.org/wiki/File:Vino_tinto_en_Valle_de_Guadalupe.jpg'),
  ('business', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/An_empty_table_in_a_restaurant.jpg/960px-An_empty_table_in_a_restaurant.jpg', 'Shixart1985', 'CC BY 2.0', 'https://commons.wikimedia.org/wiki/File:An_empty_table_in_a_restaurant.jpg')
on conflict (image_url) do nothing;

create or replace function public.blog_posts_default_image()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  pick blog_stock_images;
  -- POS ideas get POS photos; everything else a restaurant one.
  k text := case when new.kind = 'pos' then 'pos' else 'business' end;
begin
  if coalesce(btrim(new.image_url), '') <> ''
     and new.image_url not like '%/video/hero-%' then
    return new;
  end if;

  select * into pick
  from blog_stock_images
  where kind = k
  order by id
  offset (
    abs(hashtext(coalesce(new.external_url, new.send_id::text, new.published_at::date::text)))
    % greatest(1, (select count(*) from blog_stock_images where kind = k))
  )
  limit 1;

  if found then
    new.image_url := pick.image_url;
    new.image_credit := case when new.lang = 'en'
      then 'Photo: ' || pick.author || ' / Wikimedia Commons, '
           || case pick.license when 'public' then 'Public domain' else pick.license end
      else 'Foto: ' || pick.author || ' / Wikimedia Commons, '
           || case pick.license when 'public' then 'dominio público' else pick.license end
    end;
    new.image_credit_url := pick.credit_url;
  end if;
  return new;
end;
$$;
