import { NextRequest, NextResponse } from 'next/server';
import { MiddlewareContext, MiddlewarePlugin } from '..';
import { sites } from '@/utils/locales';
import { siteResolver } from 'lib/site-resolver';
import localDebug from '@/lib/_platform/logging/debug-log';
import { getSiteInfo } from '@/utils/getSiteInfo';
import { GeolocationConstants, LocaleMiddlewareConstants } from '@/constants/appConstants';

interface SiteLocaleContext {
  siteName: string;
  defaultLanguage: string;
  shouldHideDefaultLocale: boolean;
  allLanguages: string[];
}

class LocalePlugin implements MiddlewarePlugin {
  private getSiteLocaleContext(hostname: string, siteName?: string): SiteLocaleContext | null {
    let resolvedSiteName = siteName;

    localDebug.locale(
      `[Locale Plugin] Resolving site locale context for hostname: ${hostname}, siteName: ${siteName}, resolvedSiteName: ${resolvedSiteName}`
    );

    if (!resolvedSiteName) {
      // Get site from the site resolver (this should already be set by multisite middleware)
      const site = siteResolver.getByHost(hostname);
      resolvedSiteName = site?.name || '';
    }

    // Find site config from your locale.ts
    const siteConfig = sites.find(
      (site) => site.name.toLowerCase() === resolvedSiteName?.toLowerCase()
    );

    if (!siteConfig) {
      return null;
    }

    // Get all languages for this site
    const allLanguages = Object.values(siteConfig.languages).flat();

    return {
      siteName: resolvedSiteName,
      defaultLanguage: siteConfig.defaultLanguage,
      shouldHideDefaultLocale: !siteConfig.languageEmbedToDefaultLanguage,
      allLanguages,
    };
  }

  private createLocaleRegex(locale: string): RegExp {
    return new RegExp(`^\\/${locale}(\\/.*)?$`, 'i');
  }

  private hasLocaleInPath(pathname: string): boolean {
    // Check if pathname has any locale using regex pattern
    const localeRegex = /^\/[a-z]{2}(-[a-z]{2})?(?:\/|$)/i;
    const hasLocalePattern = localeRegex.test(pathname);

    localDebug.locale(
      `[Locale Plugin] Checking if path has any locale. Pathname: ${pathname}, Has locale pattern: ${hasLocalePattern}`
    );

    return hasLocalePattern;
  }

  private getLocaleFromPath(
    pathname: string,
    context: SiteLocaleContext,
    requestedLocale: string
  ): {
    locale: string;
    pathWithoutLocale: string;
    isDefaultLocale: boolean;
  } {
    const { allLanguages, defaultLanguage } = context;

    // Check if path matches any locale using regex
    for (const locale of allLanguages) {
      const localeRegex = this.createLocaleRegex(locale);
      if (localeRegex.test(pathname)) {
        localDebug.locale(
          `[Locale Plugin] Found locale in path: ${locale}, pathWithoutLocale: ${
            pathname.replace(new RegExp(`^\\/${locale}`), '') || '/'
          }, isDefaultLocale: ${locale === defaultLanguage}`
        );

        const pathWithoutLocale = pathname.replace(new RegExp(`^\\/${locale}`, 'i'), '') || '/';

        return {
          locale,
          pathWithoutLocale,
          isDefaultLocale: locale.toLowerCase() === defaultLanguage.toLowerCase(),
        };
      }
    }

    // Use regex for default language check in isDefaultLocale
    const defaultLanguageRegex = this.createLocaleRegex(defaultLanguage);

    // No locale found in path, assume default locale
    return {
      locale: defaultLanguage,
      pathWithoutLocale: pathname,
      isDefaultLocale:
        requestedLocale.toLowerCase() === defaultLanguage.toLowerCase() ||
        defaultLanguageRegex.test(pathname),
    };
  }

