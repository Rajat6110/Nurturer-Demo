# 06 — Customization / Design-Submission Flow

Implemented in `customize.html` + `js/customize.js`, tracked in `account.html` (Design Approvals tab).

## A. The 5-step studio (B2C & B2B)

**Step 1 — Model.** Pick any of the 10 SKUs; size/life-stage selector follows the PDP logic (price deltas shown).

**Step 2 — Text.** Pet name or custom text, 14-char cap, live preview. B2B checkbox: *"This is a business order (add logo / co-branding — our studio will contact you)"* → flags `isB2B` on the design record.

**Step 3 — Font.** Four lettering styles rendered in their true faces: Elegant Serif · Playful Script · Bold Caps · Clean Modern.

**Step 4 — Finish.** Five finishes: Hammered Copper · Rose Copper · Charcoal + Copper · Cream Enamel · Deep Teal.

**Step 5 — Motif & submit.** Optional icon (Paw/Heart/Fish/Bone), then submit.

## B. Live preview
Sticky SVG stage re-renders bowl + engraving text + motif with each change; summary card shows model, size, text, style, base price, **+₱350 engraving fee**, total. (Assumption: ₱350 flat engraving fee — not stated in brief.)

## C. Approval workflow (the trust engine)
On submit (email captured if guest):
1. Order created as type `custom-design`, status **Artwork Pending**, brief lands with the studio.
2. Studio produces digital proof within **24 hours** → status **In Design**.
3. Proof delivered to the customer's account → **Awaiting Your Approval**.
4. Customer taps **Approve artwork** → **Approved** (production) or **Request revision** → loops to In Design. Unlimited revisions; cancel before approval = full refund including engraving fee.
5. Engraving (2–4 days) → Shipped.

Nothing is ever etched without explicit sign-off.

## D. Status tracking UX
- Account → **Order History**: custom orders show a colored status pill + detail drawer with a 6-step timeline and action buttons at the approval gate.
- Account → **Design Approvals**: gallery view of in-flight designs with mini previews of the actual chosen finish/text.
- Demo control: "Simulate studio update" advances the pipeline for testing the full journey.
- Data shape (`localStorage.nrt_orders[].design`): `{text, font, finish, motif, isB2B, engravingFee, total, status, history[]}` — history entries are timestamped notes ready to map 1:1 onto a production workflow tool at go-live.
