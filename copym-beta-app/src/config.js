// Environment-based configuration using Vite env variables
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

// Get API URLs from environment variables
const devApiUrl = import.meta.env.VITE_API_BASE_URL_DEV || 'http://localhost:5000';
const prodApiUrl = import.meta.env.VITE_API_BASE_URL_PROD || 'https://api.copym.xyz';
const fallbackApiUrl = import.meta.env.VITE_API_FALLBACK_URL || 'http://139.59.29.69:5000';

// Frontend URLs
const devFrontendUrl = import.meta.env.VITE_FRONTEND_URL_DEV || 'http://localhost:5173';
const prodFrontendUrl = import.meta.env.VITE_FRONTEND_URL_PROD || 'https://issuer.copym.xyz';

// App info
const appName = import.meta.env.VITE_APP_NAME || 'CopyM Beta';
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Main configuration object
const config = {
  // Primary API endpoint based on environment
  API_BASE_URL: isProd ? prodApiUrl : devApiUrl,
  
  // Fallback endpoint for production (if primary fails)
  API_FALLBACK_URL: fallbackApiUrl,
  
  // Frontend URL
  FRONTEND_URL: isProd ? prodFrontendUrl : devFrontendUrl,
  
  // App information
  APP_NAME: appName,
  APP_VERSION: appVersion,
  
  // Environment info
  NODE_ENV: isProd ? 'production' : 'development',
  IS_DEVELOPMENT: isDev,
  IS_PRODUCTION: isProd,
  
  // All available endpoints for reference
  ENDPOINTS: {
    development: devApiUrl,
    production: prodApiUrl,
    fallback: fallbackApiUrl
  }
};

export default config;

// Named exports for convenience
export const { 
  API_BASE_URL, 
  API_FALLBACK_URL,
  FRONTEND_URL,
  APP_NAME,
  APP_VERSION,
  NODE_ENV,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  ENDPOINTS
} = config; 