  async exec(
    req: NextRequest,
    res?: NextResponse,
    context?: MiddlewareContext
  ): Promise<NextResponse> {
    const { pathname } = new URL(req?.url);
    const hostname = req?.headers?.get('x-forwarded-host') || req?.nextUrl?.hostname;
    const requestedLocale = req?.nextUrl?.locale || '';

    // Skip processing for Sitecore edit mode
    const url = new URL(req.url);

    localDebug.locale(
      `[Locale Plugin] Incoming url: ${req.url}, url: ${JSON.stringify(
        url
      )}, headers: ${JSON.stringify(
        Object.fromEntries(req.headers.entries())
      )}, cookies: ${JSON.stringify(Object.fromEntries(req.cookies))}`
    );

    if (
      req.cookies.has('__prerender_bypass') ||
      req.cookies.has('__next_preview_data') ||
      url.searchParams.get('sc_mode') === 'edit'
    ) {
      localDebug.locale(
        `[Locale Plugin] Skipping request in Sitecore Experience Editor: ${req.url}`
      );
      return res || NextResponse.next();
    }

    // Skip processing for Next.js data requests and internal paths
    if (req.headers.get('x-nextjs-data') === '1') {
      localDebug.locale(`[Locale Plugin] Skipping Next.js internal/data request: ${pathname}`);
      return res || NextResponse.next();
    }

    const siteInfo = getSiteInfo(req);
    const siteName = siteInfo?.name;

    // Store site info in context for other plugins
    if (context) {
      context.siteName = siteName;
      context.originalPath = pathname;
    }

    const { redirectionStatusCookieName } = LocaleMiddlewareConstants;
    const { languageCookieName } = GeolocationConstants;

    // Check for redirect prevention cookie
    const localeRedirectCookie = req.cookies.get(redirectionStatusCookieName);
    let isRedirectProcessed = localeRedirectCookie?.value === 'true';

    if (context) {
      context.isRedirectProcessed = isRedirectProcessed;
    }

    // Get site locale context
    const localeContext = this.getSiteLocaleContext(hostname, siteName);

    localDebug.locale(`[Locale Plugin] Resolved locale context: ${JSON.stringify(localeContext)}`);

    if (!localeContext) {
      localDebug.locale(`[Locale Plugin] No site context found for hostname: ${hostname}`);
      return res || NextResponse.next();
    }

    const { defaultLanguage, shouldHideDefaultLocale, allLanguages } = localeContext;

    // Proper regex check if pathname has default language of site.
    const defaultLanguageRegex = this.createLocaleRegex(defaultLanguage);
    if (defaultLanguageRegex.test(pathname)) {
      isRedirectProcessed = false;
    }

    // Store locale context data for other plugins
    if (context) {
      context.shouldHideDefaultLocale = shouldHideDefaultLocale;
      context.siteLocale = defaultLanguage;
    }

    // Parse locale from current path
    const { locale, pathWithoutLocale, isDefaultLocale } = this.getLocaleFromPath(
      pathname,
      localeContext,
      requestedLocale
    );

    // Store detected locale info in context
    if (context) {
      context.detectedLocale = locale;
      context.isDefaultLocale = isDefaultLocale;
    }

    localDebug.locale(
      `[Locale Plugin] Requested locale: ${requestedLocale}, Site: ${
        localeContext.siteName
      }, Hide Default: ${shouldHideDefaultLocale}, defaultLanguage: ${defaultLanguage}, Path: ${pathname}, isDefaultLocale: ${isDefaultLocale}, Path without locale: ${pathWithoutLocale}, isRedirectProcessed: ${isRedirectProcessed}, defaultLanguageRegex.test(pathname) ${defaultLanguageRegex.test(
        pathname
      )}, defaultLanguageRegex ${defaultLanguageRegex}, pathname ${pathname}`
    );

    // Case 1: URL has default locale but site should hide it
    if (
      !isRedirectProcessed &&
      isDefaultLocale &&
      shouldHideDefaultLocale &&
      defaultLanguageRegex.test(pathname) &&
      pathname.toLowerCase() !== pathWithoutLocale.toLowerCase()
    ) {
      const url = new URL(req.url);
      url.pathname = pathWithoutLocale;

      const response = NextResponse.redirect(url, 301);
      response.cookies.set(redirectionStatusCookieName, 'true', {
        path: '/',
        maxAge: 60,
        httpOnly: true,
        sameSite: 'lax',
      });
      response.cookies.set(languageCookieName, defaultLanguage, {
        path: '/',
      });

      // Share cookie data with other plugins
      if (context) {
        context.languageCookie = defaultLanguage;
        context.setCookieForPlugins?.('language', defaultLanguage);
        context.isRedirectProcessed = true;
      }

      localDebug.locale(
        `[Locale Plugin] Ran 1st case Redirecting ${pathname} → ${pathWithoutLocale} (hiding default locale) and setting ${defaultLanguage} cookie`
      );

      return response;
    }

    // Check if pathname has any locale using helper function
    const hasAnyLocale = this.hasLocaleInPath(pathname);

    // Case 2: URL doesn't have locale but should show default locale
    if (!isRedirectProcessed && !shouldHideDefaultLocale && !defaultLanguageRegex.test(pathname)) {
      if (!hasAnyLocale) {
        const url = new URL(req.url);
        url.pathname = `/${defaultLanguage}${pathWithoutLocale}`;

        const response = NextResponse.redirect(url, 301);
        response.cookies.set(redirectionStatusCookieName, 'true', {
          path: '/',
          maxAge: 60,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
        response.cookies.set(languageCookieName, defaultLanguage, {
          path: '/',
        });

        // Share cookie data with other plugins
        if (context) {
          context.languageCookie = defaultLanguage;
          context.setCookieForPlugins?.('language', defaultLanguage);
          context.isRedirectProcessed = true;
        }

        localDebug.locale(
          `[Locale Plugin] Ran 2nd case, Redirecting ${pathname} → ${url.pathname} (showing default locale), setting ${defaultLanguage} cookie`
        );
        return response;
      }
    }

    // Case 3: No locale in URL and we should hide default locale - using virtual folder logic
    if (!hasAnyLocale && shouldHideDefaultLocale) {
      const url = new URL(req.url);
      url.pathname = `/${defaultLanguage}/_site_${siteName}${pathWithoutLocale}`;

      const response = res
        ? NextResponse.rewrite(url, { request: { headers: res.headers } })
        : NextResponse.rewrite(url);

      response.headers.set('x-site-locale', defaultLanguage);
      response.headers.set('x-hide-default-locale', 'true');
      response.headers.set('x-original-pathname', pathname);
      response.headers.set('x-locale-rewritten', 'true');

      response.cookies.delete(redirectionStatusCookieName);
      response.cookies.set(languageCookieName, defaultLanguage, {
        path: '/',
      });

      // Share cookie data with other plugins
      if (context) {
        context.languageCookie = defaultLanguage;
        context.setCookieForPlugins?.('language', defaultLanguage);
        context.isRedirectProcessed = false;
      }

      localDebug.locale(
        `[Locale Plugin] Ran 3rd case Rewriting ${pathname} → ${url.pathname}, Setting default language cookie of ${defaultLanguage}`
      );

      return response;
    }

    // Case 4: Valid locale in URL, add headers and continue
    if (allLanguages.includes(locale)) {
      const response = res || NextResponse.next();
      response.headers.set('x-site-locale', locale);
      response.headers.set('x-hide-default-locale', shouldHideDefaultLocale.toString());
      response.headers.set('x-is-default-locale', isDefaultLocale.toString());

      response.cookies.delete(redirectionStatusCookieName);
      response.cookies.set(languageCookieName, locale, {
        path: '/',
      });

      // Share cookie data with other plugins
      if (context) {
        context.languageCookie = locale;
        context.setCookieForPlugins?.('language', locale);
        context.isRedirectProcessed = false;
      }

      localDebug.locale(
        `[Locale Plugin] Ran 4th case. Locale in URL: ${locale}, isDefault: ${isDefaultLocale}, Setting language cookie to ${locale}`
      );
      return response;
    }

    // Default case: continue with existing response or create new one
    const response = res || NextResponse.next();
    response.cookies.delete(redirectionStatusCookieName);
    if (context) {
      context.isRedirectProcessed = false;
    }
    localDebug.locale(`[Locale Plugin] No specific locale handling needed for: ${pathname}`);
    return response;
  }
}

export const localePlugin = new LocalePlugin();
