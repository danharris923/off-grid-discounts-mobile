import React from 'react';
import { Deal } from '../types/Deal';
import { getBestArticleForProduct } from '../utils/articleMatcher';
import './FeaturedInBanner.css';

interface FeaturedInBannerProps {
  deal: Deal;
  compact?: boolean;
}

const FeaturedInBanner: React.FC<FeaturedInBannerProps> = ({ deal, compact = false }) => {
  const article = getBestArticleForProduct(deal);
  
  if (!article) return null;
  
  const handleClick = () => {
    window.open(`/compare/${article.slug}`, '_blank');
  };
  
  return (
    <div 
      className={`featured-in-banner ${compact ? 'compact' : ''}`}
      onClick={handleClick}
    >
      <div className="featured-icon">
        📰
      </div>
      <div className="featured-content">
        <span className="featured-label">Featured in:</span>
        <span className="featured-title">{article.title}</span>
      </div>
      <div className="featured-arrow">
        →
      </div>
    </div>
  );
};

export default React.memo(FeaturedInBanner);