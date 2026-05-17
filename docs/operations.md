# yvrgaragedoorsprings.ca — Operations runbook

Single reference for running the site day-to-day. Read top to bottom once. Bookmark for later.

---

## 1. Branches and deploy

- `main` is **production**. Hostinger auto-deploys every push to `main` to https://yvrgaragedoorsprings.ca within a few seconds.
- `dev` is **staging**. Push here to work safely without going live.
- Workflow:

  ```bash
  git checkout dev
  # edit, test
  git add -A
  git commit -m "what changed"
  git push origin dev
  # when ready to ship:
  git checkout main && git merge dev --ff-only && git push origin main
  git checkout dev && git push origin dev
  ```

- The Git repo lives at `github.com/yarishiller-cyber/yvrgaragedoorsprings-site`. Hostinger Git settings: Repository = same, Branch = `main`, Root directory = `public_html`, Auto-deploy = ON.

---

## 2. Phone number — swap when the real tracked line is ready

Edit two constants in **`assets/js/personalize.js`** (top of the file):

```js
const PHONE_DISPLAY = '(604) XXX-XXXX';   // shown to humans
const PHONE_TEL     = '+1604XXXXXXX';     // E.164 for tel: hrefs (no spaces, with +)
```

Everywhere on the site that shows or links the phone reads from these constants — there's no second place to update. The friendly display can be anything (e.g., `(604) 555-1234`); the `tel:` value must be valid E.164.

If/when CallRail or another Dynamic Number Insertion service is added, the swap pattern is the same: replace these two constants with the dynamic injection snippet.

---

## 3. Real WCB account, business licence, Certificate of Insurance

All three live in the `SITE_DATA` object in **`assets/js/personalize.js`**:

```js
const SITE_DATA = {
  wcbAccount: null,      // e.g. 'WS1234567'
  bcLicence:  null,      // e.g. 'BC123456789'
  coiPdfUrl:  null,      // e.g. '/assets/docs/coi-2026.pdf'
  insuranceCarrier: null,
  insuranceAmount: '$5M',
  foundedYear: null,
  googlePlaceId: null,
  jobsThisMonth: null
};
```

When you set any of these to a real string, the site auto-updates everywhere it's referenced:
- Footer credentials line is rewritten on every page (`enhanceFooter()`)
- About page trust list inline values are populated (`applySiteData()`)
- COI download link appears on the About page and the "available on request" fallback hides

For the COI PDF: upload it to `public_html/assets/docs/coi-2026.pdf` (the path matches `coiPdfUrl`). Anything inside `/assets/docs/` is publicly downloadable.

---

## 4. Reviews

All reviews live in **`assets/data/reviews.json`**:

```json
{
  "reviews": [
    {
      "id": "google-ABC123",
      "stars": 5,
      "quote": "Quoted me $832 over the phone. That's what I paid.",
      "author": "Sarah K.",
      "city": "burnaby",
      "neighbourhood": "Brentwood",
      "date": "2026-04-12",
      "verified": true,
      "placeholder": false
    },
    ...
  ]
}
```

Required fields per review:
- **`id`** — any unique string. Use the Google review ID if pulling from there.
- **`stars`** — integer 1–5.
- **`quote`** — the review text (trim long ones to ~250 chars).
- **`author`** — display name (first name + last initial is fine).
- **`city`** — must be one of the 16 served city slugs (`burnaby`, `vancouver`, `port-coquitlam`, etc.). See `CITIES` in personalize.js.
- **`neighbourhood`** — free-text, displayed after author name (e.g., "Brentwood").
- **`date`** — ISO format (`YYYY-MM-DD`).
- **`verified`** — true if from a verified source (Google, HomeStars).
- **`placeholder`** — false for real reviews, true for the seed entries.

The page automatically:
- Loads up to 3 reviews on the homepage
- Prefers reviews from the visitor's detected city, then nearby cities sorted by drive time
- Shows the "placeholder" flag chip on any review where `placeholder:true`

To go live with real reviews:
1. Replace the seed entries in `reviews.json` with real ones (`placeholder:false` on each).
2. Commit + push. No code changes needed.

Future: when `SITE_DATA.googlePlaceId` is set, we can add a script that pulls fresh reviews from the Google Places API. Not built yet — manual JSON edit is fine for the first 6–12 months.

---

## 5. Images

Every image the site uses is listed in **`assets/data/images.json`** with its expected path, alt text, dimensions, and an art-direction prompt for whoever creates it.

### Adding a real image

1. Open `assets/data/images.json`, find the slot you want to fill (e.g., `blog/heard-a-loud-bang.webp`).
2. Note the **dimensions** and **alt text** for that slot.
3. Create the image at the listed dimensions in WebP format (quality 82 for above-the-fold, 72 below).
4. Also export a JPEG fallback at the same dimensions and same quality.
5. Upload both to `public_html/` at the exact paths listed:
   - `assets/img/blog/heard-a-loud-bang.webp`
   - `assets/img/blog/heard-a-loud-bang.jpg`
