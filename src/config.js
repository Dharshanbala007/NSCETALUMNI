// Central API configuration for deployment
// In production, set VITE_API_URL environment variable in Cloudflare Pages / Vercel / Render
// e.g., VITE_API_URL=https://nscet-alumni-api.onrender.com

const rawUrl = import.meta.env.VITE_API_URL || '';
const isLegacyUrl = rawUrl.includes('nscet-alumni-api.onrender.com') && !rawUrl.includes('apinew');
const API_BASE = (rawUrl && !isLegacyUrl) ? rawUrl : (import.meta.env.PROD ? 'https://nscet-alumni-apinew.onrender.com' : '');

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
};

export default API_BASE;

