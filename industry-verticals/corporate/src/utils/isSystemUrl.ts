import localDebug from '@/lib/_platform/logging/debug-log';
import { NextRequest } from 'next/server';

/**
 * Checks if a URL is a Sitecore system URL that should be ignored by middleware
 * This is the Next.js equivalent of the C# IsSitecoreUrl() extension method
 */
export function isSitecoreUrl(url: string): boolean {
  if (!url) return false;

  const urlLower = url.toLowerCase();

  // Sitecore system paths that should be ignored
  const sitecorePatterns = [
    '/sitecore/', // Sitecore admin/shell interfaces
    '/api/sitecore/', // Sitecore API endpoints
    '/-/media/', // Media library items
    '/-/jssmedia/', // JSS media items
    '/layouts/', // Layout files
    '/temp/', // Temp files
    '/sitecore/content/', // Content tree access
    '/sitecore/admin/', // Admin pages
    '/sitecore/shell/', // Shell interface
    '/sitecore/login/', // Login pages
    '/sitecore/service/', // Sitecore services
    '/_next/', // Next.js system files
    '/__nextjs_original-stack-frame', // Next.js dev mode
    '/favicon.ico', // Favicon requests
    '/robots.txt', // Robots file
    '/sitemap.xml', // Sitemap
    '/api/', // API routes (optional - depends on your setup)
  ];

  // Check for exact matches or starts with patterns
  return sitecorePatterns.some((pattern) => {
    if (pattern.endsWith('/')) {
      return urlLower.startsWith(pattern);
    }
    return (
      urlLower === pattern ||
      urlLower.startsWith(pattern + '/') ||
      urlLower.startsWith(pattern + '?')
    );
  });
}

/**
 * Additional check for JSS-specific URLs
 */

const JSS_SYSTEM_URL_REGEX = new RegExp(
  ['^/api/editing/', '^/api/layout/', '^/api/auth/', '^/api/jss/', '^/-/jss/'].join('|'),
  'i'
);

export function isJssSystemUrl(url: string): boolean {
  if (!url) return false;

  const urlLower = url.toLowerCase();

  return Boolean(urlLower && JSS_SYSTEM_URL_REGEX.test(urlLower));
}

/**
 * Combined check for all system URLs
 */
export function isSystemUrl(url: string): boolean {
  return isSitecoreUrl(url) || isJssSystemUrl(url);
}

/**
 * Checks if a URL is a static asset that should be ignored by middleware
 */
export function isAssetUrl(url: string): boolean {
  if (!url) return false;

  const assetExtensions = [
    '.svg',
    '.json',
    '.html',
    '.xml',
    '.js',
    '.css',
    '.map',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.ico',
    '.webp',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.otf',
    '.pdf',
    '.zip',
    '.txt',
    '.mp4',
    '.webm',
    '.ogg',
    '.mp3',
    '.wav',
  ];

  const urlLower = url.toLowerCase();
  return assetExtensions.some((ext) => urlLower.endsWith(ext));
}

/**
 * Block prefetch requests
 */
export function isPrefetchRequest(req: Request): boolean {
  const purpose = req.headers.get('purpose');
  const nextRouter = req.headers.get('next-router-prefetch');

  // Block prefetch
  return purpose === 'prefetch' || nextRouter === '1';
}

/** Experience Editor / Pages detection */
export function isExperienceEditor(req: NextRequest): boolean {
  const url = req.nextUrl;
  const qs = url.searchParams;

  // Common markers in EE/Pages
  const scMode = (qs.get('sc_mode') || '').toLowerCase(); // edit | preview
  const scItem = qs.get('sc_itemid');
  const scLang = qs.get('sc_lang');
  const scSite = qs.get('sc_site');

  // sometimes adds different params/headers; cover what we can:
  const pagesMode = (qs.get('pagesMode') || '').toLowerCase(); // edit | preview (defensive)
  const referer = (req.headers.get('referer') || '').toLowerCase();

  // Sitecore sets cookies during editing/preview
  const cookies = req.cookies;
  const scExpView = cookies.get('sc_expview')?.value; // EE presence cookie
  const scModeCookie = (cookies.get('SC_MODE')?.value || '').toLowerCase(); // sometimes set to 'edit' or 'preview'

  // Requests happening inside the editing shell/iframe
  const editingShellReferrer =
    referer.includes('/sitecore/shell') ||
    referer.includes('/sitecore/client/applications/experienceeditor') ||
    referer.includes('/sitecore/client/applications/pages');

  // Direct editing/layout APIs (already handled by isJssSystemUrl, but belt & suspenders)
  const editingApi =
    url.pathname.toLowerCase().startsWith('/api/editing/') ||
    url.pathname.toLowerCase().startsWith('/sitecore/api/editing/') ||
    url.pathname.toLowerCase().startsWith('/sitecore/api/layout/');

  const isEditOrPreview =
    scMode === 'edit' ||
    scMode === 'preview' ||
    pagesMode === 'edit' ||
    pagesMode === 'preview' ||
    scModeCookie === 'edit' ||
    scModeCookie === 'preview' ||
    Boolean(scExpView) ||
    editingShellReferrer ||
    editingApi ||
    // Experience Editor often appends these when rendering a content item
    Boolean(scItem && (scLang || scSite));

  if (isEditOrPreview) {
    localDebug.geolocation(`[Geolocation] Detected Experience Editor/Pages: ${url.pathname}`);
  }
  return isEditOrPreview;
}

/**
 * Comprehensive check to determine if middleware should skip processing this request
 */
export function shouldSkipRequest(req: NextRequest, url: string): boolean {
  localDebug.geolocation(
    `[Geolocation] shouldSkipRequest: ${url}, method: ${req.method} purpose: ${req.headers.get(
      'purpose'
    )}, nextRouter: ${req.headers.get('next-router-prefetch')} isSystemUrl: ${isSystemUrl(
      url
    )}, isAssetUrl: ${isAssetUrl(url)}, isPrefetchRequest: ${isPrefetchRequest(req)}`
  );

  if (isExperienceEditor(req)) {
    return true;
  }

  if (req.method === 'HEAD' && !isPrefetchRequest(req)) {
    localDebug.geolocation(`[Geolocation] HEAD request but not prefetch: ${url}`);
    return true; // Allow HEAD requests unless they are prefetch
  }

  if (req.method !== 'GET') {
    localDebug.geolocation(`[Geolocation] Skipping non-GET request: ${req.method}`);
    return true;
  }

  // Skip system URLs
  if (isSystemUrl(url)) {
    localDebug.geolocation(`[Geolocation] Skipping system URL: ${url}`);
    return true;
  }

  // Skip asset requests
  if (isAssetUrl(url)) {
    localDebug.geolocation(`[Geolocation] Skipping asset URL: ${url}`);
    return true;
  }

  // Skip explicit prefetch requests
  if (isPrefetchRequest(req)) {
    localDebug.geolocation(`[Geolocation] Skipping prefetch request: ${url}`);
    return true;
  }

  // Skip Next.js data requests (internal routing data)
  if (req.headers.get('x-nextjs-data') === '1') {
    localDebug.geolocation(`[Geolocation] Skipping Next.js data request: ${url}`);
    return true;
  }

  return false;
}
