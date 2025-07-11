import React, { useState } from 'react';
import { Disclaimer } from './Disclaimer';
import './Footer.css';

export const Footer: React.FC = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  if (showDisclaimer) {
    return <Disclaimer onBack={() => setShowDisclaimer(false)} />;
  }

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-text">
            © 2024 Off-Grid Discounts. Finding the best deals for your off-grid lifestyle.
          </p>
          <div className="footer-links">
            <button 
              onClick={() => setShowDisclaimer(true)}
              className="footer-link"
            >
              Disclaimer
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};