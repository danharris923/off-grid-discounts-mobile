import React from 'react';
import { ComparisonArticle } from '../data/comparisonArticles';
import { Deal } from '../types/Deal';

interface ArticleStructuredDataProps {
  article: ComparisonArticle;
  products: Deal[];
  url: string;
}

const ArticleStructuredData: React.FC<ArticleStructuredDataProps> = ({ 
  article, 
  products,
  url 
}) => {
  // Create Article schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": article.seo.schema.type || "Article",
    "headline": article.title,
    "description": article.description,
    "keywords": article.keywords.join(', '),
    "datePublished": article.lastUpdated,
    "dateModified": new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": article.seo.schema.organization || "Off-Grid Discounts",
      "url": "https://offgriddiscounts.vercel.app"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Off-Grid Discounts",
      "logo": {
        "@type": "ImageObject",
        "url": "https://offgriddiscounts.vercel.app/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "articleBody": `${article.content.intro} ${article.content.buyersGuide || ''} ${article.content.conclusion}`
  };

  // Create ItemList schema for products
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${article.title} - Product Comparison`,
    "description": `Curated list of the best ${article.keywords[0]} deals from Amazon and Cabela's`,
    "numberOfItems": products.length,
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.productName,
        "image": product.imageUrl,
        "url": product.dealLink,
        "brand": {
          "@type": "Brand",
          "name": product.retailer
        },
        "offers": {
          "@type": "Offer",
          "price": product.salePrice || product.amazonPrice || product.cabelasPrice || product.regularPrice,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": product.retailer
          },
          "url": product.dealLink
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": 4.5,
          "reviewCount": 100
        }
      }
    }))
  };

  // Create BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://offgriddiscounts.vercel.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Compare",
        "item": "https://offgriddiscounts.vercel.app/compare"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": url
      }
    ]
  };

  // Create FAQPage schema (for better rich snippets)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What are the best ${article.keywords[0]} in 2025?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": article.content.intro
        }
      },
      {
        "@type": "Question",
        "name": `How to choose the right ${article.keywords[0]}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": article.content.buyersGuide || "Consider your specific needs, budget, and use case when selecting products."
        }
      },
      {
        "@type": "Question",
        "name": "Where can I find the best deals?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We track daily deals from Amazon and Cabela's to find the biggest discounts on quality outdoor gear."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
};

export default React.memo(ArticleStructuredData);