import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { ThemeProvider } from '../contexts/ThemeContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { getAllArticles, getFeaturedArticles } from '../data/comparisonArticles';
import './CompareIndexPage.css';

const CompareIndexPage: React.FC = () => {
  const allArticles = getAllArticles();
  const featuredArticles = getFeaturedArticles();
  const regularArticles = allArticles.filter(article => !article.featured);

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className="compare-index-page">
          <SEO 
            title="Comparison Guides - Best Outdoor Gear Buying Guides"
            description="Expert comparison guides for outdoor gear, camping equipment, and off-grid essentials. Find the best deals on quality gear with our comprehensive buying guides."
            keywords="comparison guides, outdoor gear, camping equipment, buying guides, gear reviews"
            url="https://offgriddiscounts.vercel.app/compare"
          />
          
          <Header onSearch={() => {}} />
          
          <main className="compare-index-content">
            <div className="container">
              <div className="breadcrumbs">
                <Link to="/">Home</Link> › Compare
              </div>
              
              <header className="page-header">
                <h1>Comparison Guides</h1>
                <p className="page-description">
                  Expert buying guides and product comparisons to help you find the best outdoor gear deals. 
                  All guides feature live pricing from Amazon and Cabela's, updated daily.
                </p>
              </header>
              
              {featuredArticles.length > 0 && (
                <section className="featured-articles">
                  <h2>🏆 Featured Guides</h2>
                  <div className="articles-grid featured">
                    {featuredArticles.map(article => (
                      <article key={article.slug} className="article-card featured">
                        <div className="article-badge">Featured</div>
                        <div className="article-content">
                          <h3>
                            <Link to={`/compare/${article.slug}`}>
                              {article.title}
                            </Link>
                          </h3>
                          <p className="article-description">{article.description}</p>
                          <div className="article-meta">
                            <span className="category">{article.category}</span>
                            <span className="updated">
                              Updated {new Date(article.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="article-tags">
                            {article.keywords.slice(0, 3).map(keyword => (
                              <span key={keyword} className="tag">{keyword}</span>
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
              
              {regularArticles.length > 0 && (
                <section className="all-articles">
                  <h2>📚 All Comparison Guides</h2>
                  <div className="articles-grid">
                    {regularArticles.map(article => (
                      <article key={article.slug} className="article-card">
                        <div className="article-content">
                          <h3>
                            <Link to={`/compare/${article.slug}`}>
                              {article.title}
                            </Link>
                          </h3>
                          <p className="article-description">{article.description}</p>
                          <div className="article-meta">
                            <span className="category">{article.category}</span>
                            <span className="updated">
                              Updated {new Date(article.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="article-tags">
                            {article.keywords.slice(0, 3).map(keyword => (
                              <span key={keyword} className="tag">{keyword}</span>
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
              
              <section className="cta-section">
                <div className="cta-content">
                  <h2>Can't find what you're looking for?</h2>
                  <p>
                    Browse our complete collection of deals or use the search to find specific gear.
                  </p>
                  <Link to="/" className="cta-button">
                    Browse All Deals
                  </Link>
                </div>
              </section>
            </div>
          </main>
          
          <Footer />
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default CompareIndexPage;