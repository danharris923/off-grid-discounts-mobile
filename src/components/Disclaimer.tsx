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
        <h1>Disclaimer</h1>
        
        <div className="disclaimer-content">
          <p>
            We always list the best offers for you that we know about. Please tell us if we missed one.
          </p>
          
          <p>
            Some, but by no means most, of those offers also pay us a commission at no cost to you.
          </p>
          
          <p>
            More specifically, Off-Grid Discounts has financial relationships with some of the companies mentioned here, and Off-Grid Discounts may be compensated if consumers choose to purchase using links in our content.
          </p>
          
          <p>
            Our purpose is to show you the very best deals but we see nothing wrong with making some money on offers we will tell you about anyway.
          </p>
          
          <p>
            So, bottom line: If you click on a link on our website, we might make some money from it. Thank you.
          </p>
          
          <p>
            Any information or third party offers listed on this site could change without advanced notice and may be out of date. For the latest offer information, please consult with the third party. We strive to keep all information on this site up to date, however that's not always possible given how quickly that information could change.
          </p>
          
          <p>
            We are a participant in the Amazon Associates Program, an affiliate advertising program designed to provide a means for us to earn fees by linking to Amazon and affiliated sites.
          </p>
          
          <p>
            As an Amazon Associate we earn from qualifying purchases.
          </p>
          
          <h3>Cabela's Canada Partnership</h3>
          <p>
            This website participates in the Rakuten Affiliate Network and has an affiliate relationship with Cabela's Canada (www.cabelas.ca). When you click on links to Cabela's Canada products and make a purchase, we may earn a commission at no additional cost to you. This helps support our website and allows us to continue providing valuable content.
          </p>
          
          <p>
            Our website may contain affiliate marketing links, which means we may get paid commission on sales of those products or services we write about. Our editorial content is not influenced by advertisers or affiliate partnerships. This disclosure is provided in accordance with the Federal Trade Commission's 16 CFR § 255.5: Guides Concerning the Use of Endorsements and Testimonials in Advertising.
          </p>
        </div>
      </div>
    </div>
  );
};