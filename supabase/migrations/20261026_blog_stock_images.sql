-- El Toaster's own posts ("3 cosas…" and the POS idea of each issue) are
-- inserted without a photo, which left an empty orange box on the blog.
-- A small bank of free Wikimedia Commons restaurant photos fills the gap:
-- any El Toaster post inserted without image_url gets one, picked from the
-- issue's send_id so the Spanish and English copies share the same photo.

create table if not exists public.blog_stock_images (
  id serial primary key,
  kind text not null check (kind in ('pos', 'business')),
  image_url text not null unique,
  author text not null,
  license text not null,
  credit_url text not null
);

comment on table public.blog_stock_images is
  'Photos used for El Toaster blog posts that arrive without one (see blog_posts_stock_image).';

alter table public.blog_stock_images enable row level security;

insert into public.blog_stock_images (kind, image_url, author, license, credit_url) values
  ('business', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Taqueria_Rosita_-_December_2024_-_Sarah_Stierch_03.jpg/960px-Taqueria_Rosita_-_December_2024_-_Sarah_Stierch_03.jpg', 'Sarah Stierch', 'CC0', 'https://commons.wikimedia.org/wiki/File:Taqueria_Rosita_-_December_2024_-_Sarah_Stierch_03.jpg'),
  ('business', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Tacos_on_a_plate.jpg/960px-Tacos_on_a_plate.jpg', 'Evgeny Krivosheev', 'public', 'https://commons.wikimedia.org/wiki/File:Tacos_on_a_plate.jpg'),
  ('business', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Don_Juan%27s_Taqueria_-_November_2023_-_Sarah_Stierch_08.jpg/960px-Don_Juan%27s_Taqueria_-_November_2023_-_Sarah_Stierch_08.jpg', 'Sarah Stierch', 'CC BY 4.0', 'https://commons.wikimedia.org/wiki/File:Don_Juan%27s_Taqueria_-_November_2023_-_Sarah_Stierch_08.jpg'),
  ('business', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/M%27Ol%C3%A9_Restaurant_-_Downtown_Phoenix%2C_Arizona_%2849345588433%29.jpg/960px-M%27Ol%C3%A9_Restaurant_-_Downtown_Phoenix%2C_Arizona_%2849345588433%29.jpg', 'Tony Webster', 'CC BY 2.0', 'https://commons.wikimedia.org/wiki/File:M%27Ol%C3%A9_Restaurant_-_Downtown_Phoenix,_Arizona_(49345588433).jpg'),
  ('business', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Taqueria_La_Azteca_-_October_2024_-_Sarah_Stierch_02.jpg/960px-Taqueria_La_Azteca_-_October_2024_-_Sarah_Stierch_02.jpg', 'Sarah Stierch', 'CC0', 'https://commons.wikimedia.org/wiki/File:Taqueria_La_Azteca_-_October_2024_-_Sarah_Stierch_02.jpg'),
  ('pos', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/DFC_1472_A_restaurant_server_in_a_yellow_shirt_and_green_apron_works_at_a_point-of-sale_terminal_near_a_stack_of_plates_and_a_visible_Fire_Exit_sign.jpg/960px-DFC_1472_A_restaurant_server_in_a_yellow_shirt_and_green_apron_works_at_a_point-of-sale_terminal_near_a_stack_of_plates_and_a_visible_Fire_Exit_sign.jpg', 'PattayaPatrol', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:DFC_1472_A_restaurant_server_in_a_yellow_shirt_and_green_apron_works_at_a_point-of-sale_terminal_near_a_stack_of_plates_and_a_visible_Fire_Exit_sign.jpg'),
  ('pos', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Taqueria_Honorio_%2834473870550%29.jpg/960px-Taqueria_Honorio_%2834473870550%29.jpg', 'Lou Stejskal', 'CC BY 2.0', 'https://commons.wikimedia.org/wiki/File:Taqueria_Honorio_(34473870550).jpg'),
  ('pos', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Orange_chicken_over_rice_in_a_takeout_container.jpg/960px-Orange_chicken_over_rice_in_a_takeout_container.jpg', 'Ser Amantio di Nicolao', 'CC0', 'https://commons.wikimedia.org/wiki/File:Orange_chicken_over_rice_in_a_takeout_container.jpg'),
  ('pos', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Food_Delivery_Service.jpg/960px-Food_Delivery_Service.jpg', 'Julia Justo', 'public', 'https://commons.wikimedia.org/wiki/File:Food_Delivery_Service.jpg')
on conflict (image_url) do nothing;

create or replace function public.blog_posts_stock_image()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  pick blog_stock_images;
  -- POS ideas get POS photos; anything else of ours gets a restaurant one.
  k text := case when new.kind = 'pos' then 'pos' else 'business' end;
begin
  if new.image_url is not null or new.source is distinct from 'El Toaster' then
    return new;
  end if;

  select * into pick
  from blog_stock_images
  where kind = k
  order by id
  offset (
    abs(hashtext(coalesce(new.send_id::text, new.published_at::date::text)))
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

drop trigger if exists blog_posts_stock_image on public.blog_posts;
create trigger blog_posts_stock_image
  before insert on public.blog_posts
  for each row execute function public.blog_posts_stock_image();
