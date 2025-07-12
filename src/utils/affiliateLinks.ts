const AMAZON_TAG = process.env.REACT_APP_AMAZON_AFFILIATE_TAG || '';
const RAKUTEN_ID = process.env.REACT_APP_RAKUTEN_AFFILIATE_ID || '';

export const buildAmazonAffiliateLink = (productUrl: string): string => {
  if (!AMAZON_TAG || !productUrl) return productUrl;
  
  // Don't double-tag if already has affiliate tag
  if (productUrl.includes('tag=')) return productUrl;
  
  try {
    const url = new URL(productUrl);
    url.searchParams.set('tag', AMAZON_TAG);
    return url.toString();
  } catch {
    return productUrl;
  }
};

export const buildRakutenAffiliateLink = (productUrl: string): string => {
  if (!RAKUTEN_ID || !productUrl) return productUrl;
  
  // Don't double-tag if already a Rakuten affiliate link
  if (productUrl.includes('linksynergy.com') || productUrl.includes('click.linksynergy.com')) return productUrl;
  
  return `https://click.linksynergy.com/deeplink?id=${RAKUTEN_ID}&mid=36871&u1=offgrid&murl=${encodeURIComponent(productUrl)}`;
};