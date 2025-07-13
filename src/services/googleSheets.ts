import axios from 'axios';
import { Deal } from '../types/Deal';
import { APP_CONSTANTS, SHEETS_CONFIG } from '../constants/app';

const GOOGLE_SHEETS_API_KEY = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY;
const GOOGLE_SHEETS_ID = process.env.REACT_APP_GOOGLE_SHEETS_ID;


export class GoogleSheetsService {
  private sheet1ApiUrl: string;
  private sheet2ApiUrl: string;
  private sheet3ApiUrl: string;

  constructor() {
    this.sheet1ApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${SHEETS_CONFIG.RANGES.SHEET1}?key=${GOOGLE_SHEETS_API_KEY}`;
    this.sheet2ApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${SHEETS_CONFIG.RANGES.SHEET2}?key=${GOOGLE_SHEETS_API_KEY}`;
    this.sheet3ApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${SHEETS_CONFIG.RANGES.SHEET3}?key=${GOOGLE_SHEETS_API_KEY}`;
    
    // Configuration initialized
  }

  async fetchDeals(): Promise<Deal[]> {
    try {
      // Fetch from all three sheets in parallel
      const [sheet1Response, sheet2Response, sheet3Response] = await Promise.all([
        axios.get(this.sheet1ApiUrl),
        axios.get(this.sheet2ApiUrl).catch(() => ({ data: { values: [] } })),
        axios.get(this.sheet3ApiUrl).catch(() => ({ data: { values: [] } }))
      ]);
      
      const sheet1Rows = sheet1Response.data.values || [];
      const sheet2Rows = sheet2Response.data.values || [];
      const sheet3Rows = sheet3Response.data.values || [];
      
      if (sheet1Rows.length === 0 && sheet2Rows.length === 0 && sheet3Rows.length === 0) {
        return this.getSampleDeals();
      }

      // Process Sheet1 (Amazon deals) 
      const amazonDeals = sheet1Rows.map((row: string[], index: number) => {
        // Generate deterministic ID based on content
        const contentHash = this.generateDeterministicId(row[0] || '', 'sheet1', index);
        // Auto-detect card type: if both Amazon and Cabela's data exist, it's a comparison
        const hasAmazonData = row[2] && row[4]; // Price and link in columns C & E
        const hasCabelasData = row[3] && row[5]; // Price and link in columns D & F
        const isComparison = hasAmazonData && hasCabelasData;
        
        if (isComparison) {
          const amazonPrice = this.cleanPrice(row[2]);   // Column C - Amazon price
          const cabelasPrice = this.cleanPrice(row[3]);  // Column D - Cabela's price
          const savings = this.cleanPrice(row[11]);      // Column L - Savings
          const bestDealRetailer = amazonPrice < cabelasPrice ? 'amazon' : 'cabelas';

          return {
            id: contentHash,
            productName: row[0] || '',
            imageUrl: row[1] || '',
            amazonPrice,
            cabelasPrice,
            amazonLink: row[4] || '',
            cabelasLink: row[5] || '',
            dealEndDate: row[6] || '',
            category: this.parseCategory(row[7]),
            featured: row[8]?.toLowerCase() === 'true' || false,
            savings,
            bestDealRetailer,
            cardType: 'comparison' as const
          };
        } else {
          // Single deal card - improved price processing with data cleaning
          const salePrice = this.cleanPrice(row[2]);      // Column C - Current/Sale Price
          let originalPrice = this.cleanPrice(row[9]);    // Column J - Original Price  
          let discountPercent = this.cleanPercentage(row[10]); // Column K - Discount %
          
          // Calculate missing values for better price display
          if (originalPrice > 0 && salePrice > 0 && discountPercent === 0) {
            // Calculate discount percentage if missing
            discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
          }
          
          if (salePrice > 0 && originalPrice === 0 && discountPercent > 0) {
            // Calculate original price if missing but we have discount %
            originalPrice = Math.round((salePrice / (1 - discountPercent / 100)) * 100) / 100;
          }
          
          const link = row[4] || row[5] || '';
          const retailer = row[4] ? 'Amazon' : row[5] ? "Cabela's" : 'Unknown';
          
          // Skip items with price parsing issues
          if (salePrice === 0) {
            continue;
          }

          // Determine if price should be hidden using strategic logic
          const category = this.parseCategory(row[7]);
          const productName = row[0] || '';
          const shouldHidePrice = this.shouldHidePrice(salePrice, category, originalPrice, productName);
          
          return {
            id: contentHash,
            productName: row[0] || '',
            imageUrl: row[1] || '',
            regularPrice: originalPrice,
            salePrice: shouldHidePrice ? 0 : salePrice,
            dealLink: link,
            retailer: retailer,
            dealEndDate: row[6] || '',
            category: category,
            featured: row[8]?.toLowerCase() === 'true' || false,
            savings: originalPrice > salePrice ? Math.round((originalPrice - salePrice) * 100) / 100 : parseFloat(row[11]) || 0,
            discountPercent: discountPercent,
            bestDealRetailer: 'single' as const,
            cardType: 'single' as const
          };
        }
      });

      // Process Sheet2 (Cabela's deals)
      const cabelasDeals = sheet2Rows.map((row: string[], index: number) => {
        // Generate deterministic ID based on content
        const contentHash = this.generateDeterministicId(row[0] || '', 'sheet2', index);
        const salePrice = this.cleanPrice(row[3]);  // Column D - Cabela's price
        let originalPrice = this.cleanPrice(row[9]);  // Column J - Original Price
        let discountPercent = this.cleanPercentage(row[10]); // Column K - Discount %
        const link = row[5] || row[4] || '';  // Prefer Cabela's link
        
        // Debug logging for Cabela's links
        // Process Cabela's deals from Sheet2
        
        // Calculate missing values for better price display
        if (originalPrice > 0 && salePrice > 0 && discountPercent === 0) {
          // Calculate discount percentage if missing
          discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
        }
        
        if (salePrice > 0 && originalPrice === 0 && discountPercent > 0) {
          // Calculate original price if missing but we have discount %
          originalPrice = Math.round((salePrice / (1 - discountPercent / 100)) * 100) / 100;
        }
        
        // Determine if price should be hidden using strategic logic
        const category = this.parseCategory(row[7]);
        const productName = row[0] || '';
        const shouldHidePrice = this.shouldHidePrice(salePrice, category, originalPrice, productName);
        
        return {
          id: contentHash,
          productName: row[0] || '',
          imageUrl: row[1] || '',
          regularPrice: originalPrice,
          salePrice: shouldHidePrice ? 0 : salePrice,
          dealLink: link,
          retailer: "Cabela's",
          dealEndDate: row[6] || '',
          category: category,
          featured: row[8]?.toLowerCase() === 'true' || false,
          savings: originalPrice > salePrice ? Math.round((originalPrice - salePrice) * 100) / 100 : parseFloat(row[11]) || 0,
          discountPercent: discountPercent,
          bestDealRetailer: 'single' as const,
          cardType: 'single' as const
        };
      });

      // Process Sheet3 (Cabela's clearance deals)
      const cabelasClearanceDeals = sheet3Rows.map((row: string[], index: number) => {
        // Generate deterministic ID based on content
        const contentHash = this.generateDeterministicId(row[0] || '', 'sheet3', index);
        const salePrice = this.cleanPrice(row[3]);  // Column D - Cabela's price
        let originalPrice = this.cleanPrice(row[9]);  // Column J - Original Price
        let discountPercent = this.cleanPercentage(row[10]); // Column K - Discount %
        const link = row[5] || row[4] || '';  // Prefer Cabela's link
        
        // Calculate missing values for better price display
        if (originalPrice > 0 && salePrice > 0 && discountPercent === 0) {
          // Calculate discount percentage if missing
          discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
        }
        
        if (salePrice > 0 && originalPrice === 0 && discountPercent > 0) {
          // Calculate original price if missing but we have discount %
          originalPrice = Math.round((salePrice / (1 - discountPercent / 100)) * 100) / 100;
        }
        
        // Determine if price should be hidden using strategic logic
        const category = this.parseCategory(row[7]);
        const productName = row[0] || '';
        const shouldHidePrice = this.shouldHidePrice(salePrice, category, originalPrice, productName);
        
        return {
          id: contentHash,
          productName: row[0] || '',
          imageUrl: row[1] || '',
          regularPrice: originalPrice,
          salePrice: shouldHidePrice ? 0 : salePrice,
          dealLink: link,
          retailer: "Cabela's",
          dealEndDate: row[6] || '',
          category: category,
          featured: row[8]?.toLowerCase() === 'true' || false,
          savings: originalPrice > salePrice ? Math.round((originalPrice - salePrice) * 100) / 100 : parseFloat(row[11]) || 0,
          discountPercent: discountPercent,
          bestDealRetailer: 'single' as const,
          cardType: 'single' as const,
          clearance: true // All Sheet3 deals get clearance tag
        };
      });

      // Create comparison cards for matching products (Amazon vs regular Cabela's only)
      const comparisonDeals = this.createComparisonDeals(amazonDeals, cabelasDeals);
      
      // Merge all deals - comparisons + remaining singles + clearance deals
      const allDeals = [...comparisonDeals.comparisons, ...comparisonDeals.singles, ...cabelasClearanceDeals];
      
      // Return all deals, ProductGrid will handle stable session-based shuffling
      return allDeals;
    } catch (error: any) {
      // API error occurred, return demo data with warning
      
      // Return sample data with warning
      const sampleDeals = this.getSampleDeals();
      return sampleDeals.map(deal => ({
        ...deal,
        productName: `[DEMO - API ERROR] ${deal.productName}`
      }));
    }
  }

  private getSampleDeals(): Deal[] {
    return [
      // Row 1: 3 single deals
      {
        id: 'deal-1',
        productName: 'Goal Zero Yeti 1500X Portable Power Station',
        imageUrl: 'https://images.thdstatic.com/productImages/0e7b4b5c-d8a8-4e5f-8a2f-8b9c7d6e5f4a/svn/goal-zero-portable-generators-23000-64_1000.jpg',
        regularPrice: 2199.99,
        salePrice: 1899.99,
        dealLink: 'https://amazon.com/dp/B08FXQB4Z4',
        retailer: 'Amazon',
        dealEndDate: '2025-12-31',
        category: 'power',
        featured: true,
        savings: 300.00,
        discountPercent: 14,
        bestDealRetailer: 'single',
        cardType: 'single'
      },
      {
        id: 'deal-2',
        productName: 'Jackery Solar Generator 1000 Pro',
        imageUrl: 'https://m.media-amazon.com/images/I/71K6I5u9EjL._AC_SL1500_.jpg',
        regularPrice: 1499.99,
        salePrice: 1299.99,
        dealLink: 'https://amazon.com/dp/B095GJLPRP',
        retailer: 'Amazon',
        dealEndDate: '2025-12-25',
        category: 'generators',
        featured: false,
        savings: 200.00,
        discountPercent: 13,
        bestDealRetailer: 'single',
        cardType: 'single'
      },
      {
        id: 'deal-3',
        productName: 'Renogy 100W Solar Panel Kit',
        imageUrl: 'https://m.media-amazon.com/images/I/81VLfpYgJgL._AC_SL1500_.jpg',
        regularPrice: 229.99,
        salePrice: 179.99,
        dealLink: 'https://cabelas.com/shop/en/renogy-100w-solar-panel-kit',
        retailer: "Cabela's",
        dealEndDate: '2025-12-28',
        category: 'power',
        featured: false,
        savings: 50.00,
        discountPercent: 22,
        bestDealRetailer: 'single',
        cardType: 'single'
      },
      
      // Row 2: 2 comparison deals
      {
        id: 'deal-4',
        productName: 'Champion 3800-Watt Dual Fuel Generator',
        imageUrl: 'https://m.media-amazon.com/images/I/71lLO5JZgzL._AC_SL1500_.jpg',
        amazonPrice: 449.99,
        cabelasPrice: 469.99,
        amazonLink: 'https://amazon.com/dp/B01MXYBZWM',
        cabelasLink: 'https://cabelas.com/shop/en/champion-3800-watt-dual-fuel-generator',
        dealEndDate: '2025-12-30',
        category: 'generators',
        featured: true,
        savings: 20.00,
        bestDealRetailer: 'amazon',
        cardType: 'comparison'
      },
      {
        id: 'deal-5',
        productName: 'BattleBorn 100Ah LiFePO4 Battery',
        imageUrl: 'https://m.media-amazon.com/images/I/61zN7zJhYfL._AC_SL1024_.jpg',
        amazonPrice: 899.99,
        cabelasPrice: 849.99,
        amazonLink: 'https://amazon.com/dp/B078WQGPX8',
        cabelasLink: 'https://cabelas.com/shop/en/battleborn-100ah-lifepo4-battery',
        dealEndDate: '2025-12-26',
        category: 'batteries',
        featured: false,
        savings: 50.00,
        bestDealRetailer: 'cabelas',
        cardType: 'comparison'
      },
      
      // Row 3: 3 single deals
      {
        id: 'deal-6',
        productName: 'Bluetti AC300 Power Station',
        imageUrl: 'https://m.media-amazon.com/images/I/71QVTnWGAeL._AC_SL1500_.jpg',
        regularPrice: 2999.99,
        salePrice: 2599.99,
        dealLink: 'https://amazon.com/dp/B09KQXDVHF',
        retailer: 'Amazon',
        dealEndDate: '2025-12-27',
        category: 'power',
        featured: true,
        savings: 400.00,
        discountPercent: 13,
        bestDealRetailer: 'single',
        cardType: 'single'
      },
      {
        id: 'deal-7',
        productName: 'Cubic Mini Wood Stove',
        imageUrl: 'https://m.media-amazon.com/images/I/71dJKtGXkjL._AC_SL1500_.jpg',
        regularPrice: 349.99,
        salePrice: 289.99,
        dealLink: 'https://cabelas.com/shop/en/cubic-mini-wood-stove',
        retailer: "Cabela's",
        dealEndDate: '2025-12-20',
        category: 'stoves',
        featured: false,
        savings: 60.00,
        discountPercent: 17,
        bestDealRetailer: 'single',
        cardType: 'single'
      },
      {
        id: 'deal-8',
        productName: 'Honda EU2200i Generator',
        imageUrl: 'https://m.media-amazon.com/images/I/71xQnZGdg4L._AC_SL1500_.jpg',
        regularPrice: 1399.99,
        salePrice: 1199.99,
        dealLink: 'https://amazon.com/dp/B073HWMVGR',
        retailer: 'Amazon',
        dealEndDate: '2025-12-18',
        category: 'generators',
        featured: false,
        savings: 200.00,
        discountPercent: 14,
        bestDealRetailer: 'single',
        cardType: 'single'
      }
    ];
  }

  private shouldHidePrice(price: number, category: Deal['category'], originalPrice?: number, productName?: string): boolean {
    // Strategic price hiding based on modern e-commerce psychology
    
    // Always hide if price is 0 (already means "click for price")
    if (price === 0) return true;
    
    // Create deterministic "random" based on product name hash
    const hash = productName ? this.hashString(productName) : 0;
    const pseudoRandom = (hash % 100) / 100; // 0-0.99
    
    // High-value items (>$300) - hide 80% of the time (increased from 60%)
    if (price > APP_CONSTANTS.HIGH_VALUE_THRESHOLD) {
      return pseudoRandom < 0.8;
    }
    
    // Premium categories - hide 65% of the time (increased from 40%)
    if (['power', 'generators', 'batteries', 'tools'].includes(category)) {
      return pseudoRandom < 0.65;
    }
    
    // High discount items (>30%) - show price to highlight great deals (increased threshold)
    const discount = originalPrice ? ((originalPrice - price) / originalPrice) * 100 : 0;
    if (discount > 30) {
      return false; // Always show great deals
    }
    
    // Medium-priced items ($100-$300) - hide 50% of the time (increased from 25%)
    if (price > 100) {
      return pseudoRandom < 0.5;
    }
    
    // Low-priced items (<$100) - hide 35% of the time (increased from 15%)
    return pseudoRandom < 0.35;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private cleanPrice(priceStr: string | undefined): number {
    if (!priceStr) return 0;
    
    // Convert to string and handle various price formats
    const original = priceStr.toString();
    let cleaned = original.trim();
    
    // Handle common price prefixes and patterns
    cleaned = cleaned
      .replace(/^(From\s*|Starting\s*at\s*|As\s*low\s*as\s*)/i, '') // Remove "From $", "Starting at $", etc.
      .replace(/^[\s\$]*/, '')     // Remove leading spaces and dollar signs
      .replace(/[,$']/g, '')       // Remove commas, dollar signs, apostrophes
      .replace(/\.\./g, '.')       // Replace double dots with single dot
      .replace(/\s+/g, '')         // Remove all spaces
      .replace(/%/g, '')           // Remove percentage signs
      .replace(/[^\d.]/g, '');     // Remove any remaining non-numeric characters except dots
    
    // Handle multiple decimal points (keep only the first one)
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    const result = parseFloat(cleaned);
    const finalResult = isNaN(result) ? 0 : result;
    
    // Debug logging - print the whole string transformation
    // Price parsed successfully
    
    return finalResult;
  }

  private cleanPercentage(percentStr: string | undefined): number {
    if (!percentStr) return 0;
    
    // Remove ', %, spaces and parse as number
    const cleaned = percentStr
      .toString()
      .replace(/['%\s]/g, ''); // Remove apostrophes, percentage signs, spaces
    
    return parseInt(cleaned) || 0;
  }

  private generateDeterministicId(productName: string, sheet: string, index: number): string {
    // Create a simple hash from product name
    let hash = 0;
    const str = productName.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Make it positive and combine with sheet/index for uniqueness
    const positiveHash = Math.abs(hash);
    return `${sheet}-${index}-${positiveHash.toString(36)}`;
  }

  private extractModelKey(productName: string): string {
    const name = productName.toLowerCase();
    
    // Extract power station models
    const powerStationMatch = name.match(/(?:yeti|explorer|eb|ac|river|delta|portable power)\s*(\d+[xpros]*)/);
    if (powerStationMatch) return powerStationMatch[1];
    
    // Extract generator models  
    const generatorMatch = name.match(/(?:eu|gp|dg|champion|honda|predator)\s*(\d+[wi]*)/);
    if (generatorMatch) return generatorMatch[1];
    
    // Extract solar panel wattage
    const solarMatch = name.match(/(\d+)w/);
    if (solarMatch) return `solar${solarMatch[1]}w`;
    
    // Extract brand + first significant number
    const brandMatch = name.match(/^(\w+).*?(\d+)/);
    if (brandMatch) return `${brandMatch[1]}-${brandMatch[2]}`;
    
    // Fallback to first word + numbers
    const fallbackMatch = name.match(/(\w+).*?(\d+)/);
    return fallbackMatch ? `${fallbackMatch[1]}-${fallbackMatch[2]}` : name.slice(0, 10);
  }

  private createComparisonDeals(amazonDeals: Deal[], cabelasDeals: Deal[]): { comparisons: Deal[], singles: Deal[] } {
    // No longer creating comparison cards - using dropdown compare instead
    // Return all deals as singles
    const comparisons: Deal[] = [];
    const singles: Deal[] = [...amazonDeals, ...cabelasDeals];
    
    // Created comparison and single cards
    return { comparisons, singles };
  }

  private parseCategory(categoryStr: string): Deal['category'] {
    const category = categoryStr?.toLowerCase();
    switch (category) {
      case 'power':
      case 'generators':
      case 'batteries':
      case 'stoves':
      case 'camping':
      case 'clothing':
      case 'tools':
      case 'navigation':
      case 'water':
      case 'food':
        return category;
      default:
        return 'other';
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();