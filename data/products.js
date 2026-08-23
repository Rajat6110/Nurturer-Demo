/* NURTURER - Product catalog, vouchers, testimonials, blog seed.
   Prices in PHP. Sizes map to pet life stages. */

window.NRT_PRODUCTS = [
  {
    id: "signature-elevated-dog",
    sku: "NRT-SIG-D",
    name: "Signature Elevated Copper Bowl",
    species: ["dog"],
    tier: "premium",
    collection: "Signature Copper Collection",
    price: 1495,
    compareAt: 1795,
    rating: 4.9,
    reviewCount: 212,
    badge: "Best Seller",
    blurb: "Our flagship elevated bowl with a hand-finished copper-lined interior. Raised to a natural head-height so every meal is easier on posture and gentler on digestion.",
    colors: [
      { key: "hammered", name: "Hammered Copper", hex: "#b87333" },
      { key: "rose", name: "Rose Copper", hex: "#c98a6b" },
      { key: "charcoal", name: "Charcoal + Copper", hex: "#3a342e" }
    ],
    sizes: [
      { key: "s", label: "Small", lifeStage: "Puppy / Toy breeds", detail: "350 ml - 10 cm rim height", delta: 0 },
      { key: "m", label: "Medium", lifeStage: "Adult small-to-medium dogs", detail: "700 ml - 18 cm stand height", delta: 200 },
      { key: "l", label: "Large", lifeStage: "Adult large breeds & seniors", detail: "1.2 L - 26 cm stand height", delta: 400 }
    ]
  },
  {
    id: "signature-cat-raised",
    sku: "NRT-SIG-C",
    name: "Signature Whisker-Ease Cat Bowl",
    species: ["cat"],
    tier: "premium",
    collection: "Signature Copper Collection",
    price: 1295,
    compareAt: 1590,
    rating: 4.8,
    reviewCount: 164,
    badge: "Cat Favorite",
    blurb: "A shallow, wide-rim copper-lined dish raised to whisker-friendly height. No squished whiskers, no chin acne, no mealtime stress.",
    colors: [
      { key: "hammered", name: "Hammered Copper", hex: "#b87333" },
      { key: "cream", name: "Cream Enamel Coat", hex: "#e8d9bf" }
    ],
    sizes: [
      { key: "one", label: "One Size", lifeStage: "Kitten to senior cats", detail: "250 ml shallow dish - 12 cm height", delta: 0 }
    ]
  },
  {
    id: "signature-duo-feeder",
    sku: "NRT-DUO",
    name: "Signature Duo Copper Feeder",
    species: ["dog", "cat"],
    tier: "premium",
    collection: "Signature Copper Collection",
    price: 2495,
    compareAt: null,
    rating: 4.9,
    reviewCount: 98,
    badge: "Premium Set",
    blurb: "Two copper-lined bowls set into a solid narra wood stand - food and water side by side, at the height nature intended.",
    colors: [
      { key: "narra", name: "Natural Narra Stand", hex: "#9a6a3f" },
      { key: "walnut", name: "Walnut Stain Stand", hex: "#5d4433" }
    ],
    sizes: [
      { key: "s", label: "Small Duo", lifeStage: "Cats & small dogs", detail: "2 x 350 ml bowls", delta: 0 },
      { key: "l", label: "Large Duo", lifeStage: "Medium to large dogs", detail: "2 x 900 ml bowls", delta: 500 }
    ]
  },
  {
    id: "everyday-elevated-dog",
    sku: "NRT-EVD",
    name: "Everyday Elevated Dog Bowl",
    species: ["dog"],
    tier: "mainstream",
    collection: "Everyday Copper Line",
    price: 795,
    compareAt: null,
    rating: 4.7,
    reviewCount: 341,
    badge: null,
    blurb: "All of the copper-lined hygiene benefits in a lighter, budget-friendly body. The easiest way to upgrade from plastic today.",
    colors: [
      { key: "steel", name: "Brushed Steel Coat", hex: "#9aa0a6" },
      { key: "matte", name: "Matte Sand", hex: "#cbb59a" }
    ],
    sizes: [
      { key: "s", label: "Small", lifeStage: "Puppies / toy breeds", detail: "350 ml - low rise", delta: 0 },
      { key: "m", label: "Medium", lifeStage: "Adult small-to-medium dogs", detail: "650 ml - mid rise", delta: 100 },
      { key: "l", label: "Large", lifeStage: "Adult large breeds", detail: "1.1 L - tall rise", delta: 200 }
    ]
  },
  {
    id: "everyday-cat",
    sku: "NRT-EVC",
    name: "Everyday Cat Dish",
    species: ["cat"],
    tier: "mainstream",
    collection: "Everyday Copper Line",
    price: 645,
    compareAt: null,
    rating: 4.6,
    reviewCount: 287,
    badge: null,
    blurb: "A whisker-friendly shallow dish with the same anti-bacterial copper lining our Signature line is known for.",
    colors: [
      { key: "steel", name: "Brushed Steel Coat", hex: "#9aa0a6" },
      { key: "blush", name: "Blush Coat", hex: "#d8a49b" }
    ],
    sizes: [
      { key: "one", label: "One Size", lifeStage: "All life stages", detail: "220 ml shallow dish", delta: 0 }
    ]
  },
  {
    id: "starter-litter-bowl",
    sku: "NRT-STA",
    name: "First Bowl Starter Set",
    species: ["dog", "cat"],
    tier: "mainstream",
    collection: "Everyday Copper Line",
    price: 995,
    compareAt: 1150,
    rating: 4.8,
    reviewCount: 129,
    badge: "For New Fur Parents",
    blurb: "A tiny copper-lined bowl sized for first meals, plus a silicone place mat and care card. Made for puppy and kitten homecomings.",
    colors: [
      { key: "pastel", name: "Pastel Coat", hex: "#bcd3c5" }
    ],
    sizes: [
      { key: "one", label: "Starter", lifeStage: "Infancy (8 wks+)", detail: "150 ml bowl + mat", delta: 0 }
    ]
  },
  {
    id: "slowfeeder-copper",
    sku: "NRT-SLOW",
    name: "Slow-Feast Copper Spiral Bowl",
    species: ["dog"],
    tier: "mainstream",
    collection: "Everyday Copper Line",
    price: 845,
    compareAt: null,
    rating: 4.7,
    reviewCount: 156,
    badge: "Vet Recommended",
    blurb: "A copper-lined spiral insert slows fast eaters, helping reduce bloat, choking, and post-meal reflux.",
    colors: [
      { key: "teal", name: "Deep Teal Coat", hex: "#37655f" }
    ],
    sizes: [
      { key: "s", label: "Small", lifeStage: "Small adult dogs", detail: "400 ml spiral core", delta: 0 },
      { key: "l", label: "Large", lifeStage: "Large adult dogs", detail: "800 ml spiral core", delta: 150 }
    ]
  },
  {
    id: "travel-copper-bowl",
    sku: "NRT-TV",
    name: "Trailfold Travel Copper Bowl",
    species: ["dog", "cat"],
    tier: "mainstream",
    collection: "Everyday Copper Line",
    price: 595,
    compareAt: null,
    rating: 4.5,
    reviewCount: 203,
    badge: null,
    blurb: "A collapsible travel bowl with a genuine copper-lined basin - clean water on every walk, hike, and road trip.",
    colors: [
      { key: "olive", name: "Trail Olive", hex: "#77784f" }
    ],
    sizes: [
      { key: "one", label: "One Size", lifeStage: "All life stages", detail: "480 ml collapsible", delta: 0 }
    ]
  },
  {
    id: "heirloom-presentation-bowl",
    sku: "NRT-HL",
    name: "Heirloom Presentation Bowl",
    species: ["dog", "cat"],
    tier: "premium",
    collection: "Signature Copper Collection",
    price: 2995,
    compareAt: null,
    rating: 5.0,
    reviewCount: 47,
    badge: "Limited Edition",
    blurb: "Hand-planished, individually numbered, and finished with your pet's engraved name plate. The centerpiece of the feeding corner.",
    colors: [
      { key: "planished", name: "Hand-Planished Copper", hex: "#ad6f36" }
    ],
    sizes: [
      { key: "one", label: "One Size", lifeStage: "Adult dogs & cats", detail: "900 ml - numbered edition", delta: 0 }
    ]
  },
  {
    id: "water-station-tower",
    sku: "NRT-WTR",
    name: "Copper-Lined Water Station",
    species: ["dog", "cat"],
    tier: "premium",
    collection: "Signature Copper Collection",
    price: 2195,
    compareAt: 2495,
    rating: 4.8,
    reviewCount: 76,
    badge: null,
    blurb: "A gravity water station with a copper-lined reservoir that keeps water fresher longer between refills.",
    colors: [
      { key: "charcoal", name: "Charcoal + Copper", hex: "#3a342e" }
    ],
    sizes: [
      { key: "two", label: "2 L", lifeStage: "Cats & small dogs", detail: "2 L gravity reservoir", delta: 0 },
      { key: "four", label: "4 L", lifeStage: "Multi-pet homes", detail: "4 L gravity reservoir", delta: 300 }
    ]
  }
];

