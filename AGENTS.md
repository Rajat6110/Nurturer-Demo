# AGENTS.md — Project Context for AI Agents

> Read this file first before making changes. It explains what this project is, how it is
> architected, which conventions are load-bearing, and which bugs have already been fixed
> (so you don't reintroduce them).

---

## 1. What this is

**NURTURER** — a complete D2C + B2B e-commerce website for a pet feeding brand
(copper-lined, elevated bowls for dogs & cats; Philippines first, then SEA).

- **Stack:** static HTML + CSS + vanilla JavaScript. **Zero dependencies, zero build step.**
  Every page works when opened directly via `file://` (no server required).
- **State:** cart, auth, orders, design approvals, loyalty points, audience mode all persist
  in `localStorage` under keys prefixed `nrt_`. The whole funnel is clickable end-to-end.
- **Run:** open `index.html`, or `python -m http.server 8080`.
- **Brand palette (do not drift):** cream `#faf5ee`, copper `#b87333` / deep `#8a5220` /
  dark `#6f3f16`, ink `#2a211b`, green `#3f7259`, gold `#d9a441`.
  Fonts: Fraunces (display, Google Fonts) + Satoshi (body, Fontshare) with system fallbacks.

## 2. Directory map

```
index.html … rewards.html   14 standalone pages (no SPA router; shared chrome injected by JS)
assets/
  img/hero-poster.jpg       bitmap hero poster (1920×1080, extracted from the video)
  img/hero-poster.svg       legacy vector poster (kept, no longer referenced)
  video/hero.mp4|.webm      15s cinematic homepage hero loop (h264+AAC / VP9)
  video/hero-dog.mp4        dog-only cut (for a Dogs section/page)
  video/hero-cat.mp4        cat-only cut (for a Cats section/page)
  video/hero-vertical.mp4   1080×1920 cut (reels / future mobile hero)
css/
  base.css        tokens (:root), typography, layout, header/footer, buttons, hero, toasts
  components.css  cards, grids, compare module, forms, tables, PDP, cart, studio, chat…
  motion.css      page fades, scroll reveals (.rv), paw cursor, HERO VIDEO SYSTEM, scrim
  pets.css        pet-themed keyframes (kenBurns, floaty, wagTail, catBlink, ripple…),
                  micro-interaction easing audit
  cine.css        the pure-CSS "storyboard" fallback (5 animated SVG scenes) + layer order
js/
  main.js    NRT namespace: SVG art lib (bowlArt/petArt/icon), product cards, toasts,
             cart store, auth, audience branching, header/footer injection, newsletter,
             chat widget, abandoned-cart nudge
  motion.js  page fades, Lenis smooth scroll + eased anchors, scroll reveals,
             paw cursor, hero video lazy activation, scroll-perf observers, parallax
  cine.js    injects the 5-scene animated SVG storyboard into .hero-media (fallback only)
  home.js    homepage renderers (features, product picks, testimonials, blog teaser)
  shop.js / product.js / cart.js / checkout.js / customize.js / account.js / compare.js
data/products.js   NRT_PRODUCTS (10 SKUs), NRT_TESTIMONIALS, NRT_POSTS — plain globals
docs/              11 strategy/planning markdown deliverables (site map, copy, B2B, loyalty…)
tools/
  generate_hero_video.py  procedural cinematic video renderer (numpy/Pillow/imageio/ffmpeg)
  verify_videos.py        ffprobe wrapper that prints duration/resolution/codec of outputs
  preview/*.png           still frames of each video scene (1.5s/4.5s/8s/12s/14.5s)
```

## 3. Page inventory

| Page | Purpose |
|---|---|
| `index.html` | Homepage scroll funnel: hero video → audience branch → copper explainer → comparison → features → products → reviews → customize CTA → newsletter/blog |
| `shop.html` | Catalog, Dogs/Cats + Premium/Mainstream filters (`?species=dog|cat`) |
| `product.html?id=…` | PDP: gallery, size/color, engraving upsell, specs, reviews |
| `customize.html` | 5-step design studio, live SVG preview, submits approval to account |
| `cart.html` / `checkout.html` | Vouchers (`NURTURER10`, `PAWSFIRST`), free-ship meter, PH/SEA checkout |
| `account.html` | Auth, orders, design-approval tracking, Copper Points |
| `b2b.html` | Wholesale portal (MOQ 24, tier ladder, inquiry form) |
| `learn.html` `blog.html` `faq.html` `rewards.html` `foundation.html` `contact.html` | Content/trust/support |

## 4. JavaScript architecture

- One global namespace: `window.NRT` (created in `main.js`). No modules, no bundler.
- Every JS file is an IIFE; pages include only what they need. Shared order on most pages:
  `data/products.js → js/main.js → js/motion.js → (page script)`.
- Header/footer are **injected** into `<div id="siteHeader">` / `<div id="siteFooter">` by
  `NRT.renderHeader()` / `NRT.renderFooter()` on `DOMContentLoaded`. Never hardcode nav HTML.
- `NRT.cart` is the single source of truth for cart lines
  (`{id, sizeKey, colorKey, qty, unitPrice, delta, customized, text…}`); badge id `#cartCount`.
- `NRT.audience` toggles B2C/B2B mode; elements with `data-b2c-only` / `data-b2b-only`
  are shown/hidden accordingly; pill buttons `#pillB2C` / `#pillB2B`.
- Money is always formatted via `NRT.php(n)` → `₱1,234`.
- All inline SVG art comes from `NRT.bowlArt({coat, stand, text, motif})` and `NRT.icon(name)`
  — reuse these instead of pasting new SVG strings.

### localStorage keys (prefix `nrt_`)
`cart`, `user`, `audience`, `subscribers`, `points`, `pointsHistory`, plus page-level keys
(orders, design approvals) set in `account.js` / `customize.js` / `checkout.js`.

## 5. CSS architecture & layering rules

Load order in every page: `base → components → motion → pets → cine`.
Later files may override earlier ones (e.g. `.hero-video .hero-inner` in motion.css overrides
the grid in base.css). Keep that order when creating new pages.

- Design tokens live **only** in `:root` of `base.css` — use `var(--copper)` etc., never raw hex.
- Fluid type via `clamp()`; headings use `text-wrap: balance`.
- Buttons: `.btn` + variant (`btn-primary/dark/outline/green/ghost/white`) + optional `.btn-sm`.
- Spacing helpers: `.mt-0…3`, `.mb-1…3`, `.center`, `.text-muted`, `.tag-note`.

## 6. Hero media stack — CRITICAL (read before touching)

The homepage hero is a layered stack inside `<section class="hero hero-video">`:

```
z-order inside .hero-media (which itself is z-index:-1 within .hero):
  0  img.hero-poster   (bitmap JPG; Ken-Burns 22s zoom; mobile fallback)
  1  .cine             (5 animated full-screen SVG scenes injected by cine.js)
  2  video#heroVideo   (assets/video/hero.webm → hero.mp4, sources attached lazily by JS)
  3  .hero-scrim       (dark gradient that makes the white text readable)
  4  .hero-inner       (headline/CTAs; white text + text-shadows)
```

**Activation flow (motion.js `initHeroVideo`):** sources use `data-src` (no bytes until idle);
on desktop (non-mobile, non-data-saver) JS swaps them to `src`, calls `load()`+`play()`;
on `canplay` it adds `.video-live` to `.hero-media` and `.has-video` to `.hero`.

**GOTCHAS — already fixed, do not regress:**
1. `.hero-media` creates a stacking context (`z-index:-1`). Any overlay inside it needs a
   **positive** z-index to paint above the poster/video. The scrim once had `z-index:-1`
   and painted *behind* the artwork → white hero text was invisible. Scrim is `z-index:3`.
2. `.video-live .cine` is `display:none` (not just opacity) — opacity:0 elements keep
   animating and burn CPU/GPU.
3. `.hero.hero-paused` (toggled by IntersectionObserver / visibilitychange) pauses all hero
   animations and the video itself while offscreen.
4. On `max-width:760px` the video and `.cine` are both disabled — the poster is the mobile hero.
5. The poster must stay a **bitmap** (JPG). Scaling an SVG forces re-rasterization every
   frame; a bitmap is pure GPU compositing.

## 7. Motion & performance systems (motion.js)

- **Smooth scroll:** Lenis 1.1.14 from unpkg (graceful if offline), `lerp:0.16`.
  `html { scroll-behavior: auto }` is deliberate — native CSS smooth-scroll fights Lenis
  and causes stutter. Anchor clicks are intercepted and routed through `goTo()`.
- **Scroll reveals:** elements matching `REVEAL_SEL` get `.rv`, then `.in` when intersecting.
  `.rv.in` drops `will-change` after revealing (permanent will-change on many cards = jank).
- **Paw cursor:** desktop-only (`hover:hover and pointer:fine`), one rAF loop, trail prints
  throttled to ≥90 ms apart. `data-cursor="dog|cat"` switches the claw variant.
- **Scroll perf (`initScrollPerf`):** header drops `backdrop-filter` once scrolled
  (`.site-header.is-scrolled`); hero video/animations pause offscreen or on tab-hide.
- **Page transitions:** click interception + `.page-fade` overlay; `@view-transition` when supported.
- `prefers-reduced-motion` disables essentially everything (see pets.css bottom block).

## 8. The hero video & how to regenerate it

`tools/generate_hero_video.py` renders the brand shot list procedurally
(numpy + Pillow + imageio + imageio-ffmpeg; install with `pip install numpy imageio imageio-ffmpeg`):

- Scenes: A 0–3s macro copper ripple → B 3–6s pull-back reveal → C 6–10s puppy eats →
  D 10–14s cat at counter bowl → E 14–15s calm hold with light fade. Cross-dissolves
  straddle boundaries (weights always sum to 1 — a previous bug produced black frames).
- Outputs 15.00s loops: `hero.mp4` (1920×1080 h264+AAC), `hero.webm` (VP9),
  `hero-dog.mp4`, `hero-cat.mp4` (1280×720), `hero-vertical.mp4` (1080×1920).
- No text/logos baked in — the site overlays headline/CTA in HTML/CSS by design.
- Ambient audio bed (warm pad + water plinks) is synthesized and muxed in; the hero sound
  button (`#heroSoundBtn`) unmutes it.
- `tools/verify_videos.py` probes the outputs; `tools/preview/*.png` holds scene stills.
- To refresh the poster after re-rendering:
  `ffmpeg -ss 5.55 -i assets/video/hero.mp4 -frames:v 1 -q:v 3 assets/img/hero-poster.jpg`

## 9. Conventions & environment notes

- **No build step.** Don't introduce npm/webpack/TS. Keep `file://` compatibility
  (no fetch() of local JSON, no ES modules with CORS issues — plain scripts only).
- Windows dev machine; the default shell is **PowerShell** — `&&` does not work in
  one-liners, use `;`. Python 3.14 + Pillow/numpy/imageio/imageio-ffmpeg are installed
  (user site-packages).
- Product imagery is original inline SVG (`NRT.bowlArt`) standing in for brand photography.
- Demo vouchers: `NURTURER10` (10% off), `PAWSFIRST` (₱150 off ≥₱1,500).
- Strategy docs in `docs/01…11` are the source of truth for copy/flows; `README.md` is the
  human-facing overview; this file is the agent-facing technical map.

## 10. Change log (recent)

- **Hero text visibility fix:** scrim re-layered to `z-index:3` (+ text-shadows, stronger
  gradient); cine storyboard re-layered above poster (`z-index:1`).
- **Hero video shipped:** 5 procedural videos generated into `assets/video/`; poster swapped
  to bitmap JPG; sound button functional (mp4 has an ambient track).
- **Scroll performance pass:** removed CSS smooth-scroll/Lenis conflict; header blur
  kill-switch when scrolled; storyboard `display:none` when video live; hero video +
  animations pause offscreen/hidden-tab; mobile skips storyboard; removed permanent
  `will-change` from cards and revealed elements; Lenis lerp 0.12→0.16.