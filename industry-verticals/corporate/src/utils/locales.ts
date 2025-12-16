import { siteResolver } from 'lib/site-resolver';

export type SiteLanguages = {
  [key: string]: string[];
};

export interface Site {
  name: string;
  languages: SiteLanguages;
  enableGeoDetection?: boolean;
  id: string;
  path: string;
  defaultLanguage: string;
  languageEmbedToDefaultLanguage: boolean;
  publicUrl: string;
  cookieDomain?: string; // Optional: e.g., '.globalpayments.com', '.tsys.com'
  uptickConfig?: {
    enabled: boolean;
    headlessLocales: string[];
    sxaFallback: boolean;
    paths?: string[]; // Optional: Paths to apply uptick routing (default: ['/insights'])
  };
}

export const sites: Site[] = [
  {
    name: 'BuildguideHeadless',
    languages: {
      us: ['en-US', 'en'],
      ca: ['en-CA', 'fr-CA'],
      gb: ['en-GB'],
      au: ['en-AU'],
      mt: ['en-MT'],
      bm: ['en-BM '],
      ap: ['en-AP', 'en-HK'],
      hu: ['hu-HU'],
      eu: ['en-150', 'en-EU'],
      es: ['es-ES'],
      zh: ['zh-TW'],
    },
    enableGeoDetection: true,
    id: '90520BE85AC7493F87A856FEB7A0875C',
    path: '/sitecore/content/GPN Headless/CorporateHeadless/BuildguideHeadless/Home',
    defaultLanguage: 'en-US',
    languageEmbedToDefaultLanguage: false,
    publicUrl: 'https://www.globalpayments.com',
  },
  {
    name: 'CorporateHeadless',
    languages: {
      us: ['en-US', 'en'],
      ca: ['en-CA', 'fr-CA'],
      gb: ['en-GB'],
      au: ['en-AU'],
      mt: ['en-MT'],
      bm: ['en-BM '],
      ap: ['en-AP', 'en-HK'],
      hu: ['hu-HU'],
      eu: ['en-150', 'en-EU'],
      es: ['es-ES'],
    },
    enableGeoDetection: true,
    id: 'C8B1C1AD-D715-4E7C-834F-88D1BE893BDF',
    path: '/sitecore/content/GPN Headless/CorporateHeadless/CorporateHeadless',
    defaultLanguage: 'en-US',
    languageEmbedToDefaultLanguage: false,
    publicUrl: 'https://www.globalpayments.com',
    cookieDomain: '.globalpayments.com', // Cross-domain cookie for SXA/Headless sharing
    uptickConfig: {
      enabled: true,
      headlessLocales: ['en-us', 'en-gb', 'en-au'],
      sxaFallback: true,
      paths: ['/insights'], // Paths where headless routing applies
    },
  },
  {
    name: 'Erste',
    languages: {
      US: ['en'],
      AT: ['de-AT'],
      SK: ['sk-SK'],
      CZ: ['cs-CZ'],
      HR: ['hr-HR'],
    },
    id: 'FC2241D857574AFE9ADF8936FED9EFF6',
    path: '/sitecore/content/GPN Headless/CorporateHeadless/Erste',
    defaultLanguage: 'cs-CZ',
    languageEmbedToDefaultLanguage: true,
    publicUrl: 'https://www.globalpayments.com',
  },
  {
    name: 'tsys',
    languages: {
      US: ['en-US'],
      BR: ['pt-BR'],
    },
    id: '90520BE85AC7493F87A856FEB7A0875C', // will change with actual Tsys site ID
    path: '/sitecore/content/GPN Headless/CorporateHeadless/TsysHeadless',
    defaultLanguage: 'en-US',
    languageEmbedToDefaultLanguage: false,
    publicUrl: 'https://www.globalpayments.com',
  },
];

export function getSiteLanguages(hostname?: string): SiteLanguages {
  let siteName = '';
  if (hostname) {
    // Get site name from site resolver using hostname
    const site = siteResolver.getByHost(hostname);
    siteName = site?.name || '';
  }
  const siteConfig = sites.find((site) => site.name.toLowerCase() === siteName.toLowerCase());

  if (!siteConfig) {
    return {} as SiteLanguages;
  }

  return siteConfig.languages;
}

/**
 * Get site-specific uptick configuration
 * @param siteName - The name of the site (e.g., 'CorporateHeadless')
 * @returns The uptick config if enabled, null otherwise
 */
