#!/usr/bin/env bash
# Publish the next queued blog draft.
#
# Run from the repo root:
#     ./scripts/publish-next-draft.sh
#
# What it does:
#   1. Picks the lowest-numbered subdirectory in _drafts/blog/
#   2. Generates a random Vancouver-time publish timestamp between
#      9:00 a.m. and 2:00 p.m. (PST or PDT depending on the date)
#   3. Rewrites the post's <time datetime=...>, the visible byline date,
#      and the Article JSON-LD datePublished/dateModified
#   4. Removes the noindex meta tag (post becomes public)
#   5. Moves _drafts/blog/NN-slug/ -> blog/slug/   (NN prefix stripped)
#   6. Appends a <url> entry to sitemap.xml
#   7. Inserts a new <a class="post-item"> at the top of the
#      .post-list block in blog/index.html
#   8. git add + git commit (push left to caller — typically the
#      GitHub Action that invoked us)
#
# Manual override:
#     ./scripts/publish-next-draft.sh --slug walnut-grove-langley-torquemaster-1990s
#   forces a specific draft to publish regardless of queue order.

set -euo pipefail
cd "$(dirname "$0")/.."

# --- locate next draft ------------------------------------------------------
TARGET_DIR=""
if [ "${1-}" = "--slug" ] && [ -n "${2-}" ]; then
  TARGET_DIR=$(find _drafts/blog -maxdepth 1 -mindepth 1 -type d -name "*-$2" | head -1)
  [ -z "$TARGET_DIR" ] && { echo "No draft matches slug: $2"; exit 1; }
else
  TARGET_DIR=$(find _drafts/blog -maxdepth 1 -mindepth 1 -type d | sort | head -1)
  [ -z "$TARGET_DIR" ] && { echo "No drafts queued in _drafts/blog/."; exit 0; }
fi

DIR_NAME=$(basename "$TARGET_DIR")
SLUG=$(echo "$DIR_NAME" | sed 's/^[0-9]*-//')
META="$TARGET_DIR/meta.json"
[ ! -f "$META" ] && { echo "Missing $META — can't read post metadata."; exit 1; }

echo "Publishing draft: $DIR_NAME"
echo "Final slug:       $SLUG"

# --- generate a random Vancouver-time publish timestamp ---------------------
# Hour: 9..13 inclusive  → posts appear between 9 a.m. and 1:59 p.m. PST/PDT.
# (Range upper bound is 13 because of the inclusive randint; 14 would let us
# slip into 2:59, past the user's "9-2pm" window.)
PARSED=$(python3 <<'PY'
import datetime as dt, random, zoneinfo
tz = zoneinfo.ZoneInfo('America/Vancouver')
now = dt.datetime.now(tz)
hour = random.randint(9, 13)
minute = random.randint(0, 59)
t = now.replace(hour=hour, minute=minute, second=random.randint(0, 59), microsecond=0)
print(t.isoformat(timespec='seconds'))
print(t.strftime('%B %-d, %Y'))
print(t.strftime('%Y-%m-%d'))
PY
)
DATE_ISO=$(echo "$PARSED"  | sed -n 1p)     # 2026-06-01T11:42:17-07:00
DATE_DISPLAY=$(echo "$PARSED" | sed -n 2p)  # June 1, 2026
ISO_DATE_ONLY=$(echo "$PARSED" | sed -n 3p) # 2026-06-01
echo "Publish time:     $DATE_DISPLAY  ($DATE_ISO)"

# --- pull post metadata -----------------------------------------------------
TITLE=$(python3        -c "import json; print(json.load(open('$META'))['title'])")
CATEGORY=$(python3     -c "import json; print(json.load(open('$META'))['category'])")
CAT_SLUG=$(python3     -c "import json; print(json.load(open('$META'))['cat_slug'])")
AUTHOR_FIRST=$(python3 -c "import json; print(json.load(open('$META'))['author_first_name'])")
LEDE_EXCERPT=$(python3 -c "import json; print(json.load(open('$META'))['lede_excerpt'])")
HERO_IMAGE=$(python3   -c "import json; print(json.load(open('$META'))['hero_image'])")
HERO_ALT=$(python3     -c "import json; print(json.load(open('$META'))['hero_alt'])")
READ_MIN=$(python3     -c "import json; print(json.load(open('$META'))['read_min'])")

# --- rewrite the post's dates + remove noindex meta -------------------------
INDEX_FILE="$TARGET_DIR/index.html"
DATE_ISO="$DATE_ISO" DATE_DISPLAY="$DATE_DISPLAY" ISO_DATE_ONLY="$ISO_DATE_ONLY" INDEX_FILE="$INDEX_FILE" python3 <<'PY'
import os, re, pathlib
p = pathlib.Path(os.environ['INDEX_FILE'])
html = p.read_text()

date_iso     = os.environ['DATE_ISO']
date_display = os.environ['DATE_DISPLAY']
iso_only     = os.environ['ISO_DATE_ONLY']

