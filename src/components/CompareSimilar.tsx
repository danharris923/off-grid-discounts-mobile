import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import Fuse from 'fuse.js';
import * as stringSimilarity from 'string-similarity';
import { Deal } from '../types/Deal';
import { APP_CONSTANTS } from '../constants/app';
import { getBestArticleForProduct } from '../utils/articleMatcher';
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
    
    // Enhanced category and brand detection
    const PRODUCT_CATEGORIES = {
      'power': ['power', 'station', 'battery', 'portable', 'solar', 'generator', 'charger', 'bank'],
      'clothing': ['jacket', 'coat', 'vest', 'hoodie', 'sweater', 'fleece', 'parka', 'shirt', 'pants', 'shorts'],
      'footwear': ['boots', 'shoes', 'sandals', 'sneakers', 'hiking', 'running', 'waterproof'],
      'bags': ['backpack', 'bag', 'pack', 'duffel', 'tote', 'messenger', 'daypack', 'tactical'],
      'camping': ['tent', 'sleeping', 'pad', 'mattress', 'pillow', 'camping', 'outdoor', 'survival'],
      'tools': ['knife', 'multi-tool', 'flashlight', 'headlamp', 'lantern', 'axe', 'saw', 'tool'],
      'cooking': ['stove', 'cooler', 'thermos', 'bottle', 'mug', 'tumbler', 'cookware', 'grill'],
      'accessories': ['gloves', 'hat', 'beanie', 'cap', 'scarf', 'watch', 'sunglasses', 'wallet', 'belt']
    };
    
    const PREMIUM_BRANDS = [
      'north face', 'patagonia', 'arc\'teryx', 'yeti', 'goal zero', 'jackery', 'bluetti', 'ecoflow',
      'carhartt', 'filson', 'benchmade', 'leatherman', 'surefire', 'pelican', 'osprey', 'deuter',
      'columbia', 'under armour', 'nike', 'adidas', 'merrell', 'salomon', 'keen', 'danner',
      'rei', 'msr', 'big agnes', 'nemo', 'therm-a-rest', 'kelty', 'gregory', 'black diamond'
    ];
    
    // Enhanced keyword extraction with category awareness
    const extractFeatures = (productName: string) => {
      const text = productName.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
      const words = text.split(/\s+/).filter(word => word.length > 1);
      
      // Find category
      let category = 'general';
      for (const [cat, keywords] of Object.entries(PRODUCT_CATEGORIES)) {
        if (keywords.some(keyword => words.includes(keyword))) {
          category = cat;
          break;
        }
      }
      
      // Find brand
      let brand = '';
      for (const brandName of PREMIUM_BRANDS) {
        const brandWords = brandName.split(' ');
        if (brandWords.every(brandWord => words.includes(brandWord))) {
          brand = brandName;
          break;
        }
      }
      
      // Extract key descriptors
      const descriptors = words.filter(word => 
        word.length > 3 && 
        !['with', 'and', 'for', 'the', 'inch', 'size'].includes(word)
      );
      
      // Extract model numbers and sizes
      const modelNumbers = words.filter(word => /\d/.test(word));
      
      return {
        category,
        brand,
        descriptors,
        modelNumbers,
        allWords: words,
        cleanText: text
      };
    };
    
    // Multi-factor similarity scoring
    const calculateSimilarity = (deal1: Deal, deal2: Deal) => {
      const features1 = extractFeatures(deal1.productName);
      const features2 = extractFeatures(deal2.productName);
      
      let score = 0;
      let maxScore = 0;
      
      // 1. Category match (25% weight)
      maxScore += 25;
      if (features1.category === features2.category && features1.category !== 'general') {
        score += 25;
      }
      
      // 2. Brand match (20% weight)
      maxScore += 20;
      if (features1.brand && features2.brand && features1.brand === features2.brand) {
        score += 20;
      } else if (features1.brand && features2.brand) {
        // Partial brand similarity
        const brandSim = stringSimilarity.compareTwoStrings(features1.brand, features2.brand);
        score += brandSim * 20;
      }
      
      // 3. String similarity of full names (20% weight)
      maxScore += 20;
      const nameSimilarity = stringSimilarity.compareTwoStrings(
        features1.cleanText, 
        features2.cleanText
      );
      score += nameSimilarity * 20;
      
      // 4. Descriptor overlap (15% weight)
      maxScore += 15;
      const commonDescriptors = features1.descriptors.filter(desc => 
        features2.descriptors.includes(desc)
      );
      if (features1.descriptors.length > 0 || features2.descriptors.length > 0) {
        const descriptorRatio = (commonDescriptors.length * 2) / 
          (features1.descriptors.length + features2.descriptors.length);
        score += descriptorRatio * 15;
      }
      
      // 5. Model number similarity (10% weight)
      maxScore += 10;
      if (features1.modelNumbers.length > 0 && features2.modelNumbers.length > 0) {
        const modelMatches = features1.modelNumbers.filter(model => 
          features2.modelNumbers.some(model2 => 
            model === model2 || stringSimilarity.compareTwoStrings(model, model2) > 0.8
          )
        );
        const modelRatio = (modelMatches.length * 2) / 
          (features1.modelNumbers.length + features2.modelNumbers.length);
        score += modelRatio * 10;
      }
      
      // 6. Price range similarity (10% weight)
      maxScore += 10;
      const price1 = deal1.salePrice || deal1.amazonPrice || deal1.cabelasPrice || deal1.regularPrice || 0;
      const price2 = deal2.salePrice || deal2.amazonPrice || deal2.cabelasPrice || deal2.regularPrice || 0;
      
      if (price1 > 0 && price2 > 0) {
        const priceDiff = Math.abs(price1 - price2);
        const avgPrice = (price1 + price2) / 2;
        const priceRatio = Math.max(0, 1 - (priceDiff / avgPrice));
        score += priceRatio * 10;
      }
      
      return maxScore > 0 ? (score / maxScore) : 0;
    };
    
    // Calculate similarities for all deals
    const dealSimilarities = otherDeals.map(deal => ({
      deal,
      similarity: calculateSimilarity(currentDeal, deal)
    }));
    
    // Sort by similarity and filter out low scores
    const minSimilarity = 0.15; // 15% minimum similarity
    const sortedDeals = dealSimilarities
      .filter(item => item.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, APP_CONSTANTS.MAX_COMPARISON_RESULTS)
      .map(item => item.deal);
    
    return sortedDeals;
  }, [currentDeal, allDeals]);

  const formatPrice = (price: number | undefined | null): string => {
    if (!price || price <= 0) return '';
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

  // Get the best article for this product category
  const relatedArticle = getBestArticleForProduct(currentDeal);

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
              <div className="popup-header-content">
                <h3>Similar Products</h3>
                {relatedArticle && (
                  <a 
                    href={`/compare/${relatedArticle.slug}`}
                    className="comparison-guide-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📊 Full Comparison Guide →
                  </a>
                )}
              </div>
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
              {/* Show the original deal first */}
              <div 
                key={currentDeal.id} 
                className="popup-card"
                onClick={() => handleDealClick(currentDeal)}
              >
                <div className="popup-image-container">
                  <img 
                    src={currentDeal.imageUrl} 
                    alt={currentDeal.productName}
                    className="popup-image"
                    loading="lazy"
                  />
                  {currentDeal.featured && <span className="badge featured">Featured</span>}
                  {currentDeal.clearance && <span className="badge clearance">Clearance</span>}
                </div>
                
                <div className="popup-info">
                  <h4 className="popup-title">{currentDeal.productName}</h4>
                  
                  <div className="popup-price">
                    {(() => {
                      const displayPrice = getCurrentPrice(currentDeal);
                      const validPrice = displayPrice && displayPrice > 0;
                      
                      return !validPrice ? (
                        <span className="click-price">
                          {currentDeal.clearance ? "See clearance price" : 
                           currentDeal.featured ? "See special price" : 
                           `See price at ${currentDeal.retailer}`}
                        </span>
                      ) : (
                        <>
                          {currentDeal.regularPrice && currentDeal.salePrice && currentDeal.regularPrice > currentDeal.salePrice && (
                            <span className="regular-price">{formatPrice(currentDeal.regularPrice)}</span>
                          )}
                          <span className="sale-price">{formatPrice(displayPrice)}</span>
                          {currentDeal.discountPercent && currentDeal.discountPercent > 0 && (
                            <span className="savings-text">Save {currentDeal.discountPercent}%</span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  
                  <span className="popup-retailer">{currentDeal.retailer}</span>
                </div>
              </div>
              
              {/* Show similar deals */}
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
                            {deal.discountPercent && deal.discountPercent > 0 && (
                              <span className="savings-text">Save {deal.discountPercent}%</span>
                            )}
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