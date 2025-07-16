import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { ThemeProvider } from '../contexts/ThemeContext';
import ErrorBoundary from '../components/ErrorBoundary';
import ArticleProductGrid from '../components/ArticleProductGrid';
import ArticleStructuredData from '../components/ArticleStructuredData';
import { getArticleBySlug } from '../data/comparisonArticles';
import { useDeals } from '../hooks/useDeals';
import { Deal } from '../types/Deal';
import './ComparisonPage.css';

interface ComparisonPageProps {}

const ComparisonPage: React.FC<ComparisonPageProps> = () => {
  const { slug } = useParams<{ slug: string }>();
  const { deals } = useDeals();
  const [searchTerm, setSearchTerm] = useState('');
  const [baseProducts, setBaseProducts] = useState<Deal[]>([]);
  
  // Load article data based on slug
  const article = slug ? getArticleBySlug(slug) : undefined;
  
  // Get base filtered products for this article
  useEffect(() => {
    if (article && deals.length > 0) {
      const keywords = article.products.productKeywords;
      const filtered = deals.filter(deal => {
        const productName = deal.productName.toLowerCase();
        return keywords.some(keyword => 
          productName.includes(keyword.toLowerCase())
        );
      }).slice(0, article.products.maxResults);
      
      setBaseProducts(filtered);
    }
  }, [article, deals]);

  // Apply search filter to base products
  const filteredProducts = useMemo(() => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return baseProducts;
    }

    // Extract important keywords from search term
    const extractKeywords = (text: string): string[] => {
      const importantWords = [
        'diesel', 'heater', 'heating', 'planar', 'webasto', 'portable', 'van', 'rv',
        'power', 'station', 'battery', 'solar', 'generator', 'charger', 'bank',
        'camping', 'stove', 'cookware', 'grill', 'outdoor', 'cooking',
        'backpack', 'bag', 'pack', 'tactical', 'hiking', 'travel',
        'jacket', 'coat', 'pants', 'boots', 'clothing', 'gear',
        'knife', 'tool', 'flashlight', 'headlamp', 'survival'
      ];
      
      const words = text.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
      
      return words.filter(word => importantWords.includes(word));
    };

    const searchKeywords = extractKeywords(searchTerm);
    
    // If we have important keywords, prioritize keyword matches
    if (searchKeywords.length > 0) {
      const keywordMatches = baseProducts.filter(deal => {
        const productName = deal.productName.toLowerCase();
        return searchKeywords.some(keyword => productName.includes(keyword));
      });
      
      if (keywordMatches.length > 0) {
        // Use fuzzy search on keyword matches for better ranking
        const fuse = new Fuse(keywordMatches, {
          keys: [{ name: 'productName', weight: 1.0 }],
          threshold: 0.6,
          distance: 200,
          minMatchCharLength: 2,
          includeScore: true
        });
        
        const results = fuse.search(searchTerm);
        return results.map(result => result.item);
      }
    }
    
    // Fallback to regular fuzzy search
    const fuse = new Fuse(baseProducts, {
      keys: [{ name: 'productName', weight: 1.0 }],
      threshold: 0.4,
      distance: 150,
      minMatchCharLength: 2,
      includeScore: true
    });
    
    const results = fuse.search(searchTerm);
    return results.map(result => result.item);
  }, [baseProducts, searchTerm]);
  
  // Redirect to home if article not found
  if (slug && !article) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className="comparison-page">
          <SEO 
            title={article?.seo.metaTitle || `Comparison Guide: ${slug}`}
            description={article?.seo.metaDescription || `Complete buyer's guide and comparison for ${slug}`}
            url={`https://offgriddiscounts.vercel.app/compare/${slug}`}
            keywords={article?.keywords.join(', ')}
          />
          
          {article && (
            <ArticleStructuredData
              article={article}
              products={filteredProducts}
              url={`https://offgriddiscounts.vercel.app/compare/${slug}`}
            />
          )}
          
          <Header onSearch={() => {}} />
          
          <main className="comparison-content">
            <div className="container">
              <div className="breadcrumbs">
                <a href="/">Home</a> › <a href="/compare">Compare</a> › {slug}
              </div>
              
              <article className="comparison-article">
                <header className="article-header">
                  <h1>{article?.title || `Best ${slug?.replace(/-/g, ' ')}`}</h1>
                  <p className="article-meta">
                    Updated: {article?.lastUpdated ? new Date(article.lastUpdated).toLocaleDateString() : new Date().toLocaleDateString()} | 
                    Expert curated deals from Amazon & Cabela's
                  </p>
                </header>
                
                <div className="article-content">
                  {article ? (
                    <>
                      <div className="article-intro">
                        <p>{article.content.intro}</p>
                      </div>
                      
                      {article.content.buyersGuide && (
                        <div className="buyers-guide">
                          <h2>Buyer's Guide</h2>
                          <p>{article.content.buyersGuide}</p>
                        </div>
                      )}
                      
                      <ArticleProductGrid
                        keywords={article.products.productKeywords}
                        maxResults={article.products.maxResults}
                        sortBy={article.products.sortBy}
                        title={searchTerm ? `🔍 Search Results for "${searchTerm}" (${filteredProducts.length} found)` : "🏆 Top Picks - Current Deals"}
                        description={searchTerm ? `Showing ${filteredProducts.length} products matching your search within this category.` : "Live deals updated daily from Amazon & Cabela's. Prices and availability change frequently."}
                        searchTerm={searchTerm}
                        filteredProducts={filteredProducts}
                      />
                      
                      <div className="article-conclusion">
                        <h2>Final Thoughts</h2>
                        <p>{article.content.conclusion}</p>
                      </div>
                    </>
                  ) : (
                    <p>Loading comparison content for: {slug}</p>
                  )}
                </div>
              </article>
            </div>
          </main>
          
          <Footer />
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default ComparisonPage;