export function getUptickConfig(siteName?: string): Site['uptickConfig'] | null {
  if (!siteName) {
    return null;
  }

  const siteConfig = sites.find(
    (site) => site.name.toLowerCase() === siteName.toLowerCase()
  );

  if (!siteConfig || !siteConfig.uptickConfig) {
    return null;
  }

  return siteConfig.uptickConfig.enabled ? siteConfig.uptickConfig : null;
}

/**
 * Check if a locale is supported for uptick routing on a specific site
 * @param siteName - The name of the site
 * @param locale - The locale to check (e.g., 'en-us')
 * @returns true if the locale is supported for uptick on this site
 */
export function isUptickLocaleSupported(
  siteName: string | undefined,
  locale: string
): boolean {
  const config = getUptickConfig(siteName);
  if (!config) {
    return false;
  }

  return config.headlessLocales
    .map((l) => l.toLowerCase())
    .includes(locale.toLowerCase());
}

/**
 * Check if a pathname matches any of the configured uptick paths
 * Supports both 2-letter (en) and 4-letter (en-us) locale prefixes
 * @param pathname - The URL pathname (e.g., '/en-us/insights', '/insights', '/en/insights')
 * @param siteName - The site name to get config from
 * @returns true if pathname matches a configured uptick path
 */
export function isUptickPath(pathname: string, siteName: string | undefined): boolean {
  const config = getUptickConfig(siteName);
  if (!config) {
    return false;
  }

  const configuredPaths = config.paths || ['/insights'];

  // Check each configured path
  for (const basePath of configuredPaths) {
    // Match with 4-letter locale prefix: /en-us/insights
    const fourLetterPattern = new RegExp(`^\\/[a-z]{2}-[a-z]{2}${basePath}(\\/|$)`, 'i');
    // Match with 2-letter locale prefix: /en/insights
    const twoLetterPattern = new RegExp(`^\\/[a-z]{2}${basePath}(\\/|$)`, 'i');
    // Match without locale: /insights
    const noLocalePattern = new RegExp(`^${basePath}(\\/|$)`, 'i');

    if (
      fourLetterPattern.test(pathname) ||
      twoLetterPattern.test(pathname) ||
      noLocalePattern.test(pathname)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Remove locale prefix from pathname for any configured uptick path
 * Supports both 2-letter (en) and 4-letter (en-us) locale prefixes
 * @param pathname - The URL pathname (e.g., '/en-us/insights/article')
 * @param siteName - The site name to get config from
 * @returns Cleaned pathname (e.g., '/insights/article') or original if no match
 */
export function removeLocaleFromPath(pathname: string, siteName: string | undefined): string {
  const config = getUptickConfig(siteName);
  if (!config) {
    return pathname;
  }

  const configuredPaths = config.paths || ['/insights'];

  for (const basePath of configuredPaths) {
    // Try removing 4-letter locale prefix: /en-us/insights → /insights
    const fourLetterPattern = new RegExp(`^\\/[a-z]{2}-[a-z]{2}(${basePath}.*)$`, 'i');
    const fourLetterMatch = pathname.match(fourLetterPattern);
    if (fourLetterMatch) {
      return fourLetterMatch[1];
    }

    // Try removing 2-letter locale prefix: /en/insights → /insights
    const twoLetterPattern = new RegExp(`^\\/[a-z]{2}(${basePath}.*)$`, 'i');
    const twoLetterMatch = pathname.match(twoLetterPattern);
    if (twoLetterMatch) {
      return twoLetterMatch[1];
    }
  }

  return pathname;
}

/**
 * Get the cookie domain for a site
 * @param siteName - The name of the site (e.g., 'CorporateHeadless', 'tsys')
 * @param hostname - Optional fallback hostname to extract domain from (e.g., 'www.globalpayments.com')
 * @returns Cookie domain string (e.g., '.globalpayments.com') or undefined
 */
export function getCookieDomain(siteName: string, hostname?: string): string | undefined {
  if (!sites || !siteName) {
    return undefined;
  }
  const site = sites.find((s) => s.name.toLowerCase() === siteName.toLowerCase());

  // If site has explicit cookieDomain configured, use it
  if (site?.cookieDomain) {
    return site.cookieDomain;
  }

  // Fallback: Extract domain from hostname if provided
  if (hostname) {
    // Extract base domain from hostname (e.g., 'www.globalpayments.com' → '.globalpayments.com')
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      // Return domain with leading dot for cross-subdomain sharing
      // e.g., 'www.globalpayments.com' → '.globalpayments.com'
      // e.g., 'globalpayments.com' → '.globalpayments.com'
      const domain = parts.slice(-2).join('.');
      return `.${domain}`;
    }
  }

  // No cookie domain configured and no hostname - return undefined
  // (browser will use default same-origin cookie)
  return undefined;
}
