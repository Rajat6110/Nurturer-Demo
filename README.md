# NURTURER — Copper-Lined Pet Bowls E-Commerce Website

A complete D2C + B2B e-commerce build for **NURTURER**, a pet feeding brand launching elevated, copper-lined bowls for dogs and cats in the Philippines first, then Southeast Asia.

**Stack:** Static HTML + CSS + vanilla JavaScript (zero dependencies, zero build step). State (cart, auth, orders, design approvals, points) persists in `localStorage` — every flow is clickable end-to-end as an interactive prototype.

## Run it
Just open `index.html` in any browser — or serve it:

```
python -m http.server 8080
# → http://localhost:8080
```

**Design/motion pass:** Fraunces + Satoshi typography, scroll reveals, inertia scrolling (Lenis), custom paw cursor with dog/cat variants (desktop only), pet-themed SVG animation moments, and a lazy hero-video system. Drop your exported video at `assets/video/hero.mp4` (+ optional `.webm`) and it activates automatically — until then a branded Ken-Burns poster plays. Full details + Lottie swap points: `docs/11-motion-design-notes.md`.

## Pages
| Page | Purpose |
|---|---|
| `index.html` | Homepage — 6–8 scroll funnel: Discover → Educate → Convert → Loyalty |
| `shop.html` | Catalog with Dogs/Cats + Premium/Mainstream filters |
| `product.html?id=…` | PDP template — life-stage variants, feature→benefit table, reviews, trust accordions |
| `customize.html` | 5-step Custom Design Studio with live SVG preview + approval workflow |
| `cart.html` / `checkout.html` | Vouchers, free-shipping meter, PH/SEA checkout, foundation round-up |
| `account.html` | Login/register, order history, **design approval tracking**, Copper Points |
| `b2b.html` | Wholesale portal — partner types, tier ladder, inquiry form |
| `learn.html` | Copper story + interactive comparison modules + safety/care/warranty docs |
| `blog.html`, `faq.html`, `rewards.html`, `foundation.html`, `contact.html` | Content, trust, loyalty, cause, support |

Demo vouchers: `NURTURER10` (10% off), `PAWSFIRST` (₱150 off ≥₱1,500). Try the full custom-design journey: Customize Studio → submit → Account → Design Approvals → approve.

## Strategy deliverables (`docs/`)
1. `01-site-map.md`
2. `02-homepage-wireframe-copy.md` — ready-to-publish copy
3. `03-b2c-b2b-branching.md`
4. `04-comparison-module.md`
5. `05-product-page-template.md` (+ 10-SKU catalog)
6. `06-customization-flow.md`
7. `07-loyalty-program.md`
8. `08-content-calendar.md`
9. `09-localization-checklist.md`
10. `10-launch-checklist.md`

## Flagged assumptions (not stated in brief)
- ₱350 flat engraving fee; free-shipping threshold ₱1,500; COD fee-free; shipping fee ₱180 PH / ₱590 SEA.
- 10-SKU catalog names/prices invented to satisfy "pet bowls, dogs & cats, Premium + Mainstream".
- Loyalty thresholds/redemption values are proposed defaults for alpha tuning.
- Foundation figures (12,400+ meals, 7 shelters) are illustrative placeholders until live counters activate at B2C go-live.
- All product imagery is original inline SVG (brand-consistent stand-in for the "cuteness overload" photography shoot).
