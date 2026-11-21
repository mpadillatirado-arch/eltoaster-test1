-- Repair: the welcome-email trigger from 20261028_newsletter_welcome.sql was
-- missing in production (only the welcomed_at column had been applied), so new
-- subscribers were never welcomed. This recreates the function and the trigger
-- exactly as that migration defines them. Safe to run again.
--
-- It is not retroactive: it only fires for new subscribers (or someone who
-- re-subscribes), never for rows that already exist.

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