6. The page picks the image up automatically — no code change. Refresh.

### What happens with no image present

Every `<img>` on the site has an `onerror` handler that hides the surrounding `<figure>` cleanly. Pages render perfectly with zero images. The figure appears the moment the file exists at the named path.

### Hero variants

The homepage hero supports five variants that swap based on visitor state:

| Variant | Path | Trigger |
|---|---|---|
| `default` | `/assets/img/hero/hero-emergency.webp` | normal |
| `cold` | `/assets/img/hero/hero-emergency-cold.webp` | `/weather.php` reports cold:true |
| `night` | `/assets/img/hero/hero-emergency-night.webp` | after 9 p.m. / before 7 a.m. |
| `price` | `/assets/img/hero/hero-pricing.webp` | URL has `?intent=price` |
| `diagnostic` | `/assets/img/hero/hero-diagnostic.webp` | URL has `?intent=diagnostic` |

Ship the `default` first. The other four are nice-to-have — until they exist, the default shows in all states.

### Tools for batch resizing / WebP conversion
- Squoosh.app (free, browser-based)
- ImageMagick: `convert input.jpg -quality 82 -resize 1600x output.webp`
- Sharp (Node): `sharp(input).resize(1600).webp({quality: 82}).toFile(output)`

---

## 6. Hours and BC stat holidays

Hours are hardcoded as 7 a.m. – 9 p.m. daily. To change them, edit the time check in `assets/js/personalize.js`:

```js
const isOpen = !isHoliday && h >= 7 && h < 21;
```

BC stat holidays are listed in `BC_HOLIDAYS_2026`:

```js
const BC_HOLIDAYS_2026 = [
  '2026-01-01', '2026-02-16', '2026-04-03', '2026-05-18',
  '2026-07-01', '2026-08-03', '2026-09-07', '2026-09-30',
  '2026-10-12', '2026-11-11', '2026-12-25', '2026-12-26'
];
```

Rename to `BC_HOLIDAYS_2027` and update the dates each year. BC stat days:

| Holiday | Date rule |
|---|---|
| New Year's | January 1 |
| Family Day | 3rd Monday of February |
| Good Friday | Friday before Easter (varies) |
| Victoria Day | Monday on/before May 24 |
| Canada Day | July 1 |
| BC Day | 1st Monday of August |
| Labour Day | 1st Monday of September |
| Day for Truth and Reconciliation | September 30 |
| Thanksgiving | 2nd Monday of October |
| Remembrance Day | November 11 |
| Christmas | December 25 |
| Boxing Day | December 26 |

When the banner shows during a stat day, it reads "Stat holiday. Text a photo for fastest response — on-call tech replies every 2 hours." Adjust the copy in `applyAvailability()` if your stat-day coverage changes.

---

## 7. Weather backend (cold-snap banner)

**File:** `/weather.php` (root of `public_html`).

**What it does:** fetches Environment Canada citypage XML for Vancouver (station `s0000141`) up to once every 2 hours, decides whether a cold snap is active, and writes the result to `/weather.json`. The site's JS calls `weather.php` directly and shows the cold-snap banner when `cold:true`.

**Cold-snap rules** (Section 2.1.4 of the foundational research):
- Forecast low ≤ 0°C anywhere in the next 24 hours, OR
- Current temp ≤ +2°C with a 24-hour drop ≥ 5°C

**Requirements on Hostinger:**
- PHP 7.4 or higher (default on all Hostinger plans).
- `allow_url_fopen = On` in `php.ini` (Hostinger default).
- Write permissions on the public_html directory so PHP can update `weather.json` (Hostinger default).

**Optional cron job for redundancy:**
In Hostinger's Hosting → Advanced → Cron Jobs, add an hourly job:
```
0 * * * * /usr/bin/php /home/USERNAME/public_html/weather.php > /dev/null 2>&1
```
(Replace USERNAME with the actual cPanel username; Hostinger fills it in.)

The PHP script is self-healing — if the cron isn't set up, the first page visitor after the 2-hour TTL triggers the refresh. If ECCC is down or unreachable, the script serves the previous cache and the banner just stays in its last state.

**Testing the script manually:**
Visit https://yvrgaragedoorsprings.ca/weather.php — you should see JSON with `cold`, `current_c`, `forecast_low_c`, `message`, and `updated`. If `cold:true`, the homepage banner appears.

**Updating cold-snap copy:**
Edit the `$message` template in `weather.php` (around line 130).

---

## 8. Local-tech-per-city positioning — handle with care

