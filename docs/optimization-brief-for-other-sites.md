# Brief: Backend + SEO + AI Optimization Pass

**Hand this to a Claude Code session opened against the GitHub repo of any existing site. The session will not change anything visual — it improves the code, SEO, AI-findability, performance, and Hostinger deploy hygiene.**

---

## Your mission

You are reviewing a website's source for the first time. Your job is to leave the **visible UI/UX unchanged** while raising the quality of everything underneath — code, SEO meta, structured data, AI-crawler discoverability, performance, accessibility, deploy pipeline, and Hostinger-specific configuration.

When in doubt about whether a change is visible: don't make it. Or ask first.

---

## Rules of engagement

### ALLOWED (no permission needed)
- Add or fix `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `.htaccess`.
- Add or fix `<meta>` tags in `<head>`: title, description, canonical, Open Graph, Twitter Card, viewport, theme-color, charset, robots.
- Add or fix JSON-LD structured data (`<script type="application/ld+json">`). Never remove existing schema — only add or correct.
- Minify CSS and JavaScript files. Combine when it doesn't break behaviour. Keep originals as `.src` or maintain a build step.
- Convert images to WebP with JPEG fallback via `<picture>`. Add `srcset` for responsive widths. Add explicit `width`/`height` attributes. Add `loading="lazy"` below the fold and `loading="eager" fetchpriority="high"` on the hero.
- Add `defer` / `async` to script tags. Move scripts to end of `<body>` where safe.
- Add caching headers, gzip/brotli enablement, security headers, HTTPS redirect via `.htaccess`.
- Fix accessibility issues: missing `alt`, missing form labels, low contrast on text (only if you're matching an existing brand colour to a more contrast-compliant variant of the same hue), `<html lang="...">`, skip links.
- Add tap-target spacing in CSS if buttons are smaller than 44×44 CSS px (WCAG 2.5.5).
- Improve `.gitignore`, add `.editorconfig`, add a README if missing.
- Add a `/docs/operations.md` documenting what you changed and how to maintain it.

### NOT ALLOWED (without explicit user approval)
- Anything that changes what the page looks like to a sighted user. No layout changes, no font changes, no colour palette changes, no spacing changes, no copy rewrites.
- Removing or rewriting body copy. You may add `<meta>` content; you may not edit `<h1>` text or paragraph text.
- Restructuring the IA (URL paths, page hierarchy).
- Adding analytics tracking, third-party scripts, fonts, or libraries the site doesn't already use.
- Adding cookie banners, modals, popups, chat widgets, A/B test infrastructure.
- Force-pushing, rewriting git history, deleting branches, deleting files (other than build artifacts in `.gitignore`).
- Anything that requires a database, server-side framework, or new runtime the site doesn't already have.

If you're unsure whether something falls in ALLOWED or NOT ALLOWED, treat it as NOT ALLOWED and ask.

---

## Phase 0 — Initial audit (read-only)

Before changing anything, build a complete picture:

```bash
# Repo layout
ls -la
find . -maxdepth 3 -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.php" \) | head -50

# Detect framework / build tool
test -f package.json && cat package.json
test -f composer.json && cat composer.json
test -f wp-config.php && echo "WordPress detected"
test -f index.html && echo "Static HTML detected"

# Existing SEO files
ls -la robots.txt sitemap.xml llms.txt llms-full.txt .htaccess 2>/dev/null

