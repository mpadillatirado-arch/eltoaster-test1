-- Same rule as the Pexels index: an Unsplash photo may appear on one blog post
-- per language. The photo is identified by the "photo-<id>" part of its address,
-- so resizing parameters cannot sneak a repeat past the index.

create unique index if not exists blog_posts_unsplash_photo_once
  on public.blog_posts (lang, (substring(image_url from 'images\.unsplash\.com/(photo-[A-Za-z0-9_-]+)')))
  where image_url like 'https://images.unsplash.com/photo-%';
