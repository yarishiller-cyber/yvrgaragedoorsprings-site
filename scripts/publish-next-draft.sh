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
#   8. git add + git commit (push left to you for review)
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

# --- generate a random PST/PDT timestamp 9 a.m. - 2 p.m. --------------------
read DATE_ISO DATE_DISPLAY ISO_DATE_ONLY <<EOF
$(python3 - <<'PY'
import datetime as dt, random, zoneinfo
tz = zoneinfo.ZoneInfo('America/Vancouver')
now = dt.datetime.now(tz)
hour = random.randint(9, 13)            # 9..13 inclusive → 9 a.m. through 1:59 p.m.
minute = random.randint(0, 59)
t = now.replace(hour=hour, minute=minute, second=random.randint(0, 59), microsecond=0)
display = t.strftime('%B-%-d-%Y').replace('-', ' ').replace(' ', ', ', 1)  # "May, 26 2026" — fix below
display = t.strftime('%B %-d, %Y')
print(t.isoformat(timespec='seconds'), '||', display, '||', t.strftime('%Y-%m-%d'))
PY
)
EOF
# the heredoc above writes "<iso> || <display> || <iso-date>"; split it
PARSED=$(python3 - <<'PY'
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
DATE_ISO=$(echo "$PARSED" | sed -n 1p)
DATE_DISPLAY=$(echo "$PARSED" | sed -n 2p)
ISO_DATE_ONLY=$(echo "$PARSED" | sed -n 3p)

echo "Publish time:     $DATE_DISPLAY  ($DATE_ISO)"

# --- read metadata via python -----------------------------------------------
read TITLE CATEGORY CAT_SLUG AUTHOR_FIRST LEDE_EXCERPT HERO_IMAGE HERO_ALT READ_MIN <<EOF
$(python3 - <<PY
import json
m = json.load(open('$META'))
print(m['title'])
print(m['category'])
print(m['cat_slug'])
print(m['author_first_name'])
print(m['lede_excerpt'])
print(m['hero_image'])
print(m['hero_alt'])
print(m['read_min'])
PY
)
EOF
# Actually do this properly per-line:
TITLE=$(python3 -c "import json; print(json.load(open('$META'))['title'])")
CATEGORY=$(python3 -c "import json; print(json.load(open('$META'))['category'])")
CAT_SLUG=$(python3 -c "import json; print(json.load(open('$META'))['cat_slug'])")
AUTHOR_FIRST=$(python3 -c "import json; print(json.load(open('$META'))['author_first_name'])")
LEDE_EXCERPT=$(python3 -c "import json; print(json.load(open('$META'))['lede_excerpt'])")
HERO_IMAGE=$(python3 -c "import json; print(json.load(open('$META'))['hero_image'])")
HERO_ALT=$(python3 -c "import json; print(json.load(open('$META'))['hero_alt'])")
READ_MIN=$(python3 -c "import json; print(json.load(open('$META'))['read_min'])")

# --- rewrite the post's date + remove noindex -------------------------------
INDEX_FILE="$TARGET_DIR/index.html"

python3 <<PY
import re, json, pathlib
p = pathlib.Path('$INDEX_FILE')
html = p.read_text()

# 1. Replace placeholder dates everywhere
html = html.replace('2026-06-01T11:00:00-07:00', '$DATE_ISO')
html = html.replace('Pending publish', '$DATE_DISPLAY')

# 2. Replace JSON-LD datePublished / dateModified placeholder
html = html.replace('"datePublished":"2026-06-01"', '"datePublished":"$ISO_DATE_ONLY"')
html = html.replace('"dateModified":"2026-06-01"', '"dateModified":"$ISO_DATE_ONLY"')

# 3. Remove the noindex meta — post is now public
html = re.sub(r'\\n?<!-- DRAFT POST.+?-->\\n?', '\\n', html, flags=re.DOTALL)
html = re.sub(r'<meta name="robots" content="noindex, nofollow">\\n?', '', html)

# 4. Fix <time datetime=...> tag (find any leftover placeholder)
html = re.sub(r'<time datetime="2026-06-01[^"]*">[^<]*</time>',
              f'<time datetime="$ISO_DATE_ONLY">$DATE_DISPLAY</time>', html)

p.write_text(html)
PY

# --- move into /blog/ -------------------------------------------------------
DST="blog/$SLUG"
if [ -d "$DST" ]; then
  echo "ERROR: $DST already exists. Aborting."
  exit 1
fi
mkdir -p "$DST"
mv "$INDEX_FILE" "$DST/index.html"
rm "$META"
rmdir "$TARGET_DIR"
echo "Moved to:         $DST/index.html"

# --- append to sitemap.xml --------------------------------------------------
SITEMAP_ENTRY="  <url><loc>https://yvrgaragedoorsprings.ca/blog/$SLUG/</loc><lastmod>$ISO_DATE_ONLY</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>"
# Insert just before </urlset>
python3 <<PY
import re, pathlib
p = pathlib.Path('sitemap.xml')
xml = p.read_text()
entry = """$SITEMAP_ENTRY
"""
xml = xml.replace('</urlset>', entry + '</urlset>')
p.write_text(xml)
PY
echo "Sitemap:          + /blog/$SLUG/"

# --- insert post-item card at top of blog/index.html ------------------------
python3 <<PY
import re, pathlib, html
p = pathlib.Path('blog/index.html')
html_text = p.read_text()

# Build new card
title_attr = html.escape("$TITLE", quote=True)
hero_alt_attr = html.escape("$HERO_ALT", quote=True)
lede_text = html.escape("$LEDE_EXCERPT")

card = f'''      <a class="post-item" href="/blog/$SLUG/" data-cat="$CAT_SLUG" data-keywords="wayne dalton torquemaster $CAT_SLUG conversion">
        <div class="post-item-thumb"><img src="$HERO_IMAGE" alt="{hero_alt_attr}" width="800" height="448" loading="lazy"></div>
        <div class="post-item-body">
          <span class="post-item-eyebrow">$CATEGORY</span>
        <h2 class="post-item-title">{title_attr}</h2>
        <p class="post-item-excerpt">{lede_text}</p>
        <div class="post-item-meta">$AUTHOR_FIRST · $READ_MIN min read · Updated $DATE_DISPLAY</div>
        </div>
      </a>

'''

# Insert immediately after <div class="post-list">
new = re.sub(
    r'(<div class="post-list">\\s*\\n)',
    r'\\1' + card,
    html_text,
    count=1
)
if new == html_text:
    raise SystemExit('FAIL: could not find <div class="post-list"> to inject into.')
p.write_text(new)
PY
echo "Blog index:       + post-item card injected"

# --- commit -----------------------------------------------------------------
git add -A
git commit -m "Publish blog post: $SLUG

Auto-published from _drafts/blog queue.
- Publish time: $DATE_DISPLAY ($DATE_ISO Pacific)
- Slug: $SLUG
- Category: $CATEGORY
- Author: $AUTHOR_FIRST
- Read time: $READ_MIN min

Added to sitemap.xml and inserted into blog/index.html post list.
Run 'git push origin main' after review." 2>&1 | tail -3

echo ""
echo "Done. Review with: git show --stat HEAD"
echo "Push when ready:   git push origin main"