# Image inventory
find . -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" -o -name "*.gif" \) -not -path "./node_modules/*" -not -path "./.git/*" -exec ls -lh {} \; | awk '{print $5, $9}' | sort -h

# Current page weight (largest files)
find . -type f -size +100k -not -path "./.git/*" -not -path "./node_modules/*" -exec ls -lh {} \; | sort -k 5 -rh | head -20

# Existing meta + schema on the homepage
grep -E '<title|<meta name="description|<link rel="canonical|application/ld\+json' index.html 2>/dev/null || echo "No index.html at root"

# Git state
git log --oneline -10
git branch -a
git status
```

Write a short audit report (in chat, not a file) covering:
1. **Stack** — static HTML / WordPress / Hugo / Astro / Next / other.
2. **Hosting** — Hostinger detected? `.htaccess` present? PHP version assumed?
3. **Branch model** — `main` only, or `main` + `dev`? What does Hostinger watch?
4. **Existing SEO** — what's already there. What's missing.
5. **Image situation** — total weight, format mix, biggest files, no responsive variants?
6. **Schema situation** — any JSON-LD already? Is it valid? Is it accurate?
7. **Performance smell** — render-blocking CSS/JS, unminified, missing caching headers, no compression.
8. **Accessibility smell** — missing alt, missing lang, missing form labels, no skip link, tap target issues.

**Do not start changing files until the user confirms the audit.**

---

## Phase 1 — SEO baseline (apply to every page)

For each HTML page (template engines: the relevant template):

### `<head>` essentials
```html
<!DOCTYPE html>
<html lang="en-CA">   <!-- match the actual content language; use BCP-47 -->
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#XXXXXX">  <!-- pull from existing brand color -->
  <title>Unique page title — ≤60 chars — Brand</title>
  <meta name="description" content="Unique meta description, 140–160 chars, includes primary keyword and a call to action when natural.">
  <link rel="canonical" href="https://EXAMPLE.com/this-exact-path/">

  <!-- Open Graph -->
  <meta property="og:type" content="website">  <!-- or "article" for blog posts -->
  <meta property="og:url" content="https://EXAMPLE.com/this-exact-path/">
  <meta property="og:title" content="Same as <title> or slightly shorter">
  <meta property="og:description" content="Same as meta description">
  <meta property="og:image" content="https://EXAMPLE.com/assets/img/og-card.webp">
  <meta property="og:locale" content="en_CA">
  <meta property="og:site_name" content="Brand">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Same as <title>">
  <meta name="twitter:description" content="Same as meta description">

  <!-- Favicon (preserve existing if present) -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="alternate icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
</head>
```

### Rules
- **Every page has a unique `<title>` ≤60 chars.**
- **Every page has a unique meta description, 140–160 chars.**
- **Every page has a canonical link** pointing to the exact URL of that page (trailing-slash-consistent).
- **`<html lang>` set to the actual content language** (e.g., `en-CA`, `en-US`, `fr-CA`).
- **Viewport meta** present and correct.
- **No `<meta name="robots" content="noindex">`** except on intentionally noindex pages (privacy, internal admin). Privacy policies are conventionally noindex.

### Trailing-slash and canonical consistency
Pick one canonical format and enforce site-wide via `.htaccess` redirects:
- Preferred: `/path/` (trailing slash) for directories with `index.html`.
- Either way, redirect the inconsistent version with 301 to the canonical one.

---

## Phase 2 — Structured data (JSON-LD)

Use `<script type="application/ld+json">` blocks in `<head>`. Validate at https://validator.schema.org and https://search.google.com/test/rich-results before declaring done.

### Minimum on every page
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Brand name",
  "url": "https://EXAMPLE.com/"
}
```

### Add `Organization` (or `LocalBusiness` for local-services sites)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://EXAMPLE.com/#org",
  "name": "Brand name",
  "url": "https://EXAMPLE.com/",
  "logo": "https://EXAMPLE.com/logo.png",
  "sameAs": [
    "https://www.linkedin.com/company/...",
    "https://www.instagram.com/..."
  ]
}
```

For local-service businesses, use `LocalBusiness` (or a more specific subtype: `Plumber`, `Electrician`, `HomeAndConstructionBusiness`, etc.) with `address`, `geo`, `telephone`, `openingHoursSpecification`, `priceRange`, `areaServed`.

### Add `BreadcrumbList` to every non-homepage
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type":"ListItem","position":1,"name":"Home","item":"https://EXAMPLE.com/"},
    {"@type":"ListItem","position":2,"name":"Section","item":"https://EXAMPLE.com/section/"},
    {"@type":"ListItem","position":3,"name":"This Page","item":"https://EXAMPLE.com/section/this-page/"}
  ]
}
```

### Add `Article` / `BlogPosting` to every blog post
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Post title",
  "datePublished": "2026-05-17",
  "dateModified": "2026-05-17",
  "author": {"@type": "Person", "name": "Real author name"},
  "publisher": {"@type": "Organization", "name": "Brand"},
  "mainEntityOfPage": "https://EXAMPLE.com/blog/this-post/",
  "image": "https://EXAMPLE.com/assets/img/blog/this-post.webp"
}
```

### Add `FAQPage` if the page has an FAQ section
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text exactly as displayed on page",
      "acceptedAnswer": {"@type": "Answer", "text": "Full answer text"}
    }
  ]
}
```

### Add `HowTo` if the page has a step-by-step instruction
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to...",
  "totalTime": "PT5M",
  "step": [
    {"@type": "HowToStep", "position": 1, "name": "Step 1", "text": "Details"}
  ]
}
```

### Never
- Never invent reviews you don't have (`AggregateRating` without real data triggers manual penalties).
- Never schema-mark content that doesn't exist on the page.
- Never put schema in `<body>` — keep it in `<head>`.

---

## Phase 3 — AI crawler discoverability

### `/robots.txt` (root)
```
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: YouBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

# Bytespider is widely documented as non-compliant with robots.txt
User-agent: Bytespider
Disallow: /

Sitemap: https://EXAMPLE.com/sitemap.xml
```

Adjust per the site's specific stance on AI training (e.g., if the owner wants to block training crawlers but allow search crawlers, change accordingly — but the default for a small business site is "allow all" because visibility outweighs training-data concerns).

### `/sitemap.xml` (root)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://EXAMPLE.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- One <url> per canonical URL on the site -->
</urlset>
```

Validate at https://www.xml-sitemaps.com/validate-xml-sitemap.html. Sitemap must:
- Use canonical URLs only (the same ones in `<link rel="canonical">`).
- Be ≤50MB and ≤50,000 URLs. If larger, use a sitemap index.
- Be referenced in `/robots.txt`.

### `/llms.txt` (root) — see https://llmstxt.org
Markdown file with H1 = site name, blockquote = elevator pitch, H2 sections listing canonical URLs with short descriptions. Example structure:
```markdown
# Brand Name

> One-paragraph elevator pitch. What the site is, who it serves, what makes it credible.

## What we do
- Plain prose explanation, ≤300 words.

## Key pages
- [Home](https://EXAMPLE.com/): one-line description.
- [About](https://EXAMPLE.com/about/): one-line description.
- [Blog](https://EXAMPLE.com/blog/): one-line description.

## Contact
- Phone: +1 XXX XXX XXXX
- Email: hello@example.com
```

### `/llms-full.txt` (optional) — fuller content reference for AI ingestion
Concatenated key content sections so an AI can answer questions about the business without crawling 30+ pages.

### Content structure for AI extraction
For every important page:
- **H2-as-question format** when the section is FAQ-shaped ("How long does X last?" beats "X Lifespan").
- **Answer-first paragraph**: lead with a 1–2 sentence direct answer, then expand.
- **Atomic content chunks**: 40–80 word self-contained paragraphs with explicit subject and predicate. Avoid pronoun chains.
- **Bold the key claim** in the first sentence of each section.
- **Tables for comparisons.**
- **One topic per H2.**

---

## Phase 4 — Performance

### Core Web Vitals targets
| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5s |
| INP (Interaction to Next Paint) | ≤ 200ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 |
| FCP (First Contentful Paint) | ≤ 1.8s |
| TTFB (Time to First Byte) | ≤ 600ms |

Measured at the 75th percentile of all page loads. Use PageSpeed Insights for the field score and Lighthouse for the lab score.

### Page weight budgets (gzipped)
| Asset | Budget |
|---|---|
| HTML | < 100 KB |
| CSS (combined, minified) | < 80 KB |
| JS (combined, minified, deferred) | < 30 KB |
| Hero image WebP @ q82 | < 250 KB |
| Below-fold images WebP @ q72 | < 150 KB each |
| Above-the-fold transfer | < 600 KB |
| Full-page transfer | < 2 MB |

### Image rules — apply to every `<img>`
```html
<picture>
  <source srcset="/img/photo.avif" type="image/avif">
  <source srcset="/img/photo.webp" type="image/webp">
  <img src="/img/photo.jpg"
       alt="Specific, factual description"
       width="1600" height="900"
       loading="lazy"
       decoding="async">
</picture>
```

Above-the-fold hero image: `loading="eager" fetchpriority="high"` plus a preload hint in `<head>`:
```html
<link rel="preload" as="image" href="/img/hero.webp" type="image/webp" fetchpriority="high">
```

Responsive srcset:
```html
<img src="/img/photo-960.jpg"
     srcset="/img/photo-480.jpg 480w, /img/photo-960.jpg 960w, /img/photo-1600.jpg 1600w"
     sizes="(min-width: 960px) 50vw, 100vw"
     alt="..."
     width="1600" height="900"
     loading="lazy">
```

### Image conversion commands

ImageMagick:
```bash
# WebP at quality 82
convert input.jpg -quality 82 -resize 1600x output.webp
# JPEG progressive at quality 85
convert input.jpg -interlace Plane -quality 85 -resize 1600x output.jpg
```

Sharp (Node.js):
```bash
npx sharp-cli -i input.jpg -o output.webp --resize 1600 --webp-quality 82
```

cwebp (Google):
```bash
cwebp -q 82 -resize 1600 0 input.jpg -o output.webp
```

### CSS/JS strategy
- **Single CSS file**, minified, hash-versioned (`main.v2.css`), `<link>` in `<head>`.
- **Critical-above-the-fold CSS inlined** (≤14 KB) if it's a big site.
- **JS deferred or async**: `<script src="..." defer></script>` placed in `<head>` or at end of `<body>`.
- **No render-blocking third-party scripts** above the fold.
- **No `@import` in CSS** — flatten to a single file.

### Font strategy
- **Use the system font stack first**: `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;` — zero network requests, immediate render.
- If a brand font is required: WOFF2 only, self-hosted (never Google Fonts CDN — adds DNS lookup + RTT and triggers FOUT/FOIT), `font-display: swap`, max 2 weights, preload the regular weight.

### `.htaccess` template (Apache + Hostinger)
```apache
# ----------------------------------------------------------------------
# Default index
# ----------------------------------------------------------------------
DirectoryIndex index.html index.php

# ----------------------------------------------------------------------
# Force HTTPS + non-www → root (or www, pick one and stick with it)
# ----------------------------------------------------------------------
<IfModule mod_rewrite.c>
  RewriteEngine On

  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
  RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]

  # Clean URLs (optional; only if site uses /path → /path.html)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^([^.]+)$ $1.html [L]
</IfModule>

# ----------------------------------------------------------------------
# Custom error pages
# ----------------------------------------------------------------------
ErrorDocument 404 /404.html

# ----------------------------------------------------------------------
# Compression — gzip + brotli where available
# ----------------------------------------------------------------------
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json image/svg+xml text/xml application/xml
</IfModule>
<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS text/html text/css text/javascript application/javascript application/json image/svg+xml
</IfModule>

# ----------------------------------------------------------------------
# Browser caching
# ----------------------------------------------------------------------
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 1 hour"
  ExpiresByType text/css "access plus 30 days"
  ExpiresByType text/javascript "access plus 30 days"
  ExpiresByType application/javascript "access plus 30 days"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/avif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/x-icon "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# ----------------------------------------------------------------------
# Cache-Control (more granular than ExpiresByType)
# ----------------------------------------------------------------------
<IfModule mod_headers.c>
  <FilesMatch "\.(html)$">
    Header set Cache-Control "public, max-age=3600, must-revalidate"
  </FilesMatch>
  <FilesMatch "\.(css|js)$">
    Header set Cache-Control "public, max-age=2592000"
  </FilesMatch>
  <FilesMatch "\.(jpg|jpeg|png|webp|avif|svg|ico|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>

# ----------------------------------------------------------------------
# Security headers
# ----------------------------------------------------------------------
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"
  Header set Strict-Transport-Security "max-age=31536000; includeSubDomains" env=HTTPS
</IfModule>

# ----------------------------------------------------------------------
# MIME types (some hosts don't ship these by default)
# ----------------------------------------------------------------------
AddType image/webp .webp
AddType image/avif .avif
AddType font/woff2 .woff2

# ----------------------------------------------------------------------
# Hide sensitive files
# ----------------------------------------------------------------------
<FilesMatch "^\.(htaccess|gitignore|git|env|DS_Store)">
  Require all denied
</FilesMatch>
```

---

## Phase 5 — Accessibility

Run these checks. Fix only what doesn't change visible appearance.

- **`<html lang="...">`** present and correct.
- **Skip link** as first focusable element: `<a class="skip-link" href="#main">Skip to content</a>` (styled to appear only on focus).
- **`<main id="main">`** wraps page content (one per page).
- **Every `<img>` has `alt`.** Decorative images get `alt=""`.
- **Every form field has a `<label>`** (associated via `for`/`id` or wrapped).
- **Heading hierarchy correct**: one `<h1>` per page, no `<h3>` without an `<h2>` above it.
- **Tap targets ≥ 44×44 CSS px** (WCAG 2.5.5 AAA). If a button is smaller, add padding to meet the size (CSS only; doesn't change apparent size if the visual is a smaller inset shape).
- **Colour contrast ≥ 4.5:1** for body text, 3:1 for large text and UI components (WCAG AA). If a current text colour fails, find the nearest brand-compliant variant that passes — do not introduce a new colour.
- **Focus indicators visible** on all interactive elements. Default browser focus is fine; do not remove with `outline: none` unless you replace with something visible.
- **No keyboard traps.** Tab through the page; you should reach every interactive element and be able to leave.

---

## Phase 6 — Git + deploy hygiene (Hostinger)

### Branch model
If site has only `main`: keep it. If site has `main` + `dev`: develop on `dev`, merge to `main` when ready.

If Hostinger's Git integration is set to auto-deploy `main`: every push to `main` goes live in ~2 seconds. Treat `main` as production.

### `.gitignore` — add if missing or thin
```
# OS junk
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
desktop.ini

# Logs
*.log
logs/

# Backup / temp
*.bak
*.backup
*.old
*.orig
*.tmp
*.swp
*.swo
*~

# Editor / IDE
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# Env / local config
.env
.env.local

# Node
node_modules/
dist/
build/

# PHP
vendor/

# Cache / runtime
*.cache
.parcel-cache
.next
.nuxt
```

### Commit hygiene
- Use clear messages: `Pass N: short description`.
- One logical change per commit.
- Never `git push --force` to `main`.
- Never `--no-verify` past hooks.
- Never commit secrets (`.env`, API keys, COI PDFs marked private).

---

## Phase 7 — Verification before push

Run all of these on each meaningful change. Don't push if any fail.

```bash
# 1. HTML validates
# Use https://validator.w3.org (or html-validate locally if installed)

# 2. JSON-LD validates
# https://search.google.com/test/rich-results
# https://validator.schema.org

# 3. CSS validates
# https://jigsaw.w3.org/css-validator

# 4. JS syntax
for f in $(find . -name "*.js" -not -path "./node_modules/*" -not -path "./.git/*"); do
  node -c "$f" || echo "FAIL: $f"
done

# 5. PHP syntax (if PHP files exist)
for f in $(find . -name "*.php" -not -path "./vendor/*"); do
  php -l "$f" | grep -v "No syntax errors" && echo "FAIL: $f"
done

# 6. Sitemap parses
xmllint --noout sitemap.xml && echo "Sitemap OK"

# 7. robots.txt accessible (post-deploy)
curl -sI https://EXAMPLE.com/robots.txt | head -1

# 8. llms.txt accessible (post-deploy)
curl -sI https://EXAMPLE.com/llms.txt | head -1

# 9. 404 returns actual 404
curl -sI https://EXAMPLE.com/this-page-does-not-exist | head -1

# 10. Gzip / brotli active
curl -sI -H "Accept-Encoding: gzip, br" https://EXAMPLE.com/ | grep -i "content-encoding"

# 11. HTTPS forced
curl -sI http://EXAMPLE.com/ | grep -i "location:"

# 12. Lighthouse (use a local install or PageSpeed Insights)
# Mobile score targets: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90
```

---

## Phase 8 — Hostinger-specific notes

- **Auto-deploy** is configured per repo in hPanel → Websites → [site] → Advanced → Git. It pulls from a specific branch (usually `main`) into `public_html` on every push.
- **Root directory** in Hostinger Git settings is the server-side destination (typically `public_html`), not a subdirectory of the repo. The whole repo content lands in `public_html`.
- **PHP** is available on every Hostinger plan. Default version is current-stable (8.2+ as of 2026). `allow_url_fopen` is on by default. File writes in `public_html` are allowed.
- **Cron jobs** are in hPanel → Hosting → Advanced → Cron Jobs. Useful for periodic scripts (e.g., weather refresh, sitemap regen).
- **`.htaccess` works** — Hostinger runs LiteSpeed (Apache-compatible). Most `mod_rewrite`, `mod_headers`, `mod_expires`, `mod_deflate` directives Just Work.
- **No SSH on basic plans.** All work happens via Git or the file manager.
- **DNS and SSL** are managed in hPanel. HTTPS certificates auto-renew via Let's Encrypt.

---

## Phase 9 — Deliverable

When you've finished, give the user:

1. **A short report** in chat:
   - What you changed (bulleted).
   - Lighthouse before/after if you can measure.
   - Sitemap URL count before/after.
   - Total image weight before/after.
   - Page weight before/after.
   - Issues you couldn't fix without crossing into "visual change" territory — list these for explicit user decision.

2. **A `/docs/optimization-notes.md`** in the repo:
   - What each change does and why.
   - Any new files added (sitemap, robots, llms.txt, weather.php, etc.) and what maintains them.
   - Any cron jobs the user needs to set up in Hostinger.
   - Any image regeneration commands worth re-running periodically.
   - Items the user needs to verify or fill in (real WCB number, real reviews, real images, etc.).

3. **All commits on a feature branch** (e.g., `optimization/2026-05-17`), merged to `main` only after the user confirms.

---

## What good looks like

- Mobile Lighthouse: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90.
- LCP < 2.5s on slow 4G throttle.
- Total page weight under 2 MB for any single page.
- Every page has a unique title, unique meta description, canonical link, valid JSON-LD.
- sitemap.xml, robots.txt, llms.txt all valid and accessible.
- `.htaccess` enforces HTTPS, compression, caching, security headers.
- Visual UI/UX unchanged from baseline.

---

## Final note on judgement

If the site's existing code is bad enough that fixing it cleanly would require visible changes (e.g., the navigation is built with `<div>`s and `onclick` instead of `<a>`s), document the issue and propose a fix for the user to approve — don't ship the fix unilaterally. **Visual stability is the contract.**
