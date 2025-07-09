import React from 'react';
import { Deal } from '../types/Deal';
import { buildAmazonAffiliateLink, buildRakutenAffiliateLink } from '../utils/affiliateLinks';
import './DealCard.css';

interface DealCardProps {
  deal: Deal;
}

export const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  
  // Generate random viewing count for social proof
  const viewingCount = React.useMemo(() => Math.floor(Math.random() * 20) + 5, []);
  
  // Calculate percentage saved
  const percentSaved = Math.round((deal.savings / Math.max(deal.amazonPrice, deal.cabelasPrice)) * 100);
  
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
        {percentSaved > 20 && <span className="stock-warning">Only 3 left!</span>}
        <img 
          src={deal.imageUrl} 
          alt={deal.productName}
          className="deal-image"
          loading="lazy"
        />
        {deal.featured && <span className="featured-badge">🔥 HOT DEAL</span>}
      </div>
      
      <div className="deal-content">
        <h3 className="deal-title">{deal.productName}</h3>
        
        {/* Social proof */}
        <div className="social-proof">
          <span className="viewing-now">🔥 {viewingCount} people viewing this now</span>
        </div>
        
        <div className="price-comparison">
          <div className="retailer-price">
            <span className="retailer-name">Amazon</span>
            <span className="price">{formatPrice(deal.amazonPrice)}</span>
            <span className="shipping-info">✓ FREE Prime</span>
          </div>
          
          <div className="retailer-price">
            <span className="retailer-name">Cabela's</span>
            <span className="price">{formatPrice(deal.cabelasPrice)}</span>
            <span className="shipping-info">✓ FREE to Canada</span>
          </div>
        </div>
        
        <div className="best-deal-banner">
          <span className="crown-icon">💰</span>
          <span className="best-deal-text">
            SAVE {percentSaved}% • ${deal.savings.toFixed(0)} OFF
          </span>
        </div>
        
        {/* Countdown timer for urgency */}
        <div className="deal-timer">
          ⏰ Deal ends in <span className="timer-urgent">2h 47m</span>
        </div>
        
        <div className="action-buttons">
          <button 
            className="buy-button amazon-button"
            onClick={handleAmazonClick}
            rel="nofollow"
          >
            GET DEAL →
          </button>
          <button 
            className="buy-button cabelas-button"
            onClick={handleCabelasClick}
            rel="nofollow"
          >
            GET DEAL →
          </button>
        </div>
      </div>
    </div>
  );
};