import React, { useState, useMemo, useRef } from 'react';
import { Deal } from '../types/Deal';
import { APP_CONSTANTS } from '../constants/app';
import './CompareSimilar.css';

interface CompareSimilarProps {
  currentDeal: Deal;
  allDeals: Deal[];
  onDealClick: (deal: Deal) => void;
}

const CompareSimilar: React.FC<CompareSimilarProps> = ({ 
  currentDeal, 
  allDeals, 
  onDealClick 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const similarDeals = useMemo(() => {
    // Add stability check to prevent unnecessary recalculations
    if (!currentDeal?.productName || !allDeals?.length) return [];
    const productTitle = currentDeal.productName.toLowerCase();
    
    // Product type definitions for better categorization
    const productTypes = {
      knives: {
        fixed: ['fixed', 'hunting', 'skinning', 'fillet', 'bowie', 'survival', 'tactical'],
        folding: ['folding', 'pocket', 'edc', 'everyday', 'carry'],
        general: ['knife', 'blade', 'steel']
      },
      bags: {
        duffel: ['duffel', 'duffle', 'gear bag', 'travel bag'],
        backpack: ['backpack', 'pack', 'daypack', 'hiking pack'],
        general: ['bag', 'pack']
      },
      optics: {
        scopes: ['scope', 'riflescope', 'rifle scope'],
        binoculars: ['binocular', 'binoculars', 'binos'],
        general: ['optic', 'sight']
      }
    };
    
    // Common ignore words and retailer names
    const ignoreWords = [
      'the', 'and', 'or', 'with', 'for', 'of', 'in', 'to', 'a', 'an', 'is', 'are',
      'new', 'used', 'refurbished', 'open', 'box', 'pack', 'set', 'kit', 'bundle',
      'inch', 'cm', 'mm', 'lbs', 'oz', 'ft', 'yard', 'meter', 'pro', 'premium',
      'cabela', 'cabelas', 'bass', 'basspro', 'signature'
    ];
    
    // Extract meaningful keywords, preserving important product identifiers
    const keywords = productTitle
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 &&
        !ignoreWords.includes(word)
      )
      .slice(0, APP_CONSTANTS.MAX_KEYWORDS_TO_EXTRACT);
    
    if (keywords.length === 0) return [];
    
    // Detect product category and subcategory
    const detectCategory = (title: string) => {
      for (const [category, subcategories] of Object.entries(productTypes)) {
        for (const [subcat, terms] of Object.entries(subcategories)) {
          if (terms.some(term => title.includes(term))) {
            return { category, subcategory: subcat };
          }
        }
      }
      return null;
    };
    
    const currentCategory = detectCategory(productTitle);
    
    const matches = allDeals
      .filter(deal => deal.id !== currentDeal.id)
      .map(deal => {
        const dealTitle = deal.productName.toLowerCase();
        const dealCategory = detectCategory(dealTitle);
        
        // Score based on keyword matches
        const matchedKeywords = keywords.filter(keyword => 
          dealTitle.includes(keyword)
        );
        let score = matchedKeywords.length;
        
        // Bonus for exact phrase matches
        keywords.forEach((keyword, index) => {
          if (index < keywords.length - 1) {
            const nextKeyword = keywords[index + 1];
            if (dealTitle.includes(keyword + ' ' + nextKeyword)) {
              score += 1; // Higher bonus for phrase matches
            }
          }
        });
        
        // Category matching bonuses
        if (currentCategory && dealCategory) {
          if (currentCategory.category === dealCategory.category) {
            score += 2; // Same category bonus
            if (currentCategory.subcategory === dealCategory.subcategory) {
              score += 3; // Same subcategory bonus (e.g., both fixed knives)
            }
          }
        }
        
        // Penalty for different subcategories within same category
        if (currentCategory && dealCategory && 
            currentCategory.category === dealCategory.category &&
            currentCategory.subcategory !== dealCategory.subcategory &&
            currentCategory.subcategory !== 'general' &&
            dealCategory.subcategory !== 'general') {
          score -= 1; // Reduce score for folding vs fixed knives
        }
        
        return { 
          deal, 
          score, 
          matchedKeywords: matchedKeywords.length,
          category: dealCategory,
          title: dealTitle 
        };
      })
      .filter(item => {
        // More flexible filtering - allow single strong matches for specific products
        if (item.matchedKeywords >= APP_CONSTANTS.MINIMUM_KEYWORD_MATCHES) return true;
        if (item.matchedKeywords >= 1 && item.score >= APP_CONSTANTS.MINIMUM_COMPARISON_SCORE) return true;
        return false;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, APP_CONSTANTS.MAX_COMPARISON_RESULTS)
      .map(item => item.deal);
    
    return matches;
  }, [currentDeal, allDeals]);

  const formatPrice = (price: number | undefined | null): string => {
    if (!price || price <= 0) return '$0.00';
    return `$${price.toFixed(2)}`;
  };
  
  const getCurrentPrice = (deal: Deal): number | undefined => {
    return deal.salePrice || deal.amazonPrice || deal.cabelasPrice || deal.regularPrice;
  };

  const handleDealClick = React.useCallback((deal: Deal) => {
    if (deal.dealLink) {
      window.open(deal.dealLink, '_blank', 'noopener,noreferrer');
    }
  }, []);

  if (similarDeals.length === 0) {
    return null;
  }

  const handleCloseClick = () => {
    setIsExpanded(false);
  };

  const handleToggleClick = () => {
    setIsExpanded(true);
  };

  return (
    <>
      <button 
        onClick={handleToggleClick}
        className="compare-toggle"
      >
        Compare Similar ({similarDeals.length} found)
      </button>
      
      {isExpanded && (
        <div className="compare-overlay">
          <div className="compare-popup">
            <div className="popup-header">
              <h3>Similar Products</h3>
              <button 
                className="close-btn"
                onClick={handleCloseClick}
              >
                ✕
              </button>
            </div>
            
            
            <div 
              ref={scrollContainerRef}
              className="popup-scroll"
            >
              {similarDeals.map(deal => {
                const displayPrice = getCurrentPrice(deal);
                const shouldHidePrice = !displayPrice || displayPrice <= 0;
                const validPrice = displayPrice && displayPrice > 0;
                
                return (
                  <div 
                    key={deal.id} 
                    className="popup-card"
                    onClick={() => handleDealClick(deal)}
                  >
                    <div className="popup-image-container">
                      <img 
                        src={deal.imageUrl} 
                        alt={deal.productName}
                        className="popup-image"
                        loading="lazy"
                      />
                      {deal.featured && <span className="badge featured">Featured</span>}
                      {deal.clearance && <span className="badge clearance">Clearance</span>}
                    </div>
                    
                    <div className="popup-info">
                      <h4 className="popup-title">{deal.productName}</h4>
                      
                      <div className="popup-price">
                        {!validPrice ? (
                          <span className="click-price">
                            {deal.clearance ? "See clearance price" : 
                             deal.featured ? "See special price" : 
                             `See price at ${deal.retailer}`}
                          </span>
                        ) : (
                          <>
                            {deal.regularPrice && deal.salePrice && deal.regularPrice > deal.salePrice && (
                              <span className="regular-price">{formatPrice(deal.regularPrice)}</span>
                            )}
                            <span className="sale-price">{formatPrice(displayPrice)}</span>
                          </>
                        )}
                      </div>
                      
                      <span className="popup-retailer">{deal.retailer}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(CompareSimilar);