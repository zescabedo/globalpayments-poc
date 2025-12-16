import { NextRequest, NextResponse } from 'next/server';
import config from '@/temp/config';
import { MiddlewareContext, MiddlewarePlugin } from '..';
import localDebug from '@/lib/_platform/logging/debug-log';
import { graphqlFetcher } from '@/utils/graphqlFetcher';
import { GeolocationConstants, CountryToLanguageMappingTemplate } from '@/constants/appConstants';
import { GET_LOCALE_FROM_COUNTRY_CODE } from '@/queries/getLocaleFromCountryCode';
import {
  sites,
  Site,
  getUptickConfig,
  isUptickLocaleSupported,
  getCookieDomain,
  isUptickPath,
  removeLocaleFromPath,
} from '@/utils/locales';
import { GET_PAGE_GEO_AND_COUNTRY_TO_LANGUAGE_ID } from '@/queries/getPageGeoAndCountryToLanguageID';
import { getSiteInfo } from '@/utils/getSiteInfo';
import { SiteInfo } from '@sitecore-jss/sitecore-jss-nextjs';
import { getClientIp } from '@/utils/getClientIp';
import { shouldSkipRequest } from '@/utils/isSystemUrl';
import { maskString } from '@/utils/stringUtils';

export class GeolocationPlugin implements MiddlewarePlugin {
  async exec(
    req: NextRequest,
    res?: NextResponse,
    context?: MiddlewareContext
  ): Promise<NextResponse> {
    const url = req.nextUrl;
    const locale = req.nextUrl.locale;
    const pathname = url.pathname;

    // Skip unwanted requests
    if (shouldSkipRequest(req, pathname) && pathname !== '/') {
      localDebug.geolocation(`[Geolocation] Skipping request: ${pathname}`);
      return res || NextResponse.next();
    }

    // Check for geo-specific redirect cookie
    const geoRedirectCookie = req.cookies.get(GeolocationConstants.geoRedirectCookieName);
    const isGeoRedirectProcessed = geoRedirectCookie?.value === 'true';

    if (isGeoRedirectProcessed) {
      localDebug.geolocation(`[Geolocation] Skipping due to recent geo redirect`);
      return res || NextResponse.next();
    }

    localDebug.geolocation(`[Geolocation] Processing request: ${pathname}`);

    const siteInfo = getSiteInfo(req);
    const siteName = siteInfo?.name;
    const protocol = req.nextUrl.protocol || 'https:';
    const hostname = req?.headers?.get('x-forwarded-host') || req?.nextUrl?.hostname;

    // Get the correct target hostname and virtual folder
    const { targetHostname, virtualFolder } = this.getTargetHostnameAndVirtualFolder(
      siteInfo as SiteInfo,
      hostname
    );

    const site = sites.find((site: Site) => site.name.toLowerCase() === siteName?.toLowerCase());

    // Flatten and trim all locale values from site.languages object
    const siteValidLocales = site
      ? Object.values(site.languages)
          .flat()
          .map((locale: string) => locale.trim().toLowerCase())
      : [];

    // Extract siteId and site default language.
    const siteId: string | null = site?.id ?? null;
    const siteDefaultLanguage: string | null = site?.defaultLanguage ?? null;
    const languageEmbedToDefaultLanguage: boolean = site?.languageEmbedToDefaultLanguage ?? true;

    // Get cookie domain for this site (e.g., '.globalpayments.com' or '.tsys.com')
    const cookieDomain = getCookieDomain(siteName as string, hostname);

    // Use URL class for cleaner path handling
    const urlObj = new URL(req.url);

    const fullPathWithLocale = urlObj.pathname;

    localDebug.geolocation(`[Geolocation] fullPathWithLocale ${fullPathWithLocale}`);

    const localeFromURL = this.getLocaleFromURL(fullPathWithLocale);

    localDebug.geolocation(`[Geolocation] Request URL: ${req.url}`);
    localDebug.geolocation(`[Geolocation] Request pathname: ${pathname}`);
    localDebug.geolocation(`[Geolocation] Request locale: ${locale}`);
    localDebug.geolocation(`[Geolocation] Request fullPathWithLocale: ${fullPathWithLocale}`);
    localDebug.geolocation(`[Geolocation] Site ID: ${siteId}`);
    const languageCookie =
      context?.languageCookie ||
      context?.getCookieFromPlugins?.('language') ||
      req.cookies.get(GeolocationConstants.languageCookieName)?.value ||
      req.cookies.get('gpn_language')?.value; // Backward compatibility with old cookie name
    localDebug.geolocation(
      `[Geolocation] Language cookie from context: ${context?.languageCookie}`
    );
    localDebug.geolocation(
      `[Geolocation] Language cookie from request: ${
        req.cookies.get(GeolocationConstants.languageCookieName)?.value
      }`
    );
    localDebug.geolocation(`[Geolocation] Final language cookie value: ${languageCookie}`);
    localDebug.geolocation(`[Geolocation] Site default language: ${siteDefaultLanguage}`);
    localDebug.geolocation(`[Geolocation] Hostname by NextUrl: ${req.nextUrl.hostname}`);
    localDebug.geolocation(`[Geolocation] Site name: ${siteName}`);
    localDebug.geolocation('[Geolocation] Geolocation middleware triggered.');
    localDebug.geolocation(`[Geolocation] Locale found in URL initially: ${localeFromURL}.`);
    localDebug.geolocation(`[Geolocation] Site valid locales: ${siteValidLocales}.`);
    localDebug.geolocation(`[Geolocation] Site data: ${JSON.stringify(site)}`);

    // 1. SITE DETECTION CHECK - If it is disabled don't do anything.
    const siteGeoDetectionFlag: boolean | undefined = site?.enableGeoDetection;

    if (siteGeoDetectionFlag === false) {
      localDebug.geolocation(
        `[Geolocation] Site-level geo-detection for site ${site?.name} is disabled.`
      );
      return res || NextResponse.next();
    }

    // 2. Prioritize Locale found in URL
    if (localeFromURL) {
      localDebug.geolocation(
        `[Geolocation] Triggering locale found in URL. Locale: ${localeFromURL}`
      );
      const localeLower = localeFromURL.toLowerCase();

      // Check if URL contains locale prefix for configured paths and should be normalized
      // Example: /en-us/insights → /insights (if en-us is default and site config hides default locale)
      // Supports both 2-letter (/en/) and 4-letter (/en-us/) locale prefixes
      const matchesConfiguredPath = isUptickPath(pathname, siteName);
      const uptickConfig = getUptickConfig(siteName);
      const isDefaultLocale = uptickConfig && localeLower === siteDefaultLanguage?.toLowerCase();
      const shouldHideDefaultLocale = uptickConfig && !languageEmbedToDefaultLanguage;

      if (matchesConfiguredPath && isDefaultLocale && shouldHideDefaultLocale) {
        // Remove default locale prefix from URL for SEO compliance
        // Example: /en-us/insights → /insights (where en-us is the configured default language)
        const cleanPath = removeLocaleFromPath(pathname, siteName);
        const redirectUrl = this.buildCorrectUrl(
          cleanPath,
          targetHostname,
          virtualFolder,
          protocol
        );

        const response = NextResponse.redirect(new URL(redirectUrl));
        this.setLanguageCookie(
          response,
          localeLower,
          cookieDomain,
          GeolocationConstants.languageCookieMaxAge
        );

        // Mark redirect as processed
        if (context) {
          context.isRedirectProcessed = true;
        }

        localDebug.geolocation(
          `[Geolocation] Normalizing /en-us/insights → /insights for SEO. Redirecting to: ${redirectUrl}`
        );

        return response;
      }

      // Check if this is a locale that needs proxying BEFORE any other processing
      const { needsProxy, targetHost } = this.needsProxying(hostname, localeLower);

      if (needsProxy && targetHost) {
        if (siteValidLocales.includes(localeLower)) {
          // Use internal API proxy for external content
          const proxyPath = `/${localeLower}${pathname.replace(`/${localeLower}`, '')}`;
          const proxyUrl = new URL(`/api/proxy/rewrite${proxyPath}`, req.url); // Remove '/rewrite'

          // Create the rewrite response
          const proxyResponse = NextResponse.rewrite(proxyUrl);

          // Set cookie on the proxy response
          proxyResponse.cookies.set(GeolocationConstants.languageCookieName, localeLower, {
            path: '/',
          });

          // Add target host as header for the proxy
          proxyResponse.headers.set('x-target-host', targetHost);

          localDebug.geolocation(
            `[Geolocation] Proxying ${localeLower} content via internal API from ${targetHost}. Path: ${proxyPath}`
          );

          return proxyResponse;
        } else {
          // Invalid proxy locale - redirect to homepage
          const redirectUrl = this.buildCorrectUrl('/', targetHostname, virtualFolder, protocol);
          const response = NextResponse.redirect(new URL(redirectUrl));
          if (context) {
            context.isRedirectProcessed = true;
          }
          response.cookies.set(GeolocationConstants.languageCookieName, '', {
            path: '/',
            maxAge: 0,
          });
          localDebug.geolocation(
            `[Geolocation] Invalid proxy locale "${localeLower}". Redirecting to homepage: ${redirectUrl}`
          );
          return response;
        }
      }

      // If valid locale, set cookie and continue
      if (siteValidLocales.includes(localeLower)) {
        const response = res || NextResponse.next();

        // Clear geo redirect cookie on success
        this.manageGeoRedirectCookie(response, false);

        if (context) {
          context.languageCookie = localeLower;
          context.setCookieForPlugins?.('language', localeLower);
        }

        localDebug.geolocation(
          `[Geolocation] Valid locale "${localeLower}" found in URL. Proceeding normally.`
        );
        return response;
      }

      // ❌ If invalid locale, delete cookie and redirect to root site
      const redirectUrl = this.buildCorrectUrl('/', targetHostname, virtualFolder, protocol);
      const response = NextResponse.redirect(new URL(redirectUrl));
      if (context) {
        context.isRedirectProcessed = true;
      }
      response.cookies.set(GeolocationConstants.languageCookieName, '', {
        path: '/',
        maxAge: 0, // Delete the cookie
      });
      localDebug.geolocation(
        `[Geolocation] Invalid locale "${localeLower}" in URL. Deleted cookie and redirecting to homepage: ${redirectUrl}`
      );
      return response;
    }

    localDebug.geolocation(`[Geolocation] locale not found in the URL.`);

    // 3. Page level geo-detection check starts.
    if (!siteId) {
      localDebug.geolocation(
        ' [Geolocation] Site ID is null. Cannot fetch page geo and language mapping ID.'
      );
      return res || NextResponse.next();
    }

    // Check page-level geo-detection flag and mapping ID
    const { enableGeoDetection, mappingId: CountryToLanguageMappingItemId } =
      await this.getPageGeoAndLanguageMappingID(
        siteName as string,
        siteId,
        fullPathWithLocale,
        siteDefaultLanguage as string
      );

    localDebug.geolocation(
      `[Geolocation] Page-level geo-detection: ${enableGeoDetection}, Mapping ID: ${CountryToLanguageMappingItemId}`
    );

    if (!enableGeoDetection) {
      localDebug.geolocation(`[Geolocation] Page-level geo-detection is disabled.`);
      const localeCookieRaw = req.cookies.get(GeolocationConstants.languageCookieName)?.value;
      const localeCookie = localeCookieRaw?.toLowerCase();

      if (!localeCookie || !siteValidLocales.includes(localeCookie)) {
        // No valid cookie -> set default and render (your existing code)
        const response = res || NextResponse.next();
        const defaultLang = siteDefaultLanguage?.toLowerCase() || 'en';
        response.cookies.set(GeolocationConstants.languageCookieName, defaultLang, { path: '/' });
        localDebug.geolocation(
          `[Geolocation] Page-level detection disabled, no valid cookie; setting default language cookie: ${defaultLang}.`
        );
        return response;
      }

      // We have a valid cookie
      if (localeCookie === siteDefaultLanguage?.toLowerCase()) {
        // Cookie is default -> just render
        localDebug.geolocation(
          `[Geolocation] Detection disabled; cookie locale is default. Rendering page without redirect.`
        );
        return res || NextResponse.next();
      }

      // Check proxy (your existing proxy rewrite stays as-is)
      const { needsProxy, targetHost } = this.needsProxying(hostname, localeCookie);
      if (needsProxy && targetHost) {
        const proxyPath = `/${localeCookie}${pathname}`;
        const proxyUrl = new URL(`/api/proxy/rewrite${proxyPath}`, req.url);
        const response = NextResponse.rewrite(proxyUrl);
        response.headers.set('x-target-host', targetHost);
        localDebug.geolocation(
          `[Geolocation] Proxying via internal API to: ${targetHost}${proxyPath}`
        );
        return response;
      }

      // NEW: non-default, non-proxy -> redirect to cookie-locale path on this site
      const redirectUrl = this.buildCorrectUrl(
        `/${localeCookie}${pathname}`,
        targetHostname,
        virtualFolder,
        protocol
      );
      if (context) {
        context.isRedirectProcessed = true;
      }
      localDebug.geolocation(
        `[Geolocation] Detection disabled; redirecting to cookie locale path: ${redirectUrl}`
      );
      return NextResponse.redirect(new URL(redirectUrl));
    }

    // 4. NOW check existing cookie (only when geo-detection is enabled)
    const localeCookie = req.cookies.get(GeolocationConstants.languageCookieName)?.value;
    localDebug.geolocation(`[Geolocation] localeCookie: ${localeCookie}`);

    // Check if cookie exists and is valid
    if (localeCookie) {
      const isValidLocale = siteValidLocales.includes(localeCookie.toLowerCase());

      if (!isValidLocale) {
        // IMPORTANT: Clear invalid cookie before geo-detection
        const response = res || NextResponse.next();
        response.cookies.set(GeolocationConstants.languageCookieName, '', {
          path: '/',
          maxAge: 0, // Delete cookie
        });

        localDebug.geolocation(
          `[Geolocation] Invalid cookie locale "${localeCookie}" found. Clearing cookie and proceeding to geo-detection.`
        );

        // Don't return - let it fall through to geo-detection below
      } else {
        // Valid locale in cookie
        const isDefaultLocale = localeCookie.toLowerCase() === siteDefaultLanguage?.toLowerCase();

        if (isDefaultLocale) {
          // Default locale → No redirect
          const response = res || NextResponse.next();
          this.manageGeoRedirectCookie(response, false);

          localDebug.geolocation(
            `[Geolocation] Cookie locale is default language. Rendering page without redirect.`
          );
          return response;
        }

        // Non-default locale → Check if it matches a configured path (e.g., /insights, /uptick)
        const matchesConfiguredPath = isUptickPath(pathname, siteName);
        const localeSupported = isUptickLocaleSupported(siteName, localeCookie);

        localDebug.geolocation(
          `[Geolocation] Checking for existing locale cookie - localeSupported: ${localeSupported}, matchesConfiguredPath: ${matchesConfiguredPath}`
        );

        if (matchesConfiguredPath) {
          const uptickConfig = getUptickConfig(siteName);

          if (!uptickConfig || !localeSupported) {
            // No uptick config or locale not supported → Redirect to SXA
            const sxaRedirectUrl = this.buildCorrectUrl(
              `/${localeCookie}${pathname}`,
              targetHostname,
              virtualFolder,
              protocol
            );

            localDebug.geolocation(
              `[Geolocation] Redirect URL constructed for ${pathname} for non-default locale & no uptick config & no locale supported: ${sxaRedirectUrl}`
            );

            const response = NextResponse.redirect(new URL(sxaRedirectUrl));
            this.manageGeoRedirectCookie(response, true);

            // Mark redirect as processed
            if (context) {
              context.isRedirectProcessed = true;
            }

            localDebug.geolocation(
              `[Geolocation] Site "${siteName}" has no insights config or locale "${localeCookie}" not supported. ` +
                `Redirecting to SXA: ${sxaRedirectUrl}`
            );

            return response;
          }
        }

        // Check if this locale needs to be proxied from another site
        const { needsProxy, targetHost } = this.needsProxying(hostname, localeCookie);

        if (needsProxy && targetHost) {
          // Instead of redirecting, rewrite the request to proxy from target host
          const proxyPath = `/${localeCookie.toLowerCase()}${pathname}`;
          const proxyUrl = new URL(`/api/proxy/rewrite${proxyPath}`, req.url);

          // Add target host as header for the proxy
          const response = NextResponse.rewrite(proxyUrl);
          response.headers.set('x-target-host', targetHost);

          localDebug.geolocation(
            `[Geolocation] Proxying via internal API to: ${targetHost}${proxyPath}`
          );

          return response;
        }

        // Normal same-site redirect for locales that exist on current site
        const redirectUrl = new URL(req.url);
        redirectUrl.pathname = `/${localeCookie}${pathname}`;

        const response = NextResponse.redirect(redirectUrl);

        if (context) {
          context.isRedirectProcessed = true;
        }

        // Clear geo redirect cookie on successful redirect
        this.manageGeoRedirectCookie(response, false);

        localDebug.geolocation(
          `[Geolocation] Cookie locale is not requested locale. Redirecting to localized path ${redirectUrl.pathname}.`
        );

        return response;
      }
    }

    // No cookie OR invalid cookie was cleared → Proceed to geo-detection

    // 5. Get IP and country code
    const ip = getClientIp(req);

    localDebug.geolocation(`[Geolocation] IP address detected: ${ip}`);

    if (!ip) {
      localDebug.geolocation(
        '[Geolocation] No IP address found. Redirecting to homepage with region selector modal.'
      );
      // Redirect to homepage with cookie
      const homeUrl = this.buildCorrectUrl('/', targetHostname, virtualFolder, protocol);
      const fallbackResponse = NextResponse.redirect(homeUrl);
      if (context) {
        context.isRedirectProcessed = true;
      }
      // Set geo-specific redirect cookie
      this.manageGeoRedirectCookie(fallbackResponse, true);

      fallbackResponse.cookies.set(GeolocationConstants.showRegionSelectorModalCookieName, 'true', {
        path: '/',
      });
      return fallbackResponse;
    }

    const { countryCode, regionCode } = await this.getCountryCodeFromIP(ip);

    localDebug.geolocation(
      `[Geolocation] Detected countryCode: ${countryCode}, regionCode: ${regionCode}`
    );

    if (!countryCode && !regionCode) {
      localDebug.geolocation(
        '[Geolocation] Could not detect country. Redirecting to homepage with region selector modal.'
      );
      // Redirect to homepage with cookie
      const homeUrl = this.buildCorrectUrl('/', targetHostname, virtualFolder, protocol);
      const fallbackResponse = NextResponse.redirect(new URL(homeUrl));
      if (context) {
        context.isRedirectProcessed = true;
      }
      // Set geo-specific redirect cookie
      this.manageGeoRedirectCookie(fallbackResponse, true);

      fallbackResponse.cookies.set(GeolocationConstants.showRegionSelectorModalCookieName, 'true', {
        path: '/',
      });
      return fallbackResponse;
    }

    // 6. Map country to locale and redirect
    let dynamicLocale: string | null = null;

    if (countryCode) {
      dynamicLocale = await this.getLocaleFromCountryCode(
        countryCode,
        CountryToLanguageMappingItemId,
        siteDefaultLanguage as string,
        regionCode ?? undefined
      );
    }

    localDebug.geolocation(
      `[Geolocation] Dynamic locale determined from geo-detection: ${dynamicLocale}`
    );

    if (dynamicLocale && siteValidLocales.includes(dynamicLocale.toLowerCase())) {
      // SEO-aware geo-detection for configured paths (e.g., /insights, /uptick)
      // Supports both 2-letter and 4-letter locale prefixes
      const matchesConfiguredPath = isUptickPath(pathname, siteName);
      const uptickConfig = getUptickConfig(siteName);
      const localeSupported = isUptickLocaleSupported(siteName, dynamicLocale);

      localDebug.geolocation(
        `[Geolocation] matchesConfiguredPath: ${matchesConfiguredPath}, localeSupported: ${localeSupported}, uptickConfig: ${JSON.stringify(
          uptickConfig
        )}`
      );

      if (matchesConfiguredPath) {
        // Check if site has uptick configuration enabled
        if (!uptickConfig) {
          // No uptick config → Redirect to SXA
          const sxaUrl = `${protocol}//${targetHostname}/${dynamicLocale}/insights`;
          const response = NextResponse.redirect(new URL(sxaUrl));

          this.setLanguageCookie(
            response,
            dynamicLocale,
            cookieDomain,
            GeolocationConstants.languageCookieMaxAge
          );

          this.manageGeoRedirectCookie(response, true);

          // Mark redirect as processed
          if (context) {
            context.isRedirectProcessed = true;
          }

          localDebug.geolocation(
            `[Geolocation] Site "${siteName}" has no insights config. Redirecting to SXA: ${sxaUrl}`
          );

          return response;
        }

        if (localeSupported) {
          // Locale is supported by Headless
          const response = res || NextResponse.next();

          localDebug.geolocation(
            `[Geolocation] Dynamic-Locale ${dynamicLocale}, cookieDomain: ${cookieDomain}.`
          );

          // SEO Decision: Should we show locale in URL?
          const isDefaultLocale =
            dynamicLocale.toLowerCase() === siteDefaultLanguage?.toLowerCase();
          const shouldHideDefaultLocale = !languageEmbedToDefaultLanguage;

          localDebug.geolocation(
            `[Geolocation] isDefaultLocale: ${isDefaultLocale}, shouldHideDefaultLocale: ${shouldHideDefaultLocale}`
          );

          if (isDefaultLocale && shouldHideDefaultLocale) {
            // Default locale (en-us) → Render /insights WITHOUT redirect

            // Update context for other plugins
            if (context) {
              context.languageCookie = dynamicLocale;
              context.setCookieForPlugins?.('language', dynamicLocale);
            }

            response.cookies.set(GeolocationConstants.languageCookieName, dynamicLocale, {
              path: '/',
            });

            // Clear geo redirect cookie on successful geo-detection
            this.manageGeoRedirectCookie(response, false);

            localDebug.geolocation(
              `[Geolocation] Default locale "${dynamicLocale}" detected for ${pathname}. ` +
                `Rendering without redirect and hiding locale in URL (SEO requirement). Cookie set to: ${dynamicLocale}`
            );

            return response; // ✅ NO REDIRECT - render /insights as-is
          } else {
            // Non-default locale OR config says always show locale
            const redirectUrl = this.buildCorrectUrl(
              `/${dynamicLocale}${pathname}`,
              targetHostname,
              virtualFolder,
              protocol
            );

            localDebug.geolocation(
              `[Geolocation] Redirect URL constructed for ${pathname} for visible default locale: ${redirectUrl}`
            );

            const redirectResponse = NextResponse.redirect(new URL(redirectUrl));

            // Set cookie with proper domain
            this.setLanguageCookie(
              redirectResponse,
              dynamicLocale,
              cookieDomain,
              GeolocationConstants.languageCookieMaxAge
            );

            // Update context for other plugins
            if (context) {
              context.languageCookie = dynamicLocale;
              context.setCookieForPlugins?.('language', dynamicLocale);
              context.isRedirectProcessed = true;
            }

            localDebug.geolocation(
              `[Geolocation] Non-default locale "${dynamicLocale}" for /insights. ` +
                `Redirecting to show locale in URL: ${redirectUrl}. Cookie set to: ${dynamicLocale}`
            );

            return redirectResponse;
          }
        } else {
          // Locale NOT supported by Headless for this site → Redirect to SXA
          const sxaRedirectUrl = this.buildCorrectUrl(
            `/${dynamicLocale}${pathname}`,
            targetHostname,
            virtualFolder,
            protocol
          );

          localDebug.geolocation(
            `[Geolocation] Redirect URL constructed for ${pathname} for non-default locale: ${sxaRedirectUrl}`
          );

          const response = NextResponse.redirect(new URL(sxaRedirectUrl));

          this.setLanguageCookie(
            response,
            dynamicLocale,
            cookieDomain,
            GeolocationConstants.languageCookieMaxAge
          );

          // Mark redirect as processed to prevent other plugins from interfering
          if (context) {
            context.isRedirectProcessed = true;
          }

          // Clear geo redirect cookie on successful geo-detection
          this.manageGeoRedirectCookie(response, false);

          localDebug.geolocation(
            `[Geolocation] Locale "${dynamicLocale}" not supported by site "${siteName}". ` +
              `Redirecting to SXA: ${sxaRedirectUrl}`
          );

          return response;
        }
      }

      // Original logic for non-insights paths
      const { needsProxy, targetHost } = this.needsProxying(hostname, dynamicLocale);

      if (needsProxy && targetHost) {
        const redirectUrl = new URL(req.url);
        redirectUrl.pathname = `/${dynamicLocale}${pathname}`;

        const response = NextResponse.redirect(redirectUrl);
        if (context) {
          context.isRedirectProcessed = true;
        }
        response.cookies.set(GeolocationConstants.languageCookieName, dynamicLocale, {
          path: '/',
        });
        return response;
      }

      const redirectUrl = this.buildCorrectUrl(
        `/${dynamicLocale}${pathname}`,
        targetHostname,
        virtualFolder,
        protocol
      );
      const response = NextResponse.redirect(new URL(redirectUrl));

      if (context) {
        context.isRedirectProcessed = true;
      }

      // Clear geo redirect cookie on successful geo-detection
      this.manageGeoRedirectCookie(response, false);

      return response;
    } else {
      localDebug.geolocation(
        ` [Geolocation] Geo-detected locale "${dynamicLocale}" not in validLocales`
      );
    }

    // 7. Fallback
    localDebug.geolocation(
      `[Geolocation] No locale mapping found for country: ${countryCode}. Redirecting to homepage with region selector modal.`
    );
    // Redirect to homepage with cookie
    const homeUrl = this.buildCorrectUrl('/', targetHostname, virtualFolder, protocol);
    const fallbackResponse = NextResponse.redirect(new URL(homeUrl));
    if (context) {
      context.isRedirectProcessed = true;
    }

    // Set geo-specific redirect cookie
    this.manageGeoRedirectCookie(fallbackResponse, true);

    fallbackResponse.cookies.set(GeolocationConstants.showRegionSelectorModalCookieName, 'true', {
      path: '/',
    });
    return fallbackResponse;
  }

