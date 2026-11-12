import { Product, ProductCategory } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // 1. BANGLES & KADAS
  {
    id: 'zn-prod-005',
    name: 'Royal Kundan & Velvet Bridal Bangles Set (24 Pcs)',
    sku: 'ZN-BNG-201',
    category: 'Bangles',
    price: 5800,
    salePrice: 5200,
    images: [
      'https://images.unsplash.com/photo-1611591475878-c07a33e459db?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Traditional Pakistani wedding bangles set. Includes 24 pieces combining deep ruby velvet micro-bangles, gold-polished filigree separators, and two heavy bridal Kundan centerpiece kadas.',
    material: 'Brass Gold-Plating, Kundan Glass Stones & Velvet',
    stock: 15,
    isFeatured: true,
    isNewArrival: false,
    rating: 4.9,
    reviewsCount: 31,
    createdAt: '2026-02-10T10:00:00Z'
  },
  {
    id: 'zn-prod-006',
    name: 'Antique Gold Filigree Openable Bangles & Kada Pair',
    sku: 'ZN-BNG-202',
    category: 'Bangles',
    price: 4200,
    images: [
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1611591475878-c07a33e459db?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Heirloom-inspired antique gold-finish openable kadas with intricate jali latticework, screw-lock closure for comfortable fit, and delicate pearl droplet fringes.',
    material: 'High-Durability Brass Alloy with Antique Gold Polish Plating',
    stock: 20,
    isFeatured: false,
    isNewArrival: true,
    rating: 4.8,
    reviewsCount: 19,
    createdAt: '2026-02-12T10:00:00Z'
  },
  {
    id: 'zn-prod-007',
    name: 'Pakistani Zircon Crystal Stacking Bangles Set (12 Pcs)',
    sku: 'ZN-BNG-203',
    category: 'Bangles',
    price: 3800,
    salePrice: 3400,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Sparkling diamond-cut cubic zirconia crystals hand-set in polished gold tone channels. Perfect for formal wear, festive Eid gatherings, and wedding guest styling.',
    material: 'Gold Polish & High-Luster AAA Cubic Zirconia',
    stock: 18,
    isFeatured: true,
    isNewArrival: true,
    rating: 5.0,
    reviewsCount: 22,
    createdAt: '2026-02-14T10:00:00Z'
  },
  {
    id: 'zn-prod-008',
    name: 'Traditional Meenakari & Pearl Royal Bangles',
    sku: 'ZN-BNG-204',
    category: 'Bangles',
    price: 4900,
    images: [
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Enchanting floral Meenakari enamel artistry finished with clustered freshwater seed pearls along both borders. Hypoallergenic interior with smooth comfort band.',
    material: 'Enamel Meenakari Art & Clustered Pearls',
    stock: 14,
    isFeatured: false,
    isNewArrival: false,
    rating: 4.9,
    reviewsCount: 15,
    createdAt: '2026-02-16T10:00:00Z'
  },

  // 3. HANDBAGS
  {
    id: 'zn-prod-009',
    name: 'The Aurelia Structured Gold-Lock Leather Handbag',
    sku: 'ZN-HBG-301',
    category: 'Handbags',
    price: 7800,
    salePrice: 6900,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Iconic structured silhouette in premium textured vegan leather with polished 18K champagne-gold hardware, turn-lock front clasp, protective base studs, and detachable crossbody strap.',
    material: 'Micro-Grain Vegan Leather with Gold Hardware',
    stock: 10,
    isFeatured: true,
    isNewArrival: true,
    rating: 5.0,
    reviewsCount: 27,
    createdAt: '2026-02-05T10:00:00Z'
  },
  {
    id: 'zn-prod-010',
    name: 'Royal Monogram Chain Crossbody Shoulder Bag',
    sku: 'ZN-HBG-302',
    category: 'Handbags',
    price: 6500,
    images: [
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Sleek luxury day-to-evening flap bag featuring quilted diamond stitching, woven golden chain strap that can be worn doubled or long, and secure magnetic interior compartments.',
    material: 'Quilted Fine Vegan Leather & Braided Metal Chain',
    stock: 14,
    isFeatured: true,
    isNewArrival: false,
    rating: 4.8,
    reviewsCount: 35,
    createdAt: '2026-02-08T10:00:00Z'
  },
  {
    id: 'zn-prod-011',
    name: 'Emerald Velvet & Pearl Evening Bridal Clutch',
    sku: 'ZN-HBG-303',
    category: 'Handbags',
    price: 5200,
    salePrice: 4700,
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Sumptuous deep green velvet evening clutch embellished with mother-of-pearl cabochons, gold metal frame closure with crystal clasp, and an optional fine link chain strap.',
    material: 'Rich Silk Velvet & Hand-Inlaid Pearl Clasp',
    stock: 8,
    isFeatured: false,
    isNewArrival: true,
    rating: 5.0,
    reviewsCount: 16,
    createdAt: '2026-02-11T10:00:00Z'
  },
  {
    id: 'zn-prod-012',
    name: 'Executive Textured Leather Daily Carryall Tote',
    sku: 'ZN-HBG-304',
    category: 'Handbags',
    price: 8900,
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Spacious and sophisticated everyday tote with reinforced handles, padded laptop compartment, gold logo medallion, and wipe-clean scratch-resistant saffiano texture.',
    material: 'Saffiano Finish Luxury Leatherette',
    stock: 12,
    isFeatured: false,
    isNewArrival: false,
    rating: 4.9,
    reviewsCount: 20,
    createdAt: '2026-02-13T10:00:00Z'
  },

  // 4. WATCHES (Men's & Women's)
  {
    id: 'zn-prod-013',
    name: "The Sovereign Men's Chronograph Black & Gold Watch",
    sku: 'ZN-WTC-401',
    category: 'Watches',
    price: 8500,
    salePrice: 7600,
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Prestigious men’s chronograph timepiece featuring a matte black sunray dial, functional sub-dials, tachymeter bezel, 3ATM water resistance, and an 18K gold-plated stainless steel oyster bracelet.',
    material: 'Stainless Steel Case with 18K Ion Gold Plating',
    stock: 12,
    isFeatured: true,
    isNewArrival: true,
    rating: 5.0,
    reviewsCount: 42,
    createdAt: '2026-02-02T10:00:00Z'
  },
  {
    id: 'zn-prod-014',
    name: "Serene Diamond-Accented Rose Gold Women's Watch",
    sku: 'ZN-WTC-402',
    category: 'Watches',
    price: 7200,
    salePrice: 6500,
    images: [
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Elegantly proportioned 32mm case framed by crystal-cut bezel, mother-of-pearl inner dial with rose gold hour markers, quartz precision movement, and polished jewelry clasp bracelet.',
    material: 'Rose Gold Plated Alloy & Mother-of-Pearl Dial',
    stock: 16,
    isFeatured: true,
    isNewArrival: true,
    rating: 4.9,
    reviewsCount: 38,
    createdAt: '2026-02-07T10:00:00Z'
  },
  {
    id: 'zn-prod-015',
    name: "Emerald Sunburst Roman Numeral Men's Gold Watch",
    sku: 'ZN-WTC-403',
    category: 'Watches',
    price: 9500,
    images: [
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Striking deep emerald green dial adorned with classic Roman numerals, date cyclops window, fluted bezel, and presidential three-link gold-tone steel bracelet.',
    material: '316L Stainless Steel & Hardlex Crystal',
    stock: 9,
    isFeatured: false,
    isNewArrival: false,
    rating: 5.0,
    reviewsCount: 19,
    createdAt: '2026-02-09T10:00:00Z'
  },
  {
    id: 'zn-prod-016',
    name: 'Petite Champagne Mesh Bracelet Watch',
    sku: 'ZN-WTC-404',
    category: 'Watches',
    price: 6800,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Minimalist Scandinavian luxury design featuring an ultra-slim 6mm case, champagne gold sunburst dial, and supple magnetic Milanese mesh band that adjusts seamlessly to any wrist size.',
    material: 'Milanese Steel Mesh & Scratch-Resistant Mineral Glass',
    stock: 15,
    isFeatured: false,
    isNewArrival: true,
    rating: 4.8,
    reviewsCount: 23,
    createdAt: '2026-02-14T10:00:00Z'
  },

  // 5. STAINLESS STEEL JEWELLERY
  {
    id: 'zn-prod-017',
    name: 'Waterproof 18K PVD Anti-Tarnish Herringbone Chain',
    sku: 'ZN-SSJ-501',
    category: 'Stainless Steel Jewellery',
    price: 3200,
    salePrice: 2800,
    images: [
      'https://images.unsplash.com/photo-1611591475878-c07a33e459db?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Guaranteed 100% waterproof and anti-tarnish everyday luxury chain. Crafted in surgical grade 316L stainless steel with vacuum 18K PVD gold coating that withstands perfume, water, and sweat.',
    material: '316L Surgical Stainless Steel with 18K PVD Gold',
    stock: 30,
    isFeatured: true,
    isNewArrival: false,
    rating: 5.0,
    reviewsCount: 65,
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'zn-prod-018',
    name: 'Roman Numeral Anti-Tarnish Titanium Bangle Bracelet',
    sku: 'ZN-SSJ-502',
    category: 'Stainless Steel Jewellery',
    price: 3500,
    images: [
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1611591475878-c07a33e459db?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Chic oval contour bangle featuring precision engraved Roman numerals, hidden side push-lock clasp, and high-mirror polished gold luster. Non-fading and hypoallergenic.',
    material: 'Titanium Stainless Steel 18K Gold Plated',
    stock: 25,
    isFeatured: true,
    isNewArrival: true,
    rating: 4.9,
    reviewsCount: 48,
    createdAt: '2026-02-04T10:00:00Z'
  },
  {
    id: 'zn-prod-019',
    name: 'Clover Leaf Mother of Pearl Stainless Steel Necklace',
    sku: 'ZN-SSJ-503',
    category: 'Stainless Steel Jewellery',
    price: 2800,
    salePrice: 2400,
    images: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1611591475878-c07a33e459db?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Double-sided four-leaf lucky clover motif inlaid with natural iridescent mother of pearl and black onyx on the reverse side. Adjustable delicate link chain with lobster clasp.',
    material: 'Stainless Steel & Natural Mother-of-Pearl Shell',
    stock: 22,
    isFeatured: false,
    isNewArrival: true,
    rating: 5.0,
    reviewsCount: 34,
    createdAt: '2026-02-06T10:00:00Z'
  },
  {
    id: 'zn-prod-020',
    name: 'Anti-Tarnish Bold Twisted Croissant Ring',
    sku: 'ZN-SSJ-504',
    category: 'Stainless Steel Jewellery',
    price: 2200,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Chunky statement croissant dome ring with comfortable tapered band. Built from durable stainless steel that will never turn your skin green or lose its golden sheen.',
    material: '316L Stainless Steel 18K Gold Plated',
    ringSizes: ['6', '7', '8'],
    stock: 28,
    isFeatured: false,
    isNewArrival: false,
    rating: 4.9,
    reviewsCount: 29,
    createdAt: '2026-02-08T10:00:00Z'
  },

  // 5. JEWELLERY SETS (BRIDAL & FORMAL)
  {
    id: 'zn-prod-021',
    name: 'Royal Kundan & Pearl Heritage Bridal Choker Set',
    sku: 'ZN-SET-601',
    category: 'Jewellery Sets',
    price: 9500,
    salePrice: 8800,
    images: [
      '/hero-sets.jpg',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Breathtaking heirloom bridal choker set with matching oversized chandelier earrings and maang tikka. Handcrafted in rich antique gold finish, embedded with uncut Kundan polki glass stones and cascading pearl tassels.',
    material: 'Antique 24K Gold-Tone Polish, Kundan Glass Stones & Pearls',
    stock: 12,
    isFeatured: true,
    isNewArrival: true,
    rating: 5.0,
    reviewsCount: 42,
    createdAt: '2026-02-18T10:00:00Z'
  },
  {
    id: 'zn-prod-022',
    name: 'Emerald Zircon Festive Haar & Earring Set',
    sku: 'ZN-SET-602',
    category: 'Jewellery Sets',
    price: 7800,
    images: [
      '/hero-sets.jpg',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Regal layered necklace set featuring deep emerald green simulated stones, clear baguette zircons, and matching statement drop earrings. Ideal for Barat, Walima, and festive occasions.',
    material: 'Brass Gold-Tone Setting with Hydrothermal Emeralds & Zircons',
    stock: 15,
    isFeatured: true,
    isNewArrival: false,
    rating: 4.9,
    reviewsCount: 27,
    createdAt: '2026-02-19T10:00:00Z'
  },

  // 6. RINGS
  {
    id: 'zn-prod-023',
    name: 'Waterproof 18K PVD Bold Croissant & Dome Rings Stack',
    sku: 'ZN-RNG-701',
    category: 'Rings',
    price: 2400,
    salePrice: 2100,
    images: [
      '/hero-rings.jpg',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Set of two statement rings: one French braided croissant ring and one polished golden dome band. 100% waterproof, sweatproof, and perfume-safe titanium steel.',
    material: '316L Surgical Stainless Steel 18K PVD Gold',
    ringSizes: ['6', '7', '8'],
    stock: 35,
    isFeatured: true,
    isNewArrival: true,
    rating: 4.9,
    reviewsCount: 56,
    createdAt: '2026-02-20T10:00:00Z'
  },
  {
    id: 'zn-prod-024',
    name: 'Imperial Solitaire Crystal Signet Band Ring',
    sku: 'ZN-RNG-702',
    category: 'Rings',
    price: 2200,
    images: [
      '/hero-rings.jpg',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Refined modern signet ring adorned with a precision-cut brilliant crystal solitaire. Smooth comfort inner band, anti-fade guarantee.',
    material: '18K Ion Gold-Plated Stainless Steel & AAA Zirconia',
    ringSizes: ['6', '7', '8'],
    stock: 25,
    isFeatured: false,
    isNewArrival: true,
    rating: 4.8,
    reviewsCount: 18,
    createdAt: '2026-02-21T10:00:00Z'
  },

  // 7. EARRINGS
  {
    id: 'zn-prod-025',
    name: 'Royal Kundan Chandbali Bridal Earrings',
    sku: 'ZN-EAR-801',
    category: 'Earrings',
    price: 3800,
    salePrice: 3400,
    images: [
      '/hero-earrings.jpg',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Grand traditional Pakistani drop earrings featuring crescent moon chandbali motifs, faceted Kundan glass settings, and dense freshwater seed pearl bunch hangings.',
    material: 'Antique Gold Polish Brass, Kundan Stones & Pearls',
    stock: 20,
    isFeatured: true,
    isNewArrival: true,
    rating: 5.0,
    reviewsCount: 39,
    createdAt: '2026-02-22T10:00:00Z'
  },
  {
    id: 'zn-prod-026',
    name: 'Waterproof 18K Gold PVD Chunky Huggie Hoops',
    sku: 'ZN-EAR-802',
    category: 'Earrings',
    price: 1950,
    images: [
      '/hero-earrings.jpg',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Everyday minimalist luxury huggie hoop earrings. Safe for showers, gym, and swimming. Secure click-closure with hypoallergenic post.',
    material: '316L Stainless Steel 18K PVD Coated',
    stock: 40,
    isFeatured: false,
    isNewArrival: true,
    rating: 4.9,
    reviewsCount: 31,
    createdAt: '2026-02-23T10:00:00Z'
  },

  // 8. JEWELLERY (CHAINS & BRACELETS)
  {
    id: 'zn-prod-027',
    name: 'Waterproof Snake Herringbone Chain & Lucky Clover Pendant',
    sku: 'ZN-JWL-901',
    category: 'Jewellery',
    price: 3200,
    salePrice: 2800,
    images: [
      '/hero-steel.jpg',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Lustrous flat herringbone liquid gold chain with detachable lucky mother-of-pearl four-leaf clover charm. Guaranteed anti-tarnish everyday wear.',
    material: '316L Stainless Steel with Natural Shell Inlay',
    stock: 30,
    isFeatured: true,
    isNewArrival: true,
    rating: 5.0,
    reviewsCount: 47,
    createdAt: '2026-02-24T10:00:00Z'
  }
];

export interface CategoryMeta {
  name: ProductCategory;
  description: string;
  image: string;
  tagline: string;
}

export const CATEGORIES_LIST: CategoryMeta[] = [
  {
    name: 'Jewellery Sets',
    description: 'Grand Kundan Bridal Choker Sets, Festive Emerald Haars & Matching Tikka Earrings.',
    image: '/hero-sets.jpg',
    tagline: 'Bridal & Festive Suites'
  },
  {
    name: 'Rings',
    description: '100% Waterproof 18K PVD Croissant Rings, Solitaire Crystal Bands & Signet Rings.',
    image: '/hero-rings.jpg',
    tagline: 'Statement & Everyday Rings'
  },
  {
    name: 'Earrings',
    description: 'Royal Kundan Chandbalis, Traditional Pearl Drops & Waterproof Gold Huggies.',
    image: '/hero-earrings.jpg',
    tagline: 'Earrings & Hoops'
  },
  {
    name: 'Watches',
    description: "Men's Luxury Chronographs, Emerald Dials & Women's Rose Gold Timepieces.",
    image: '/hero-watches.jpg',
    tagline: 'Horlogerie & Precision'
  },
  {
    name: 'Bangles',
    description: 'Velvet Bridal Bangles Sets, Antique Gold Kadas & Kundan Centerpieces.',
    image: '/hero-bangles.jpg',
    tagline: 'Bridal Bangles & Kadas'
  },
  {
    name: 'Jewellery',
    description: 'Waterproof Herringbone Chains, Lucky Clover Pendants & Anti-Tarnish Pieces.',
    image: '/hero-steel.jpg',
    tagline: 'Waterproof Everyday Luxury'
  },
  {
    name: 'Stainless Steel Jewellery',
    description: '316L Surgical Stainless Steel, 18K PVD Anti-Tarnish Chains, Bracelets, Rings & Waterproof Pieces.',
    image: '/hero-steel.jpg',
    tagline: '100% Waterproof & Anti-Tarnish'
  },
  {
    name: 'Handbags',
    description: 'Structured Vegan Leather Totes, Quilted Monogram Bags & Velvet Bridal Clutches.',
    image: '/hero-handbags.jpg',
    tagline: 'Haute Leathercraft'
  }
];


