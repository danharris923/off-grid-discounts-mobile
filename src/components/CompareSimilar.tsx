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
    if (!isExpanded) return [];

    const productName = currentDeal.productName.toLowerCase();
    
    // Extract key terms for smart searching
    const extractKeyTerms = (name: string) => {
      const terms = new Set<string>();
      
      // Brand names
      const brands = ['goal zero', 'jackery', 'bluetti', 'honda', 'champion', 'predator', 'renogy', 'anker', 'ecoflow'];
      brands.forEach(brand => {
        if (name.includes(brand)) terms.add(brand);
      });
      
      // Product types
      const types = ['generator', 'power station', 'battery', 'solar panel', 'inverter', 'portable power'];
      types.forEach(type => {
        if (name.includes(type)) terms.add(type);
      });
      
      // Capacities/Power ratings
      const powerMatch = name.match(/(\d+(?:wh|w|ah|a))/g);
      if (powerMatch) {
        powerMatch.forEach(power => terms.add(power));
      }
      
      // Model numbers
      const modelMatch = name.match(/\b([a-z]*\d+[a-z]*)\b/g);
      if (modelMatch) {
        modelMatch.slice(0, 2).forEach(model => terms.add(model)); // Limit to 2 models
      }
      
      // General power/energy terms
      if (name.includes('portable')) terms.add('portable');
      if (name.includes('dual fuel')) terms.add('dual fuel');
      if (name.includes('inverter')) terms.add('inverter');
      
      return Array.from(terms);
    };

    const currentTerms = extractKeyTerms(productName);
    
    const scoredDeals = allDeals
      .filter(deal => deal.id !== currentDeal.id) // Exclude current deal
      .map(deal => {
        const dealName = deal.productName.toLowerCase();
        const dealTerms = extractKeyTerms(dealName);
        
        let score = 0;
        
        // Brand match (high weight)
        const currentBrand = currentTerms.find(term => 
          ['goal zero', 'jackery', 'bluetti', 'honda', 'champion', 'predator', 'renogy', 'anker', 'ecoflow'].includes(term)
        );
        const dealBrand = dealTerms.find(term => 
          ['goal zero', 'jackery', 'bluetti', 'honda', 'champion', 'predator', 'renogy', 'anker', 'ecoflow'].includes(term)
        );
        
        if (currentBrand && dealBrand && currentBrand === dealBrand) {
          score += 50; // Same brand
        }
        
        // Product type match (high weight)
        const currentType = currentTerms.find(term => 
          ['generator', 'power station', 'battery', 'solar panel', 'inverter', 'portable power'].includes(term)
        );
        const dealType = dealTerms.find(term => 
          ['generator', 'power station', 'battery', 'solar panel', 'inverter', 'portable power'].includes(term)
        );
        
        if (currentType && dealType && currentType === dealType) {
          score += 40; // Same product type
        }
        
        // Category match (medium weight)
        if (deal.category === currentDeal.category) {
          score += 20;
        }
        
        // Common terms (lower weight)
        currentTerms.forEach(term => {
          if (dealTerms.includes(term)) {
            score += 10;
          }
        });
        
        // Capacity/power similarity
        const currentPower = currentTerms.find(term => /\d+(?:wh|w|ah|a)/.test(term));
        const dealPower = dealTerms.find(term => /\d+(?:wh|w|ah|a)/.test(term));
        
        if (currentPower && dealPower) {
          const currentNum = parseInt(currentPower);
          const dealNum = parseInt(dealPower);
          const diff = Math.abs(currentNum - dealNum);
          
          if (diff === 0) score += 30; // Exact match
          else if (diff < currentNum * 0.2) score += 20; // Within 20%
          else if (diff < currentNum * 0.5) score += 10; // Within 50%
        }
        
        return { deal, score };
      })
      .filter(item => item.score > 15) // Minimum relevance threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, 4) // Limit to 4 similar items
      .map(item => item.deal);

    return scoredDeals;
  }, [currentDeal, allDeals, isExpanded]);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  if (similarDeals.length === 0 && isExpanded) {
    return (
      <div className="compare-similar">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="compare-toggle"
        >
          Compare Similar {isExpanded ? '▲' : '▼'}
        </button>
        {isExpanded && (
          <div className="similar-deals">
            <p className="no-similar">No similar products found</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="compare-similar">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="compare-toggle"
      >
        Compare Similar {isExpanded ? '▲' : '▼'}
        {!isExpanded && similarDeals.length > 0 && (
          <span className="count">({Math.min(4, allDeals.length - 1)} found)</span>
        )}
      </button>
      
      {isExpanded && similarDeals.length > 0 && (
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