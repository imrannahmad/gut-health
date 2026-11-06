import { ProductConfig } from "@/types/product";

export const PRODUCT_CONFIG: ProductConfig = {
  id: "gutglow-daily-wellness",
  name: "GutGlow Daily Wellness Formula",
  tagline: "Everyday digestive harmony, nurtured from within.",
  shortDescription:
    "A thoughtfully developed daily gut wellness supplement designed to support digestive balance, nutrient absorption, and everyday vitality. Crafted with clean botanical actives and gentle prebiotic nourishment.",
  fullDescription:
    "GutGlow Daily Wellness Formula is created around a singular conviction: lasting vitality and everyday radiance begin in the digestive system. Designed for daily morning integration, our gentle, non-laxative blend works harmoniously with your body's natural rhythms to support healthy gut flora, comfortable digestion, and balanced gut-barrier integrity.",
  category: "Digestive Wellness & Microbiome Support",
  servingSize: "1 Scoop (6g) or 2 Plant Capsules daily",
  defaultPrice: 1999,
  defaultCompareAtPrice: 2499,
  packOptions: [
    {
      id: "pack-1-month",
      name: "1-Month Supply",
      subtitle: "30 Daily Servings · Discovery Pack",
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
      subtitle: "60 Daily Servings · Consistency Pack",
      servings: 60,
      durationMonths: 2,
      price: 3599,
      compareAtPrice: 4999,
      badge: "Save ₹1,400",
      isPopular: false,
    },
    {
      id: "pack-3-month",
      name: "3-Month Ritual",
      subtitle: "90 Daily Servings · Microbiome Reset",
      servings: 90,
      durationMonths: 3,
      price: 4899,
      compareAtPrice: 7499,
      badge: "Most Popular · Save 35%",
      isPopular: true,
    },
  ],
  images: [
    {
      src: "/images/product-jar-hero.jpg",
      alt: "GutGlow Daily Wellness Formula - Premium Jar Mockup",
      label: "Hero Jar",
    },
    {
      src: "/images/product-lifestyle-routine.jpg",
      alt: "Morning wellness ritual with GutGlow and pure water",
      label: "Morning Ritual",
    },
    {
      src: "/images/product-botanicals.jpg",
      alt: "Carefully sourced natural botanicals and plant actives",
      label: "Botanical Sourcing",
    },
    {
      src: "/images/product-packaging-macro.jpg",
      alt: "Packaging close-up with clean typography and instructions",
      label: "Packaging Detail",
    },
  ],
  highlights: [
    "Supports everyday digestive ease & comfortable motility",
    "Prebiotic fiber matrix to feed beneficial gut microflora",
    "Gentle botanical soothing blend (non-stimulant, non-laxative)",
    "Clean, plant-derived, zero artificial sweeteners or synthetics",
    "30-day supply in sustainable, UV-protective glass packaging",
  ],
  features: [
    {
      title: "Thoughtful Formulation",
      description:
        "Engineered with purposeful botanicals selected for tolerability, gentle action, and physiological harmony.",
    },
    {
      title: "Microbiome-First Philosophy",
      description:
        "Prioritizes diverse plant prebiotic substrates over high-dose harsh laxatives or synthetic fillers.",
    },
    {
      title: "Transparent & Responsible",
      description:
        "Every batch is crafted under strict GMP guidelines with third-party testing upon commercial release.",
    },
    {
      title: "Effortless Daily Ritual",
      description:
        "Stirs seamlessly into room-temperature water or morning smoothies with a light, crisp natural taste.",
    },
  ],
  specifications: [
    { label: "Net Contents", value: "180g (30 Servings of 6g each)" },
    { label: "Form", value: "Fine Soluble Powder / Plant Capsules" },
    { label: "Origin", value: "Formulated & Packaged in India" },
    { label: "Dietary", value: "Vegetarian, Gluten-Free, Non-GMO, Soy-Free" },
    { label: "Flavour Profile", value: "Subtle Herbal Citrus (Naturally Flavoured)" },
    { label: "Packaging", value: "Recyclable Forest-Green UV Glass Jar + Aluminum Cap" },
  ],
  ingredientsNote:
    "PROVISIONAL FORMULATION NOTE: Full quantitative ingredient declaration, standardized botanical extracts, and batch COA will be published upon manufacturer release. GutGlow does not compromise on regulatory compliance or laboratory verification.",
  provisionalIngredients: [
    {
      category: "Prebiotic Fiber Complex",
      items: ["Chicory Root Inulin", "Acacia Senegal Gum Fiber", "Green Banana Resistant Starch"],
      purpose: "Nourishes beneficial bifidobacteria and short-chain fatty acid (SCFA) synthesis.",
    },
    {
      category: "Digestive Botanical Soothing Matrix",
      items: ["Standardized Ginger Rhizome Extract", "Fennel Seed Powder", "Peppermint Leaf Extract"],
      purpose: "Eases post-meal bloating sensation and supports normal digestive transit.",
    },
    {
      category: "Microbiome Harmony Blend",
      items: ["Spore-Forming Bacillus Coagulans", "Dandelion Root Extract", "Marshmallow Root"],
      purpose: "Supports intestinal lining integrity and normal gut barrier defense.",
    },
  ],
  directions: [
    {
      step: "01 — Measure",
      instruction: "Add 1 level scoop (6g) or take 2 capsules each morning.",
    },
    {
      step: "02 — Mix",
      instruction:
        "Stir briskly into 200–250ml of cool or room-temperature filtered water until smoothly dissolved.",
    },
    {
      step: "03 — Enjoy",
      instruction:
        "Consume 15–20 minutes before your first meal. Consistency is key for microbiome adaptation.",
    },
  ],
  safetyInformation: [
    "Not intended to diagnose, treat, cure, or prevent any medical condition or gastrointestinal disease.",
    "Pregnant or lactating women, individuals taking prescription medication, or those with known chronic digestive conditions should consult a qualified physician before use.",
    "Do not exceed the recommended daily serving.",
    "Keep out of reach of children. Store in an airtight container away from moisture.",
  ],
  storageInstructions:
    "Store in a cool, dry place away from direct sunlight and heat. Keep lid tightly closed after each use to protect botanical potency.",
  shippingInfo: {
    standardDays: "2 to 4 business days",
    expressDays: "1 to 2 business days",
    freeShippingThreshold: 0, // Complimentary shipping on all orders
  },
};
