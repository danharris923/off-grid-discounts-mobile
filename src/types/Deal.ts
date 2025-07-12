export interface Deal {
  id: string;
  productName: string;
  imageUrl: string;
  amazonPrice?: number;
  cabelasPrice?: number;
  regularPrice?: number;
  salePrice?: number;
  amazonLink?: string;
  cabelasLink?: string;
  dealLink?: string;
  dealEndDate: string;
  category: 'power' | 'generators' | 'batteries' | 'stoves' | 'camping' | 'clothing' | 'tools' | 'navigation' | 'water' | 'food' | 'other';
  featured: boolean;
  savings?: number;
  discountPercent?: number;
  bestDealRetailer?: 'amazon' | 'cabelas' | 'single';
  cardType: 'comparison' | 'single';
  retailer?: string;
  clearance?: boolean;
}