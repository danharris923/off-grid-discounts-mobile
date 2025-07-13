// Application constants
export const APP_CONSTANTS = {
  // Pagination and loading
  ITEMS_PER_PAGE: 12,
  LOAD_MORE_INCREMENT: 12,
  
  // Pricing and discounts
  MINIMUM_DISCOUNT_PERCENT: 15,
  SIGNIFICANT_DISCOUNT_PERCENT: 20,
  
  // Comparison logic
  MINIMUM_KEYWORD_MATCHES: 2,
  MINIMUM_COMPARISON_SCORE: 3,
  MAX_COMPARISON_RESULTS: 12,
  MAX_KEYWORDS_TO_EXTRACT: 6,
  
  // Random generation ranges (being replaced with deterministic)
  RANDOM_MIN: 1000,
  RANDOM_MAX: 9000,
  
  // Price hiding thresholds
  HIGH_VALUE_THRESHOLD: 300,
  
  // Animation durations (ms)
  FADE_DURATION: 200,
  SLIDE_DURATION: 300,
  
  // Z-index values
  MODAL_Z_INDEX: 1000,
  TOOLTIP_Z_INDEX: 1001,
  
  // Image dimensions
  CARD_IMAGE_HEIGHT: 200,
  MOBILE_CARD_IMAGE_HEIGHT: 160,
  POPUP_IMAGE_SIZE: 100,
  MOBILE_POPUP_IMAGE_SIZE: 80,
  
  // Grid and spacing
  CARD_GAP: 16,
  POPUP_PADDING: 20,
  
  // Session and caching
  SESSION_STORAGE_KEY: 'offgrid-session-seed'
} as const;

// Google Sheets configuration
export const SHEETS_CONFIG = {
  RANGES: {
    SHEET1: 'Sheet1!A2:L1000', // Amazon deals
    SHEET2: 'Sheet2!A2:L1000', // Cabela's deals  
    SHEET3: 'Sheet3!A2:L1000'  // Cabela's clearance deals
  },
  MAX_ROWS: 1000
} as const;