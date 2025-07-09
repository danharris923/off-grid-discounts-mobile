import axios from 'axios';
import { Deal } from '../types/Deal';

const GOOGLE_SHEETS_API_KEY = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY;
const GOOGLE_SHEETS_ID = process.env.REACT_APP_GOOGLE_SHEETS_ID;
const SHEET_RANGE = 'Sheet1!A2:I1000'; // Skip header row


export class GoogleSheetsService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${SHEET_RANGE}?key=${GOOGLE_SHEETS_API_KEY}`;
  }

  async fetchDeals(): Promise<Deal[]> {
    try {
      const response = await axios.get(this.apiUrl);
      const rows = response.data.values;
      
      if (!rows || rows.length === 0) {
        return this.getSampleDeals();
      }

      // Map data (header already skipped in SHEET_RANGE)
      return rows.map((row: string[], index: number) => {
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
          bestDealRetailer
        };
      });
    } catch (error) {
      console.error('Error fetching deals from Google Sheets:', error);
      // Return sample data while API is being set up
      return this.getSampleDeals();
    }
  }

  private getSampleDeals(): Deal[] {
    return [
      {
        id: 'deal-1',
        productName: 'Goal Zero Yeti 1500X Portable Power Station',
        imageUrl: 'https://images.thdstatic.com/productImages/0e7b4b5c-d8a8-4e5f-8a2f-8b9c7d6e5f4a/svn/goal-zero-portable-generators-23000-64_1000.jpg',
        amazonPrice: 1899.99,
        cabelasPrice: 1999.99,
        amazonLink: 'https://amazon.com/dp/B08FXQB4Z4',
        cabelasLink: 'https://cabelas.com/shop/en/goal-zero-yeti-1500x',
        dealEndDate: '2024-12-31',
        category: 'power',
        featured: true,
        savings: 100.00,
        bestDealRetailer: 'amazon'
      },
      {
        id: 'deal-2',
        productName: 'Jackery Solar Generator 1000 Pro',
        imageUrl: 'https://m.media-amazon.com/images/I/71K6I5u9EjL._AC_SL1500_.jpg',
        amazonPrice: 1299.99,
        cabelasPrice: 1349.99,
        amazonLink: 'https://amazon.com/dp/B095GJLPRP',
        cabelasLink: 'https://cabelas.com/shop/en/jackery-solar-generator-1000-pro',
        dealEndDate: '2024-12-25',
        category: 'generators',
        featured: false,
        savings: 50.00,
        bestDealRetailer: 'amazon'
      },
      {
        id: 'deal-3',
        productName: 'Renogy 100W Solar Panel Starter Kit',
        imageUrl: 'https://m.media-amazon.com/images/I/81VLfpYgJgL._AC_SL1500_.jpg',
        amazonPrice: 189.99,
        cabelasPrice: 179.99,
        amazonLink: 'https://amazon.com/dp/B07GF5JY35',
        cabelasLink: 'https://cabelas.com/shop/en/renogy-100w-solar-panel-kit',
        dealEndDate: '2024-12-28',
        category: 'power',
        featured: false,
        savings: 10.00,
        bestDealRetailer: 'cabelas'
      },
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
        bestDealRetailer: 'amazon'
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
        bestDealRetailer: 'cabelas'
      },
      {
        id: 'deal-6',
        productName: 'Dickinson Marine Diesel Stove',
        imageUrl: 'https://m.media-amazon.com/images/I/71VYOPLJzDL._AC_SL1500_.jpg',
        amazonPrice: 1299.99,
        cabelasPrice: 1199.99,
        amazonLink: 'https://amazon.com/dp/B01MXYBZWM',
        cabelasLink: 'https://cabelas.com/shop/en/dickinson-marine-diesel-stove',
        dealEndDate: '2024-12-29',
        category: 'stoves',
        featured: false,
        savings: 100.00,
        bestDealRetailer: 'cabelas'
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