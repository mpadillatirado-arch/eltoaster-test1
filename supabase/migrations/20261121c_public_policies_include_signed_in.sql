-- A signed-in browser (the owner after logging in to /admin) sends its own JWT, so
-- Postgres treats it as role "authenticated", not "anon". The public site's
-- policies only named anon, so in that browser the blog came back empty and
-- the forms would have been refused. Public content and public forms must work
-- the same for everyone, signed in or not.
--
-- Rule for new public tables: name both roles in their policy
-- (to anon, authenticated).
alter policy "Anyone can read published posts" on public.blog_posts to anon, authenticated;
alter policy "Anyone can unlock the calculator" on public.calculator_leads to anon, authenticated;
alter policy "anon can submit leads" on public.leads to anon, authenticated;
alter policy "Allow anonymous inserts for privacy requests" on public.privacy_requests to anon, authenticated;
alter policy "Anyone can open the full ranking" on public.ranking_leads to anon, authenticated;
