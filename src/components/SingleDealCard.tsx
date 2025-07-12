import React from 'react';
import { Deal } from '../types/Deal';
import './SingleDealCard.css';

interface SingleDealCardProps {
  deal: Deal;
  allDeals?: Deal[];
  onDealClick?: (deal: Deal) => void;
}

export const SingleDealCard: React.FC<SingleDealCardProps> = ({ deal, allDeals = [], onDealClick }) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  
  // Generate random viewing count for social proof
  const viewingCount = React.useMemo(() => Math.floor(Math.random() * 15) + 3, []);
  
  const handleDealClick = () => {
    if (!deal.dealLink) return;
    
    window.open(deal.dealLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="single-deal-card">
      <div className="deal-image-container" onClick={handleDealClick} style={{ cursor: 'pointer' }}>
        {deal.discountPercent && deal.discountPercent > 15 && (
          <span className="discount-badge">{deal.discountPercent}% OFF</span>
        )}
        <img 
          src={deal.imageUrl} 
          alt={deal.productName}
          className="deal-image"
          loading="lazy"
          onError={(e) => {
            // Try fallback image sizes if the primary fails
            const currentSrc = e.currentTarget.src;
            let newSrc = '';
            
            if (currentSrc.includes('_SL500_')) {
              // Try 300px version
              newSrc = currentSrc.replace('_SL500_', '_SL300_');
            } else if (currentSrc.includes('_SL300_')) {
              // Try 1000px version
              newSrc = currentSrc.replace('_SL300_', '_SL1000_');
            } else if (currentSrc.includes('_SL1000_')) {
              // Try removing size parameter entirely
              newSrc = currentSrc.replace(/\._SL\d+_/, '');
            } else {
              // Hide image if all fallbacks fail
              console.error('All image fallbacks failed for:', deal.imageUrl);
              e.currentTarget.style.display = 'none';
              return;
            }
            
            if (newSrc && newSrc !== currentSrc) {
              console.log('Trying fallback image:', newSrc);
              e.currentTarget.src = newSrc;
            } else {
              e.currentTarget.style.display = 'none';
            }
          }}
        />
        {deal.featured && <span className="featured-badge">FEATURED</span>}
      </div>
      
      <div className="deal-content">
        <h3 className="deal-title">{deal.productName}</h3>
        
        <div className="price-info">
          {deal.regularPrice && deal.regularPrice > deal.salePrice! && (
            <span className="regular-price">{formatPrice(deal.regularPrice)}</span>
          )}
          {deal.salePrice !== undefined && deal.salePrice !== null && deal.salePrice > 0 && (
            <span className="sale-price">{formatPrice(deal.salePrice!)}</span>
          )}
          {deal.discountPercent && deal.discountPercent > 0 && (
            <span className="savings-text">Save {deal.discountPercent}%</span>
          )}
        </div>
        
        <div className="button-section">
          <button 
            className="get-deal-button"
            onClick={handleDealClick}
            rel="nofollow"
          >
            <span>Get Deal on {deal.retailer}</span>
          </button>
        </div>
        
      </div>
    </div>
  );
};