window.NRT_VOUCHERS = {
  NURTURER10: { type: "percent", value: 10, note: "10% off - affiliate code" },
  PAWSFIRST: { type: "fixed", value: 150, minSpend: 1500, note: "PHP 150 off first order over PHP 1,500" },
  COPPERCLUB: { type: "percent", value: 15, note: "15% off - rewards members" }
};

window.NRT_TESTIMONIALS = [
  {
    quote: "Bilis ma-dirty ng dating plastic bowl ni Bantay. Since switching to NURTURER, hindi na siya nangangamoy aso kahit buong araw na nakatayo ang tubig.",
    name: "Marites D.", who: "Fur mom to Bantay, Quezon City",
    stars: 5
  },
  {
    quote: "We stocked the Everyday line in all three branches. They sell out faster than any premium bowl we have carried - customers keep coming back for engraving add-ons.",
    name: "Kuya Pet Supplies", who: "B2B Partner - 3-store pet retailer, Cebu",
    stars: 5
  },
  {
    quote: "My vet actually asked where I got it. Miming used to refuse eating from floor-level bowls; now she finishes everything. Worth every peso.",
    name: "Jico R.", who: "First-time cat dad to Miming",
    stars: 5
  },
  {
    quote: "The custom engraving workflow is genius - we approve artwork right in our account dashboard before production. Zero surprises for our clinic's branded bowls.",
    name: "Dr. Ana Villanueva", who: "Veterinary clinic partner, Davao",
    stars: 5
  }
];

