import React from 'react';
import { Deal } from '../types/Deal';
import { APP_CONSTANTS } from '../constants/app';
import CompareSimilar from './CompareSimilar';
import './DealCard.css';

interface DealCardProps {
  deal: Deal;
  allDeals?: Deal[];
  onDealClick?: (deal: Deal) => void;
}

const DealCard: React.FC<DealCardProps> = ({ deal, allDeals = [], onDealClick }) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  
  
  // Calculate percentage saved
  const percentSaved = deal.savings && deal.amazonPrice && deal.cabelasPrice 
    ? Math.round((deal.savings / Math.max(deal.amazonPrice, deal.cabelasPrice)) * 100)
    : 0;
  
  const handleAmazonClick = () => {
    if (deal.amazonLink) {
      window.open(deal.amazonLink, '_blank', 'noopener,noreferrer');
    }
  };
  
  const handleCabelasClick = () => {
    if (deal.cabelasLink) {
      window.open(deal.cabelasLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageClick = () => {
    // Open the better deal for comparison cards
    if (deal.bestDealRetailer === 'amazon') {
      handleAmazonClick();
    } else {
      handleCabelasClick();
    }
  };

  return (
    <div className="deal-card">
      <div className="deal-image-container" onClick={handleImageClick} style={{ cursor: 'pointer' }}>
        {deal.discountPercent && deal.discountPercent >= APP_CONSTANTS.SIGNIFICANT_DISCOUNT_PERCENT ? (
          <span className="discount-badge">{deal.discountPercent}% OFF</span>
        ) : null}
        {deal.clearance && (
          <span className="clearance-badge">CLEARANCE</span>
        )}
        <img 
          src={deal.imageUrl} 
          alt={deal.productName}
          className="deal-image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {deal.featured && <span className="featured-badge">FEATURED</span>}
      </div>
      
      <div className="deal-content">
        <h3 className="deal-title">{deal.productName}</h3>
        
        <div className="price-comparison">
          <div className="retailer-price">
            <span className="retailer-name">Amazon</span>
            <span className="price">{deal.amazonPrice && deal.amazonPrice > 0 ? formatPrice(deal.amazonPrice) : ''}</span>
          </div>
          
          <div className="retailer-price">
            <span className="retailer-name">Cabela's</span>
            <span className="price">{deal.cabelasPrice && deal.cabelasPrice > 0 ? formatPrice(deal.cabelasPrice) : ''}</span>
          </div>
        </div>
        
        {deal.savings && deal.savings > 0 && (
          <div className="best-deal-banner">
            <span className="best-deal-text">
              Save ${deal.savings.toFixed(0)} • {deal.bestDealRetailer === 'amazon' ? 'Amazon' : "Cabela's"} wins
            </span>
          </div>
        )}
        
        <div className="action-buttons">
          <button 
            className="buy-button amazon-button"
            onClick={handleAmazonClick}
            rel="nofollow"
          >
            <span>Shop Amazon</span>
          </button>
          <button 
            className="buy-button cabelas-button"
            onClick={handleCabelasClick}
            rel="nofollow"
          >
            <span>Shop Cabela's</span>
          </button>
        </div>
        
        <CompareSimilar 
          currentDeal={deal}
          allDeals={allDeals}
          onDealClick={onDealClick || (() => {})}
        />
      </div>
    </div>
  );
};

export default React.memo(DealCard);