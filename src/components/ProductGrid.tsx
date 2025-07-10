import React, { useState, useCallback, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Deal } from '../types/Deal';
import { DealCard } from './DealCard';
import { SingleDealCard } from './SingleDealCard';
import './ProductGrid.css';

interface ProductGridProps {
  deals: Deal[];
  featuredDeals?: Deal[];
}

const INITIAL_LOAD_COUNT = 20;
const LOAD_MORE_COUNT = 15;

export const ProductGrid: React.FC<ProductGridProps> = ({ deals, featuredDeals = [] }) => {
  const [displayedDeals, setDisplayedDeals] = useState<Deal[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const allDeals = useMemo(() => {
    const featured = featuredDeals.filter(deal => deal.featured);
    const regular = deals.filter(deal => !deal.featured);
    return [...featured, ...regular];
  }, [deals, featuredDeals]);

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

  // Group deals into random rows of 2 or 3
  const groupedDeals = useMemo(() => {
    const groups = [];
    let currentIndex = 0;
    let rowIndex = 0;
    
    while (currentIndex < displayedDeals.length) {
      const group = [];
      // Use a stable pseudo-random pattern based on row index
      // Creates a varied but consistent pattern
      const patterns = [3, 2, 2, 3, 2, 3, 3, 2];
      const cardsPerRow = patterns[rowIndex % patterns.length];
      rowIndex++;
      
      // Add up to cardsPerRow deals (or remaining deals)
      for (let i = 0; i < cardsPerRow && currentIndex < displayedDeals.length; i++) {
        group.push(displayedDeals[currentIndex]);
        currentIndex++;
      }
      
      if (group.length > 0) {
        groups.push({ type: `row-${group.length}`, deals: group });
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
                  
                  {deal.cardType === 'comparison' ? (
                    <DealCard deal={deal} />
                  ) : (
                    <SingleDealCard deal={deal} />
                  )}
                </article>
              ))}
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </section>
  );
};