# Replace placeholders the build-drafts.py script left behind
html = html.replace('2026-06-01T11:00:00-07:00', date_iso)
html = html.replace('Pending publish', date_display)
html = html.replace('"datePublished":"2026-06-01"', f'"datePublished":"{iso_only}"')
html = html.replace('"dateModified":"2026-06-01"',  f'"dateModified":"{iso_only}"')

# Fix any leftover <time datetime="..."> placeholder format
html = re.sub(
    r'<time datetime="2026-06-01[^"]*">[^<]*</time>',
    f'<time datetime="{iso_only}">{date_display}</time>',
    html,
)

# Strip the DRAFT POST comment + the noindex meta — post is now public
html = re.sub(r'\n?<!-- DRAFT POST[^>]*-->\n?', '\n', html)
html = re.sub(r'<meta name="robots" content="noindex, nofollow">\n?', '', html)

p.write_text(html)
PY

# --- move directory into /blog/ ---------------------------------------------
DST="blog/$SLUG"
if [ -d "$DST" ]; then
  echo "ERROR: $DST already exists. Aborting before clobbering anything."
  exit 1
fi
mkdir -p "$DST"
mv "$INDEX_FILE" "$DST/index.html"
rm "$META"
rmdir "$TARGET_DIR"
echo "Moved to:         $DST/index.html"

# --- append to sitemap.xml --------------------------------------------------
SITEMAP_ENTRY="  <url><loc>https://yvrgaragedoorsprings.ca/blog/$SLUG/</loc><lastmod>$ISO_DATE_ONLY</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>"
SITEMAP_ENTRY="$SITEMAP_ENTRY" python3 <<'PY'
import os, pathlib
p = pathlib.Path('sitemap.xml')
xml = p.read_text()
entry = os.environ['SITEMAP_ENTRY'] + '\n'
if entry.strip() in xml:
    print('Sitemap entry already present, skipping.')
else:
    xml = xml.replace('</urlset>', entry + '</urlset>')
    p.write_text(xml)
PY
echo "Sitemap:          + /blog/$SLUG/"

# --- inject post-item card at top of blog/index.html ------------------------
SLUG="$SLUG" \
CAT_SLUG="$CAT_SLUG" \
HERO_IMAGE="$HERO_IMAGE" \
HERO_ALT="$HERO_ALT" \
CATEGORY="$CATEGORY" \
TITLE="$TITLE" \
LEDE_EXCERPT="$LEDE_EXCERPT" \
AUTHOR_FIRST="$AUTHOR_FIRST" \
READ_MIN="$READ_MIN" \
DATE_DISPLAY="$DATE_DISPLAY" \
python3 <<'PY'
import os, re, pathlib, html as html_lib
p = pathlib.Path('blog/index.html')
html = p.read_text()

esc_attr = lambda s: html_lib.escape(s, quote=True)
esc_text = lambda s: html_lib.escape(s, quote=False)

card = (
'      <a class="post-item" href="/blog/' + os.environ['SLUG'] + '/" '
'data-cat="' + esc_attr(os.environ['CAT_SLUG']) + '" '
'data-keywords="wayne dalton torquemaster ' + esc_attr(os.environ['CAT_SLUG']) + ' conversion vancouver">\n'
'        <div class="post-item-thumb"><img src="' + esc_attr(os.environ['HERO_IMAGE']) + '" '
'alt="' + esc_attr(os.environ['HERO_ALT']) + '" width="800" height="448" loading="lazy"></div>\n'
'        <div class="post-item-body">\n'
'          <span class="post-item-eyebrow">' + esc_text(os.environ['CATEGORY']) + '</span>\n'
'        <h2 class="post-item-title">' + esc_text(os.environ['TITLE']) + '</h2>\n'
'        <p class="post-item-excerpt">' + esc_text(os.environ['LEDE_EXCERPT']) + '</p>\n'
'        <div class="post-item-meta">' + esc_text(os.environ['AUTHOR_FIRST']) + ' · '
+ esc_text(os.environ['READ_MIN']) + ' min read · Updated ' + esc_text(os.environ['DATE_DISPLAY']) + '</div>\n'
'        </div>\n'
'      </a>\n\n'
)

new = re.sub(r'(<div class="post-list">\s*\n)', r'\1' + card.replace('\\', r'\\'), html, count=1)
if new == html:
    raise SystemExit('FAIL: could not find <div class="post-list"> in blog/index.html')
p.write_text(new)
PY
echo "Blog index:       + post-item card injected at top"

# --- commit -----------------------------------------------------------------
git add -A
git commit -m "Publish blog post: $SLUG

Auto-published from _drafts/blog queue.
- Publish time: $DATE_DISPLAY ($DATE_ISO Pacific)
- Slug: $SLUG
- Category: $CATEGORY
- Author: $AUTHOR_FIRST
- Read time: $READ_MIN min

Added to sitemap.xml and inserted at the top of the
blog/index.html post-list grid." 2>&1 | tail -3

echo ""
echo "Commit ready. Caller (GitHub Action or you) is responsible for the push."
