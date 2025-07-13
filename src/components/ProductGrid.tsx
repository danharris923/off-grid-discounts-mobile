import React, { useState, useCallback, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Deal } from '../types/Deal';
import SingleDealCard from './SingleDealCard';
import './ProductGrid.css';

interface ProductGridProps {
  deals: Deal[];
  featuredDeals?: Deal[];
}

const INITIAL_LOAD_COUNT = 20;
const LOAD_MORE_COUNT = 16; // Use 16 to maintain rows of 4

// Generate a session-stable random seed once
const SESSION_SEED = Math.random().toString(36).substring(7);

export const ProductGrid: React.FC<ProductGridProps> = ({ deals, featuredDeals = [] }) => {
  const [displayedDeals, setDisplayedDeals] = useState<Deal[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);

  // Only shuffle once when deals change, using stable session seed with retailer distribution
  React.useEffect(() => {
    if (deals.length === 0) return;
    
    const featured = featuredDeals.filter(deal => deal.featured);
    const regular = deals.filter(deal => !deal.featured);
    
    // Group by retailer for better distribution
    const retailerGroups: { [key: string]: Deal[] } = {};
    regular.forEach(deal => {
      const retailer = deal.retailer || 'Other';
      if (!retailerGroups[retailer]) {
        retailerGroups[retailer] = [];
      }
      retailerGroups[retailer].push(deal);
    });
    
    // Shuffle each retailer group using session-stable seed
    Object.keys(retailerGroups).forEach(retailer => {
      retailerGroups[retailer] = retailerGroups[retailer].sort((a, b) => {
        const hashA = (a.id + SESSION_SEED).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hashB = (b.id + SESSION_SEED).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return hashA - hashB;
      });
    });
    
    // Interleave retailers to prevent clustering
    const retailers = Object.keys(retailerGroups);
    const shuffledRegular: Deal[] = [];
    const maxGroupSize = Math.max(...retailers.map(r => retailerGroups[r].length));
    
    for (let i = 0; i < maxGroupSize; i++) {
      // Rotate through retailers in a stable order
      const retailerOrder = [...retailers].sort((a, b) => {
        const hashA = (a + SESSION_SEED).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hashB = (b + SESSION_SEED).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return hashA - hashB;
      });
      
      retailerOrder.forEach(retailer => {
        if (retailerGroups[retailer][i]) {
          shuffledRegular.push(retailerGroups[retailer][i]);
        }
      });
    }
    
    setAllDeals([...featured, ...shuffledRegular]);
  }, [deals.length, featuredDeals.length]); // Only depend on length, not the arrays themselves

  React.useEffect(() => {
    if (allDeals.length > 0) {
      setDisplayedDeals(allDeals.slice(0, INITIAL_LOAD_COUNT));
      setHasMore(allDeals.length > INITIAL_LOAD_COUNT);
    }
  }, [allDeals]);

  const loadMore = useCallback(() => {
    const currentLength = displayedDeals.length;
    const moreDeals = allDeals.slice(currentLength, currentLength + LOAD_MORE_COUNT);
    
    setDisplayedDeals(prev => [...prev, ...moreDeals]);
    
    if (currentLength + moreDeals.length >= allDeals.length) {
      setHasMore(false);
    }
  }, [displayedDeals.length, allDeals]);

  const LoadingComponent = () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading more deals...</p>
    </div>
  );

  const EndMessage = () => (
    <div className="end-message">
      <p>You've seen all {allDeals.length} deals!</p>
    </div>
  );

  // Force specific 4-3-4-4-3 pattern that repeats
  const groupedDeals = useMemo(() => {
    const groups = [];
    let currentIndex = 0;
    const pattern = [4, 3, 4, 4, 3]; // Your desired pattern
    let patternIndex = 0;
    
    while (currentIndex < displayedDeals.length) {
      const group = [];
      const cardsPerRow = pattern[patternIndex % pattern.length];
      const remainingCount = displayedDeals.length - currentIndex;
      
      // Use the pattern, but don't exceed remaining cards
      const actualCardsToTake = Math.min(cardsPerRow, remainingCount);
      
      // Add cards to this row
      for (let i = 0; i < actualCardsToTake; i++) {
        group.push(displayedDeals[currentIndex]);
        currentIndex++;
      }
      
      if (group.length > 0) {
        groups.push({ type: `row-${group.length}`, deals: group });
        patternIndex++; // Move to next pattern position
      }
    }
    
    return groups;
  }, [displayedDeals]);

  return (
    <section 
      className="product-grid-container" 
      aria-label="Product deals and offers"
      role="main"
    >
      <InfiniteScroll
        dataLength={displayedDeals.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<LoadingComponent />}
        endMessage={<EndMessage />}
        className="product-grid-scroll"
      >
        <div 
          className="mixed-layout-grid"
          role="list"
          aria-label={`${displayedDeals.length} product deals`}
        >
          {groupedDeals.map((group, groupIndex) => (
            <div 
              key={groupIndex} 
              className={`deal-row ${group.type}`}
              role="group"
              aria-label={`Deal row ${groupIndex + 1} with ${group.deals.length} products`}
            >
              {group.deals.map((deal) => (
                <article
                  key={deal.id}
                  role="listitem"
                  className="deal-card-wrapper"
                  data-deal-id={deal.id}
                  itemScope
                  itemType="https://schema.org/Product"
                >
                  <meta itemProp="name" content={deal.productName} />
                  <meta itemProp="category" content={deal.category} />
                  {deal.imageUrl && <meta itemProp="image" content={deal.imageUrl} />}
                  {(deal.salePrice || deal.amazonPrice || deal.cabelasPrice) && (
                    <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
                      <meta itemProp="price" content={String(deal.salePrice || deal.amazonPrice || deal.cabelasPrice)} />
                      <meta itemProp="priceCurrency" content="USD" />
                      <meta itemProp="availability" content="https://schema.org/InStock" />
                    </div>
                  )}
                  
                  <SingleDealCard 
                    deal={deal} 
                    allDeals={allDeals}
                    onDealClick={(clickedDeal) => {
                      // Scroll to the clicked deal
                      const element = document.querySelector(`[data-deal-id="${clickedDeal.id}"]`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                  />
                </article>
              ))}
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </section>
  );
};