import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Deal } from '../types/Deal';
import './CompareSimilar.css';

interface CompareSimilarProps {
  currentDeal: Deal;
  allDeals: Deal[];
  onDealClick: (deal: Deal) => void;
}

type SheetHeight = 'closed' | 'peek' | 'half' | 'full';
type ActiveTab = 'similar' | 'comparison' | 'specs';

export const CompareSimilar: React.FC<CompareSimilarProps> = ({ 
  currentDeal, 
  allDeals, 
  onDealClick 
}) => {
  const [sheetHeight, setSheetHeight] = useState<SheetHeight>('closed');
  const [activeTab, setActiveTab] = useState<ActiveTab>('similar');
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sheetHeight !== 'closed') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sheetHeight]);

  const similarDeals = useMemo(() => {
    const productTitle = currentDeal.productName.toLowerCase();
    
    // Brand names to exclude from keyword matching
    const brandNames = [
      'bass pro', 'basspro', 'cabela', 'cabelas', 'amazon', 'signature', 'club',
      'coleman', 'yeti', 'pelican', 'garmin', 'bushnell', 'leupold', 'vortex',
      'redfield', 'nikon', 'zeiss', 'swarovski', 'steiner', 'burris', 'trijicon',
      'aimpoint', 'holosun', 'sig', 'glock', 'smith', 'wesson', 'remington',
      'winchester', 'federal', 'hornady', 'barnes', 'nosler', 'berger', 'sierra'
    ];
    
    // Size/color/generic terms to ignore
    const ignoreWords = [
      'the', 'and', 'or', 'with', 'for', 'of', 'in', 'to', 'a', 'an', 'is', 'are',
      'small', 'medium', 'large', 'xl', 'xxl', 'xs', 'mini', 'compact', 'full',
      'black', 'white', 'red', 'blue', 'green', 'brown', 'gray', 'grey', 'tan',
      'new', 'used', 'refurbished', 'open', 'box', 'pack', 'set', 'kit', 'bundle',
      'pro', 'premium', 'deluxe', 'ultimate', 'edition', 'series', 'model',
      'inch', 'cm', 'mm', 'lbs', 'oz', 'ft', 'yard', 'meter'
    ];
    
    const allExcludeWords = [...brandNames, ...ignoreWords];
    
    // Extract meaningful keywords from product title
    const keywords = productTitle
      .replace(/[^\w\s]/g, ' ')                    // Remove punctuation
      .split(/\s+/)                               // Split into words
      .filter(word => 
        word.length > 2 &&                        // At least 3 characters
        !allExcludeWords.some(exclude => word.includes(exclude)) // Not a brand/ignore word
      )
      .slice(0, 4);                               // Use top 4 keywords
    
    if (keywords.length === 0) return [];
    
    // Find similar products based on keyword matches
    const matches = allDeals
      .filter(deal => deal.id !== currentDeal.id)
      .map(deal => {
        const dealTitle = deal.productName.toLowerCase();
        
        // Count keyword matches
        const matchedKeywords = keywords.filter(keyword => 
          dealTitle.includes(keyword)
        );
        
        // Calculate similarity score
        let score = matchedKeywords.length;
        
        // Bonus for exact keyword sequence matches
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
      .filter(item => item.matchedKeywords >= 2)    // At least 2 keyword matches
      .sort((a, b) => b.score - a.score)           // Sort by best matches
      .map(item => item.deal);
    
    return matches;
  }, [currentDeal, allDeals]);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!dragHandleRef.current?.contains(e.target as Node)) return;
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setCurrentY(e.touches[0].clientY);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const deltaY = currentY - startY;
    const threshold = 100;
    
    if (deltaY > threshold) {
      if (sheetHeight === 'full') setSheetHeight('half');
      else if (sheetHeight === 'half') setSheetHeight('peek');
      else if (sheetHeight === 'peek') setSheetHeight('closed');
    } else if (deltaY < -threshold) {
      if (sheetHeight === 'peek') setSheetHeight('half');
      else if (sheetHeight === 'half') setSheetHeight('full');
      else if (sheetHeight === 'closed') setSheetHeight('peek');
    }
  }, [isDragging, currentY, startY, sheetHeight]);

  useEffect(() => {
    if (sheetHeight === 'closed') return;
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, sheetHeight]);

  const handleBackdropClick = () => {
    setSheetHeight('closed');
  };

  const handleDealClick = (deal: Deal) => {
    if (deal.dealLink) {
      window.open(deal.dealLink, '_blank', 'noopener,noreferrer');
    }
  };

  const getSheetTransform = () => {
    if (isDragging) {
      const deltaY = Math.max(0, currentY - startY);
      return `translateY(${deltaY}px)`;
    }
    return 'translateY(0)';
  };

  const getCurrentPrice = (deal: Deal) => {
    return deal.salePrice || deal.amazonPrice || deal.cabelasPrice || deal.regularPrice;
  };

  const renderSpecs = () => {
    const specs = [
      { label: 'Brand', value: currentDeal.retailer },
      { label: 'Category', value: 'Outdoor Gear' },
      { label: 'Availability', value: 'In Stock' }
    ];
    
    if (currentDeal.featured) specs.push({ label: 'Status', value: 'Featured Deal' });
    if (currentDeal.clearance) specs.push({ label: 'Status', value: 'Clearance' });
    
    return (
      <div className="specs-content">
        {specs.map((spec, index) => (
          <div key={index} className="spec-item">
            <span className="spec-label">{spec.label}</span>
            <span className="spec-value">{spec.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderPriceComparison = () => {
    const currentPrice = getCurrentPrice(currentDeal);
    const comparisons = similarDeals.slice(0, 5).map(deal => {
      const dealPrice = getCurrentPrice(deal);
      const priceDiff = dealPrice && currentPrice ? dealPrice - currentPrice : null;
      
      return {
        deal,
        price: dealPrice,
        difference: priceDiff,
        isLower: priceDiff ? priceDiff < 0 : false,
        isHigher: priceDiff ? priceDiff > 0 : false
      };
    });
    
    return (
      <div className="price-comparison-content">
        <div className="current-deal-price">
          <div className="price-label">Current Deal</div>
          <div className="price-value">
            {currentPrice ? formatPrice(currentPrice) : 'See price at retailer'}
          </div>
        </div>
        
        <div className="comparison-list">
          {comparisons.map((comp, index) => (
            <div key={comp.deal.id} className="comparison-item" onClick={() => handleDealClick(comp.deal)}>
              <img src={comp.deal.imageUrl} alt={comp.deal.productName} className="comparison-image" />
              <div className="comparison-info">
                <div className="comparison-title">{comp.deal.productName}</div>
                <div className="comparison-pricing">
                  <span className="comparison-price">
                    {comp.price ? formatPrice(comp.price) : 'See price'}
                  </span>
                  {comp.difference && (
                    <span className={`price-diff ${comp.isLower ? 'lower' : 'higher'}`}>
                      {comp.isLower ? '-' : '+'}${Math.abs(comp.difference).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (similarDeals.length === 0) {
    return null;
  }

  return (
    <>
      <button 
        onClick={() => setSheetHeight('peek')}
        className="compare-toggle"
      >
        Compare Similar
        <span className="count">({similarDeals.length} found)</span>
      </button>
      
      {sheetHeight !== 'closed' && (
        <>
          <div className="bottom-sheet-backdrop" onClick={handleBackdropClick} />
          <div 
            ref={sheetRef}
            className={`bottom-sheet ${sheetHeight}`}
            style={{ transform: getSheetTransform() }}
          >
            <div className="sheet-header">
              <div ref={dragHandleRef} className="drag-handle" />
              <h3 className="sheet-title">Product Comparison</h3>
              <button className="close-button" onClick={() => setSheetHeight('closed')}>✕</button>
            </div>
            
            <div className="tab-navigation">
              <button 
                className={`tab ${activeTab === 'similar' ? 'active' : ''}`}
                onClick={() => setActiveTab('similar')}
              >
                Similar Products
              </button>
              <button 
                className={`tab ${activeTab === 'comparison' ? 'active' : ''}`}
                onClick={() => setActiveTab('comparison')}
              >
                Price Comparison
              </button>
              <button 
                className={`tab ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => setActiveTab('specs')}
              >
                Specs
              </button>
            </div>
            
            <div className="sheet-content">
              {activeTab === 'similar' && (
                <div className="similar-products-grid">
                  {similarDeals.map(deal => {
                    const displayPrice = getCurrentPrice(deal);
                    const shouldHidePrice = (() => {
                      if (!displayPrice || displayPrice <= 0) return true;
                      if (displayPrice > 500 && deal.clearance) return true;
                      if (displayPrice > 500 && deal.featured) {
                        const hash = deal.id.split('').reduce((a, b) => {
                          a = ((a << 5) - a) + b.charCodeAt(0);
                          return a & a;
                        }, 0);
                        return Math.abs(hash) % 100 < 30;
                      }
                      return false;
                    })();
                    
                    return (
                      <div 
                        key={deal.id} 
                        className="similar-product-card"
                        onClick={() => handleDealClick(deal)}
                      >
                        <div className="product-image-container">
                          <img 
                            src={deal.imageUrl} 
                            alt={deal.productName}
                            className="product-image"
                            loading="lazy"
                          />
                          {deal.featured && <span className="badge featured">Featured</span>}
                          {deal.clearance && <span className="badge clearance">Clearance</span>}
                        </div>
                        <div className="product-info">
                          <h4 className="product-title">{deal.productName}</h4>
                          <div className="product-price">
                            {shouldHidePrice ? (
                              <span className="click-price">See price at {deal.retailer}</span>
                            ) : (
                              <>
                                {deal.regularPrice && deal.salePrice && deal.regularPrice > deal.salePrice && (
                                  <span className="regular-price">{formatPrice(deal.regularPrice)}</span>
                                )}
                                <span className="sale-price">{formatPrice(displayPrice)}</span>
                              </>
                            )}
                          </div>
                          <span className="retailer">{deal.retailer}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {activeTab === 'comparison' && renderPriceComparison()}
              {activeTab === 'specs' && renderSpecs()}
            </div>
          </div>
        </>
      )}
    </>
  );
};