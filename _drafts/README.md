# Draft blog posts — auto-publish queue

This directory holds finished blog posts queued for staggered
auto-publishing. **Files in here are not served by the public site:**

1. `_drafts/.htaccess` denies all HTTP access to the directory.
2. Every draft `index.html` has `<meta name="robots" content="noindex,nofollow">`.
3. None of the draft URLs are listed in `sitemap.xml`.
4. None of the draft posts appear in `blog/index.html` post list.
5. `robots.txt` explicitly disallows `/_drafts/`.

## How publishing happens (automatic — set and forget)

A GitHub Action at `.github/workflows/publish-next-draft.yml` runs
**every 3 days at 17:00 UTC** (≈ 10:00 a.m. PDT in summer / 9:00 a.m.
PST in winter). The Action runs `scripts/publish-next-draft.sh`, which:

1. Picks the lowest-numbered draft in `_drafts/blog/`
2. Generates a **random Vancouver-time byline timestamp** between
   9:00 a.m. and 2:00 p.m. (random hour AND minute)
3. Rewrites the post's `<time>`, JSON-LD dates, and visible byline
4. Removes the `noindex` meta — post is now public
5. Moves `_drafts/blog/NN-slug/` → `blog/slug/` (NN prefix stripped)
6. Appends the URL to `sitemap.xml`
7. Inserts a fresh `<a class="post-item">` card at the top of
   `blog/index.html`
8. Commits as "YVR Auto-Publish" and pushes to `main`

Once `main` updates, your Hostinger (or whatever) deploy hook
re-publishes the site. The new post is live.

## How to trigger a publish manually

Three ways:

**A — GitHub UI (zero typing):**
1. Go to **GitHub → Actions → "Publish next blog draft"**
2. Click **Run workflow** → keep default branch (`main`) → **Run workflow**
3. Wait ~30 seconds. The new post is live.

**B — Local terminal:**
```
./scripts/publish-next-draft.sh
git push origin main
```

**C — Specific draft out of order:**
```
./scripts/publish-next-draft.sh --slug tsawwassen-salt-air-torquemaster
git push origin main
```

## Queue state — current order

The script publishes in numeric order. Today's queue:

```
01-westwood-plateau-torquemaster-coquitlam        (Coquitlam, Dale)
02-walnut-grove-langley-torquemaster-1990s        (Langley,   Dale)
03-tsawwassen-salt-air-torquemaster               (Tsawwassen,Madison)
04-cloverdale-clayton-surrey-torquemaster-country (Surrey,    Dale)
05-silver-valley-albion-maple-ridge-torquemaster-plus (Maple Ridge, Dale)
06-richmond-lulu-island-delta-silt-torquemaster   (Richmond,  Madison)
```

To reorder, just rename the directories (e.g. `mv 03- 01-` to bump
one to the front).

## When the queue runs out

The Action checks the queue at the top of each run. If `_drafts/blog/`
is empty, it logs "No drafts queued" and exits cleanly — no broken
state, no error noise.

To add more, ask Claude to write another batch from a research doc.
The pattern is in `scripts/build-drafts.py`.
