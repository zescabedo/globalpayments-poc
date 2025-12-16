import { NextRequest, NextResponse } from 'next/server';
import { MiddlewareContext, MiddlewarePlugin } from '..';
import localDebug from '@/lib/_platform/logging/debug-log';
import { getSiteInfo } from '@/utils/getSiteInfo';
import { Site, sites } from '@/utils/locales';

class SSRProxyPlugin implements MiddlewarePlugin {
  private async getSSRPagePaths(req: NextRequest, language: string): Promise<string[]> {
    try {
      const languageValue = language || req.nextUrl.locale;
      const siteName = getSiteInfo(req)?.name?.toLowerCase();
      const hostname = req?.headers?.get('x-forwarded-host') || req?.nextUrl?.hostname;
      const baseUrl = `${req.nextUrl.protocol}//${hostname}`;
      const fetchUrl = `${baseUrl}/${languageValue}/ssr-routes/${siteName}/get-ssr-routes`;

      localDebug.ssrRouting(`[SSR Routing] Fetching SSR routes from: ${fetchUrl}`);

      // Forward relevant headers from original request
      const headers = new Headers({
        'Cache-Control': 'no-cache',
        Accept: 'application/json',
        'x-forwarded-host': hostname,
        'x-real-ip': req.headers.get('x-real-ip') || '',
        'x-forwarded-for': req.headers.get('x-forwarded-for') || '',
        'x-forwarded-proto': req.headers.get('x-forwarded-proto') || 'https',
        cookie: req.headers.get('cookie') || '',
      });

      // Forward any authorization headers if present
      const authHeader = req.headers.get('authorization');
      const fetchOptions = {
        headers,
        credentials: undefined as RequestCredentials | undefined,
      };

      if (authHeader) {
        headers.set('authorization', authHeader);
        fetchOptions.credentials = 'include';
      }

      // Also include credentials if there are cookies that might be needed
      const cookies = req.headers.get('cookie');
      if (cookies && cookies.length > 0) {
        fetchOptions.credentials = 'include';
      }

      const response = await fetch(fetchUrl, fetchOptions);

      if (!response.ok) {
        const logData = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url,
        };

        localDebug.ssrRouting('[SSR Routing] Failed to fetch SSR routes: %o', logData);
        return [];
      }

      // Get the script element content and parse it
      const html = await response.text();

      // Find start and end indices of the JSON content
      const startTag = '<script id="ssr-routes-data" type="application/json">';
      const endTag = '</script>';

      const startIndex = html.indexOf(startTag) + startTag.length;
      const endIndex = html.indexOf(endTag, startIndex);

      if (startIndex !== -1 && endIndex !== -1) {
        const jsonContent = html.substring(startIndex, endIndex);
        const data = JSON.parse(jsonContent);
        localDebug.ssrRouting(`[SSR Routing] Parsed ${data.routes?.length || 0} routes from API`);
        return data.routes || [];
      }

      localDebug.ssrRouting(`[SSR Routing] Could not find script tag in response`);
      return [];
    } catch (error) {
      localDebug.ssrRouting('Error fetching SSR routes in middleware:', error);
      return [];
    }
  }

  async exec(
    req: NextRequest,
    res?: NextResponse,
    context?: MiddlewareContext
  ): Promise<NextResponse> {
    const path = req.nextUrl.pathname.toLowerCase();

    if (context?.isRedirectProcessed) {
      localDebug.ssrRouting(
        `[SSR Routing] Skipping SSR processing because redirect is being processed`
      );
      return res || NextResponse.next();
    }

    // Skip processing for Sitecore edit mode
    const url = new URL(req.url);
    localDebug.ssrRouting(`[SSR Routing] Incoming url: ${req.url}, url: ${JSON.stringify(url)}`);
    if (url.searchParams.get('sc_mode') === 'edit' || url.searchParams.has('sc_site')) {
      localDebug.ssrRouting(
        `[SSR Routing] Skipping request in Sitecore Experience Editor: ${req.url}`
      );
      return res || NextResponse.next();
    }

    const siteName = getSiteInfo(req)?.name;
    const requestedLocale = req?.nextUrl?.locale;
    const site = sites.find((site: Site) => site.name.toLowerCase() === siteName?.toLowerCase());

    const language = context?.languageCookie || site?.defaultLanguage || requestedLocale;

    localDebug.ssrRouting(
      `[SSR Routing] Processing request for path: ${path}, site: ${siteName} language ${language}, requeste-locale: ${requestedLocale}, isRedirectProcessed: ${context?.isRedirectProcessed}`
    );

    try {
      // Get dynamic rewrites from the API (which uses manual cache)
      const dynamicRewrites = await this.getSSRPagePaths(req, language);
      localDebug.ssrRouting(
        `[SSR Routing] Received ${dynamicRewrites.length} dynamic rewrites:`,
        dynamicRewrites
      );

      // Convert wildcard routes to regex patterns and check for matches
      const isSSRRoute = dynamicRewrites.some((route: string) => {
        if (route.includes(',-w-,')) {
          // First replace the wildcard marker before escaping
          const routeWithWildcard = route.replace(/,-w-,/g, '__WILDCARD__');
          // Then escape special regex characters
          const escapedRoute = routeWithWildcard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // Replace our temporary wildcard marker with regex pattern
          const regexPattern =
            '^' + escapedRoute.replace(/__WILDCARD__/g, '([^/]+(?:/[^/]+)*)') + '$';
          const routeRegex = new RegExp(regexPattern, 'i');

          localDebug.ssrRouting(
            `[SSR Routing] Testing wildcard route '${route}' (pattern: ${regexPattern}) against path '${path}'`
          );

          return routeRegex.test(path);
        } else {
          // Exact match for non-wildcard routes
          const matches = path === route.toLowerCase();
          localDebug.ssrRouting(
            `[SSR Routing] Testing exact route '${route}' against path '${path}': ${matches}`
          );
          return matches;
        }
      });

      // Early return if no routes found or path doesn't match
      if (!dynamicRewrites.length || !isSSRRoute) {
        localDebug.ssrRouting(`[SSR Routing] No matching SSR route found for path ${path}`);
        return res || NextResponse.next();
      }

      localDebug.ssrRouting(`[SSR Routing] Found matching SSR route for path ${path}`);

      const currentUrl = new URL(req.url);

      localDebug.ssrRouting(`[SSR Routing] CurrentUrl.pathname ${currentUrl.pathname}`);

      const pathnameWithoutLocale = currentUrl.pathname.replace(
        /^\/[a-z]{2}(-[a-z]{2})?(?:\/|$)/i,
        '/'
      );
      localDebug.ssrRouting(`[SSR Routing] Pathname without locale ${pathnameWithoutLocale}`);

      // Add language to the SSR path to preserve exact locale version
      const newUrl = new URL(
        `/${language}/_ssr/_site_${siteName}${pathnameWithoutLocale}${
          currentUrl.searchParams.size > 0 ? '?' + currentUrl.searchParams : ''
        }`,
        req.url
      );

      localDebug.ssrRouting(`[SSR Routing] Rewriting '${path}' to '${newUrl.pathname}'`);

      const response = NextResponse.rewrite(newUrl);

      // Preserve cookies from previous plugins
      if (res) {
        // Copy all cookies from the previous response
        const existingCookies = res.cookies.getAll();
        const cookies = Array.isArray(existingCookies) ? existingCookies : [];

        localDebug.ssrRouting(
          `[SSR Routing] Preserving ${cookies.length} cookies from previous plugins`
        );

        cookies.forEach((cookie) => {
          response.cookies.set(cookie.name, cookie.value, {
            domain: cookie.domain,
            expires: cookie.expires,
            httpOnly: cookie.httpOnly,
            maxAge: cookie.maxAge,
            path: cookie.path,
            sameSite: cookie.sameSite,
            secure: cookie.secure,
          });
        });

        if (cookies.length > 0) {
          const cookieList = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join(', ');
          localDebug.ssrRouting(`[SSR Routing] Preserved ${cookies.length} cookies: ${cookieList}`);
        }
      } else {
        localDebug.ssrRouting(`[SSR Routing] No previous response to preserve cookies from`);
      }

      return response;
    } catch (error) {
      localDebug.ssrRouting('Error in SSRProxyPlugin:', error);
      return res || NextResponse.next();
    }
  }
}

export const ssrProxyPlugin = new SSRProxyPlugin();
