# Off-Grid Discounts - Project Planning & Strategy

## Project Overview
Building a modern affiliate deals website called "Off-Grid Discounts" targeting off-grid living enthusiasts in Canada through a 150k member Facebook group.

## Key Audience Insights ⚠️ IMPORTANT
- **Target:** Canadian off-grid living Facebook group (150k members)
- **Challenge:** Right-wing, anti-corporate, anti-Amazon sentiment
- **Resistance:** Distrust of big corporations, government, traditional marketing
- **What Works:** Essential infrastructure items only
- **Proven Converters:** Solar lights, power generators, battery banks, diesel stoves

## Technical Stack Decision
- **Frontend:** React (user is comfortable with this stack)
- **Data Source:** Google Sheets API for deal curation
- **Hosting:** Static deployment (Vercel/Netlify for speed)
- **Update Strategy:** Nightly rebuilds (meets Amazon ToS requirements)

## Site Structure
- **Volume:** ~100 deals total
- **Loading:** Infinite scroll (20-25 initial, 15-20 per load)
- **Layout:** Magazine-style grid, mobile-first
- **Categories:** Focus on power/energy solutions primarily

## Affiliate Strategy - DUAL APPROACH 🎯
**Key Innovation:** Price comparison between retailers to build trust

### Affiliate Programs
1. **Amazon Associates** (complex API, universal availability)
2. **Rakuten/Cabela's** (better brand fit, developer account ready, simpler API)

### Comparison Card Strategy
```
[Product Image]
Product Name & Key Specs
Amazon: $899 (Prime shipping)
Cabela's: $949 (Free shipping to Canada)
👑 Best Deal: Amazon saves you $50
[Amazon Button] [Cabela's Button]
```

### Why This Works
- Transparency builds trust with skeptical audience
- Users choose their preferred retailer
- Positions you as helpful price-checker, not pushy affiliate
- Double commission opportunities
- Addresses anti-Amazon sentiment while still offering choice

## Google Sheets Structure
```
Product Name | Image URL | Amazon Price | Cabela's Price | Amazon Link | Cabela's Link | Deal End Date | Category | Featured
```

## Conversion Psychology for This Audience
- **Avoid:** Corporate marketing speak, flashy design, "SAVE NOW" urgency
- **Use:** Practical specs, honest comparisons, outdoor aesthetic
- **Messaging:** "I check both so you don't have to" / "Your choice - save money or support outdoor retailers"
- **Design:** Think REI meets deal aggregator - authentic, trustworthy, rugged

## Technical Next Steps

### Phase 1: Research & Setup
1. **API Research**
   - Explore Rakuten API capabilities (developer account ready)
   - Test Amazon Associates API for product data
   - Set up Google Sheets structure and API access

2. **UI Research & Design**
   - Analyze high-converting affiliate sites
   - Apply 2025 conversion optimization principles
   - Focus on mobile-first, fast-loading design

### Phase 2: MVP Development
1. **React Components**
   - Comparison deal cards
   - Infinite scroll container
   - Mobile-optimized layout
   - Countdown timers for deal expiration

2. **Data Integration**
   - Google Sheets API connection
   - Automated nightly rebuilds
   - Price comparison logic
   - Image optimization and lazy loading

### Phase 3: Optimization
1. **Conversion Testing**
   - A/B test card designs
   - Test messaging approaches
   - Optimize for mobile performance
   - Track click-through rates by retailer

## Key Success Factors
1. **Trust First:** Transparent comparison approach over pushy sales
2. **Mobile Speed:** Sub-2-second load times for Facebook traffic
3. **Category Focus:** Only proven converters (power, generators, batteries, stoves)
4. **Authentic Design:** Outdoor/rugged aesthetic that feels genuine
5. **Retailer Choice:** Let users pick Amazon vs Cabela's based on preference

## Questions to Resolve on Desktop
1. Rakuten API documentation and implementation
2. Product image sourcing strategy (direct from retailer sites?)
3. Automated price monitoring frequency
4. Category organization and filtering options
5. Facebook group posting strategy and timing

## Revenue Potential
- 150k targeted Facebook members
- Proven conversion on essential off-grid gear
- Dual affiliate programs = higher revenue per visitor
- Niche audience willing to spend on quality infrastructure

---

**Next Action:** Move to desktop, explore Rakuten API, and build React prototype with comparison cards.