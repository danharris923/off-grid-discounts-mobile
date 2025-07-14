import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const isTogglingRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const similarDeals = useMemo(() => {
    // Add stability check to prevent unnecessary recalculations
    if (!currentDeal?.productName || !allDeals?.length) return [];
    const productTitle = currentDeal.productName.toLowerCase();
    
    // Function-based product categorization (avoiding house brands)
    const productFunctions = {
      powerStorage: {
        powerStations: ['power station', 'portable power', 'solar generator'],
        goalZero: ['goal zero yeti', 'yeti'],
        jackery: ['jackery explorer', 'jackery'],
        bluetti: ['bluetti ac', 'bluetti eb', 'bluetti'],
        capacitySpecs: ['wh', 'watt hour', 'amp hour', 'ah']
      },
      solarEquipment: {
        panels: ['solar panel', 'photovoltaic', 'pv panel'],
        technology: ['monocrystalline', 'polycrystalline', 'flexible solar'],
        wattage: ['100w', '200w', '300w', '400w', 'watt'],
        kits: ['solar kit', 'solar system']
      },
      generators: {
        types: ['generator', 'inverter generator', 'dual fuel'],
        honda: ['honda eu', 'eu2200', 'eu3000'],
        champion: ['champion dual fuel', 'champion inverter'],
        specs: ['2200w', '3000w', '4000w', 'watts', 'running watts']
      },
      batteries: {
        chemistry: ['lifepo4', 'lithium iron', 'agm', 'gel', 'deep cycle'],
        capacity: ['100ah', '200ah', '300ah', 'amp hour'],
        voltage: ['12v', '24v', '48v', 'volt']
      },
      heating: {
        woodStoves: ['wood stove', 'wood burning', 'tent stove'],
        propane: ['propane stove', 'camp stove', 'portable stove'],
        specs: ['btu', 'cubic mini', 'chimney']
      }
    };
    
    // House brands and generic marketing terms to ignore
    const ignoreWords = [
      'the', 'and', 'or', 'with', 'for', 'of', 'in', 'to', 'a', 'an', 'is', 'are',
      'new', 'used', 'refurbished', 'open', 'box', 'pack', 'set', 'bundle',
      'inch', 'cm', 'mm', 'lbs', 'oz', 'ft', 'yard', 'meter',
      // House brands and generic terms
      'pro', 'premium', 'custom', 'signature', 'elite', 'series', 'collection',
      'cabela', 'cabelas', 'bass', 'basspro', 'redhead', 'ascend', 'white', 'river',
      'uncle', 'bucks', 'mens', 'womens', 'youth', 'adult', 'size', 'color',
      // Clothing/non-power terms
      'jacket', 'shirt', 'pants', 'boots', 'gloves', 'hat', 'coat', 'vest',
      'fishing', 'hunting', 'camo', 'camouflage', 'outdoor', 'tactical'
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
    
    // Detect product function and subtype
    const detectProductFunction = (title: string) => {
      for (const [functionType, subtypes] of Object.entries(productFunctions)) {
        for (const [subtype, terms] of Object.entries(subtypes)) {
          if (terms.some(term => title.includes(term))) {
            return { functionType, subtype };
          }
        }
      }
      return null;
    };
    
    const currentFunction = detectProductFunction(productTitle);
    
    const matches = allDeals
      .filter(deal => deal.id !== currentDeal.id)
      .map(deal => {
        const dealTitle = deal.productName.toLowerCase();
        const dealFunction = detectProductFunction(dealTitle);
        
        // Skip if different product functions (no power station vs fishing rod matches)
        if (currentFunction && dealFunction && 
            currentFunction.functionType !== dealFunction.functionType) {
          return null;
        }
        
        // Score based on meaningful keyword matches
        const matchedKeywords = keywords.filter(keyword => 
          dealTitle.includes(keyword)
        );
        let score = matchedKeywords.length;
        
        // Bonus for exact phrase matches (technical terms)
        keywords.forEach((keyword, index) => {
          if (index < keywords.length - 1) {
            const nextKeyword = keywords[index + 1];
            if (dealTitle.includes(keyword + ' ' + nextKeyword)) {
              score += 2; // Higher bonus for technical phrase matches
            }
          }
        });
        
        // Function matching bonuses
        if (currentFunction && dealFunction) {
          if (currentFunction.functionType === dealFunction.functionType) {
            score += 3; // Same function type bonus (both power storage)
            if (currentFunction.subtype === dealFunction.subtype) {
              score += 4; // Same subtype bonus (both Goal Zero Yeti)
            }
          }
        }
        
        // Technical specification matching
        const techTerms = ['wh', 'ah', 'watt', 'volt', 'btu', 'amp', 'lithium'];
        const currentTechTerms = techTerms.filter(term => productTitle.includes(term));
        const dealTechTerms = techTerms.filter(term => dealTitle.includes(term));
        const matchedTechTerms = currentTechTerms.filter(term => dealTechTerms.includes(term));
        score += matchedTechTerms.length * 2; // Bonus for matching technical specs
        
        return { 
          deal, 
          score, 
          matchedKeywords: matchedKeywords.length,
          functionType: dealFunction,
          title: dealTitle 
        };
      })
      .filter(Boolean)
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
    if (isTogglingRef.current) return;
    isTogglingRef.current = true;
    setIsExpanded(false);
    setTimeout(() => {
      isTogglingRef.current = false;
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseClick();
    }
  };

  const handleToggleClick = () => {
    if (isTogglingRef.current) return;
    isTogglingRef.current = true;
    setIsExpanded(true);
    setTimeout(() => {
      isTogglingRef.current = false;
    }, 200);
  };

  return (
    <>
      <button 
        onClick={handleToggleClick}
        className="compare-toggle"
        disabled={isTogglingRef.current}
      >
        Compare Similar ({similarDeals.length} found)
      </button>
      
      {isExpanded && createPortal(
        <div 
          key="compare-modal" 
          className="compare-overlay"
          onClick={handleBackdropClick}
        >
          <div 
            className="compare-popup"
            onClick={(e) => e.stopPropagation()}
          >
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
        </div>,
        document.body
      )}
    </>
  );
};

export default React.memo(CompareSimilar);