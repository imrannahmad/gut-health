import { ProductConfig } from "@/types/product";

export const PRODUCT_CONFIG: ProductConfig = {
  id: "gutglow-daily-wellness",
  name: "GutGlow Daily Wellness Formula",
  tagline: "Thoughtful gut wellness for everyday living.",
  shortDescription:
    "A clean, daily approach to digestive wellness. Formulated with targeted botanicals and prebiotic fiber to support everyday gut balance.",
  fullDescription:
    "GutGlow Daily Wellness Formula is designed to integrate effortlessly into your morning routine. A focused, non-laxative blend supporting healthy gut flora, natural digestive ease, and nutrient absorption.",
  category: "Gut Wellness Nutraceutical",
  servingSize: "1 Scoop (~6.5g) daily with water",
  defaultPrice: 1999,
  defaultCompareAtPrice: 2499,
  packOptions: [
    {
      id: "pack-1-month",
      name: "1-Month Supply",
      subtitle: "30 Daily Servings",
      servings: 30,
      durationMonths: 1,
      price: 1999,
      compareAtPrice: 2499,
      badge: "Standard",
      isPopular: false,
    },
    {
      id: "pack-2-month",
      name: "2-Month Supply",
      subtitle: "60 Daily Servings",
      servings: 60,
      durationMonths: 2,
      price: 3599,
      compareAtPrice: 4999,
      badge: "Save 28%",
      isPopular: false,
    },
    {
      id: "pack-3-month",
      name: "3-Month Ritual",
      subtitle: "90 Daily Servings",
      servings: 90,
      durationMonths: 3,
      price: 4899,
      compareAtPrice: 7499,
      badge: "Best Value",
      isPopular: true,
    },
  ],
  images: [
    {
      src: "/images/gutglow-product-front.jpg",
      alt: "GutGlow Daily Wellness Formula front view on stone pedestal with powder bowl",
      label: "Front Packaging",
    },
    {
      src: "/images/gutglow-product-angle.jpg",
      alt: "GutGlow Daily Wellness Formula angled view on stone with wooden scoop",
      label: "Angle & Scoop",
    },
    {
      src: "/images/philosophy-ritual.webp",
      alt: "GutGlow daily morning wellness ritual with spoon and jar on stone",
      label: "Daily Ritual",
    },
    {
      src: "/images/product-packaging-macro.jpg",
      alt: "GutGlow close-up packaging detail and letterpress typography",
      label: "Macro Detail",
    },
    {
      src: "/images/product-botanicals.jpg",
      alt: "GutGlow carefully sourced active natural botanicals",
      label: "Active Botanicals",
    },
  ],
  highlights: [
    "Supports daily digestive ease and regularity",
    "Prebiotic fiber matrix to feed beneficial microflora",
    "Gentle botanical soothing blend",
    "Zero artificial sweeteners, fillers or synthetics",
    "UV-protective recyclable glass packaging",
  ],
  features: [
    {
      title: "Quality Focused",
      description: "Crafted in certified facilities with rigorous batch testing.",
    },
    {
      title: "Thoughtful Formulation",
      description: "Plant-derived ingredients selected for physiological tolerability.",
    },
    {
      title: "Transparent Information",
      description: "Full disclosure of all ingredients and no hidden blends.",
    },
    {
      title: "Everyday Wellness",
      description: "Seamlessly blends into water with a subtle, natural taste.",
    },
  ],
  specifications: [
    { label: "Net Contents", value: "200g (30 Servings)" },
    { label: "Form", value: "Soluble Fine Powder" },
    { label: "Origin", value: "Formulated in India" },
    { label: "Dietary", value: "Vegetarian, Gluten-Free, Non-GMO" },
    { label: "Packaging", value: "Recyclable Glass Jar" },
  ],
  ingredientsNote:
    "Provisional formulation details. Full quantitative ingredient breakdown and batch certificate will be published upon manufacturer release.",
  provisionalIngredients: [
    {
      category: "Prebiotic Fiber Complex",
      items: ["Chicory Root Inulin", "Acacia Senegal Fiber"],
      purpose: "Nourishes beneficial gut microflora.",
    },
    {
      category: "Digestive Botanical Blend",
      items: ["Ginger Rhizome Extract", "Peppermint Leaf Extract"],
      purpose: "Supports digestive ease and comfort.",
    },
    {
      category: "Microbiome Support",
      items: ["Spore Probiotic Culture (Bacillus coagulans)"],
      purpose: "Supports intestinal flora balance.",
    },
  ],
  directions: [
    {
      step: "01 — Measure",
      instruction: "Add 1 level scoop (6g) each morning.",
    },
    {
      step: "02 — Mix",
      instruction: "Stir into 200ml of room-temperature water.",
    },
    {
      step: "03 — Drink",
      instruction: "Consume 15 minutes before your first meal.",
    },
  ],
  safetyInformation: [
    "Not intended to diagnose, treat, cure, or prevent any disease.",
    "Consult your physician if pregnant, nursing, or taking medications.",
    "Do not exceed the recommended daily serving.",
    "Store in a cool, dry place away from direct sunlight.",
  ],
  storageInstructions:
    "Store in a cool, dry place. Keep lid tightly closed.",
  shippingInfo: {
    standardDays: "2 to 4 business days",
    expressDays: "1 to 2 business days",
    freeShippingThreshold: 0,
  },
};
