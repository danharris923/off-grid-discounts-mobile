import React, { useMemo } from 'react';
import Fuse from 'fuse.js';
import { Deal } from '../types/Deal';
import { useDeals } from '../hooks/useDeals';
import SingleDealCard from './SingleDealCard';
import './ArticleProductGrid.css';

interface ArticleProductGridProps {
  keywords: string[];
  maxResults: number;
  sortBy: 'discount' | 'price' | 'relevance';
  title?: string;
  description?: string;
  searchTerm?: string;
  filteredProducts?: Deal[];
}

const ArticleProductGrid: React.FC<ArticleProductGridProps> = ({
  keywords,
  maxResults,
  sortBy,
  title = "Featured Products",
  description,
  searchTerm,
  filteredProducts: providedProducts
}) => {
  const { deals, loading, error } = useDeals();

  const filteredProducts = useMemo(() => {
    // Use provided filtered products if available (from search)
    if (providedProducts) {
      return providedProducts.slice(0, maxResults);
    }

    if (!deals?.length || !keywords?.length) return [];

    // Filter products by keywords
    const keywordMatches = deals.filter(deal => {
      const productName = deal.productName.toLowerCase();
      return keywords.some(keyword => 
        productName.includes(keyword.toLowerCase())
      );
    });

    if (keywordMatches.length === 0) return [];

    // Sort based on criteria
    let sortedProducts = [...keywordMatches];
    
    switch (sortBy) {
      case 'discount':
        sortedProducts.sort((a, b) => {
          const discountA = a.discountPercent || 0;
          const discountB = b.discountPercent || 0;
          return discountB - discountA;
        });
        break;
        
      case 'price':
        sortedProducts.sort((a, b) => {
          const priceA = a.salePrice || a.amazonPrice || a.cabelasPrice || a.regularPrice || 999999;
          const priceB = b.salePrice || b.amazonPrice || b.cabelasPrice || b.regularPrice || 999999;
          return priceA - priceB;
        });
        break;
        
      case 'relevance':
        // Use fuzzy search for relevance scoring
        const searchTerm = keywords.join(' ');
        const fuse = new Fuse(keywordMatches, {
          keys: [{ name: 'productName', weight: 1.0 }],
          threshold: 0.6,
          distance: 200,
          includeScore: true
        });
        
        const results = fuse.search(searchTerm);
        sortedProducts = results.map(result => result.item);
        break;
    }

    return sortedProducts.slice(0, maxResults);
  }, [deals, keywords, maxResults, sortBy, providedProducts]);

  if (loading) {
    return (
      <div className="article-products-loading">
        <div className="loading-spinner"></div>
        <p>Loading current deals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="article-products-error">
        <p>Unable to load current deals. Please try again later.</p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="article-products-empty">
        <p>No current deals found for: {keywords.join(', ')}</p>
        <p>Check back later for updated inventory!</p>
      </div>
    );
  }

  return (
    <div className="article-product-grid">
      <div className="article-products-header">
        <h3>{title}</h3>
        {description && <p className="products-description">{description}</p>}
        <div className="products-meta">
          <span className="deal-count">{filteredProducts.length} deals found</span>
          <span className="sort-info">Sorted by {sortBy}</span>
          <span className="update-info">🔥 Updated daily</span>
        </div>
      </div>
      
      <div className="article-products-grid">
        {filteredProducts.map(deal => (
          <SingleDealCard
            key={deal.id}
            deal={deal}
            allDeals={deals}
          />
        ))}
      </div>
      
      <div className="article-products-footer">
        <p className="disclaimer">
          * Prices and availability updated daily. Deals may expire without notice.
        </p>
      </div>
    </div>
  );
};

export default React.memo(ArticleProductGrid);