# 04 — Copper-Lined vs Standard Bowl: Comparison Module Spec

Implemented in `js/compare.js`; mounts on any page via `data-compare-module` (matrix) and `data-compare-wipe` (slider). Live on homepage scroll 3 and `learn.html`.

## A. Material toggle → live matrix
Visitor taps a material; the matrix animates to that material's row set. Default selection: **NURTURER Copper-Lined**.

### NURTURER Copper-Lined (highlight state)
| Dimension | Copy |
|---|---|
| Anti-Bacterial | 🟢 Copper contact surfaces naturally eliminate up to 99% of common bacteria* — no chemicals needed. |
| Hygiene | 🟢 Biofilm can't establish like plastic; weekly 60-second rinse keeps the lining bright. |
| Durability | 🟢 Solid body with non-slip weighted base; built for years of daily use, life-stage after life-stage. |
| Pet Health | 🟢 Elevated heights support digestion and posture; shallow cat dish respects whiskers. |
| Freshness | 🟢 Water stays noticeably fresher longer between refills. |

### Plastic
- Anti-Bacterial 🔴 Scratches harbor biofilm and bacteria within weeks; degrades with every wash.
- Hygiene 🔴 Absorbs oils and odors; slime film returns hours after cleaning.
- Durability 🟡 Cheap to buy, but cracks, chews, and stains force frequent replacement.
- Pet Health 🔴 Linked to feline chin acne and irritation; micro-scratches can transfer to food.
- Freshness 🔴 Water goes stale-tasting fast; pets often drink less.

### Ceramic
- Anti-Bacterial 🟡 Glazed surface resists bacteria — until the glaze chips, then it traps grime.
- Hygiene 🟡 Easy to clean while intact; hairline cracks are invisible germ hotels.
- Durability 🔴 Heavy but fragile — one drop on tile ends its life.
- Pet Health 🟡 Lead-free certification varies widely by maker; verify before buying.
- Freshness 🟡 Neutral taste, but no active freshness protection.

### Standard Stainless Steel
- Anti-Bacterial 🟡 Passive material only — it does not fight bacteria; scratches still harbor film.
- Hygiene 🟢 Dishwasher-safe and non-porous when new.
- Durability 🟢 Tough and long-lasting; lightweight bowls slide everywhere without grip.
- Pet Health 🟡 Safe, but floor-level sliding causes spills and mealtime stress for flat-faced pets.
- Freshness 🟡 No odor absorption, but water develops slime within a day.

Footnote everywhere: *Laboratory-tested antimicrobial efficacy of copper contact surfaces under ISO 22196 protocol.

## B. Drag-to-reveal wipe slider
Left panel — **Traditional Bowl — Day 7**: "Slimy film. Sour smell. Scrubbing on your knees." / Biofilm rebuilds within hours on scratched plastic and plain steel. Water gets refilled, but never feels fresh.
Right panel — **NURTURER Copper-Lined — Day 7**: "Clean basin. Fresher water. One quick rinse." / The copper interior actively suppresses bacterial growth between washes. Maintenance is a 60-second routine, not a workout.
Interaction: draggable copper handle (mouse/touch) + keyboard arrows for accessibility; stacks vertically on mobile.

## C. Design tone benchmarks
Ollie Bowls premium lifestyle feel; clean matrix cards; copper accent handle as brand moment. No clinical lab-photo aesthetic — friendly illustration style matches the site's SVG art system.
