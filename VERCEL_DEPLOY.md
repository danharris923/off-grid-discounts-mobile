# Vercel Deployment Guide

## Quick Deploy
1. Connect your GitHub repo to Vercel
2. Import project: `https://github.com/danharris923/off-grid-discounts-mobile`
3. Set environment variables (see below)
4. Deploy!

## Required Environment Variables
Add these in Vercel Dashboard → Project → Settings → Environment Variables:

### Google Sheets API
```
REACT_APP_GOOGLE_SHEETS_API_KEY=your_api_key_here
REACT_APP_GOOGLE_SHEETS_ID=your_sheet_id_here
```

### Affiliate Programs
```
REACT_APP_AMAZON_AFFILIATE_TAG=offgriddisc06-20
REACT_APP_RAKUTEN_AFFILIATE_ID=your_id_here
```

## Build Settings
- **Framework Preset**: Create React App
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `build` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

## Features Enabled
✅ **SPA routing** - All routes redirect to index.html  
✅ **Static asset caching** - 1 year cache for /static files  
✅ **Security headers** - XSS protection, content sniffing protection  
✅ **Mobile optimization** - New bottom sheet compare UI  
✅ **SEO ready** - Sitemap, structured data, meta tags  

## Post-Deployment
1. Test mobile compare functionality
2. Verify Google Sheets data loading
3. Check affiliate links work correctly
4. Test across different devices/browsers

## Custom Domain (Optional)
Add your domain in Vercel Dashboard → Project → Settings → Domains