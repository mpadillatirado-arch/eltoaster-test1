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
       locations, preferred_language, biggest_challenge
from public.leads
order by created_at desc;
```

## Content

All copy lives in `src/content.js` as an `es` / `en` pair. Editing that file is
the only step needed to change wording — no component changes required. The
visitor's language is detected from the browser, overridable via the nav toggle,
and remembered in `localStorage`.
