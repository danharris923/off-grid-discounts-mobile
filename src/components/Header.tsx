import React from 'react';
import './Header.css';

interface HeaderProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSearch: (searchTerm: string) => void;
}

const categories = [
  { value: 'all', label: 'All Deals' },
  { value: 'power', label: 'Power' },
  { value: 'generators', label: 'Generators' },
  { value: 'batteries', label: 'Batteries' },
  { value: 'stoves', label: 'Stoves' }
];

export const Header: React.FC<HeaderProps> = ({ 
  selectedCategory, 
  onCategoryChange,
  onSearch 
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

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
            Compare prices from Amazon & Cabela's - <span className="savings-highlight">Save up to 40%</span>
          </p>
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
          
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category.value}
                className={`category-button ${selectedCategory === category.value ? 'active' : ''}`}
                onClick={() => onCategoryChange(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};