The whole site's value proposition rests on this:
> 16 cities. 15 have a local tech living in them. Tsawwassen is the exception — Madison's Delta crew covers ~25 min while we hire a Tsawwassen-resident tech.

If this becomes untrue (a city loses its local tech, or we expand outside the 16), update:
1. **`CITIES` object** in `personalize.js` — add/remove entries, update `localEta` values.
2. **`DRIVE_TIMES` matrix** in `personalize.js` — add/remove rows + destination columns. Run the sanity-check script in `docs/dev-notes.md` (TODO).
3. **`FSA_TO_CITY` map** in `personalize.js` — repoint postal codes as needed.
4. **`TECH_STATUS` object** — flag any new "hiring" cities or clear Tsawwassen when filled.
5. **City pages** — create or remove `/cities/{slug}/index.html` files.
6. **Sitemap** — update `/sitemap.xml` URLs.
7. **Homepage city tile section** — update the static fallback HTML.
8. **About page** — update Dale and Madison's territory descriptions if they shift.

The site has a smoke test for this — visit `/?city=tsawwassen` and confirm the Tsawwassen tile shows as the origin with the hiring caveat, and the rest of the tiles reorder by proximity.

---

## 9. Voice check (pre-commit gate)

**Script:** `/scripts/voice-check.sh`

**What it checks:**
- AI tropes ("dive in", "leverage", "delve", "synergy", "ecosystem", etc.)
- Marketing-speak ("solutions provider", "world-class", "white-glove", etc.)
- Conclusion filler ("in conclusion", "to summarize", "moreover", etc.)
- Trade non-tells ("garage door system", "skilled craftsmen", "facilitate")
- Americanisms in body text ("color", "neighborhood", "center" outside CSS)
- Test phone numbers (any `(604) 555-xxxx`)
- Unshippable placeholders ("TODO", "[PLACEHOLDER]", "lorem ipsum")

**Run before every commit:**
```bash
./scripts/voice-check.sh
```

Returns exit code 0 if clean, 1 if it found a violation. Use that to gate commits:
```bash
./scripts/voice-check.sh && git commit -m "..."
```

**If you get a false positive** (a real product name like "Marantec Synergy" trips the "synergy" check): just rephrase. The check is intentionally conservative — better to lose a product-name shoutout than to ship marketing-speak by accident.

---

## 10. Adding a new blog post

Cookbook for adding `/blog/{slug}/index.html`:

1. Decide the **slug** (kebab-case, short, descriptive — e.g., `garage-door-rust-prevention`).
2. Pick the **author** (Dale or Madison — see `docs/operations.md` author personas section, and the existing posts for voice samples).
3. Copy an existing blog post HTML as a starting template (`blog/heard-a-loud-bang/index.html` is the simplest).
4. Update the `<title>`, `<meta name="description">`, canonical URL, og:title, breadcrumb, Article schema, byline avatar (`D` for Dale, `M` for Madison with `style="background:var(--gold)"`).
5. Write the body (200–900 words, Dale or Madison voice, opening with a scenario/sound/number, DANGER block if covering anything DIY).
6. Add an image placeholder to `assets/data/images.json` under `blog`, then add a `<picture>` block in the post pointing at it (use the existing posts as the template).
7. Add an entry to `/blog/index.html` (the post list).
8. Add a `<url>` entry to `/sitemap.xml`.
9. Add a bullet to `/llms.txt` under "Blog".
10. Run `./scripts/voice-check.sh` until it passes.
11. Commit, push to `dev`, then merge to `main` to deploy.

---

## 11. Adding a new city (or removing one)

If the service area changes, this is the full sequence. **Don't skip steps — they reference each other.**

### Adding a city `foo-town`:
1. **`personalize.js`** — add to `CITIES`, `DRIVE_TIMES` (one row + 17 destinations), `FSA_TO_CITY` (its postal prefixes), `TECH_STATUS` (if hiring), and update the count text on the homepage hero.
2. Create **`/cities/foo-town/index.html`** — copy an existing city page as template, swap in unique content (neighbourhoods, housing stock, climate, FAQ, sibling links).
3. **`/sitemap.xml`** — add a `<url>` entry.
4. **`/llms.txt`** — add a bullet.
5. **`/index.html`** — add a `<a class="city-tile">` to the static fallback grid.
6. **`/contact/index.html`** — add a tile to the static fallback grid.
7. Update Dale or Madison's territory line on **`/about/index.html`** if their coverage shifts.

### Removing a city:
1. Delete from `CITIES`, `DRIVE_TIMES` (the row + every destination key referencing it), `FSA_TO_CITY`.
2. Delete `/cities/{slug}/` directory.
3. Remove from `/sitemap.xml`, `/llms.txt`, `/index.html` static fallback, `/contact/index.html` static fallback.
4. Update About page territory lines.
5. Add a 301 redirect in `.htaccess` to a sensible nearby city: `Redirect 301 /cities/{slug}/ /cities/{nearest}/`

