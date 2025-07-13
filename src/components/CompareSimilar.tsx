import React, { useState, useMemo, useRef } from 'react';
import { Deal } from '../types/Deal';
import './CompareSimilar.css';

interface CompareSimilarProps {
  currentDeal: Deal;
  allDeals: Deal[];
  onDealClick: (deal: Deal) => void;
}

export const CompareSimilar: React.FC<CompareSimilarProps> = ({ 
  currentDeal, 
  allDeals, 
  onDealClick 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const similarDeals = useMemo(() => {
    const productTitle = currentDeal.productName.toLowerCase();
    
    const brandNames = [
      'bass pro', 'basspro', 'cabela', 'cabelas', 'amazon', 'signature', 'club',
      'coleman', 'yeti', 'pelican', 'garmin', 'bushnell', 'leupold', 'vortex',
      'redfield', 'nikon', 'zeiss', 'swarovski', 'steiner', 'burris', 'trijicon',
      'aimpoint', 'holosun', 'sig', 'glock', 'smith', 'wesson', 'remington',
      'winchester', 'federal', 'hornady', 'barnes', 'nosler', 'berger', 'sierra'
    ];
    
    const ignoreWords = [
      'the', 'and', 'or', 'with', 'for', 'of', 'in', 'to', 'a', 'an', 'is', 'are',
      'small', 'medium', 'large', 'xl', 'xxl', 'xs', 'mini', 'compact', 'full',
      'black', 'white', 'red', 'blue', 'green', 'brown', 'gray', 'grey', 'tan',
      'new', 'used', 'refurbished', 'open', 'box', 'pack', 'set', 'kit', 'bundle',
      'pro', 'premium', 'deluxe', 'ultimate', 'edition', 'series', 'model',
      'inch', 'cm', 'mm', 'lbs', 'oz', 'ft', 'yard', 'meter'
    ];
    
    const allExcludeWords = [...brandNames, ...ignoreWords];
    
    const keywords = productTitle
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 &&
        !allExcludeWords.some(exclude => word.includes(exclude))
      )
      .slice(0, 4);
    
    if (keywords.length === 0) return [];
    
    const matches = allDeals
      .filter(deal => deal.id !== currentDeal.id)
      .map(deal => {
        const dealTitle = deal.productName.toLowerCase();
        const matchedKeywords = keywords.filter(keyword => 
          dealTitle.includes(keyword)
        );
        let score = matchedKeywords.length;
        
        keywords.forEach((keyword, index) => {
          if (index < keywords.length - 1) {
            const nextKeyword = keywords[index + 1];
            if (dealTitle.includes(keyword + ' ' + nextKeyword)) {
              score += 0.5;
            }
          }
        });
        
        return { 
          deal, 
          score, 
          matchedKeywords: matchedKeywords.length,
          title: dealTitle 
        };
      })
      .filter(item => item.matchedKeywords >= 2)
      .sort((a, b) => b.score - a.score)
      .map(item => item.deal);
    
    return matches;
  }, [currentDeal, allDeals]);

  const formatPrice = (price: number | undefined): string => {
    if (price === undefined || price === null) return '$0.00';
    return `$${price.toFixed(2)}`;
  };
  
  const getCurrentPrice = (deal: Deal): number | undefined => {
    return deal.salePrice || deal.amazonPrice || deal.cabelasPrice || deal.regularPrice;
  };

  const handleDealClick = (deal: Deal) => {
    if (deal.dealLink) {
      window.open(deal.dealLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (similarDeals.length === 0) {
    return null;
  }

  return (
    <div className="compare-similar">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="compare-toggle"
      >
        Compare Similar ({similarDeals.length} found)
        <span className="arrow">{isExpanded ? '▲' : '▼'}</span>
      </button>
      
      {isExpanded && (
        <div className="horizontal-compare">
          <div className="compare-header">
            <h3>Similar Products</h3>
            <span className="swipe-hint">← Swipe to compare →</span>
          </div>
          
          <div 
            ref={scrollContainerRef}
            className="horizontal-scroll"
          >
            {similarDeals.map(deal => {
              const displayPrice = getCurrentPrice(deal);
              const shouldHidePrice = !displayPrice || displayPrice <= 0;
              const validPrice = displayPrice && displayPrice > 0;
              
              return (
                <div 
                  key={deal.id} 
                  className="compare-card"
                  onClick={() => handleDealClick(deal)}
                >
                  <div className="compare-image-container">
                    <img 
                      src={deal.imageUrl} 
                      alt={deal.productName}
                      className="compare-image"
                      loading="lazy"
                    />
                    {deal.featured && <span className="badge featured">Featured</span>}
                    {deal.clearance && <span className="badge clearance">Clearance</span>}
                  </div>
                  
                  <div className="compare-info">
                    <h4 className="compare-title">{deal.productName}</h4>
                    
                    <div className="compare-price">
                      {!validPrice ? (
                        <span className="click-price">
                          {deal.clearance ? "See clearance price" : 
                           deal.featured ? "See special price" : 
                           `See price at ${deal.retailer}`}
                        </span>
                      ) : (
                        <>
                          {deal.regularPrice && deal.salePrice && deal.regularPrice > deal.salePrice && (
                            <span className="regular-price">{formatPrice(deal.regularPrice as number)}</span>
                          )}
                          <span className="sale-price">{formatPrice(displayPrice as number)}</span>
                        </>
                      )}
                    </div>
                    
                    <span className="compare-retailer">{deal.retailer}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};