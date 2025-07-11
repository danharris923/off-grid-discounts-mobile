import axios from 'axios';
import { Deal } from '../types/Deal';

const GOOGLE_SHEETS_API_KEY = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY;
const GOOGLE_SHEETS_ID = process.env.REACT_APP_GOOGLE_SHEETS_ID;
const SHEET1_RANGE = 'Sheet1!A2:L1000'; // Amazon deals - Skip header row, include all columns (A-L = 12 columns)
const SHEET2_RANGE = 'Sheet2!A2:L1000'; // Cabela's deals - Skip header row, include all columns (A-L = 12 columns)


export class GoogleSheetsService {
  private sheet1ApiUrl: string;
  private sheet2ApiUrl: string;

  constructor() {
    this.sheet1ApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${SHEET1_RANGE}?key=${GOOGLE_SHEETS_API_KEY}`;
    this.sheet2ApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${SHEET2_RANGE}?key=${GOOGLE_SHEETS_API_KEY}`;
    
    // Log configuration for debugging
    console.log('Google Sheets configuration:', {
      hasApiKey: !!GOOGLE_SHEETS_API_KEY,
      hasSheetId: !!GOOGLE_SHEETS_ID,
      apiKeyLength: GOOGLE_SHEETS_API_KEY?.length || 0,
      sheetIdLength: GOOGLE_SHEETS_ID?.length || 0,
      sheet1Url: this.sheet1ApiUrl,
      sheet2Url: this.sheet2ApiUrl
    });
  }

  async fetchDeals(): Promise<Deal[]> {
    try {
      // Fetch from both sheets in parallel
      console.log('Fetching from Sheet1 (Amazon):', this.sheet1ApiUrl);
      console.log('Fetching from Sheet2 (Cabela\'s):', this.sheet2ApiUrl);
      
      const [sheet1Response, sheet2Response] = await Promise.all([
        axios.get(this.sheet1ApiUrl),
        axios.get(this.sheet2ApiUrl).catch(error => {
          console.error('Sheet2 fetch failed, continuing with Sheet1 only:', error);
          console.error('Sheet2 URL:', this.sheet2ApiUrl);
          console.error('Error details:', {
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data
          });
          return { data: { values: [] } };
        })
      ]);
      
      const sheet1Rows = sheet1Response.data.values || [];
      const sheet2Rows = sheet2Response.data.values || [];
      
      console.log('Sheet1 rows:', sheet1Rows.length);
      console.log('Sheet2 rows:', sheet2Rows.length);
      
      if (sheet1Rows.length === 0 && sheet2Rows.length === 0) {
        return this.getSampleDeals();
      }

      // Process Sheet1 (Amazon deals)
      const amazonDeals = sheet1Rows.map((row: string[], index: number) => {
        // Auto-detect card type: if both Amazon and Cabela's data exist, it's a comparison
        const hasAmazonData = row[2] && row[4]; // Price and link in columns C & E
        const hasCabelasData = row[3] && row[5]; // Price and link in columns D & F
        const isComparison = hasAmazonData && hasCabelasData;
        
        if (isComparison) {
          const amazonPrice = parseFloat(row[2]) || 0;
          const cabelasPrice = parseFloat(row[3]) || 0;
          const savings = parseFloat(row[11]) || 0;
          const bestDealRetailer = amazonPrice < cabelasPrice ? 'amazon' : 'cabelas';

          return {
            id: `amazon-${index}`,
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
          // Single deal card - direct mapping from sheet
          const salePrice = parseFloat(row[2]) || 0;      // Column C - Amazon Price
          const originalPrice = parseFloat(row[9]) || 0;  // Column J - Original Price
          const discountPercent = parseInt(row[10]) || 0; // Column K - Discount %
          
          const link = row[4] || row[5] || '';
          const retailer = row[4] ? 'Amazon' : row[5] ? "Cabela's" : 'Unknown';
          
          // Debug logging for price issues
          if (salePrice === 0) {
            console.log(`Price issue for "${row[0]}"`, {
              salePriceRaw: row[2],
              originalPriceRaw: row[9],
              discountPercentRaw: row[10],
              fullRow: row
            });
          }

          return {
            id: `amazon-${index}`,
            productName: row[0] || '',
            imageUrl: row[1] || '',
            regularPrice: originalPrice,
            salePrice: salePrice,
            dealLink: link,
            retailer: retailer,
            dealEndDate: row[6] || '',
            category: this.parseCategory(row[7]),
            featured: row[8]?.toLowerCase() === 'true' || false,
            savings: parseFloat(row[11]) || 0,
            discountPercent: discountPercent,
            bestDealRetailer: 'single' as const,
            cardType: 'single' as const
          };
        }
      });

      // Process Sheet2 (Cabela's deals)
      const cabelasDeals = sheet2Rows.map((row: string[], index: number) => {
        const salePrice = parseFloat(row[3]) || parseFloat(row[2]) || 0;  // Try Cabela's price first, then Amazon column
        const originalPrice = parseFloat(row[9]) || 0;  // Column J - Original Price
        const discountPercent = parseInt(row[10]) || 0; // Column K - Discount %
        const link = row[5] || row[4] || '';  // Prefer Cabela's link
        
        return {
          id: `cabelas-${index}`,
          productName: row[0] || '',
          imageUrl: row[1] || '',
          regularPrice: originalPrice,
          salePrice: salePrice,
          dealLink: link,
          retailer: "Cabela's",
          dealEndDate: row[6] || '',
          category: this.parseCategory(row[7]),
          featured: row[8]?.toLowerCase() === 'true' || false,
          savings: parseFloat(row[11]) || 0,
          discountPercent: discountPercent,
          bestDealRetailer: 'single' as const,
          cardType: 'single' as const
        };
      });

      // Merge and shuffle deals for random appearance
      const allDeals = [...amazonDeals, ...cabelasDeals];
      
      // Separate featured and regular deals
      const featuredDeals = allDeals.filter(deal => deal.featured);
      const regularDeals = allDeals.filter(deal => !deal.featured);
      
      // Shuffle function using Fisher-Yates algorithm
      const shuffle = (array: any[]) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };
      
      // Shuffle both groups separately
      const shuffledFeatured = shuffle(featuredDeals);
      const shuffledRegular = shuffle(regularDeals);
      
      // Combine with featured deals first, then shuffled regular deals
      return [...shuffledFeatured, ...shuffledRegular];
    } catch (error: any) {
      console.error('Error fetching deals from Google Sheets:', error);
      console.error('Error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
        fullError: JSON.stringify(error?.response?.data || error),
        errorObject: error?.response?.data
      });
      
      // Check for specific API errors
      if (error?.response?.status === 400 && error?.response?.data?.error?.message?.includes('API key not valid')) {
        console.error('API Key Error: The Google Sheets API key is invalid or doesn\'t have access to Google Sheets API');
        console.error('To fix: Enable Google Sheets API in Google Cloud Console for this API key');
      }
      
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
        dealEndDate: '2024-12-31',
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
        dealEndDate: '2024-12-25',
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
        dealEndDate: '2024-12-28',
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
        dealEndDate: '2024-12-30',
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
        dealEndDate: '2024-12-26',
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
        dealEndDate: '2024-12-27',
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
        dealEndDate: '2024-12-20',
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
        dealEndDate: '2024-12-18',
        category: 'generators',
        featured: false,
        savings: 200.00,
        discountPercent: 14,
        bestDealRetailer: 'single',
        cardType: 'single'
      }
    ];
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