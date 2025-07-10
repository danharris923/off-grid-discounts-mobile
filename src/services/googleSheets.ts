import axios from 'axios';
import { Deal } from '../types/Deal';

const GOOGLE_SHEETS_API_KEY = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY;
const GOOGLE_SHEETS_ID = process.env.REACT_APP_GOOGLE_SHEETS_ID;
const SHEET_RANGE = 'Sheet1!A2:J1000'; // Skip header row, include card type column (A-J = 10 columns)


export class GoogleSheetsService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${SHEET_RANGE}?key=${GOOGLE_SHEETS_API_KEY}`;
    
    // Log configuration for debugging
    console.log('Google Sheets configuration:', {
      hasApiKey: !!GOOGLE_SHEETS_API_KEY,
      hasSheetId: !!GOOGLE_SHEETS_ID,
      apiKeyLength: GOOGLE_SHEETS_API_KEY?.length || 0,
      sheetIdLength: GOOGLE_SHEETS_ID?.length || 0,
      fullUrl: this.apiUrl
    });
  }

  async fetchDeals(): Promise<Deal[]> {
    try {
      console.log('Fetching from URL:', this.apiUrl);
      const response = await axios.get(this.apiUrl);
      const rows = response.data.values;
      
      if (!rows || rows.length === 0) {
        return this.getSampleDeals();
      }

      // Map data (header already skipped in SHEET_RANGE)
      return rows.map((row: string[], index: number) => {
        // Auto-detect card type: if both Amazon and Cabela's data exist, it's a comparison
        const hasAmazonData = row[2] && row[4]; // Price and link in columns C & E
        const hasCabelasData = row[3] && row[5]; // Price and link in columns D & F
        const isComparison = hasAmazonData && hasCabelasData;
        
        if (isComparison) {
          const amazonPrice = parseFloat(row[2]) || 0;
          const cabelasPrice = parseFloat(row[3]) || 0;
          const savings = Math.abs(amazonPrice - cabelasPrice);
          const bestDealRetailer = amazonPrice < cabelasPrice ? 'amazon' : 'cabelas';

          return {
            id: `deal-${index}`,
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
          // Single deal card - use actual prices from sheet
          const regularPrice = parseFloat(row[2]) || 0;
          const salePrice = parseFloat(row[3]) || 0;
          const link = row[4] || row[5] || '';
          const retailer = row[4] ? 'Amazon' : row[5] ? "Cabela's" : 'Unknown';
          
          // Calculate real savings and discount
          const savings = Math.max(0, regularPrice - salePrice);
          const discountPercent = regularPrice > 0 ? Math.round((savings / regularPrice) * 100) : 0;

          return {
            id: `deal-${index}`,
            productName: row[0] || '',
            imageUrl: row[1] || '',
            regularPrice: regularPrice,
            salePrice: salePrice > 0 ? salePrice : regularPrice,
            dealLink: link,
            retailer: retailer,
            dealEndDate: row[6] || '',
            category: this.parseCategory(row[7]),
            featured: row[8]?.toLowerCase() === 'true' || false,
            savings: savings,
            discountPercent: discountPercent,
            bestDealRetailer: 'single' as const,
            cardType: 'single' as const
          };
        }
      });
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
        return category;
      default:
        return 'other';
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();