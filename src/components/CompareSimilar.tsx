import React, { useState, useMemo, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isExpanded && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded, isMobile]);

  const similarDeals = useMemo(() => {
    const productName = currentDeal.productName.toLowerCase();
    
    // Simple exclusion pairs - if one word exists, exclude products with the other
    const exclusions = [
      ['combat', 'kitchen'],
      ['survival', 'dining'],
      ['rain', 'work'],
      ['rain', 'hiking'],
      ['men', 'women'],
      ['men', 'kid'],
      ['women', 'kid'],
      ['knife', 'battery'],
      ['blade', 'power'],
      ['cutting', 'charging'],
      ['summer', 'winter'],
      ['hunting', 'cooking'],
      ['game', 'kitchen'],
      ['field', 'kitchen'],
      ['rifle', 'cooking'],
      ['scope', 'kitchen'],
      ['drill', 'flashlight'],
      ['camping', 'office'],
      ['hiking', 'desk'],
      ['trail', 'home'],
      ['outdoor', 'indoor'],
      ['marine', 'desert'],
      ['boat', 'hiking'],
      ['water', 'mountain'],
      ['fishing', 'climbing'],
      ['electric', 'manual'],
      ['powered', 'hand'],
      ['motor', 'manual'],
      ['winter', 'summer'],
      ['snow', 'beach'],
      ['cold', 'hot'],
      ['first aid', 'tool'],
      ['medical', 'mechanical'],
      ['health', 'engine'],
      ['mini', 'xl'],
      ['compact', 'large'],
      ['pocket', 'full-size'],
      ['boots', 'electronics'],
      ['jacket', 'device'],
      ['pants', 'gadget'],
      ['fast', 'slow']
    ];
    
    // Words to exclude from matching (noise words that cause false matches)
    const excludeWords = [
      'bass pro', 'basspro', 'cabela\'s', 'cabelas', 'signature', 'club', 'points',
      'gift card', 'egift', 'e-gift', 'xl', 'xxl', 'xxxl', 'xs', 'small', 'medium', 
      'med', 'large', 'x-large', '2xl', '3xl', '4xl', 'tall', 'petite', 'kids', 
      'youth', 'junior', 'womens', 'mens', 'pro', 'ultimate', 'deluxe', 'premium', 
      'edition', 'bundle', 'combo', 'kit', 'set', 'pack', 'assortment', 'case', 
      'cover', 'refurbished', 'renewed', 'clearance', 'open box', 'used', 'display', 
      'demo', 'replacement', 'attachment', 'adapter', 'mount', 'bracket', 'coupon', 
      'promo', 'promotion', 'discount', 'savings', 'special', 'value', 'sample', 
      'trial', 'free shipping', 'digital', 'download', 'subscription', 'warranty', 
      'membership', 'guide', 'manual', 'instructions', 'video', 'dvd', 'course', 
      'seminar', 'service', 'installation', 'assembly', 'labor', 'fee', 'charge', 
      'gift', 'certificate', 'booking', 'reservation', 'event', 'ticket', 'tour', 
      'auction', 'charity', 'donation', 'contribution', 'personalized', 'engraved', 
      'custom', 'commemorative', 'limited', 'collectible', 'souvenir', 'apparel', 
      'clothing', 'shop', 'store', 'outlet', 'gear', 'equipment', 'item', 'product',
      'cordless', '12v', '18v', 'mah', 'ah', 'lbs', 'kg', 'tactical',
      'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 
      'brown', 'gray', 'grey', 'silver', 'gold', 'tan', 'beige', 'navy', 'maroon', 
      'olive', 'lime', 'cyan', 'magenta', 'turquoise', 'burgundy', 'crimson', 'ivory', 
      'khaki', 'coral', 'salmon', 'plum', 'teal', 'mint', 'lavender', 'indigo'
    ];
    
    // Extract meaningful keywords (skip common words and exclude words)
    const commonWords = ['the', 'and', 'or', 'with', 'for', 'of', 'in', 'to', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'black', 'white', 'red', 'blue', 'green', 'new', 'used', 'inch', 'cm', 'mm', 'size', 'pack', 'set', ...excludeWords];
    
    const keywords = productName
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 5); // Use top 5 keywords

    if (keywords.length === 0) return [];
    
    // Check for exclusion words in current product
    const currentExclusions = exclusions
      .filter(pair => pair.some(word => productName.includes(word)))
      .flat();

    // Find deals that share keywords
    const matches = allDeals
      .filter(deal => deal.id !== currentDeal.id)
      .filter(deal => {
        const dealName = deal.productName.toLowerCase();
        
        // Skip if deal contains any exclusion words
        for (const exclusion of currentExclusions) {
          if (dealName.includes(exclusion) && !productName.includes(exclusion)) {
            return false;
          }
        }
        
        // Additional filtering to prevent cross-category matches
        const productCategories = {
          knives: ['knife', 'blade', 'cutting', 'sharp', 'edge'],
          batteries: ['battery', 'power', 'lithium', 'charging', 'rechargeable'],
          clothing: ['shirt', 'pants', 'jacket', 'coat', 'vest'],
          tools: ['tool', 'wrench', 'hammer', 'screwdriver', 'drill']
        };
        
        // Check if current product and deal are in conflicting categories
        for (const [category, terms] of Object.entries(productCategories)) {
          const currentHasCategory = terms.some(term => productName.includes(term));
          const dealHasCategory = terms.some(term => dealName.includes(term));
          
          if (currentHasCategory && !dealHasCategory) {
            // Current product is in this category, check if deal conflicts
            for (const [otherCategory, otherTerms] of Object.entries(productCategories)) {
              if (category !== otherCategory) {
                const dealHasOtherCategory = otherTerms.some(term => dealName.includes(term));
                if (dealHasOtherCategory) {
                  return false; // Different categories, skip
                }
              }
            }
          }
        }
        
        return true;
      })
      .map(deal => {
        const dealName = deal.productName.toLowerCase();
        const matchedKeywords = keywords.filter(keyword => dealName.includes(keyword));
        let score = matchedKeywords.length;
        
        // Bonus for important qualifier matches
        const qualifiers = ['hunting', 'tactical', 'survival', 'rain', 'rubber', 'steel', 'carbon', 'folding', 'fixed'];
        qualifiers.forEach(qualifier => {
          if (productName.includes(qualifier) && dealName.includes(qualifier)) {
            score += 1;
          }
        });
        
        return { deal, score, matchedKeywords };
      })
      .filter(item => item.score >= 2) // At least 2 keyword matches for solid match
      .sort((a, b) => b.score - a.score) // Sort by most matches
      .slice(0, 10) // Limit to 10 similar items
      .map(item => item.deal);

    return matches;
  }, [currentDeal, allDeals]);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  // Only show compare button if we have at least 2 solid matches
  if (similarDeals.length < 2) {
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
        <div className="similar-deals" onClick={isMobile ? handleClose : undefined}>
          {similarDeals.map(deal => (
            <div 
              key={deal.id} 
              className="similar-deal"
              onClick={() => {
                if (deal.dealLink) {
                  window.open(deal.dealLink, '_blank', 'noopener,noreferrer');
                }
              }}
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
                  {(() => {
                    // Priority: salePrice > amazonPrice > cabelasPrice > regularPrice
                    const displayPrice = deal.salePrice || deal.amazonPrice || deal.cabelasPrice || deal.regularPrice;
                    
                    if (!displayPrice || displayPrice <= 0) {
                      return (
                        <span className="similar-click-price">see price at {deal.retailer}</span>
                      );
                    }
                    
                    // Strategic price hiding - but ensure comparison functionality
                    const shouldHidePrice = (() => {
                      // For high-value items (>$500), only hide some strategically
                      if (displayPrice > 500) {
                        // Hide clearance high-value items (creates urgency)
                        if (deal.clearance) return true;
                        
                        // Hide some featured high-value items (30% chance)
                        if (deal.featured) {
                          const hash = deal.id.split('').reduce((a, b) => {
                            a = ((a << 5) - a) + b.charCodeAt(0);
                            return a & a;
                          }, 0);
                          return Math.abs(hash) % 100 < 30;
                        }
                        
                        return false; // Show most high-value prices for comparison
                      }
                      
                      // Hide some mid-range items ($100-$500) randomly (20% chance)
                      if (displayPrice >= 100 && displayPrice <= 500) {
                        const hash = deal.id.split('').reduce((a, b) => {
                          a = ((a << 5) - a) + b.charCodeAt(0);
                          return a & a;
                        }, 0);
                        return Math.abs(hash) % 100 < 20;
                      }
                      
                      // Hide some clearance items under $100 to create urgency
                      if (deal.clearance && displayPrice < 100) {
                        const hash = deal.id.split('').reduce((a, b) => {
                          a = ((a << 5) - a) + b.charCodeAt(0);
                          return a & a;
                        }, 0);
                        return Math.abs(hash) % 100 < 40;
                      }
                      
                      return false;
                    })();
                    
                    if (shouldHidePrice) {
                      return (
                        <span className="similar-click-price">see price at {deal.retailer}</span>
                      );
                    }
                    
                    // Show the price
                    return (
                      <>
                        {deal.regularPrice && deal.salePrice && deal.regularPrice > deal.salePrice && (
                          <span className="similar-regular-price">
                            {formatPrice(deal.regularPrice)}
                          </span>
                        )}
                        <span className="similar-sale-price">
                          {formatPrice(displayPrice)}
                        </span>
                      </>
                    );
                  })()}
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