import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import Fuse from 'fuse.js';
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
    if (!currentDeal?.productName || !allDeals?.length) return [];
    
    // Filter out current deal
    const otherDeals = allDeals.filter(deal => deal.id !== currentDeal.id);
    
    // Configure Fuse.js for fuzzy search
    const fuse = new Fuse(otherDeals, {
      keys: [
        {
          name: 'productName',
          weight: 1.0
        }
      ],
      threshold: 0.4, // Lower = more strict matching (0.0 = exact, 1.0 = match anything)
      distance: 100,   // Maximum character distance for matches
      minMatchCharLength: 3, // Minimum character length to match
      includeScore: true
    });
    
    // Search for similar products
    const results = fuse.search(currentDeal.productName);
    
    // Return top matches, limited by MAX_COMPARISON_RESULTS
    return results
      .slice(0, APP_CONSTANTS.MAX_COMPARISON_RESULTS)
      .map(result => result.item);
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