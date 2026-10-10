-- Each issue carries its own written sections next to the frozen news posts.
alter table public.newsletter_sends add column if not exists content jsonb;
comment on column public.newsletter_sends.content is
  'The written parts of the issue, per language: { "es": { subject, preheader, fun_fact: {title, body}, pos: {title, body}, business: [{title, body} x3] }, "en": { ... } }. The news section comes from post_ids. An issue cannot be sent until both languages are present.';

-- One place to answer "who can I email?".
--   opted_in   on the list and mailable
--   opted_out  unsubscribed, bounced or complained
--   no_status  requested a diagnostic but never said yes or no to marketing
create or replace view public.mailing_status
with (security_invoker = true) as
select s.email,
       case when s.unsubscribed_at is null then 'opted_in' else 'opted_out' end as status,
       s.is_test,
       s.source,
       s.lang,
       s.created_at as since,
       s.unsubscribed_at,
       s.unsubscribe_reason
  from public.newsletter_subscribers s
union all
select lower(l.email),
       'no_status',
       false,
       'diagnostic',
       max(l.preferred_language),
       min(l.created_at),
       null::timestamptz,
       null::text
  from public.leads l
 where not exists (
         select 1 from public.newsletter_subscribers s where lower(s.email) = lower(l.email)
       )
 group by lower(l.email);

comment on view public.mailing_status is
  'Every address El Toaster knows, with its marketing status. Runs with the caller''s rights, so the publishable key sees nothing.';
revoke all on public.mailing_status from public, anon, authenticated;
