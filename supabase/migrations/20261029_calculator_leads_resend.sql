-- Calculator leads (name, email, phone from the /calculator gate) are also
-- kept as contacts in Resend, in their own "Calculadora El Toaster" audience,
-- apart from the newsletter list. The calculator-lead-resend function does the
-- copy; this trigger asks for it after every new lead.
--
-- resend_synced_at is claimed by the function before it copies, so nobody is
-- copied twice. A failed copy clears it again, and can be retried with:
--   select public.calculator_lead_request_resend_for(id)
--   from calculator_leads where resend_synced_at is null;

alter table public.calculator_leads add column if not exists resend_synced_at timestamptz;
comment on column public.calculator_leads.resend_synced_at is
  'When this lead was copied to the Resend audience. Set by the calculator-lead-resend function.';

create or replace function public.calculator_lead_request_resend_for(lead_id uuid) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://oichxzrvbvauazvvysll.supabase.co/functions/v1/calculator-lead-resend',
    body := jsonb_build_object('id', lead_id),
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 15000);
end;
$$;

create or replace function public.calculator_lead_request_resend() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.calculator_lead_request_resend_for(new.id);
  return new;
exception when others then
  -- A failed request must never keep someone out of the calculator.
  raise warning 'calculator lead resend request failed: %', sqlerrm;
  return new;
end;
$$;

revoke all on function public.calculator_lead_request_resend_for(uuid) from public, anon, authenticated;
revoke all on function public.calculator_lead_request_resend() from public, anon, authenticated;

drop trigger if exists calculator_lead_resend on public.calculator_leads;
create trigger calculator_lead_resend
  after insert on public.calculator_leads
  for each row
  execute function public.calculator_lead_request_resend();
