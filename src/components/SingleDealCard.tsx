import React from 'react';
import { Deal } from '../types/Deal';
import { buildAmazonAffiliateLink, buildRakutenAffiliateLink } from '../utils/affiliateLinks';
import './SingleDealCard.css';

interface SingleDealCardProps {
  deal: Deal;
}

export const SingleDealCard: React.FC<SingleDealCardProps> = ({ deal }) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  
  // Generate random viewing count for social proof
  const viewingCount = React.useMemo(() => Math.floor(Math.random() * 15) + 3, []);
  
  const handleDealClick = () => {
    if (!deal.dealLink) return;
    
    let affiliateLink = deal.dealLink;
    
    if (deal.retailer?.toLowerCase().includes('amazon')) {
      affiliateLink = buildAmazonAffiliateLink(deal.dealLink);
    } else if (deal.retailer?.toLowerCase().includes('cabela')) {
      affiliateLink = buildRakutenAffiliateLink(deal.dealLink);
    }
    
    window.open(affiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="single-deal-card">
      <div className="deal-image-container">
        {deal.discountPercent && deal.discountPercent > 15 && (
          <span className="discount-badge">{deal.discountPercent}% OFF</span>
        )}
        <img 
          src={deal.imageUrl} 
          alt={deal.productName}
          className="deal-image"
          loading="lazy"
          onError={(e) => {
            console.error('Image failed to load:', deal.imageUrl);
            e.currentTarget.style.display = 'none';
          }}
        />
        {deal.featured && <span className="featured-badge">FEATURED</span>}
      </div>
      
      <div className="deal-content">
        <h3 className="deal-title">{deal.productName}</h3>
        
        <div className="price-section">
          {deal.regularPrice && deal.regularPrice > deal.salePrice! && (
            <span className="regular-price">{formatPrice(deal.regularPrice)}</span>
          )}
          <span className="sale-price">{formatPrice(deal.salePrice!)}</span>
        </div>
        
        <div className="retailer-info">
          <span className="retailer-name">{deal.retailer}</span>
        </div>
        
        <div className="action-buttons">
          <button 
            className={`buy-button ${deal.retailer?.toLowerCase().includes('amazon') ? 'amazon-button' : 'cabelas-button'}`}
            onClick={handleDealClick}
            rel="nofollow"
          >
            <span>Get Deal</span>
          </button>
        </div>
      </div>
    </div>
  );
};