### Tsawwassen specifically — when the local tech is hired
1. In `personalize.js`, **delete** the `tsawwassen` entry from `TECH_STATUS`.
2. Update the Tsawwassen city page hero (currently leads with the hiring honesty) to match the standard city-page template.
3. Update the About page hiring callout (remove or update).
4. Update the homepage hero eyebrow from "15 with a local tech" to "16 with a local tech".

---

## 12. Quick commands cheat-sheet

```bash
# Run the voice check
./scripts/voice-check.sh

# Verify the JS syntactically
node -c assets/js/personalize.js

# Verify reviews / images / weather JSON files
python3 -c "import json; json.load(open('assets/data/reviews.json'))"
python3 -c "import json; json.load(open('assets/data/images.json'))"
python3 -c "import json; json.load(open('weather.json'))"

# Verify PHP syntactically
php -l weather.php

# Manually trigger weather refresh
curl https://yvrgaragedoorsprings.ca/weather.php

# Deploy dev → main
git checkout main && git merge dev --ff-only && git push origin main && git checkout dev

# See what changed since last deploy
git log main..dev --oneline
```

---

## 13. Author personas (for blog post writing)

### Dale McRae — East Vancouver / Burnaby / North Shore / Surrey / Coquitlam / PoCo / PoMo / New West / Langley / Maple Ridge / Pitt Meadows / West Van / Vancouver
- 41, lives in East Van bungalow with two kids and a Lab named Doug.
- Drives a beat-up navy Toyota Tacoma.
- Voice rules: open with scenario/sound/number; second-person; specific numbers > vague adjectives; one bolded retort per 3–4 paragraphs; fragments allowed; mocks the situation, not the homeowner; CTAs sound like advice not sales.
- Catchphrases: "The door doesn't lie." "Call before noon." "East of the Cambie trench." "Steel's cheap, springs aren't." "That's not how this works." "One truck, four bridges."
- Mild swearing OK every 4–5th post ("damn", "hell"; "shit" only in dialogue). Never "fuck", "Christ", "Jesus".

### Madison Lim — Richmond / Delta / Tsawwassen / White Rock / Steveston
- Three generations on Lulu Island. Grandfather on the boats, father on the roofs.
- Lives in East Richmond, drives a wrapped Ford Transit Connect.
- Voice rules: same backbone as Dale but warmer; family-business cadence; generational anchors; water-and-fishing references.
- Catchphrases: "The family answers the phone." "Same family. Same number." "Coastal hardware for the river air." "Three generations on Lulu Island."
- Sparing swearing — "damn" max. No politics in posts.

When in doubt: read 2–3 existing posts by that persona before writing.

---

## 14. Things explicitly NOT shipped (referenced for future work)

- **Real images** — manifest exists in `assets/data/images.json`; production photography/illustration to be commissioned.
- **CallRail dynamic number insertion** — waits on the real tracked phone numbers.
- **Google Places API review pull** — waits on `SITE_DATA.googlePlaceId` being set.
- **GA4 / Search Console verification** — to be installed when the site goes to production.
- **The 4 hero variants beyond `default`** — `cold`, `night`, `price`, `diagnostic` are all listed in the manifest but the default loads in all states until they're produced.
- **An admin UI for editing reviews / SITE_DATA** — this runbook IS the admin UI. Edit JSON / JS, commit, push.

---

## 15. Where things live (file tree)

```
/
├── index.html                      Conversion hub (homepage)
├── 404.html                        Branded 404
├── robots.txt                      AI-crawler allowlist (14 bots)
├── llms.txt                        AI-readable site summary
├── llms-full.txt                   AI-readable full content reference
├── sitemap.xml                     All canonical URLs
├── .htaccess                       Apache: HTTPS, clean URLs, cache, security
├── weather.php                     ECCC weather poller + cache writer
├── weather.json                    Cached weather state (auto-updated by PHP)
├── assets/
│   ├── css/main.css                Design system + all page styles
│   ├── js/personalize.js           All client-side dynamic behaviour
│   ├── data/
│   │   ├── reviews.json            Review content (edit to publish reviews)
│   │   └── images.json             Image manifest (specs + alt text)
│   ├── img/                        Image files by section (hero/, blog/, etc.)
│   └── docs/                       Trust documents (COI PDF, etc.) — create when ready
├── about/index.html
├── contact/index.html
├── privacy/index.html
├── blog/
│   ├── index.html                  Blog listing
│   └── {slug}/index.html           One per post (11 posts at time of writing)
├── cities/
│   └── {slug}/index.html           One per city (16 pages)
├── scripts/
│   └── voice-check.sh              Pre-commit content audit
└── docs/
    └── operations.md               This file
```
