# 11 — Motion & Polish Pass: Notes + Asset Swap Guide

## What was added (this pass)
| System | Files | Notes |
|---|---|---|
| Hero video system | `index.html`, `js/motion.js`, `css/motion.css` | Full-bleed `<video>`: autoplay/muted/loop/playsinline, lazy source attach after idle, data-saver + mobile aware, poster fallback w/ Ken-Burns, gradient scrim, mute toggle |
| Typography | `css/base.css`, font links in all heads | Display: **Fraunces** (variable, Google Fonts) · Body: **Satoshi** (Fontshare) · fluid type scale tokens `--fs-h1..caption`, tightened tracking (-0.03em h1 / -0.022em h2), balanced line wrapping |
| Scroll reveals | `js/motion.js` (IntersectionObserver engine) | Auto-tags section heads, cards, tiles, banners; grid stagger 90ms; cascading timelines |
| Micro-interactions | `css/pets.css` audit block | Chips, size options, swatches, pay options, account nav, qty buttons, social chips — all eased (200ms soft cubic-bezier); CTA arrows nudge on hover |
| Pet moments | `css/pets.css` + inline SVGs in `index.html` | Wagging-tail dog (reviews H2), blinking cat (shop-by-companion H2), paw-print sequence walking into the Customize CTA, water-freshness ripple rings (copper explainer), sparkle sweep on the copper flag, breathing product art on homepage spotlight |
| Custom paw cursor | `js/motion.js`, `css/motion.css` | Lerped follow (0.2) + faster dot (0.55), fading paw-print trail, dog/cat variants via `[data-cursor]` or species links, link/down states, **auto-disabled on touch/reduced-motion** |
| Smooth scrolling + route fades | `js/motion.js`, `css/motion.css` | Lenis 1.1.14 via unpkg (guarded — native scroll if offline), eased anchor scrolling w/ header offset, cross-document View Transitions + manual fade overlay fallback |

## Swap-in your real assets later

### 1. Hero video (currently a branded poster placeholder)
Export from Gemini, then compress to two formats and drop them here:

```
assets/video/hero.mp4    <- required (H.264, ~6-8 Mbps max, 10-20s loop ideal)
assets/video/hero.webm   <- optional VP9 fallback (smaller)
```

ffmpeg one-liners (install ffmpeg, or use an online compressor):

```
ffmpeg -i input.mp4 -an -vcodec libx264 -crf 26 -preset slow -vf "scale=-2:1080" hero.mp4
ffmpeg -i input.mp4 -an -vcodec libvpx-vp9 -crf 34 -b:v 0 -vf "scale=-2:1080" hero.webm
```

No code changes needed — `js/motion.js` auto-detects the files. Until then: desktop/mobile both show the animated poster (`assets/img/hero-poster.svg`). Mobile always uses the poster (performance choice per brief).

### 2. Lottie/GIF swap points (current animations are hand-built CSS/SVG — crisp, zero-dependency)
Marked spots to replace with brand-owned Lottie (via `lottie-web` or `<lottie-player>`) when ready:
- `[WAG]` wagging-tail dog → search `wag-dog` in `index.html` (~reviews section)
- `[BLINK]` blinking cat → search `blink-cat` in `index.html`
- `[PAWS]` paw-print sequence → search `paw-seq` in `index.html`
- `[RIPPLE]` water freshness rings → search `ripple-ring` in `index.html`
- `[SPARK]` copper shine sweep → the `.spark` span inside the hero copper flag

Free sources: LottieFiles (lottiefiles.com) — search "dog tail wag", "cat blink", "paw prints", "water ripple", "sparkle shine".

## Performance guardrails shipped
- Video bytes requested only after window idle (`requestIdleCallback`) — poster paints first
- Skips video entirely on Save-Data / 2G connections and ≤760px viewports
- Reveal/cursor systems disabled under `prefers-reduced-motion`
- Trail prints capped by throttle (90ms min gap, auto-removed after 850ms)
