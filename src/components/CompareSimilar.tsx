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

  const similarDeals = useMemo(() => {
    const productName = currentDeal.productName.toLowerCase();
    
    // Detect product category
    const getCategory = (name: string) => {
      const lower = name.toLowerCase();
      
      // Optics/Scopes
      if (lower.includes('scope') || lower.includes('optic') || lower.includes('sight') || lower.includes('binocular') || lower.includes('monocular')) {
        return 'optics';
      }
      
      // Firearms/Weapons
      if (lower.includes('rifle') || lower.includes('gun') || lower.includes('pistol') || lower.includes('shotgun') || lower.includes('firearm')) {
        return 'firearms';
      }
      
      // Power/Energy
      if (lower.includes('generator') || lower.includes('power station') || lower.includes('battery') || lower.includes('solar') || lower.includes('inverter')) {
        return 'power';
      }
      
      // Outdoor/Camping
      if (lower.includes('tent') || lower.includes('sleeping') || lower.includes('camping') || lower.includes('backpack') || lower.includes('cooler')) {
        return 'outdoor';
      }
      
      // Tools
      if (lower.includes('drill') || lower.includes('saw') || lower.includes('wrench') || lower.includes('hammer') || lower.includes('tool')) {
        return 'tools';
      }
      
      // Electronics
      if (lower.includes('radio') || lower.includes('walkie') || lower.includes('gps') || lower.includes('electronics') || lower.includes('charger')) {
        return 'electronics';
      }
      
      // Clothing
      if (lower.includes('jacket') || lower.includes('pants') || lower.includes('shirt') || lower.includes('boot') || lower.includes('glove') || lower.includes('carhartt')) {
        return 'clothing';
      }
      
      // Kitchen/Food
      if (lower.includes('coffee') || lower.includes('cup') || lower.includes('mug') || lower.includes('food') || lower.includes('kitchen') || lower.includes('cooking')) {
        return 'kitchen';
      }
      
      return 'general';
    };

    const currentCategory = getCategory(productName);
    
    // Extract meaningful keywords (skip common words and generic terms)
    const commonWords = ['the', 'and', 'or', 'with', 'for', 'of', 'in', 'to', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'black', 'white', 'red', 'blue', 'green', 'new', 'used', 'inch', 'cm', 'mm'];
    
    const keywords = productName
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 6); // Use top 6 keywords

    if (keywords.length === 0) return [];

    // Find deals that share keywords AND same category
    const matches = allDeals
      .filter(deal => deal.id !== currentDeal.id)
      .filter(deal => {
        const dealCategory = getCategory(deal.productName);
        // Must be same category OR both are 'general'
        return dealCategory === currentCategory || (dealCategory === 'general' && currentCategory === 'general');
      })
      .map(deal => {
        const dealName = deal.productName.toLowerCase();
        const matchedKeywords = keywords.filter(keyword => dealName.includes(keyword));
        let score = matchedKeywords.length;
        
        // Bonus points for exact brand matches
        const brands = ['bushnell', 'leupold', 'vortex', 'nikon', 'zeiss', 'aimpoint', 'trijicon', 'holosun', 'sig sauer', 'primary arms'];
        const currentBrand = brands.find(brand => productName.includes(brand));
        const dealBrand = brands.find(brand => dealName.includes(brand));
        if (currentBrand && dealBrand && currentBrand === dealBrand) {
          score += 2; // Brand match bonus
        }
        
        return { deal, score, matchedKeywords };
      })
      .filter(item => item.score >= 1) // At least one keyword match
      .sort((a, b) => b.score - a.score) // Sort by most matches
      .slice(0, 4) // Limit to 4 similar items
      .map(item => item.deal);

    return matches;
  }, [currentDeal, allDeals]);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Always show compare button if we have similar deals
  if (similarDeals.length === 0) {
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
                  {deal.salePrice !== undefined && deal.salePrice !== null && deal.salePrice > 0 ? (
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
                    <span className="similar-click-price">see price at {deal.retailer}</span>
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