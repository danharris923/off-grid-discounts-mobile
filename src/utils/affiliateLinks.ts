// Affiliate link generator utility
export const generateAffiliateLink = (product: string, retailer: string = 'amazon'): string => {
  // Amazon affiliate parameters
  const amazonTag = 'offgriddisc-20'; // Replace with your actual Amazon affiliate tag
  const cabellasTag = 'offgrid-cabelas'; // Replace with your actual Cabela's affiliate tag
  
  // Clean product name for URL
  const cleanProduct = product.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  
  switch (retailer.toLowerCase()) {
    case 'amazon':
      // Amazon search URL with affiliate tag
      return `https://www.amazon.com/s?k=${encodeURIComponent(product)}&tag=${amazonTag}`;
      
    case 'cabelas':
      // Cabela's search URL (adjust based on their affiliate program requirements)
      return `https://www.cabelas.com/shop/en/search?q=${encodeURIComponent(product)}&affiliate=${cabellasTag}`;
      
    case 'planar':
      // Direct manufacturer links
      return `https://www.planarheaters.com/products?search=${encodeURIComponent(product)}`;
      
    case 'mec':
      // MEC search URL
      return `https://www.mec.ca/en/search?q=${encodeURIComponent(product)}`;
      
    case 'rei':
      // REI search URL
      return `https://www.rei.com/search?q=${encodeURIComponent(product)}`;
      
    default:
      // Default to Amazon
      return `https://www.amazon.com/s?k=${encodeURIComponent(product)}&tag=${amazonTag}`;
  }
};

// Parse retailer from "Retails At" column
export const parseRetailers = (retailString: string): string[] => {
  return retailString.split(',').map(r => r.trim().replace(/[⬇️🛒]/g, '').trim());
};

// Generate multiple affiliate links for a product
export const generateProductLinks = (productName: string, retailers: string[]): Record<string, string> => {
  const links: Record<string, string> = {};
  
  retailers.forEach(retailer => {
    const cleanRetailer = retailer.toLowerCase();
    links[retailer] = generateAffiliateLink(productName, cleanRetailer);
  });
  
  return links;
};