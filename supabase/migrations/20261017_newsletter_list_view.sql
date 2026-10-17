-- One row per address on the newsletter, with the name and restaurant from
-- their diagnostic request, for reading and exporting from the dashboard.
create or replace view public.newsletter_list
with (security_invoker = true) as
select
  s.email,
  case when s.unsubscribed_at is not null then 'opted out'
       when s.is_test then 'test'
       else 'subscriber' end as status,
  l.contact_name as name,
  l.restaurant_name as restaurant,
  l.city,
  s.lang as language,
  s.source as joined_from,
  s.created_at::date as joined_on,
  s.unsubscribed_at::date as left_on,
  s.unsubscribe_reason
from public.newsletter_subscribers s
left join lateral (
  select contact_name, restaurant_name, city
    from public.leads
   where lower(email) = lower(s.email)
   order by created_at desc
   limit 1
) l on true
order by (s.unsubscribed_at is not null), s.is_test, s.created_at;

revoke all on public.newsletter_list from anon, authenticated;
