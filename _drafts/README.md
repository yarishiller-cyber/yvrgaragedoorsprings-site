# Draft blog posts — scheduled publishing queue

This directory contains finished blog posts queued for staggered
publishing. **Files in here are not served by the public site:**

1. `_drafts/.htaccess` denies all HTTP access to this directory.
2. Every draft `index.html` has `<meta name="robots" content="noindex,nofollow">`.
3. None of the draft URLs are listed in `sitemap.xml`.
4. None of the draft posts appear in `blog/index.html` post list.
5. `robots.txt` explicitly disallows `/_drafts/`.

## Publishing cadence

Target: one post every 3 days at a random time between
9:00 a.m. and 2:00 p.m. PST (Vancouver time).

## How to publish the next post

Run from the repo root:

```
./scripts/publish-next-draft.sh
```

The script will:
1. Pick the lowest-numbered draft directory in `_drafts/blog/`
2. Generate a random Vancouver-time timestamp between 9 a.m. and 2 p.m.
3. Rewrite the post's `<time datetime=...>` + visible byline date
4. Move `_drafts/blog/NN-slug/` → `blog/slug/` (drops the NN prefix)
5. Append the new URL to `sitemap.xml`
6. Insert a new `<a class="post-item">` card at the top of `blog/index.html`
7. Git add + commit (push is left to you so you can review)

## Automation

If your host supports cron, schedule:
```
# Every 3 days at random minute past 9 a.m. PST
0 17 */3 * *  cd /path/to/repo && ./scripts/publish-next-draft.sh && git push origin main
```
(17:00 UTC ≈ 9:00 a.m. PST during DST; 18:00 UTC during PST.)

Or run manually every 3 days.
