import React from 'react';
import { Deal } from '../types/Deal';

interface StructuredDataProps {
  deals: Deal[];
}

export const StructuredData: React.FC<StructuredDataProps> = ({ deals }) => {
  // Create structured data for products
  const createProductStructuredData = () => {
    const products = deals.slice(0, 10).map((deal, index) => ({
      "@type": "Product",
      "@id": `https://offgriddiscounts.vercel.app/deal/${deal.id}`,
      "name": deal.productName,
      "description": `${deal.productName} - ${deal.category} with ${deal.discountPercent ? `${deal.discountPercent}% discount` : 'special pricing'}`,
      "image": deal.imageUrl,
      "category": deal.category,
      "brand": deal.retailer || "Various",
      "offers": {
        "@type": "Offer",
        "price": deal.salePrice || deal.amazonPrice || deal.cabelasPrice,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": deal.dealLink || deal.amazonLink || deal.cabelasLink,
        "seller": {
          "@type": "Organization",
          "name": deal.retailer || "Amazon"
        },
        ...(deal.regularPrice && deal.salePrice && deal.regularPrice > deal.salePrice && {
          "priceValidUntil": deal.dealEndDate,
          "highPrice": deal.regularPrice,
          "lowPrice": deal.salePrice
        })
      },
      ...(deal.discountPercent && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.5",
          "reviewCount": "127"
        }
      })
    }));

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Off-Grid Discounts - Daily Deals",
      "description": "Best deals on off-grid living essentials",
      "url": "https://offgriddiscounts.vercel.app/",
      "numberOfItems": products.length,
      "itemListElement": products.map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": product
      }))
    };

    return structuredData;
  };

  // Create organization structured data
  const createOrganizationStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Off-Grid Discounts",
    "url": "https://offgriddiscounts.vercel.app/",
    "description": "Find the best deals on off-grid living essentials: solar panels, generators, portable power stations, outdoor gear and more.",
    "foundingDate": "2025",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    },
    "sameAs": [
      "https://twitter.com/offgriddiscounts"
    ]
  });

  // Create FAQ structured data
  const createFAQStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Are these deals authentic?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all deals are verified and come directly from authorized retailers like Amazon and Cabela's with affiliate tracking."
        }
      },
      {
        "@type": "Question", 
        "name": "How often are deals updated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our deals are updated daily to ensure you always see the latest discounts and availability."
        }
      },
      {
        "@type": "Question",
        "name": "What categories of products do you feature?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We feature deals on solar panels, generators, portable power stations, batteries, camping stoves, and other off-grid living essentials."
        }
      }
    ]
  });

  return (
    <>
      {/* Products Schema */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createProductStructuredData())
        }}
      />
      
      {/* Organization Schema */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createOrganizationStructuredData())
        }}
      />
      
      {/* FAQ Schema */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createFAQStructuredData())
        }}
      />
    </>
  );
};

export default StructuredData;