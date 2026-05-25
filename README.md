# yvrgaragedoorsprings.ca

Emergency garage door spring repair website for Greater Vancouver. One service, three flat-rate tiers, local techs in each of 16 served cities.

## Workflow

Claude Code → GitHub → Hostinger auto-deploy

- Development happens on the **`dev`** branch.
- **`main`** is the production branch — Hostinger auto-deploys every push to main to https://yvrgaragedoorsprings.ca.
- Merge `dev` → `main` only when ready to ship.

## Structure

```
/
├── index.html               Single-page conversion hub (homepage)
├── 404.html                 Branded 404
├── robots.txt               Explicit allowlist for 14+ AI crawlers
├── llms.txt                 AI-readable site summary
├── sitemap.xml              All canonical URLs
├── .htaccess                Apache config: HTTPS, clean URLs, caching, security headers
├── assets/
│   ├── css/main.css         Design system + page styles (vanilla CSS, mobile-first)
│   ├── js/personalize.js    URL-param DTR, geo, time-of-day, sticky bar, diagnosis widget
│   └── img/                 (images TBD)
└── cities/                  16 city landing pages (pending Pass 2)
```

## Build constants

All defined as single sources of truth — swap in one place:

- **Phone:** `(778) 800-0769`. Single source of truth: `PHONE_DISPLAY` and `PHONE_TEL` in `assets/js/personalize.js` (also baked into every page's static markup so crawlers and no-JS users see it pre-hydration).
- **Email:** `info@yvrgaragedoorsprings.ca`
- **Dispatch HQ:** 4321 Still Creek Drive, Burnaby, BC V5C 6C6 (placeholder)
- **Hours:** 7 a.m. – 9 p.m. daily

## Positioning

Local technicians live in each of the 16 served cities. Typical drive time to your door: **~12 minutes** (vs. 25–55 min for downtown-dispatched competitors). This is the headline trust differentiator.

## Pending (Pass 2, after Part 3 research lands)

- 16 hand-crafted city pages (content from foundational research Section 1.7)
- Blog cluster (Dale McRae persona)
- Real reviews to replace placeholders
- Real tracked phone number(s) — likely CallRail DNI with 4 source numbers
- Cold-snap weather banner backend (ECCC GeoMet hourly poll → `/weather.json`)
- Real images (truck, broken-spring close-ups, tech headshots)
