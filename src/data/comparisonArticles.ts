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
    title: 'Best Diesel Heaters for Van Life & Off-Grid Living 2025',
    description: 'Complete buyer\'s guide to the top diesel heaters for van life, RVs, and off-grid cabins. Compare features, BTU output, and find the best deals.',
    category: 'heating',
    keywords: ['diesel heater', 'van life', 'off-grid heating', 'rv heater', 'cabin heater'],
    lastUpdated: new Date().toISOString(),
    featured: true,
    content: {
      intro: 'When living off-grid or in a van, reliable heating is crucial for comfort and safety. Diesel heaters offer exceptional efficiency and power, making them the top choice for serious off-grid enthusiasts.',
      buyersGuide: 'Consider BTU output (2kW for small vans, 5kW+ for larger spaces), fuel efficiency, noise levels, and installation complexity.',
      conclusion: 'The right diesel heater transforms cold nights into cozy comfort while maximizing fuel efficiency.'
    },
    products: {
      productKeywords: ['diesel heater', 'heater', 'heating'],
      maxResults: 8,
      sortBy: 'discount'
    },
    seo: {
      metaTitle: 'Best Diesel Heaters 2025: Van Life & Off-Grid Heating Guide',
      metaDescription: 'Find the top diesel heaters for van life, RVs & off-grid living. Compare BTU, efficiency & prices. Expert reviews + current deals.',
      schema: {
        type: 'Article',
        author: 'Off-Grid Experts',
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