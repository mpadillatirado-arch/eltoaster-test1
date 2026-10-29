-- Every new subscriber gets a welcome email, whether they joined from the
-- footer form or from the marketing box on the diagnostic form. Both paths end
-- in a row in newsletter_subscribers, so the trigger lives there.
--
-- welcomed_at is claimed by the newsletter-welcome function before it sends,
-- so nobody is welcomed twice. Rejoining after opting out keeps the old
-- welcomed_at, so it does not resend either. Test addresses never get one
-- from the trigger (tests are sent by hand).

alter table public.newsletter_subscribers add column if not exists welcomed_at timestamptz;
comment on column public.newsletter_subscribers.welcomed_at is
  'When the welcome email went out. Set by the newsletter-welcome function before it sends.';

-- People already on the list have been getting the newsletter; no welcome.
update public.newsletter_subscribers set welcomed_at = coalesce(welcomed_at, created_at);

create or replace function public.newsletter_request_welcome() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://oichxzrvbvauazvvysll.supabase.co/functions/v1/newsletter-welcome',
    body := jsonb_build_object('id', new.id),
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 15000);
  return new;
exception when others then
  -- A failed request must never block someone from subscribing.
  raise warning 'newsletter welcome request failed: %', sqlerrm;
  return new;
end;
$$;

revoke all on function public.newsletter_request_welcome() from public, anon, authenticated;

drop trigger if exists newsletter_welcome on public.newsletter_subscribers;
create trigger newsletter_welcome
  after insert or update of unsubscribed_at on public.newsletter_subscribers
  for each row
  when (new.unsubscribed_at is null and new.welcomed_at is null and not new.is_test)
  execute function public.newsletter_request_welcome();