window.NRT_POSTS = [
  {
    slug: "what-is-a-copper-lined-pet-bowl",
    title: "What Is a Copper-Lined Pet Bowl (and Why Your Vet Will Approve)",
    tag: "Education",
    minutes: 5,
    excerpt: "Copper has been used for clean water storage for centuries. Here is what modern science says about using it in your pet's bowl."
  },
  {
    slug: "plastic-bowl-chin-acne",
    title: "Is Your Plastic Bowl Giving Your Cat Chin Acne?",
    tag: "Health",
    minutes: 4,
    excerpt: "Feline acne is more common than you think - and your pet's dish could be the culprit. Here is how bowl material matters."
  },
  {
    slug: "elevated-bowls-for-large-dogs",
    title: "Elevated Bowls for Large Dogs: Comfort or Hype?",
    tag: "Guides",
    minutes: 6,
    excerpt: "Posture, digestion, joint relief - we break down which dogs genuinely benefit from raised feeders, and which heights to pick."
  },
  {
    slug: "puppy-first-meal-checklist",
    title: "The First-Meal Checklist for New Puppy Parents",
    tag: "New Fur Parents",
    minutes: 3,
    excerpt: "Bringing home a puppy? Start with the right bowl size, the right height, and these five feeding habits."
  },
  {
    slug: "custom-engraving-process",
    title: "From Name to Engraving: How Our Custom Bowls Are Made",
    tag: "Behind the Scenes",
    minutes: 4,
    excerpt: "A look inside the design approval workflow - from your submission to artwork sign-off to final etch."
  },
  {
    slug: "cleaning-your-copper-bowl",
    title: "How to Care for a Copper-Lined Bowl (60 Seconds a Week)",
    tag: "Care",
    minutes: 2,
    excerpt: "Copper lining is naturally hygienic and nearly maintenance-free. Keep yours bright with this simple routine."
  }
];
