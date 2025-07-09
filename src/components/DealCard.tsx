import React from 'react';
import { Deal } from '../types/Deal';
import { buildAmazonAffiliateLink, buildRakutenAffiliateLink } from '../utils/affiliateLinks';
import './DealCard.css';

interface DealCardProps {
  deal: Deal;
}

export const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  
  const handleAmazonClick = () => {
    const affiliateLink = buildAmazonAffiliateLink(deal.amazonLink);
    window.open(affiliateLink, '_blank', 'noopener,noreferrer');
  };
  
  const handleCabelasClick = () => {
    const affiliateLink = buildRakutenAffiliateLink(deal.cabelasLink);
    window.open(affiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="deal-card">
      <div className="deal-image-container">
        <img 
          src={deal.imageUrl} 
          alt={deal.productName}
          className="deal-image"
          loading="lazy"
        />
        {deal.featured && <span className="featured-badge">Featured</span>}
      </div>
      
      <div className="deal-content">
        <h3 className="deal-title">{deal.productName}</h3>
        
        <div className="price-comparison">
          <div className="retailer-price">
            <span className="retailer-name">Amazon</span>
            <span className="price">{formatPrice(deal.amazonPrice)}</span>
            <span className="shipping-info">Prime shipping</span>
          </div>
          
          <div className="retailer-price">
            <span className="retailer-name">Cabela's</span>
            <span className="price">{formatPrice(deal.cabelasPrice)}</span>
            <span className="shipping-info">Free shipping to Canada</span>
          </div>
        </div>
        
        <div className="best-deal-banner">
          <span className="crown-icon">👑</span>
          <span className="best-deal-text">
            Best Deal: {deal.bestDealRetailer === 'amazon' ? 'Amazon' : "Cabela's"} saves you ${deal.savings.toFixed(2)}
          </span>
        </div>
        
        <div className="action-buttons">
          <button 
            className="buy-button amazon-button"
            onClick={handleAmazonClick}
            rel="nofollow"
          >
            Shop on Amazon
          </button>
          <button 
            className="buy-button cabelas-button"
            onClick={handleCabelasClick}
            rel="nofollow"
          >
            Shop at Cabela's
          </button>
        </div>
      </div>
    </div>
  );
};