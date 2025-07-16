import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedArticles } from '../data/comparisonArticles';
import './FloatingGuidesButton.css';

const FloatingGuidesButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const featuredArticles = getFeaturedArticles();

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleItemClick = () => {
    setIsExpanded(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'heating': return '🔥';
      case 'cooking': return '🍳';
      case 'power': return '⚡';
      case 'bags': return '🎒';
      case 'clothing': return '👕';
      case 'tools': return '🔧';
      case 'camping': return '⛺';
      default: return '📋';
    }
  };

  return (
    <div className={`floating-guides ${isExpanded ? 'expanded' : ''}`}>
      {/* Main FAB Button */}
      <button
        className="fab-main"
        onClick={toggleExpanded}
        aria-label="Best of guides"
      >
        <span className="fab-icon">
          {isExpanded ? '✕' : '📊'}
        </span>
        <span className="fab-text">Best Of</span>
      </button>

      {/* Expanded Menu */}
      {isExpanded && (
        <div className="fab-menu">
          <div className="fab-menu-header">
            <h3>Expert Guides</h3>
            <p>Find the best deals faster</p>
          </div>
          
          <div className="fab-menu-items">
            {featuredArticles.map((article) => (
              <Link
                key={article.slug}
                to={`/compare/${article.slug}`}
                className="fab-menu-item"
                onClick={handleItemClick}
              >
                <div className="fab-item-icon">
                  {getCategoryIcon(article.category)}
                </div>
                <div className="fab-item-content">
                  <h4>{article.title.replace(/\s*\d{4}.*$/, '')}</h4>
                  <p>{article.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isExpanded && (
        <div className="fab-backdrop" onClick={() => setIsExpanded(false)} />
      )}
    </div>
  );
};

export default FloatingGuidesButton;