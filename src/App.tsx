import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ProductGrid } from './components/ProductGrid';
import { Footer } from './components/Footer';
import { StructuredData } from './components/StructuredData';
import { SEO } from './components/SEO';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { useDeals } from './hooks/useDeals';
import './App.css';

function App() {
  const { deals, loading, error } = useDeals();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeals = useMemo(() => {
    let filtered = deals;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.productName.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [deals, searchTerm]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading deals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="App">
          <SEO 
            dealCount={filteredDeals.length}
          />
          <StructuredData deals={filteredDeals} />
          <Header 
            onSearch={setSearchTerm}
          />
          <main className="main-content">
            <ProductGrid deals={filteredDeals} />
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;