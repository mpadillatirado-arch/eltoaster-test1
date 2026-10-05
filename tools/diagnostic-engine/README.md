# Diagnostic engine

Turns a free-diagnostic form submission into a finished reputation report,
delivered as the body of an email, with a human approval step before anything
reaches the restaurant owner.

## Why it is shaped this way

The research can't run in an edge function. Yelp returns 403 to plain HTTP
fetches and Google Maps needs a real rendering browser, so the
step that reads reviews runs where there is one: a scheduled Claude Code job on
Mario's machine, following the `restaurant-review-diagnostic` skill. Postgres
holds the queue and the result; Deno only sends mail.

The second shaping force is that this writes to restaurant owners under Mario's
name. A diagnostic once went out with a quote that had been carried over from a
different restaurant — a serious allegation, attributed to a business that never
received it. Automating that failure would be much worse than the original. So:

- `render-email.mjs` **refuses to render** a finding without a verbatim quote
  carrying its platform and location, and refuses a quote pinned to a location
  that was never researched.
- Nothing sends automatically. A finished report sits at `awaiting_review` until
  Mario opens it, reads the exact email, and approves it.

## Flow

```
form submit
  └─ leads row inserted
       ├─ trigger queues diagnostic_reports (status: pending)
       └─ send-diagnostic-email  →  owner gets the "on its way" confirmation

scheduled job (Claude Code + browser, skill: eltoaster-diagnostic-job)
  ├─ engine.mjs pending          → leads waiting, with every research parameter
  ├─ engine.mjs claim <id>       → status: researching
  ├─ reads Google / Yelp for each location
  └─ engine.mjs submit <json>    → validates, renders, status: awaiting_review
                                    and emails Mario the review link

Mario opens the review page
  ├─ Approve  → diagnostic-review sends the stored HTML, status: sent
  └─ Reject   → status: rejected, nothing sent
```

## Files

| File | Role |
| --- | --- |
| `render-email.mjs` | The email body, plus `validate()` — the anti-fabrication gate |
| `engine.mjs` | CLI the job drives: `pending`, `claim`, `submit`, `fail` |
| `preview.mjs` | Renders a payload to HTML and proves the gate still bites |
| `sample-tortas-paquime.json` | Real approved report, used as the fixture |
| `../../supabase/functions/diagnostic-review/` | Review page, approve/reject, send |

## Setup

```bash
cp tools/diagnostic-engine/.env.engine.example tools/diagnostic-engine/.env.engine
# paste the service role key from Supabase → Project Settings → API
```

That key bypasses RLS, which is why it lives only in this gitignored file and
never in `.env.local` or the Vite bundle.

## Checking it

```bash
node tools/diagnostic-engine/preview.mjs          # renders the sample, tests the gate
node --env-file=tools/diagnostic-engine/.env.engine tools/diagnostic-engine/engine.mjs pending
```

`preview.mjs` writes `preview-output.html`; open it in a browser to see exactly
what an owner receives. It exits non-zero if the gate stops biting, so it works
as a regression check after any change to the renderer.

## Schema

`leads` gained the parameters the research needs and the form never asked for:
`street_address` (required on the form — a brand name alone matches same-named
restaurants across the metro), `location_addresses`, `google_maps_url`, and
`annual_revenue`.

`diagnostic_reports` holds one row per report: the research `payload` as the
audit trail for every quote, the rendered `email_html`, and the status. RLS is
on with no anon policies, so reports are reachable only by the service role. A
partial unique index keeps one open report per lead.
