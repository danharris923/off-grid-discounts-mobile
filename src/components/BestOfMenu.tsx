import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedArticles } from '../data/comparisonArticles';
import './BestOfMenu.css';

interface BestOfMenuProps {
  onNavigate?: () => void;
}

const BestOfMenu: React.FC<BestOfMenuProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const featuredArticles = getFeaturedArticles();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    setIsOpen(false);
    onNavigate?.();
  };


  return (
    <div className="best-of-menu">
      <button
        ref={buttonRef}
        className={`best-of-toggle ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="menu-text">Best Of Guides</span>
        <span className={`arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
      </button>

      {isOpen && (
        <div ref={menuRef} className="best-of-dropdown">
          <div className="dropdown-header">
            <h3>Expert Buying Guides</h3>
            <p>Curated by off-grid specialists</p>
          </div>
          
          <div className="dropdown-content">
            {featuredArticles.map((article) => (
              <Link
                key={article.slug}
                to={`/compare/${article.slug}`}
                className="dropdown-item"
                onClick={handleItemClick}
              >
                <div className="item-content">
                  <h4>{article.title}</h4>
                  <p>{article.description}</p>
                  <div className="item-meta">
                    <span className="category">{article.category}</span>
                    <span className="updated">Updated 2025</span>
                  </div>
                </div>
                <div className="item-arrow">→</div>
              </Link>
            ))}
          </div>

          <div className="dropdown-footer">
            <div className="footer-links">
              <Link to="/" className="footer-home-link" onClick={handleItemClick}>
                ← Back to Deals
              </Link>
              <Link to="/guides" className="view-all-link" onClick={handleItemClick}>
                View All Guides →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BestOfMenu;