import React from 'react';
import './Disclaimer.css';

interface DisclaimerProps {
  onBack?: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onBack }) => {
  return (
    <div className="disclaimer-page">
      <div className="disclaimer-container">
        {onBack && (
          <button onClick={onBack} className="back-button">
            ← Back to Deals
          </button>
        )}
        <h1>About</h1>
        
        <div className="disclaimer-content">
          <p>
            At Off-Grid Discounts, our mission is simple: to highlight the best deals on gear, tools, and supplies for off-grid living in Canada. We only post offers we believe provide real value.
          </p>
          
          <p>
            Some of those offers may include affiliate links, which means we might earn a small commission if you make a purchase—at no extra cost to you. This helps support the site and keeps the deals coming.
          </p>
          
          <p>
            We are a participant in the Amazon Associates Program and may earn from qualifying purchases. We also partner with Cabela's Canada through the Rakuten Affiliate Network and may receive commissions on purchases made via links to www.cabelas.ca.
          </p>
          
          <p>
            Third-party offers listed on this site may change without notice. While we do our best to keep everything up to date, we recommend checking directly with the retailer for the latest details.
          </p>
          
          <p>
            This disclosure is made in accordance with FTC guidelines (16 CFR § 255.5) concerning the use of endorsements and testimonials in advertising.
          </p>
        </div>
      </div>
    </div>
  );
};