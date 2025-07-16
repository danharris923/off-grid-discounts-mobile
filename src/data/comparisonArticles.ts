// Data structure for comparison articles
export interface ComparisonArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  lastUpdated: string;
  featured: boolean;
  content: {
    intro: string;
    buyersGuide?: string;
    conclusion: string;
  };
  products: {
    productKeywords: string[]; // Keywords to match against scraped products
    maxResults: number;
    sortBy: 'discount' | 'price' | 'relevance';
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    schema: {
      type: 'Article' | 'Product' | 'Review';
      author?: string;
      organization?: string;
    };
  };
}

// Sample article for testing - this will be replaced by AI generation
export const sampleArticles: ComparisonArticle[] = [
  {
    slug: 'best-diesel-heaters-2025',
    title: 'Best Diesel Heaters 2025: Ultimate Guide for Van Life & Off-Grid Living',
    description: 'Expert-tested diesel heaters for van life, RVs, and off-grid cabins. Compare Planar, Webasto, and Chinese models. Find the best deals on reliable heating solutions.',
    category: 'heating',
    keywords: ['diesel heater', 'van life', 'off-grid heating', 'rv heater', 'cabin heater', 'planar heater', 'webasto', 'portable heater', 'chinese diesel heater', 'campervan heating'],
    lastUpdated: new Date().toISOString(),
    featured: true,
    content: {
      intro: 'After testing dozens of diesel heaters across harsh winter conditions, we\'ve identified the most reliable options for 2025. Whether you\'re building a van, heating an RV, or warming an off-grid cabin, these diesel heaters deliver exceptional performance and fuel efficiency. From premium Planar models to budget-friendly Chinese alternatives, we\'ve got you covered.',
      buyersGuide: `## What to Look For in a Diesel Heater 2025

**Power Output & BTU Sizing:**
- **Small Vans (Under 100 sq ft):** 2kW (6,800 BTU) sufficient
- **Large Vans/RVs (100-200 sq ft):** 4kW (13,600 BTU) recommended  
- **Cabins/Large Spaces (200+ sq ft):** 5kW+ (17,000+ BTU) required

**Fuel Efficiency Matters:**
- Quality heaters burn 3-4 liters per 8-hour night
- Look for automatic fuel regulation and altitude compensation
- Avoid models with excessive fuel consumption

**Safety Features:**
- External exhaust venting (never vent inside)
- Carbon monoxide detection compatibility
- Automatic shutoff mechanisms
- Overheat protection

**Power Consumption:**
- Startup: 8-12 amps (brief spike)
- Running: 0.5-2 amps (sustainable for battery systems)
- 12V compatibility essential for off-grid setups

**Installation Complexity:**
- All-in-one units: Minimal installation, portable
- Separate units: Professional installation recommended
- Consider clearance requirements and ventilation`,
      conclusion: 'The diesel heater market has matured significantly in 2025, with reliable options across all price points. For maximum reliability, invest in a Planar or Webasto unit. Budget-conscious buyers can find success with well-reviewed Chinese models, but expect shorter lifespans. Remember: proper installation and maintenance are crucial for safety and longevity. Don\'t skimp on carbon monoxide detection, and always vent exhaust outside your living space.'
    },
    products: {
      productKeywords: ['diesel heater', 'heater', 'heating', 'planar', 'webasto', 'portable heater', 'van heater', 'rv heater'],
      maxResults: 12,
      sortBy: 'discount'
    },
    seo: {
      metaTitle: 'Best Diesel Heaters 2025: Van Life & Off-Grid Heating Guide | Expert Reviews',
      metaDescription: 'Expert-tested diesel heaters for van life & off-grid living. Compare Planar, Webasto & Chinese models. BTU sizing guide + current deals. Updated 2025.',
      schema: {
        type: 'Article',
        author: 'Off-Grid Heating Experts',
        organization: 'Off-Grid Discounts'
      }
    }
  },
  {
    slug: 'top-camping-stoves-under-100',
    title: 'Top 10 Camping Stoves Under $100 - Budget Outdoor Cooking',
    description: 'Best budget camping stoves that deliver great performance without breaking the bank. Compare fuel types, weight, and cooking power.',
    category: 'cooking',
    keywords: ['camping stove', 'budget camping gear', 'outdoor cooking', 'backpacking stove'],
    lastUpdated: new Date().toISOString(),
    featured: true,
    content: {
      intro: 'Great outdoor cooking doesn\'t require expensive gear. These budget-friendly camping stoves prove you can enjoy hot meals on the trail without emptying your wallet.',
      buyersGuide: 'Consider fuel type (propane, butane, alcohol), weight for backpacking, cooking surface size, and wind resistance.',
      conclusion: 'A reliable camping stove under $100 opens up endless meal possibilities on your outdoor adventures.'
    },
    products: {
      productKeywords: ['camping stove', 'stove', 'outdoor cooking'],
      maxResults: 10,
      sortBy: 'price'
    },
    seo: {
      metaTitle: 'Best Camping Stoves Under $100 - Budget Outdoor Cooking Guide',
      metaDescription: 'Top 10 budget camping stoves under $100. Compare weight, fuel efficiency & cooking power. Find deals on quality outdoor cooking gear.',
      schema: {
        type: 'Article',
        author: 'Outdoor Gear Experts',
        organization: 'Off-Grid Discounts'
      }
    }
  }
];

// Function to get article by slug
export const getArticleBySlug = (slug: string): ComparisonArticle | undefined => {
  return sampleArticles.find(article => article.slug === slug);
};

// Function to get all articles (for future use)
export const getAllArticles = (): ComparisonArticle[] => {
  return sampleArticles;
};

// Function to get featured articles
export const getFeaturedArticles = (): ComparisonArticle[] => {
  return sampleArticles.filter(article => article.featured);
};