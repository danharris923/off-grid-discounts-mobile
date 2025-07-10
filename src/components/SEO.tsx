import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  category?: string;
  dealCount?: number;
}

export const SEO: React.FC<SEOProps> = ({
  title = "Off-Grid Discounts - Best Deals on Solar, Generators, Power & Outdoor Gear",
  description = "Find the best deals on off-grid living essentials: solar panels, generators, portable power stations, outdoor gear and more. Save up to 70% with verified discounts.",
  keywords = "off-grid, solar panels, generators, portable power, outdoor gear, camping, deals, discounts, solar power, battery packs, jackery, yeti, carhartt",
  image = "https://offgriddiscounts.vercel.app/og-image.png",
  url = "https://offgriddiscounts.vercel.app/",
  type = "website",
  category,
  dealCount
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Update basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Update Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);

    // Update Twitter tags
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);
    updateMetaTag('twitter:url', url, true);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Create category-specific optimizations
    if (category) {
      const categoryTitles: Record<string, string> = {
        power: `Power Deals - Solar Panels & Battery Packs ${dealCount ? `(${dealCount} deals)` : ''} | Off-Grid Discounts`,
        generators: `Generator Deals - Portable & Backup Power ${dealCount ? `(${dealCount} deals)` : ''} | Off-Grid Discounts`,
        batteries: `Battery Deals - Power Banks & Solar Batteries ${dealCount ? `(${dealCount} deals)` : ''} | Off-Grid Discounts`,
        stoves: `Camping Stove Deals - Portable & Outdoor Cooking ${dealCount ? `(${dealCount} deals)` : ''} | Off-Grid Discounts`,
        solar: `Solar Panel Deals - Off-Grid Solar Power ${dealCount ? `(${dealCount} deals)` : ''} | Off-Grid Discounts`
      };

      const categoryDescriptions: Record<string, string> = {
        power: "Best deals on portable power stations, solar panels, and off-grid power solutions. Save on Jackery, Goal Zero, and more.",
        generators: "Top deals on portable generators, backup power, and emergency generators. Find the best prices on reliable power solutions.",
        batteries: "Great deals on power banks, solar batteries, and portable battery packs. Keep your devices charged off-grid.",
        stoves: "Camping stove deals and portable cooking solutions. Find discounts on camping gear and outdoor cooking equipment.",
        solar: "Solar panel deals and off-grid solar power equipment. Save on solar generators, panels, and complete solar systems."
      };

      if (categoryTitles[category]) {
        document.title = categoryTitles[category];
        updateMetaTag('description', categoryDescriptions[category]);
        updateMetaTag('og:title', categoryTitles[category], true);
        updateMetaTag('og:description', categoryDescriptions[category], true);
      }
    }

  }, [title, description, keywords, image, url, type, category, dealCount]);

  return null; // This component doesn't render anything visible
};

export default SEO;