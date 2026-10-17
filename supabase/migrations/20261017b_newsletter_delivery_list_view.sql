-- Who each issue went to, one row per email sent, newest issue first.
create or replace view public.newsletter_delivery_list
with (security_invoker = true) as
select
  (n.sent_at at time zone 'America/Phoenix')::date as issue_date,
  n.content -> 'es' ->> 'subject' as issue_subject,
  d.mode as kind,
  s.email,
  l.contact_name as name,
  l.restaurant_name as restaurant,
  s.lang as language,
  d.status,
  to_char(d.sent_at at time zone 'America/Phoenix', 'YYYY-MM-DD HH12:MI AM') as sent_at_arizona,
  d.error,
  d.send_id
from public.newsletter_deliveries d
join public.newsletter_sends n on n.id = d.send_id
join public.newsletter_subscribers s on s.id = d.subscriber_id
left join lateral (
  select contact_name, restaurant_name
    from public.leads
   where lower(email) = lower(s.email)
   order by created_at desc
   limit 1
) l on true
order by n.sent_at desc nulls last, d.mode desc, d.sent_at;

revoke all on public.newsletter_delivery_list from anon, authenticated;
