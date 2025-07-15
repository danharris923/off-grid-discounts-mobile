import { Deal } from '../types/Deal';
import { getAllArticles, ComparisonArticle } from '../data/comparisonArticles';

/**
 * Find articles that feature a specific product
 */
export const findArticlesForProduct = (deal: Deal): ComparisonArticle[] => {
  const articles = getAllArticles();
  const productName = deal.productName.toLowerCase();
  
  return articles.filter(article => {
    // Check if any of the article's keywords match the product
    return article.products.productKeywords.some(keyword => 
      productName.includes(keyword.toLowerCase())
    );
  });
};

/**
 * Get the best matching article for a product (highest relevance)
 */
export const getBestArticleForProduct = (deal: Deal): ComparisonArticle | null => {
  const matchingArticles = findArticlesForProduct(deal);
  
  if (matchingArticles.length === 0) return null;
  
  // Return featured articles first, then by most keywords matched
  const sorted = matchingArticles.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    // Count keyword matches
    const productName = deal.productName.toLowerCase();
    const matchesA = a.products.productKeywords.filter(keyword => 
      productName.includes(keyword.toLowerCase())
    ).length;
    const matchesB = b.products.productKeywords.filter(keyword => 
      productName.includes(keyword.toLowerCase())
    ).length;
    
    return matchesB - matchesA;
  });
  
  return sorted[0];
};