  /**
   * Helper method to set language cookie with proper domain handling
   * @param response - NextResponse to set cookie on
   * @param locale - Locale value (e.g., 'en-us', 'pt-br')
   * @param cookieDomain - Cookie domain (can be undefined for same-origin cookies)
   * @param maxAge - Cookie max age in seconds
   */
  private setLanguageCookie(
    response: NextResponse,
    locale: string,
    cookieDomain: string | undefined,
    maxAge: number
  ): void {
    const cookieOptions: {
      path: string;
      maxAge: number;
      sameSite: 'lax' | 'strict' | 'none';
      domain?: string;
    } = {
      path: '/',
      maxAge,
      sameSite: 'lax',
    };

    // Only set domain if it's defined and not empty
    if (cookieDomain) {
      cookieOptions.domain = cookieDomain;
    }

    localDebug.geolocation(
      `[Geolocation] Setting language cookie: ${locale} with options: ${JSON.stringify(
        cookieOptions
      )}`
    );

    response.cookies.set(GeolocationConstants.languageCookieName, locale, cookieOptions);
  }

  private getLocaleFromURL(pathname: string): string | null {
    localDebug.geolocation(`[Geolocation] pathname getting in getLocaleFromURL ${pathname}`);
    // 1. First try the current regex for paths with locale prefixes
    const match = pathname.match(/^\/?([a-z]{2}(?:-[a-z]{2,4})?)\//i);

    if (match) {
      return match[1].toLowerCase();
    }

    // 2. Check if the whole path is just a locale (e.g. "/en-US" or "/en")
    const fullPathMatch = pathname.match(/^\/?([a-z]{2}(?:-[a-z]{2,4})?)$/i);

    if (fullPathMatch) {
      return fullPathMatch[1].toLowerCase();
    }

    // 3. No locale found in the URL
    return null;
  }

  private async getPageGeoAndLanguageMappingID(
    siteName: string,
    siteID: string,
    path: string,
    siteLanguage: string
  ): Promise<{ enableGeoDetection: boolean; mappingId: string | null }> {
    try {
      // Remove leading slash from path if present to avoid double slashes
      const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
      const query = GET_PAGE_GEO_AND_COUNTRY_TO_LANGUAGE_ID(
        siteName,
        siteID,
        normalizedPath,
        siteLanguage
      );

      const data = await graphqlFetcher<{
        layout?: { item?: { EnableGeoDetection?: { jsonValue: { value: boolean } } } };
        search?: { results?: { id: string; name: string }[] };
      }>(query, {});

      localDebug.geolocation(`[Geolocation] received data:`, JSON.stringify(data));

      const enableGeoDetection = data?.layout?.item?.EnableGeoDetection?.jsonValue?.value ?? false;
      const mappingId = data?.search?.results?.[0]?.id ?? null;

      localDebug.geolocation(
        `[Geolocation] enableGeoDetection ${enableGeoDetection} mappingId ${mappingId}`
      );

      return { enableGeoDetection, mappingId };
    } catch (error) {
      localDebug.geolocation(' [Geolocation] Error fetching geo-detection flag:', error);
      return { enableGeoDetection: false, mappingId: null };
    }
  }

  private async getCountryCodeFromIP(
    ip: string
  ): Promise<{ countryCode: string | null; regionCode: string | null }> {
    let regionCode: string;

    try {
      const accountId = config.maxmindAccountId;
      const licenseKey = config.maxmindLicenseKey;

      localDebug.geolocation(
        `[Geolocation] MaxMind credentials accountId ${accountId} licenseKey '${maskString(licenseKey)}'.`
      );

      if (!accountId || !licenseKey) {
        localDebug.geolocation(
          ' [Geolocation] MaxMind credentials not found. Skipping country code lookup.'
        );
        return { countryCode: null, regionCode: null };
      }

      // Edge-compatible  encoding

      const encodedAuth = btoa(`${accountId}:${licenseKey}`);

      const maxMindUrl = `https://geoip.maxmind.com/geoip/v2.1/city/${ip}`;

      localDebug.geolocation(
        `[Geolocation] Fetching MaxMind API for IP ${ip} with URL: ${maxMindUrl}`
      );

      const response = await fetch(maxMindUrl, {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
      });

      localDebug.geolocation(
        `[Geolocation] MaxMind API response status: ${response.status} ${response.statusText}`
      );

      localDebug.geolocation(
        `[Geolocation] MaxMind API response headers: ${JSON.stringify(
          Object.fromEntries(response.headers.entries())
        )}`
      );

      if (!response.ok) {
        localDebug.geolocation(
          ' [Geolocation] Failed response from MaxMind service:',
          response.status,
          response.statusText
        );
        return { countryCode: null, regionCode: null };
      }

      const data = await response.json();

      localDebug.geolocation(`[Geolocation] MaxMind service response ${JSON.stringify(data)}.`);

      const countryCode = data?.country?.iso_code ?? null;
      // Subdivisions is an array, take the first region if available
      regionCode =
        Array.isArray(data?.subdivisions) && data.subdivisions.length > 0
          ? data.subdivisions[0]?.iso_code ?? null
          : null;

      return { countryCode, regionCode };
    } catch (err) {
      localDebug.geolocation(' [Geolocation] Failed to fetch country from MaxMind service:', err);
      return { countryCode: null, regionCode: null };
    }
  }

  private async getLocaleFromCountryCode(
    countryIsoCode: string,
    CountryToLanguageMappingItemId: string | null,
    siteLanguage: string,
    regionCode?: string
  ): Promise<string | null> {
    try {
      localDebug.geolocation(
        `[Geolocation] Fetching locale for country code: ${countryIsoCode}, region code: ${regionCode} from CountryToLanguageMappingItemId: ${CountryToLanguageMappingItemId} with language: ${siteLanguage}`
      );

      const data = await graphqlFetcher<LocaleSearchResponse>(GET_LOCALE_FROM_COUNTRY_CODE, {
        sitePath: CountryToLanguageMappingItemId,
        templatePath: CountryToLanguageMappingTemplate,
        countryIsoCode,
        language: siteLanguage,
      });

      localDebug.geolocation(`[Geolocation] Received data:`, JSON.stringify(data));

      // 1. Check Primary language for region for a valid locale first (priority)
      const children = data?.search?.results?.[0]?.children?.results;
      if (children && Array.isArray(children) && regionCode) {
        const matchingRegion = children.find(
          (region) =>
            region?.RegionIsoCode?.value &&
            region.RegionIsoCode.value.toLowerCase() === regionCode.toLowerCase()
        );
        const locale =
          matchingRegion?.PrimaryLanguage?.jsonValue?.fields?.['Regional Iso Code']?.value;
        if (locale) {
          return locale;
        }
      }

      // 2. Fallback to the main result's locale
      const fallbackLocale =
        data?.search?.results?.[0]?.PrimaryLanguage?.jsonValue?.fields?.['Regional Iso Code']
          ?.value ?? null;
      return fallbackLocale;
    } catch (error) {
      localDebug.geolocation(' [Geolocation] Error fetching locale from country code:', error);
      return null;
    }
  }

  private getTargetHostnameAndVirtualFolder(
    siteInfo: ExtendedSiteInfo,
    currentHostname: string
  ): { targetHostname: string; virtualFolder: string } {
    let targetHostname = currentHostname;
    let virtualFolder = '';

    if (siteInfo) {
      // 1. First priority: Use target hostname if defined and not empty
      if (siteInfo.targetHostName && siteInfo.targetHostName.trim() !== '') {
        targetHostname = siteInfo.targetHostName.trim();
      }
      // 2. Second priority: Use first hostname from pipe-separated list
      else if (siteInfo.hostName) {
        const hostnames = siteInfo.hostName.split('|');
        if (hostnames.length > 0 && hostnames[0].trim() !== '') {
          targetHostname = hostnames[0].trim();
        }
      }

      // Get virtual folder (normalize it)
      if (siteInfo.virtualFolder) {
        virtualFolder = siteInfo.virtualFolder.trim();
        // Ensure it starts with / but doesn't end with / (unless it's just "/")
        if (virtualFolder && virtualFolder !== '/') {
          if (!virtualFolder.startsWith('/')) {
            virtualFolder = '/' + virtualFolder;
          }
          if (virtualFolder.endsWith('/')) {
            virtualFolder = virtualFolder.slice(0, -1);
          }
        } else if (virtualFolder === '/') {
          virtualFolder = ''; // Root virtual folder means no prefix
        }
      }
    }

    localDebug.geolocation(
      `[Geolocation] Target hostname: ${targetHostname}, Virtual folder: "${virtualFolder}"`
    );

    return { targetHostname, virtualFolder };
  }

  private buildCorrectUrl(
    path: string,
    targetHostname: string,
    virtualFolder: string,
    protocol: string
  ): string {
    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // Build the full path with virtual folder
    const fullPath = virtualFolder ? `${virtualFolder}${path}` : path;

    // Construct the complete URL
    const fullUrl = `${protocol}//${targetHostname}${fullPath}`;

    localDebug.geolocation(
      `[Geolocation] Built URL: ${fullUrl} (hostname: ${targetHostname}, virtualFolder: "${virtualFolder}", path: ${path})`
    );

    return fullUrl;
  }

  // Add site mappings configuration
  private readonly siteMappings: SiteMapping[] = [
    {
      sourceHost: 'globalpayments.com',
      targetHost: 'globalpaymentsinc.com',
      locales: ['zh-tw'], // Locales that exist on legacy site only
    },
    {
      sourceHost: 'localhost:3000', // For testing purpose on local.
      targetHost: 'globalpaymentsinc.com',
      locales: ['zh-tw'],
    },
  ];

  private needsProxying(
    hostname: string,
    locale: string
  ): { needsProxy: boolean; targetHost?: string } {
    const mapping = this.siteMappings.find(
      (m) => hostname.includes(m.sourceHost) && m.locales.includes(locale.toLowerCase())
    );

    localDebug.geolocation(
      `[Geolocation] Checking proxy for hostname: ${hostname}, locale: ${locale}, needsProxy: ${!!mapping}`
    );

    return {
      needsProxy: !!mapping,
      targetHost: mapping?.targetHost,
    };
  }

  private manageGeoRedirectCookie(response: NextResponse, shouldSet: boolean): void {
    if (shouldSet) {
      response.cookies.set(GeolocationConstants.geoRedirectCookieName, 'true', {
        path: '/',
        maxAge: 60,
        sameSite: 'lax',
      });
    } else {
      response.cookies.set(GeolocationConstants.geoRedirectCookieName, '', {
        path: '/',
        maxAge: 0,
      });
    }
  }
}

interface LocaleResult {
  name: string;
  CountryName?: { value: string };
  CountryIsoCode?: { value: string };
  PrimaryLanguage?: PrimaryLanguageResult;
  children?: {
    results?: RegionResult[];
  };
}

interface RegionResult {
  RegionName?: { value: string };
  RegionIsoCode?: { value: string };
  PrimaryLanguage?: PrimaryLanguageResult;
}

interface PrimaryLanguageResult {
  jsonValue: {
    id: string;
    url: string;
    name: string;
    displayName: string;
    fields: {
      'Regional Iso Code': {
        value: string;
      };
    };
  };
}

interface LocaleSearchResponse {
  search?: {
    results?: LocaleResult[];
  };
}

interface SiteMapping {
  sourceHost: string;
  targetHost: string;
  locales: string[];
}

export type SiteParent = {
  parent?: {
    parent?: {
      path: string;
      id: string;
      EnableGeoDetection: string;
    };
  };
};

export type SiteValueField = {
  value: string;
};

export const geolocationPlugin = new GeolocationPlugin();
