# 03 — B2C vs B2B Branching UX

## 1. Self-selection moments
A visitor can declare their audience in **three places** (first touch wins):
1. **Homepage branch cards** (scroll 1.5) — the primary, unmissable fork.
2. **Header audience pill** — persistent "Fur Parent / Business" toggle on every page; switching restyles context and shows a confirmation toast ("Switched to business mode — wholesale pricing unlocked").
3. **Entry deep-links** in campaigns: `b2b.html` for B2B ads/QR kits, `shop.html` for B2C.

The choice is stored (`localStorage.nrt_audience`) and drives subsequent defaults.

## 2. How the experience diverges

| Touchpoint | B2C "Fur Parent" | B2B "Business" |
|---|---|---|
| Primary nav emphasis | Shop Dogs/Cats, Customize | For Business portal |
| Homepage path | Discover → Learn → Trust → Buy | Understand Product → Business Opportunity → Request Info |
| Pricing display | RRP with vouchers | RRP + wholesale ladder teaser (30–50% off from 24 units) |
| Customization studio | Pet name, font, finish, motif | Same tools **+ logo/co-branding checkbox** → triggers studio outreach |
| Checkout | Consumer checkout (GCash/Maya/COD/card) | Inquiry → quote → invoice flow (net terms negotiated offline) |
| Account area | Orders, design approvals, points | Orders/designs for branded bulk work; wholesale quotes (Phase 2) |
| Content voice | Warm, cuteness-forward | Margin, MOQ, merchandising, territory language |

## 3. The two conversion paths (from brief)

**B2C:** Discover → Learn → Trust → Buy
`index hero → comparison module & learn.html → reviews/warranty/foundation → PDP add-to-cart → checkout`

**B2B:** Discover → Understand Product → See Business Opportunity → Request Information
`b2b.html hero pitch → feature tiles & price ladder → partner-type cards + launch timeline → inquiry form (business type, volume, co-branding needs) → 1-business-day response SLA`

## 4. Implementation notes (this build)
- `js/main.js` exposes `NRT.audience.set('b2c'|'b2b')`; elements tagged `data-b2c-only` / `data-b2b-only` auto-show/hide.
- Customize Studio surfaces the B2B logo option via checkbox and flags orders `isB2B` in the design record.
- B2B inquiries persist as leads (`nrt_b2bLeads`) ready to pipe into CRM at go-live.
