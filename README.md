# El Toaster

Bilingual (ES/EN) landing page for Mario Padilla's free restaurant reputation
diagnostic, aimed at Latino-owned restaurants in the Phoenix metro.

## Stack

- **Vite + React** — static SPA, no server runtime
- **Supabase** — `public.leads` table captures form submissions
- **Vercel** — hosting, deploys on push to `main`

## Local development

```bash
npm install
npm run dev
```

`.env.local` holds the Supabase credentials for local work; `.env.production`
holds the same publishable values used at build time.

## Lead capture

Submissions land in `public.leads`. Row Level Security is enabled with a single
policy allowing `INSERT` for the `anon` role — anonymous clients can submit but
cannot read any rows back.

Read leads from the Supabase dashboard, or:

```sql
select created_at, restaurant_name, contact_name, email, phone, city,
       zip_code, restaurant_type, preferred_language, biggest_challenge
from public.leads
order by created_at desc;
```

## Newsletter

One mailing list, `public.newsletter_subscribers`, holds everyone El Toaster may
email: footer signups, diagnostic leads who ticked the marketing box (linked by
`leads.subscriber_id`), and the internal test addresses (`is_test`). A row is
mailable while `unsubscribed_at` is null.

- **Join** — `newsletter_opt_in(email, lang, source)`. Called by the footer form
  and by a trigger on `leads`.
- **Leave** — `newsletter_opt_out(email, reason)`. Called by the unsubscribe
  link in every email, by mail clients' one-click button, and by the Resend
  webhook for bounces and complaints. It also clears consent on the person's
  leads.
- **Send** — an issue is a row in `newsletter_sends`:

  ```sql
  select id, token from newsletter_create_send();  -- newest posts not yet sent
  ```

  Then write the issue's sections into `newsletter_sends.content` (fun fact,
  point-of-sale note, three business points, subject line — in both languages;
  the column comment has the shape). The news section comes from the posts,
  using each post's short `teaser`.

  `POST /functions/v1/newsletter-send` with `{ send, token, action: "test" }`
  mails the test addresses. The test email links to the approval page
  (`/#send/<id>/<token>`), whose button sends it to the rest of the list. Live is
  refused until a test has gone out. Add `only: ["a@b.com"]` to either action to
  reach just those people. `newsletter_deliveries` records each recipient, so a
  retried issue never reaches anyone twice.

  Sending first publishes the written sections to the blog
  (`newsletter_publish_issue`), and every link in the email points at a page on
  the site (`/#blog/<id>`), which in turn links to the original source. The
  postal address in the footer is set in the function (`MAILING_ADDRESS`).

- **Who is where** — `select * from mailing_status;` lists every known address
  as `opted_in`, `opted_out` or `no_status` (asked for a diagnostic, never
  answered the marketing question).

Function pages live on the site (`/#unsubscribe/…`, `/#send/…`) because Supabase
serves HTML returned by a function as plain text.

## Content

All copy lives in `src/content.js` as an `es` / `en` pair. Editing that file is
the only step needed to change wording — no component changes required. The
visitor's language is detected from the browser, overridable via the nav toggle,
and remembered in `localStorage`.
