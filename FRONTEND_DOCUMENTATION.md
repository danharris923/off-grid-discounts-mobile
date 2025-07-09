# Off-Grid Discounts - Frontend Development Documentation

## Project Overview
**Repository:** https://github.com/danharris923/off_grid_discounts  
**Live Site:** https://offgriddiscounts.vercel.app/  
**Target Audience:** 150k Facebook group members interested in off-grid living  
**Business Model:** Dual affiliate system (Amazon + Rakuten/Cabela's)

## Architecture & Tech Stack

### Frontend Framework
- **React 18.1.0** with TypeScript
- **Create React App** for build system
- **Axios** for API calls
- **React Infinite Scroll Component** for pagination

### Hosting & Deployment
- **Vercel** for static hosting
- **Automatic deployment** from GitHub pushes
- **Environment variables** stored in Vercel dashboard

### Data Source
- **Google Sheets API** for real-time deal data
- **Fallback sample data** when API fails
- **No caching** - fresh data on every page load

## Design Philosophy

### Visual Design
- **Lululemon-inspired aesthetic** - clean, minimal, premium
- **Helvetica Neue typography** with careful spacing
- **Neutral color palette** - whites, grays, subtle accents
- **Mobile-first responsive** design

### Layout Strategy
- **Mixed card layout** - 3 single deals, 2 comparison deals, 3 single deals (repeating)
- **Horizontal balance** - 2-card rows span full width to match 3-card rows
- **Clean content hierarchy** - minimal clutter, focus on pricing

### User Experience
- **Infinite scroll** loading (20 initial, 15 per load)
- **Category filtering** (Power, Generators, Batteries, Stoves)
- **Search functionality** with real-time filtering
- **Hover effects** and smooth transitions

## Component Architecture

### Core Components

#### 1. App.tsx
- **Main container** with error handling
- **State management** for search and filters
- **Data fetching** coordination

#### 2. Header.tsx
- **Site branding** and navigation
- **Search input** with real-time filtering
- **Category filter buttons**
- **Clean, minimal design**

#### 3. ProductGrid.tsx
- **Mixed layout manager** (3-2-3 pattern)
- **Infinite scroll** implementation
- **Card type routing** (single vs comparison)
- **Responsive grid system**

#### 4. SingleDealCard.tsx
- **Single retailer deals**
- **Regular price vs sale price**
- **Clean pricing display**
- **Retailer branding**

#### 5. DealCard.tsx
- **Amazon vs Cabela's comparison**
- **Side-by-side pricing**
- **Savings calculation**
- **Dual CTA buttons**

### Data Flow

#### 1. Google Sheets Service
```typescript
googleSheetsService.fetchDeals() → Deal[] → ProductGrid → Cards
```

#### 2. Deal Type Interface
```typescript
interface Deal {
  // Universal fields
  id: string;
  productName: string;
  imageUrl: string;
  dealEndDate: string;
  category: 'power' | 'generators' | 'batteries' | 'stoves' | 'other';
  featured: boolean;
  cardType: 'comparison' | 'single';
  
  // Comparison cards
  amazonPrice?: number;
  cabelasPrice?: number;
  amazonLink?: string;
  cabelasLink?: string;
  savings?: number;
  bestDealRetailer?: 'amazon' | 'cabelas';
  
  // Single cards
  regularPrice?: number;
  salePrice?: number;
  dealLink?: string;
  retailer?: string;
  discountPercent?: number;
}
```

## Google Sheets Integration

### API Configuration
- **Endpoint:** `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}`
- **Range:** `Sheet1!A2:J1000` (skips header row)
- **Authentication:** API key in environment variables
- **Cache busting:** Timestamp parameter prevents stale data

### Expected Data Structure
| Column | Field | Type | Example |
|--------|-------|------|---------|
| A | Product Name | String | "Goal Zero Yeti 1500X" |
| B | Image URL | URL | "https://m.media-amazon.com/images/..." |
| C | Price 1 | Number | 649 (Amazon) or 1899.99 (Regular) |
| D | Price 2 | Number | 699.99 (Cabela's) or 1599.99 (Sale) |
| E | Link 1 | URL | Amazon link or Deal link |
| F | Link 2 | URL | Cabela's link or Retailer name |
| G | Deal End Date | Date | "2025-07-16" |
| H | Category | String | "power", "generators", "batteries", "stoves" |
| I | Featured | Boolean | "true" or "false" |
| J | Card Type | String | "comparison" or "single" |

### Data Processing
1. **Fetch from Google Sheets API**
2. **Parse row data** based on card type
3. **Calculate savings** and best deals
4. **Apply affiliate links** automatically
5. **Fallback to sample data** on API failure

## Affiliate Link Management

### Amazon Associates
- **Tag:** `offgriddisc06-20`
- **Implementation:** `buildAmazonAffiliateLink()`
- **Automatic appending** to all Amazon URLs

### Rakuten/Cabela's
- **ID:** `zfk8GYin9vz9mfukcRN8iD99jg2kb9PW`
- **Implementation:** `buildRakutenAffiliateLink()`
- **Deep linking** through Rakuten network

## Environment Variables

### Required in Vercel
```env
REACT_APP_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here
REACT_APP_GOOGLE_SHEETS_ID=your_google_sheet_id_here
REACT_APP_AMAZON_AFFILIATE_TAG=your_amazon_affiliate_tag_here
REACT_APP_RAKUTEN_AFFILIATE_ID=your_rakuten_affiliate_id_here
```

## Responsive Design

### Breakpoints
- **Mobile:** < 768px (single column)
- **Tablet:** 769px - 1024px (2 columns)
- **Desktop:** > 1024px (3 columns for row-3, 2 for row-2)

### Mobile Optimizations
- **Touch-friendly** buttons (44px minimum)
- **Readable typography** (14px+ font sizes)
- **Simplified layouts** (single column grid)
- **Fast loading** (lazy loaded images)

## Performance Considerations

### Image Optimization
- **Lazy loading** for all product images
- **Error handling** for failed image loads
- **Responsive images** with proper sizing

### Data Loading
- **Infinite scroll** reduces initial load time
- **Fresh data** on every visit (no stale cache)
- **Fallback content** prevents empty states

### Bundle Size
- **Minimal dependencies** (only essential packages)
- **Tree shaking** enabled via Create React App
- **Code splitting** ready for future expansion

## Development Workflow

### Local Development
```bash
npm start  # Port 3100 for development
```

### Deployment
```bash
git add -A
git commit -m "Description"
git push origin master  # Auto-deploys to Vercel
```

### Environment Management
- **Local:** `.env` file (gitignored)
- **Production:** Vercel environment variables
- **API keys** configured in Vercel dashboard

## Future Enhancements

### Immediate Improvements
1. **Real-time updates** (WebSocket or polling)
2. **Advanced filtering** (price ranges, brands)
3. **Wishlist functionality** 
4. **Email notifications** for deal alerts

### Analytics Integration
1. **Click tracking** for affiliate links
2. **Conversion metrics** by retailer
3. **User behavior** analysis
4. **A/B testing** framework

## Scraper Team Requirements

### Data Output Format
The scraper should populate the Google Sheet with exactly 10 columns (A-J) following the structure above.

### Critical Requirements
1. **Accurate pricing** - prices must be current and correct
2. **Working image URLs** - all images must load properly
3. **Valid affiliate links** - links should redirect correctly
4. **Consistent categories** - use only: power, generators, batteries, stoves
5. **Card type designation** - specify "comparison" or "single" in column J

### Update Frequency
- **Daily updates** recommended
- **Real-time sync** - changes appear immediately on site
- **No manual intervention** required after sheet update

## Contact & Handoff
- **Repository:** https://github.com/danharris923/off_grid_discounts
- **Live Site:** https://offgriddiscounts.vercel.app/
- **Google Sheet:** https://docs.google.com/spreadsheets/d/1RU6FR-86YDlccVkeNCwlCmYkzKELj40Gr8RuNmnUpaY/
- **Vercel Project:** Connected to GitHub for auto-deployment

The frontend is production-ready and waiting for real scraper data. Once the Google Sheet is populated correctly, the site will automatically display live deals with proper affiliate tracking.