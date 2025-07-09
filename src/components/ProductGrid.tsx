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
      // Use a stable pattern based on row index instead of Math.random()
      // Pattern: 3, 2, 3, 2, 3, 2...
      const cardsPerRow = rowIndex % 2 === 0 ? 3 : 2;
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
    <InfiniteScroll
      dataLength={displayedDeals.length}
      next={loadMore}
      hasMore={hasMore}
      loader={<LoadingComponent />}
      endMessage={<EndMessage />}
      className="product-grid-container"
    >
      <div className="mixed-layout-grid">
        {groupedDeals.map((group, groupIndex) => (
          <div key={groupIndex} className={`deal-row ${group.type}`}>
            {group.deals.map((deal) => (
              deal.cardType === 'comparison' ? (
                <DealCard key={deal.id} deal={deal} />
              ) : (
                <SingleDealCard key={deal.id} deal={deal} />
              )
            ))}
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
};