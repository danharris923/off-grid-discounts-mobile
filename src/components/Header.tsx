import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './Header.css';

interface HeaderProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSearch: (searchTerm: string) => void;
  onRefresh?: () => void;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'power', label: 'Power' },
  { value: 'generators', label: 'Generators' },
  { value: 'batteries', label: 'Batteries' },
  { value: 'stoves', label: 'Stoves' },
  { value: 'camping', label: 'Camping' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'tools', label: 'Tools' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'water', label: 'Water' },
  { value: 'food', label: 'Food' },
  { value: 'other', label: 'Other' }
];

export const Header: React.FC<HeaderProps> = ({ 
  selectedCategory, 
  onCategoryChange,
  onSearch,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { theme, toggleTheme } = useTheme();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="header-top">
          <h1 className="site-title">Off-Grid Discounts</h1>
          <p className="site-tagline">
            Compare prices from Amazon, Cabela's & more! - <span className="savings-highlight">Save up to 80%</span>
          </p>
        </div>
        
        <div className="header-controls">
          <div className="search-and-filter">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            
            <div className="filter-container">
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="category-dropdown"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={toggleTheme}
              className="theme-toggle"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            
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
    </header>
  );
};