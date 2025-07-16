import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Header } from '../components/Header';
import { ProductGrid } from '../components/ProductGrid';
import { Footer } from '../components/Footer';
import { StructuredData } from '../components/StructuredData';
import { SEO } from '../components/SEO';
import { ThemeProvider } from '../contexts/ThemeContext';
import ErrorBoundary from '../components/ErrorBoundary';
import FloatingGuidesButton from '../components/FloatingGuidesButton';
import { useDeals } from '../hooks/useDeals';

const HomePage: React.FC = () => {
  const { deals, loading, error } = useDeals();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeals = useMemo(() => {
    let filtered = deals;

    // Apply search filter with keyword-aware fuzzy search
    if (searchTerm && searchTerm.trim().length > 0) {
      const searchLower = searchTerm.trim().toLowerCase();
      
      // Extract keywords from search term
      const extractSearchKeywords = (search: string): string[] => {
        const importantWords = [
          'jacket', 'coat', 'vest', 'hoodie', 'sweater', 'fleece', 'parka',
          'boots', 'shoes', 'sandals', 'sneakers', 'hiking', 'running',
          'backpack', 'bag', 'pack', 'duffel', 'tote', 'messenger',
          'tent', 'sleeping', 'pad', 'mattress', 'pillow',
          'knife', 'multi-tool', 'flashlight', 'headlamp', 'lantern',
          'cooler', 'thermos', 'bottle', 'mug', 'tumbler',
          'gloves', 'hat', 'beanie', 'cap', 'scarf',
          'pants', 'shorts', 'jeans', 'leggings', 'tights',
          'shirt', 't-shirt', 'polo', 'tank', 'top',
          'watch', 'sunglasses', 'wallet', 'belt',
          'fishing', 'hunting', 'camping', 'hiking', 'outdoor'
        ];
        
        const words = search.replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(word => word.length > 1);
        return words.filter(word => importantWords.includes(word));
      };
      
      const searchKeywords = extractSearchKeywords(searchLower);
      
      // If search contains important keywords, prioritize those
      if (searchKeywords.length > 0) {
        const keywordMatches = deals.filter(deal => {
          const productName = deal.productName.toLowerCase();
          return searchKeywords.some(keyword => productName.includes(keyword));
        });
        
        if (keywordMatches.length > 0) {
          // Use fuse.js on keyword matches for ranking
          const fuse = new Fuse(keywordMatches, {
            keys: [{ name: 'productName', weight: 1.0 }],
            threshold: 0.6, // More lenient since we pre-filtered
            distance: 200,
            minMatchCharLength: 2,
            includeScore: true
          });
          
          const results = fuse.search(searchTerm.trim());
          filtered = results.map(result => result.item);
        } else {
          // Fallback to regular keyword search
          filtered = deals.filter(deal => 
            deal.productName.toLowerCase().includes(searchLower)
          );
        }
      } else {
        // Regular fuzzy search for non-keyword searches
        const fuse = new Fuse(deals, {
          keys: [{ name: 'productName', weight: 1.0 }],
          threshold: 0.4,
          distance: 150,
          minMatchCharLength: 2,
          includeScore: true
        });
        
        const results = fuse.search(searchTerm.trim());
        filtered = results.map(result => result.item);
      }
    }

    return filtered;
  }, [deals, searchTerm]);

  if (loading) {
    return (
      <ThemeProvider>
        <div className="app-loading">
          <div className="loading-spinner"></div>
          <p>Loading deals...</p>
        </div>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider>
        <div className="app-error">
          <h2>Unable to load deals</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className="app">
          <SEO 
            title="Off-Grid Discounts - Best Deals on Outdoor Gear"
            description="Find the best deals on camping, hiking, and outdoor gear from Amazon and Cabela's. Compare prices and save up to 80%!"
            dealCount={filteredDeals.length}
          />
          <StructuredData deals={filteredDeals} />
          
          <Header onSearch={setSearchTerm} />
          <ProductGrid deals={filteredDeals} />
          <Footer />
          <FloatingGuidesButton />
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default HomePage;