/**
 * Centralized API configuration.
 *
 * The base URL is resolved from Vite's environment variables:
 *   - Local development: VITE_API_URL=http://localhost:5000/api  (set in .env.local)
 *   - Production:        VITE_API_URL=https://eventopia-1-5.onrender.com/api  (set in Vercel env vars)
 *
 * Import this wherever you need the API base URL instead of hardcoding it.
 */

// The raw env value (e.g. "http://localhost:5000/api").
// Vite replaces import.meta.env.VITE_* at build time, so the value is baked
// into the bundle. The fallback keeps local dev working without any .env file.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Convenience: the base origin without /api (e.g. "http://localhost:5000").
// Useful if you ever need to construct a non-API URL to the same server.
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export default API_URL;
