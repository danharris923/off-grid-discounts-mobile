export interface Deal {
  id: string;
  productName: string;
  imageUrl: string;
  amazonPrice: number;
  cabelasPrice: number;
  amazonLink: string;
  cabelasLink: string;
  dealEndDate: string;
  category: 'power' | 'generators' | 'batteries' | 'stoves' | 'other';
  featured: boolean;
  savings: number;
  bestDealRetailer: 'amazon' | 'cabelas';
}