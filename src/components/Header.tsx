import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Disclaimer } from './Disclaimer';
import BestOfMenu from './BestOfMenu';
import './Header.css';

interface HeaderProps {
  onSearch: (searchTerm: string) => void;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSearch,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  // Check if we're on homepage to show different navigation
  const isHomePage = location.pathname === '/';
  const isComparisonPage = location.pathname.startsWith('/compare/');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <>
      <header className="site-header">
        <button 
          onClick={toggleTheme}
          className="theme-toggle-top"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>
        <button 
          onClick={() => setShowDisclaimer(true)}
          className="about-link-top"
          title="View about"
        >
          About
        </button>
        <div className="header-container">
          <div className="header-top">
            <div className="site-branding">
              {!isHomePage && (
                <Link to="/" className="home-link" title="Back to home">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                </Link>
              )}
              <Link to="/" className="site-title-link">
                <h1 className="site-title">Off-Grid Discounts</h1>
              </Link>
            </div>
            {isHomePage && (
              <p className="site-tagline">
                Compare prices from Amazon, Cabela's & more! - <span className="savings-highlight">Save up to 80%</span>
              </p>
            )}
            {isComparisonPage && (
              <nav className="breadcrumb-nav">
                <Link to="/" className="breadcrumb-link">Home</Link>
                <span className="breadcrumb-separator">›</span>
                <span className="breadcrumb-current">Buying Guide</span>
              </nav>
            )}
          </div>
        
        <div className="header-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          
          <div className="controls-container">
            <div className="center-controls">
              <BestOfMenu />
              {onRefresh && (
                <button 
                  onClick={onRefresh}
                  className="refresh-button"
                  title="Refresh deals"
                >
                  ↻
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
    
    {showDisclaimer && (
      <div className="disclaimer-modal" onClick={() => setShowDisclaimer(false)}>
        <div className="disclaimer-modal-content" onClick={(e) => e.stopPropagation()}>
          <Disclaimer onBack={() => setShowDisclaimer(false)} />
        </div>
      </div>
    )}
    </>
  );
};