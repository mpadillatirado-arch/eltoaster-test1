# Analytics (Google Analytics 4)

Built and switched off. To turn it on, add the Measurement ID to `.env.production`
and deploy:

```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

The ID is public (it is visible in any site that uses GA), so it is fine to commit.
With no ID, no Google script loads and every call in `src/analytics.js` does nothing.

## Rules it follows

- Counts only on `eltoaster.com` and `www.eltoaster.com`. Previews and localhost send nothing.
- Never tracks `/admin`, the unsubscribe link or the newsletter-preview link (their hashes hold personal tokens).
- Excludes the owner's browser once signed in to `/admin`. `?notrack=1` does it by hand, `?notrack=0` undoes it.
- Skips browsers that send Global Privacy Control or Do Not Track.
- Ad storage, Google Signals and ad personalisation are off. No names, emails, phones or restaurant names are ever sent.
- The privacy notice gets a "Estadísticas del sitio" section automatically once an ID is set.
- To test on a preview: open any page with `?ga_debug=1` (stop with `?ga_debug=0`) and watch GA's DebugView.

## Site map: pages

`page_view` is sent once per real page, with `page_path`, `page_title`, `content_group`, `page_name` and `site_language`. Scrolling to an anchor inside the landing page is not a page view.

| page_name | page_path | content_group | Address |
|---|---|---|---|
| home | `/` | Landing | `/` |
| blog | `/blog` | Blog | `/#blog`, `/#blog/page/N` |
| blog_post | `/blog/<id>` | Blog | `/#blog/<id>` |
| rankings | `/rankings` | Tools | `/rankings`, `/ranking` |
| calculator | `/calculator` | Tools | `/calculator` |
| about | `/about_me` | About | `/about_me` |
| privacy | `/privacy` | Legal | `/#privacy` |

UTM tags (`utm_*`) and `gclid` are kept on `page_location` so campaigns are attributed.

## Events

| Event | When | Parameters |
|---|---|---|
| `section_view` | A landing section is 40% on screen, once per visit: problema, dolores, como, diagnostico, empezar, clientes, video, blog, newsletter | `section` |
| `cta_click` | Link to the diagnostic form, calculator, rankings or newsletter | `cta`, `link_text`, `section` |
| `book_call` | Link to cal.com | `link_url`, `link_text`, `section` |
| `file_download` | Any PDF link, including the ranking PDFs | `file_name`, `file_extension`, `link_url` |
| `click` | Any other external link | `link_domain`, `link_url`, `outbound` |
| `contact_click` | `mailto:`, `tel:` or WhatsApp links | `method` |
| `language_change` | ES / EN switch | `language` |
| `calculator_run` | The revenue calculator is run | `rating_from`, `rating_to` |
| `generate_lead` | A form is submitted | `form` = `diagnostic`, `calculator` or `ranking`, plus `restaurant_type`, `newsletter_opt_in` (diagnostic) or `ranking`, `city` (ranking) |
| `sign_up` | New newsletter subscriber | `method` = `newsletter` |

`site_language` is also set as a user property on every visit.

## To do once in GA4

1. Admin → Data streams → your stream → Enhanced measurement → Page views → gear → turn **off** "Page changes based on browser history events". Pages are sent by hand, so leaving it on double-counts blog and privacy views.
2. Admin → Events → mark `generate_lead` (and optionally `sign_up`, `book_call`) as **key events**.
3. Admin → Data collection → turn Google signals off if it is on, and keep data retention at 14 months.
4. Register `form`, `section`, `cta`, `ranking`, `restaurant_type` and `page_name` as custom dimensions (event scope) to report on them.
