import React, { useState, useMemo } from 'react';
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
  
  // Stable random factor for this deal to determine if compare should show
  const shouldShowCompare = useMemo(() => {
    // Create a stable hash from deal ID to get consistent behavior per deal
    const dealHash = currentDeal.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Show compare for approximately 70% of eligible deals
    return (dealHash % 100) < 70;
  }, [currentDeal.id]);

  const similarDeals = useMemo(() => {
    if (!isExpanded) return [];

    const productName = currentDeal.productName.toLowerCase();
    
    // Detect specific comparable product types
    const getProductType = (name: string) => {
      const lower = name.toLowerCase();
      
      // Very specific product categories that make sense to compare
      if (lower.includes('trail cam') || lower.includes('game cam') || lower.includes('hunting cam')) {
        return 'trail-camera';
      }
      if (lower.includes('generator') && !lower.includes('power station')) {
        return 'generator';
      }
      if (lower.includes('power station') || lower.includes('portable power')) {
        return 'power-station';
      }
      if (lower.includes('solar panel') || (lower.includes('solar') && lower.includes('panel'))) {
        return 'solar-panel';
      }
      if (lower.includes('battery bank') || (lower.includes('battery') && lower.includes('12v'))) {
        return 'battery';
      }
      if (lower.includes('inverter') && !lower.includes('generator')) {
        return 'inverter';
      }
      if (lower.includes('flashlight') || lower.includes('headlamp') || lower.includes('lantern')) {
        return 'lighting';
      }
      if (lower.includes('walkie') || lower.includes('two way radio') || lower.includes('2-way radio')) {
        return 'radio';
      }
      if (lower.includes('carhartt')) {
        return 'carhartt';
      }
      if (lower.includes('power supply') || lower.includes('power adapter')) {
        return 'power-supply';
      }
      if (lower.includes('charger') && (lower.includes('usb') || lower.includes('battery'))) {
        return 'charger';
      }
      if (lower.includes('cooler') || lower.includes('ice chest')) {
        return 'cooler';
      }
      if (lower.includes('tent') || lower.includes('shelter')) {
        return 'tent';
      }
      if (lower.includes('sleeping bag') || lower.includes('sleep system')) {
        return 'sleeping-bag';
      }
      
      return null; // No comparable type found
    };

    const extractCapacity = (name: string) => {
      const powerMatch = name.match(/(\d+(?:wh|w|ah|mah))/i);
      return powerMatch ? powerMatch[1].toLowerCase() : null;
    };

    const extractBrand = (name: string) => {
      const lower = name.toLowerCase();
      const brands = ['goal zero', 'jackery', 'bluetti', 'honda', 'champion', 'predator', 'renogy', 'anker', 'ecoflow', 'bushnell', 'stealth cam', 'reconyx'];
      return brands.find(brand => lower.includes(brand)) || null;
    };

    // Only show compare for specific product types
    const currentProductType = getProductType(productName);
    if (!currentProductType) {
      return []; // No compare for this product type
    }

    const currentBrand = extractBrand(productName);
    const currentCapacity = extractCapacity(productName);
    
    const tightMatches = allDeals
      .filter(deal => deal.id !== currentDeal.id) // Exclude current deal
      .filter(deal => {
        const dealProductType = getProductType(deal.productName);
        return dealProductType === currentProductType; // MUST be exact same product type
      })
      .map(deal => {
        const dealBrand = extractBrand(deal.productName);
        const dealCapacity = extractCapacity(deal.productName);
        
        let score = 0;
        
        // Same brand = high relevance
        if (currentBrand && dealBrand && currentBrand === dealBrand) {
          score += 100;
        }
        
        // Similar capacity = high relevance
        if (currentCapacity && dealCapacity) {
          if (currentCapacity === dealCapacity) {
            score += 80; // Exact capacity match
          } else {
            // Parse numbers for range comparison
            const currentNum = parseInt(currentCapacity);
            const dealNum = parseInt(dealCapacity);
            if (!isNaN(currentNum) && !isNaN(dealNum)) {
              const diff = Math.abs(currentNum - dealNum);
              if (diff < currentNum * 0.25) { // Within 25%
                score += 40;
              }
            }
          }
        }
        
        // Same retailer = lower relevance (we want to compare across retailers)
        if (deal.retailer !== currentDeal.retailer) {
          score += 20;
        }
        
        return { deal, score };
      })
      .filter(item => item.score >= 60) // Much higher threshold - only tight matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Limit to 3 tight matches
      .map(item => item.deal);

    return tightMatches;
  }, [currentDeal, allDeals, isExpanded]);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Only render the component if we have tight matches AND should show compare
  if (similarDeals.length === 0 || !shouldShowCompare) {
    return null;
  }

  return (
    <div className="compare-similar">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="compare-toggle"
      >
        Compare Similar {isExpanded ? '▲' : '▼'}
        {!isExpanded && (
          <span className="count">({similarDeals.length} found)</span>
        )}
      </button>
      
      {isExpanded && (
        <div className="similar-deals">
          {similarDeals.map(deal => (
            <div 
              key={deal.id} 
              className="similar-deal"
              onClick={() => onDealClick(deal)}
            >
              <img 
                src={deal.imageUrl} 
                alt={deal.productName}
                className="similar-image"
                loading="lazy"
              />
              <div className="similar-info">
                <h4 className="similar-title">{deal.productName}</h4>
                <div className="similar-price">
                  {deal.salePrice && deal.salePrice > 0 ? (
                    <>
                      {deal.regularPrice && deal.regularPrice > deal.salePrice && (
                        <span className="similar-regular-price">
                          {formatPrice(deal.regularPrice)}
                        </span>
                      )}
                      <span className="similar-sale-price">
                        {formatPrice(deal.salePrice)}
                      </span>
                    </>
                  ) : (
                    <span className="similar-click-price">Click to See Price</span>
                  )}
                </div>
                <span className="similar-retailer">{deal.retailer}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};