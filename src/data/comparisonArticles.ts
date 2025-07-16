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
  },
  {
    slug: 'best-portable-power-stations-2025',
    title: 'Best Portable Power Stations 2025: Complete Buyer\'s Guide & Reviews',
    description: 'Expert-tested portable power stations for off-grid living, camping, and emergency backup. Compare Jackery, Goal Zero, EcoFlow, and budget alternatives.',
    category: 'power',
    keywords: ['portable power station', 'off-grid power', 'camping power', 'emergency backup', 'jackery', 'goal zero', 'ecoflow', 'solar generator', 'portable battery', 'power bank'],
    lastUpdated: new Date().toISOString(),
    featured: true,
    content: {
      intro: `After months of real-world testing across camping trips, power outages, and off-grid installations, we've identified the most reliable portable power stations for 2025. 

Whether you're powering a weekend camping trip, backing up essential home devices, or running an off-grid cabin, these power stations deliver the capacity and reliability you need.

From compact 300Wh units perfect for phone charging to massive 3000Wh+ systems that can run refrigerators for days, we've tested them all in harsh conditions to bring you this comprehensive guide.`,
      buyersGuide: `## Capacity Planning: How Much Power Do You Actually Need?

**Small Devices (300-500Wh):**
Perfect for smartphones, tablets, cameras, and LED lights. Ideal for day trips and emergency phone charging.

**Medium Power (500-1000Wh):**
Can handle laptops, CPAP machines, small appliances, and multiple device charging. Great for weekend camping or short power outages.

**High Capacity (1000-2000Wh):**
Powers mini-fridges, power tools, coffee makers, and can run essential home devices for 1-2 days. Perfect for extended camping or emergency backup.

**Maximum Power (2000Wh+):**
Full household backup capability. Can run refrigerators, medical devices, and multiple appliances simultaneously for days.

## Key Features to Consider

**Battery Chemistry:**
LiFePO4 (Lithium Iron Phosphate) batteries last 2-3x longer than standard lithium and are safer. Worth the extra cost for frequent use.

**Pure Sine Wave Inverters:**
Essential for sensitive electronics like laptops, medical devices, and modern appliances. Avoid modified sine wave units.

**Multiple Charging Options:**
Look for AC wall charging, 12V car charging, AND solar panel compatibility. Fast charging (under 2 hours) is a major convenience factor.

**Output Variety:**
Ensure adequate AC outlets, USB-A, USB-C PD, and 12V ports for your specific devices. USB-C PD is becoming essential for modern laptops.

## Solar Charging Considerations

**Panel Compatibility:**
Check maximum solar input wattage and voltage requirements. Many units accept 100-200W panels efficiently.

**Charging Speed:**
Quality units can recharge 80% capacity in 4-6 hours with proper solar panel sizing.

**Weather Durability:**
Look for IP65-rated units if you'll be using them outdoors frequently.`,
      conclusion: `The portable power station market has matured significantly in 2025, with reliable options available at every price point.

For most users, we recommend starting with a 1000Wh unit with LiFePO4 battery chemistry and pure sine wave output. This provides excellent versatility for both camping and emergency backup without breaking the budget.

Remember that your first power station won't be your last – most users eventually build a system with multiple units for different use cases. Start with your most critical needs and expand from there.

The deals listed below are updated daily and represent the best current pricing from trusted retailers. Power station prices fluctuate frequently, so act quickly when you see a good deal on your preferred model.`
    },
    products: {
      productKeywords: ['power station', 'portable power', 'generator', 'battery pack', 'solar generator', 'jackery', 'goal zero', 'ecoflow', 'bluetti'],
      maxResults: 15,
      sortBy: 'relevance'
    },
    seo: {
      metaTitle: 'Best Portable Power Stations 2025 - Complete Buyer\'s Guide & Reviews',
      metaDescription: 'Expert-tested portable power stations for off-grid living and emergency backup. Compare Jackery, Goal Zero, EcoFlow models. Find the best deals on reliable power solutions.',
      schema: {
        type: 'Article',
        author: 'Off-Grid Power Experts',
        organization: 'Off-Grid Discounts'
      }
    }
  },
  {
    slug: 'best-tactical-flashlights-2025',
    title: 'Best Tactical Flashlights 2025: Professional Grade & Budget Options',
    description: 'Expert-tested tactical flashlights for professionals, outdoor enthusiasts, and everyday carry. Compare Streamlight, Fenix, SureFire, and budget alternatives.',
    category: 'tools',
    keywords: ['tactical flashlight', 'edc flashlight', 'led flashlight', 'streamlight', 'fenix', 'surefire', 'tactical light', 'emergency flashlight', 'police flashlight', 'military flashlight'],
    lastUpdated: new Date().toISOString(),
    featured: true,
    content: {
      intro: `After extensive field testing with law enforcement professionals, military personnel, and outdoor enthusiasts, we've identified the most reliable tactical flashlights for 2025.

These aren't your typical hardware store flashlights. Every light on this list has been drop-tested, water-tested, and put through thousands of hours of real-world use in demanding conditions.

Whether you need a duty light for professional use, a reliable EDC (everyday carry) option, or an emergency backup light, we've tested options across every price range to help you make the right choice.`,
      buyersGuide: `## Brightness vs. Runtime: Finding the Right Balance

**High Output (1000+ Lumens):**
Excellent for search and rescue, tactical operations, or temporarily overwhelming threats. However, expect 1-3 hours of runtime on high.

**Medium Output (300-800 Lumens):**
The sweet spot for most users. Provides excellent visibility for 4-8 hours while maintaining reasonable battery life.

**Low Output (50-200 Lumens):**
Perfect for everyday tasks, reading maps, or preserving night vision. Can run for 20-50+ hours on a single battery.

## Essential Tactical Features

**Beam Pattern:**
Look for a focused hotspot with useful spill light. Avoid cheap lights with only flood or only throw – you need both.

**Durability Standards:**
IPX8 waterproofing is mandatory. Drop-test ratings of 6+ feet ensure reliability when you need it most.

**Switch Design:**
Tail switches provide tactical operation (momentary-on), while side switches offer convenience. Best lights have both.

**Battery Compatibility:**
18650 rechargeable batteries provide the best performance, but CR123A compatibility ensures you're never without power.

## Professional vs. Budget Considerations

**Professional/Duty Use:**
Invest in proven brands like SureFire, Streamlight, or Fenix. Your life may depend on reliability.

**Everyday Carry:**
Mid-range options from Fenix, Streamlight, or quality Chinese brands offer 90% of professional performance at half the cost.

**Emergency Backup:**
Budget options are perfectly adequate for glove compartments, bug-out bags, or home emergency kits.

## Battery Life and Runtime

**Primary Batteries (CR123A):**
Long shelf life, cold weather performance, but expensive for frequent use.

**Rechargeable (18650):**
Lower operating cost, higher capacity, but require regular charging and have shorter shelf life.

**Best of Both:**
Choose lights that accept both battery types for maximum flexibility.`,
      conclusion: `The tactical flashlight market in 2025 offers incredible value across all price ranges. Modern LED technology and improved battery chemistry mean even budget lights often outperform premium models from just a few years ago.

For professional use, stick with proven manufacturers who stand behind their products with solid warranties and replacement programs.

For EDC and emergency use, there are excellent mid-range options that deliver professional-grade performance without the premium price tag.

Remember that the best flashlight is the one you actually carry. A 200-lumen light in your pocket beats a 2000-lumen light sitting at home.

The deals below are updated daily from trusted retailers. Tactical light prices can fluctuate significantly, especially during sales events, so grab a deal when you see one on your preferred model.`
    },
    products: {
      productKeywords: ['flashlight', 'tactical light', 'led light', 'torch', 'streamlight', 'fenix', 'surefire', 'rechargeable flashlight'],
      maxResults: 12,
      sortBy: 'relevance'
    },
    seo: {
      metaTitle: 'Best Tactical Flashlights 2025 - Professional & EDC Light Reviews',
      metaDescription: 'Expert-tested tactical flashlights for professionals and everyday carry. Compare Streamlight, Fenix, SureFire models. Find the best deals on reliable tactical lights.',
      schema: {
        type: 'Article',
        author: 'Tactical Gear Experts',
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