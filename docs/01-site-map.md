# 01 — Site Map

NURTURER e-commerce website structure. Implemented pages are marked ✅ (this repo ships a working build of every page).

## 1. Global elements (all pages)
- Announcement bar: free PH shipping over ₱1,500 + SEA shipping status (rotates per market)
- Sticky header: logo · Shop Dogs · Shop Cats · Why Copper? · Customize · For Business · Blog · **B2C/B2B audience pill** · Account · Cart (live count)
- Floating **messenger/chat widget** on every page (bot-first, human escalation 9–6 PHT)
- Abandoned-cart reminder banner (fires when cart holds items)
- Newsletter capture block + full footer sitemap
- Toast notification system

## 2. Home (`index.html`) ✅
- Scroll 1: Hero — "Mealtime, elevated." copper-lined claim above fold; B2C/B2B branch cards
- Scroll 2: What copper lining does (plain-language science + stats)
- Scroll 3: Interactive comparison module (material matrix + wipe slider)
- Scroll 4: Feature → Benefit grid (6 tiles from brand brief)
- Scroll 5: Product spotlight grid (Dogs & Cats, both tiers)
- Scroll 6: Reviews/testimonials + social proof strip (Meta, TikTok, Pinterest, #NurturerMeals UGC)
- Scroll 7: Customize CTA banner + Pet Foundation give-back card
- Scroll 8: Newsletter capture + blog teaser

## 3. Shop
- `shop.html` ✅ — catalog with species filter (Dogs/Cats/All), tier filter (Premium/Mainstream), sort; deep-links `?species=dog|cat&tier=premium|mainstream`
- `product.html?id=<sku>` ✅ — product detail template (see Deliverable 05)

## 4. Education & Trust
- `learn.html` ✅ — Copper Story: comparison modules, plain-language science, materials/safety, testing/certifications, care instructions, recommended use by life stage, warranty
- `faq.html` ✅ — FAQ accordions grouped: Copper basics / Materials & Safety / Sizing & Care / Orders & Shipping
- `blog.html` ✅ — Blog/Vlog hub with tag filters + published Q4 content calendar

## 5. Conversion tools
- `customize.html` ✅ — Custom Design Studio (B2C + B2B), live preview, artwork approval workflow
- `cart.html` ✅ — cart, vouchers/affiliate codes, free-shipping progress meter
- `checkout.html` ✅ — address form (PH regions + SEA countries), payment methods (GCash/Maya/Card/COD/bank), foundation round-up donation, order confirmation

## 6. Account (`account.html`) ✅
- Login / Register (demo auth)
- Order History — status timelines
- **Design Approvals** — custom artwork status pipeline with Approve / Request Revision actions
- Rewards & Points — balance, tier progress, redemption, history
- Settings — newsletter prefs, abandoned-cart reminder opt-out, demo data wipe

## 7. Loyalty & Cause
- `rewards.html` ✅ — Copper Points program explainer, earn rules, four tiers, donation conversion
- `foundation.html` ✅ — Pet Foundation: 5% profits, round-up, points-to-meals, B2B matching, transparency reports

## 8. Business
- `b2b.html` ✅ — B2B portal: product pitch, six partner types, wholesale tier ladder, launch sequence, inquiry form
- `contact.html` ✅ — support channels, response SLAs, message form, chat launcher

## 9. Future / Phase 2 (not in this build)
- Full CMS blog articles & video embeds
- Live payment gateway integration (GCash/Maya APIs)
- Multi-language storefronts & per-country currency switching
- Wholesale account portal (quote history, net terms) behind B2B login
