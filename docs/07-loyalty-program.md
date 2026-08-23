# 07 — Loyalty Program: "Copper Points"

Implemented across `rewards.html` and the account area (Rewards & Points tab); points accrue automatically at checkout.

## A. Points logic
| Action | Points |
|---|---|
| Spend ₱100 | +1 point (automatic, no opt-in) |
| Successful referral (friend's first order) | +40 |
| Published review with photo | +25 |
| Double-points weekends | 2x on all of the above (newsletter-announced) |
| Welcome bonus (new account) | +100 |

Redemption value anchor: **100 pts = ₱50 voucher**. Catalog redemptions:
- ₱50 off voucher — 100 pts
- Free engraving add-on — 250 pts
- Donate 10 shelter meals — 120 pts

## B. Reward tiers (lifetime/rolling points)
| Tier | Threshold | Perks |
|---|---|---|
| Bronze Tail | 0+ | Welcome voucher, pet birthday treat |
| Silver Snout | 200+ | + early access to drops, free-shipping weekends |
| Gold Whisker | 500+ | + free engraving annually, priority studio queue |
| Platinum Paw | 1000+ | + limited-edition gifts, VIP launch previews |

Account UI shows a live tier progress track against the balance.

## C. Pet Foundation tie-in
- **Checkout round-up:** total rounds to next ₱50; difference passed through at 100%.
- **Points donation:** any balance converts to meals (120 pts = 10 shelter meals).
- **B2B matching:** wholesale partners co-fund donations per case; NURTURER matches 1:1.
- Funding base: **5% of company profits**, reported quarterly.

## D. Retention loops mapped to funnel Stage 4
1. **Abandoned-cart reminders** — banner + (at go-live) email/SMS after session idle.
2. **Newsletter program** — weekly-to-monthly cadence: care tips → new drops → vouchers → adoptable pets; capture with first-order 10% incentive.
3. **Points link from account area** — Rewards tab is one tap from order history; every order confirmation shows points earned.
4. **Reviews engine** — post-purchase review CTA awards points, feeding social proof back into Stage 1 Discover.

(Flagged assumption: tier thresholds and redemption values are proposed defaults — tune after alpha data.)
