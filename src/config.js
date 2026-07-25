// Central API configuration for deployment
// In production, set VITE_API_URL environment variable in Cloudflare Pages
// e.g., VITE_API_URL=https://nscet-alumni-api.onrender.com

const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;
