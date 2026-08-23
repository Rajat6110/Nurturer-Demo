# 05 — Product Page Template (PDP)

Implemented as `product.html?id=<sku>` + `js/product.js`; renders all 10 catalog SKUs from `data/products.js`.

## Layout

### Left — Gallery (sticky)
- Main SVG product render; finish-color swatches and thumbnails re-render live
- Tier badge on card & PDP (Premium gold / Mainstream green)

### Right — Buy box
1. Collection eyebrow: e.g. `SIGNATURE COPPER COLLECTION • SKU NRT-SIG-D`
2. H1 product name + ★ rating & verified-review count
3. Blurb (benefit-led, 2 lines)
4. Live price with compare-at strike-through + In-stock pill
5. **Size & life-stage selector** — each option shows label + life stage:
   - Small → "Puppy / Toy breeds"
   - Medium → "Adult small-to-medium dogs"
   - Large → "Adult large breeds & seniors"
   - One-size SKUs show a single life-stage mapping (e.g. cat dish: "Kitten to senior cats")
   - Price deltas update the live price (e.g. Large +₱400)
6. **Finish swatches** (Hammered Copper, Rose Copper, Charcoal + Copper, …)
7. **Make it theirs** — button to the Customize Studio pre-loaded with this model ("Add custom engraving from ₱350")
8. Qty stepper · [Add to cart] · [Buy now]
9. Shipping trust note: Free PH shipping over ₱1,500 · SEA delivery 5–9 days · 30-day Clean Meal Promise
10. Spec list echoing hero features

### Below — Feature → Benefit table
Exact brand-brief mapping rendered as a two-column table (Feature | What it means for you & your pet).

### Trust accordions
Materials & Safety · Care Instructions · Recommended Use (life-stage height guide) · Warranty & Certifications (12-month warranty, ISO 22196 testing note).

### Reviews block
Aggregate rating, 96% recommend stat, sample verified reviews, write-a-review CTA (unlocks post-purchase).

### Related products
Same-species recommendations to complete the feeding corner.

## Catalog snapshot (10 launch SKUs)

| SKU | Product | Species | Tier | From |
|---|---|---|---|---|
| NRT-SIG-D | Signature Elevated Copper Bowl | Dog | Premium | ₱1,495 |
| NRT-SIG-C | Signature Whisker-Ease Cat Bowl | Cat | Premium | ₱1,295 |
| NRT-DUO | Signature Duo Copper Feeder | Dog+Cat | Premium | ₱2,495 |
| NRT-HL | Heirloom Presentation Bowl | Dog+Cat | Premium | ₱2,995 |
| NRT-WTR | Copper-Lined Water Station | Dog+Cat | Premium | ₱2,195 |
| NRT-EVD | Everyday Elevated Dog Bowl | Dog | Mainstream | ₱795 |
| NRT-EVC | Everyday Cat Dish | Cat | Mainstream | ₱645 |
| NRT-STA | First Bowl Starter Set | Dog+Cat | Mainstream | ₱995 |
| NRT-SLOW | Slow-Feast Copper Spiral Bowl | Dog | Mainstream | ₱845 |
| NRT-TV | Trailfold Travel Copper Bowl | Dog+Cat | Mainstream | ₱595 |

Life-stage coverage spans infancy (starter sets, small sizes) through adulthood and senior years (tall stands), fulfilling the brief's standard-quality range requirement.
