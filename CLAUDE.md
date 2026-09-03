# YVR Garage Door Springs — site-specific instructions

## Coverage model
**`single-service`** — ONE service (spring repair) across Greater Vancouver metro. Pillar-cluster topical-authority model. 16 city pages + pillar content.

## Site identity
- **Town/Region**: Greater Vancouver, BC
- **Service**: Garage door spring repair (torsion & TorqueMaster conversion)
- **Hero concept**: Live Vancouver sky + personalized city detection + local-tech messaging
- **Phone**: +1-778-800-0769
- **Email**: info@yvrgaragedoorsprings.ca
- **Address**: 4321 Still Creek Drive, Burnaby, BC V5C 6C6

## Palette (per FLEET-DIRECTIVES)
- **Steel**: #22303C (primary dark accent, buttons, links)
- **Brick-coral**: #C74A2E (CTAs, primary accent) — white text 4.72:1 WCAG AA
- **Emergency red**: #B91C1C (distinct danger state)
- **Paper**: #fafaf7 (off-white background)
- **Ink**: #0f1a1f (primary text)

## Typography (per FLEET-DIRECTIVES)
- **Headings**: Oswald 500/600 (Google Fonts) — condensed, fits long H1s like "Spring Replacement in <City>"
- **Body**: Public Sans 400/500 (Google Fonts) — clean, accessible

## Pricing (canonical floor + $10-30)
**Spring tiers (all-in + GST/PST)**:
- One Spring: $739
- Two Springs + free cables: $851 (95% pick this)
- Two High-Cycle springs: $1,274

**TorqueMaster conversion**:
- Replace with new TorqueMaster: $1,438
- Convert to standard torsion: $917 (saves $521 today)

Prices are hidden by default behind footer "Pricing" toggle (data-px toggle script).

## Key features implemented
1. ✓ Font imports: Oswald + Public Sans from Google Fonts
2. ✓ Color scheme: Steel #22303C, Brick-coral #C74A2E, Emergency red #B91C1C
3. ✓ Pricing tiers: $739 / $851 / $1,274 (canonical floor)
4. ✓ Pricing toggle: data-px attributes + toggle script (footer button)
5. ✓ Sticky mobile bar: Call + Text CTAs
6. ✓ City picker: Dropdown + GPS location detect
7. ✓ Live Vancouver sky: Time-of-day + weather animation (via personalize.js)
8. ✓ Proof stack: "16 cities", "$5M liability", "WorkSafeBC covered", "Licensed in BC"
9. ✓ Hero: Personalized by location + availability strip

## Content structure (pillar + clusters)
- **Home**: Spring intro + three tiers + city picker + TorqueMaster special
- **Pillar**: `/spring-replacement/` — comprehensive spring guide, cost anatomy, DIY risks, warranty
- **Clusters**: 16 city pages (Vancouver, Burnaby, Richmond, Surrey, etc.)
  - Each shows "how much for a spring in <City>", local availability, nearest tech
- **Blog**: Spring maintenance, DIY dangers, seasonal tips
- **About**: "how we're different" — local techs, no dispatch from downtown
- **Partners**: Contractor referral program

## AEO layer (Answer Engine Optimization)
- Full FAQPage JSON-LD with 8 detailed Q&A entries
- HowTo schema for spring diagnosis (30-second at-home test)
- Service schema + LocalBusiness with areaServed (16 cities)
- Breadcrumbs on every city page
- H1 keywords: "Spring Replacement in <City>", "Garage Door Spring Repair"
- Updated sections: add freshness byline ("Updated December 2024")

## Image requirements
- Hero: picture element with mobile (portrait) + desktop (landscape) shots
  - Preload with fetchpriority=high
  - Shows garage door + branded van + technician in uniform
  - Object-fit: cover, no letterboxing
- Service cards: Real photos, not icons
- Responsive sizes: -480, -960, full (webp + fallback jpg)
- Lazy-load below the fold

## SEO baseline (per FLEET-STANDARDS)
- ✓ Unique title (<60 char), meta description (<155)
- ✓ Canonical + OG + Twitter card
- ✓ LocalBusiness + Service + FAQPage + HowTo JSON-LD
- ✓ Breadcrumbs JSON-LD
- ✓ robots.txt + sitemap.xml (with clean URLs, no .html)
- ✓ llms.txt (optional, for AI answer engines)
- ✓ 404.html + .htaccess (HTTPS + clean URL rewrites + gzip)

## Notes
- This is a **spring-specialist** site — everything is about coil springs, not door repair generally
- No Review schema (FLEET-STANDARDS: avoid self-serving review schema penalty risk)
- Testimonials are visual-only; real reviews live in Google Business Profile
- Animation: Motion CDN (inView scroll-reveals, stagger, parallax) — no build step
- No frameworks, no npm dependencies — static HTML/CSS/vanilla JS only
