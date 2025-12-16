import type { NextApiRequest, NextApiResponse } from 'next';
import { getSiteLanguages, SiteLanguages } from '@/utils/locales';
import {
  generateAuthorUrl,
  generateContentUrl,
  generateIndustryUrl,
  generateSMEUrl,
  getDefaultUptickConfig,
  UptickUrlConfig,
} from '@/utils/uptick/linkResolver';
import {
  fetchSitemapWithPagination,
  fetchSitemapSetting,
  fetchUptickWildcardPages,
  fetchSiteConfiguration,
  SitemapItem, // Add this import
} from '@/lib/sitemap-fetcher/enhancedSitemapFetcher';
import { getSiteInfoByHostName } from '@/utils/getSiteInfo';
import { sites } from '@/utils/locales';
import localDebug from '@/lib/_platform/logging/debug-log';
import { uptickConstants } from '@/constants/appConstants';

/**
 * Generates sitemap index XML for multiple locales.
 *
 * @param locales - Array of locale codes.
 * @param baseUrl - Base URL of the website.
 * @returns XML string containing the sitemap index.
 */
interface QueryParams {
  locale?: string | string[];
}

const xmlEscape = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
};

const formatLastModDate = (dateValue?: string): string => {
  if (!dateValue || dateValue.trim() === '') return '';

  try {
    let date: Date;

    // Handle different Sitecore date formats
    if (dateValue.includes('T')) {
      // ISO format: 2023-12-15T10:30:00Z
      date = new Date(dateValue);
    } else if (dateValue.match(/^\d{8}T\d{6}$/)) {
      // Sitecore format: 20231215T103000
      const year = parseInt(dateValue.substr(0, 4));
      const month = parseInt(dateValue.substr(4, 2)) - 1; // Month is 0-indexed
      const day = parseInt(dateValue.substr(6, 2));
      const hour = parseInt(dateValue.substr(9, 2));
      const minute = parseInt(dateValue.substr(11, 2));
      const second = parseInt(dateValue.substr(13, 2));
      date = new Date(year, month, day, hour, minute, second);
    } else {
      // Try parsing as-is
      date = new Date(dateValue);
    }

    // Validation checks
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const now = new Date();

    // Skip default/invalid dates
    if (
      year < 1900 ||
      year === 1900 ||
      year === 1901 ||
      date.getTime() === 0 || // Unix epoch
      date > now // Future dates
    ) {
      return '';
    }

    // Return W3C DateTime format for sitemaps
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch (error) {
    localDebug.sitemap('[Sitemap] Date parsing error:', dateValue, error);
    return '';
  }
};

// Helper function to safely extract values from jsonValue
const getJsonValue = (field: { jsonValue?: unknown }): string => {
  if (!field?.jsonValue) return '';

  const jsonValue = field.jsonValue as Record<string, unknown>;

  // Try the nested structure first (fields.Value.value)
  if (jsonValue.fields) {
    const fields = jsonValue.fields as Record<string, unknown>;
    if (fields.Value) {
      const value = fields.Value as Record<string, unknown>;
      return String(value.value || '');
    }
  }

  // Try direct value access
  if (jsonValue.value) {
    return String(jsonValue.value);
  }

  return '';
};

const generateSitemapIndex = (baseUrl: string, sitemapLocale: SiteLanguages): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${Object.keys(sitemapLocale)
    .map(
      (region) =>
        `<sitemap>
    <loc>${xmlEscape(`${baseUrl}/${region}-sitemap.xml`)}</loc>
  </sitemap>`
    )
    .join('\n  ')}
</sitemapindex>`;
};

// Update the resolveWildcardUrl function to accept config parameter
async function resolveWildcardUrl(
  baseUrl: string,
  siteLanguage: string,
  item: SitemapItem,
  config: UptickUrlConfig
): Promise<string> {
  const { authorTemplateId, industryTemplateId } = uptickConstants;
  const templateId = item.template?.id;
  const path = item.slug?.value || '';
  let relativePath = '';

  localDebug.sitemap('[Sitemap] Resolving wildcard URL for item:', item, templateId, path);

  switch (templateId) {
    case authorTemplateId:
      // Author template
      const isSME = item.isSME?.jsonValue?.value;
      if (isSME) {
        relativePath = generateSMEUrl(path as string, config, siteLanguage) as string;
      } else {
        relativePath = generateAuthorUrl(path as string, config, siteLanguage) as string;
      }
      break;
    case industryTemplateId:
      // Industry template
      relativePath = generateIndustryUrl(path as string, config, siteLanguage) as string;
      break;
    default:
      // Content template
      relativePath = generateContentUrl(path as string, config, siteLanguage) as string;
      break;
  }

  // Clean up the relative path
  if (!relativePath.startsWith('/')) {
    relativePath = '/' + relativePath;
  }

  // Remove trailing slashes from baseUrl
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');

  // Combine and clean up the URL
  const fullUrl = `${cleanBaseUrl}${relativePath}`
    .replace(/(https?:)\/\/+/g, '$1//') // Fix protocol double slashes
    .replace(/([^:]\/)\/+/g, '$1'); // Remove other duplicate slashes

  return fullUrl;
}

const sitemapApi = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    const hostname = req.headers.host;
    // Get site configuration for the current hostname
    const site = getSiteInfoByHostName(hostname as string);
    const siteName = site?.name;
    const SITEMAP_LOCALE = getSiteLanguages(hostname);
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const siteMapSetting = await fetchSitemapSetting(siteName);
    const {
      excludeLastMod = false,
      excludePriority = false,
      excludeChangeFrequency = false,
    } = siteMapSetting || {};
    const baseUrl = `${protocol}://${req.headers.host}`;
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
    const { locale } = req.query as QueryParams;

    localDebug.sitemap('[Sitemap] Site resolved for hostname:', { hostname, site });

    if (locale && typeof locale === 'string') {
      if (!SITEMAP_LOCALE[locale]) {
        localDebug.sitemap('[Sitemap] Invalid locale requested:', {
          locale,
          availableLocales: Object.keys(SITEMAP_LOCALE),
          hostname,
        });

        return res.status(400).json({
          error: `Invalid locale '${locale}'. Available locales: ${Object.keys(SITEMAP_LOCALE).join(
            ', '
          )}`,
          availableLocales: Object.keys(SITEMAP_LOCALE),
        });
      }

      const siteData = sites.find((s) => s?.name?.toLowerCase() === siteName?.toLowerCase());
      const siteRootId = siteData?.id;
      const siteDefaultLanguage = siteData?.defaultLanguage || 'en-US';

      // Fetch dynamic site configuration
      localDebug.sitemap('[Sitemap] Fetching site configuration for:', {
        siteRootId,
        siteDefaultLanguage,
      });
      const siteConfig = await fetchSiteConfiguration(siteRootId as string, siteDefaultLanguage);

      localDebug.sitemap('[Sitemap] Site configuration fetched:', siteConfig);

      // Use dynamic config or fallback to static
      const config = siteConfig || getDefaultUptickConfig();
      localDebug.sitemap('[Sitemap] Using site configuration:', config);

      const results = await fetchSitemapWithPagination(SITEMAP_LOCALE[locale], siteName as string);
      const globalResults = await fetchUptickWildcardPages(SITEMAP_LOCALE[locale], config);

      const allResults = [...results, ...globalResults];

      let sitemapResult = '';
      for (const sp of allResults) {
        let fullUrl = '';
        if (sp.template?.id) {
          // resolve global wildcard
          fullUrl = await resolveWildcardUrl(
            normalizedBaseUrl,
            sp.language?.name || locale,
            sp,
            config
          );
        } else {
          // site page
          let pagePath = sp?.url?.path || '';
          if (!pagePath.startsWith('/')) pagePath = '/' + pagePath;
          fullUrl = `${normalizedBaseUrl}/${sp?.language?.name}${pagePath}`
            .replace(/(https?:)\/\//, '$1//')
            .replace(/([^:])\/+/g, '$1/');
        }

        localDebug.sitemap('[Sitemap] Final URL for sitemap:', fullUrl);

        // Extract priority, changeFrequency, and lastmod values using helper function
        const priority = sp?.priority ? getJsonValue(sp.priority) : '';
        const changeFreq = sp?.changeFrequency
          ? getJsonValue(sp.changeFrequency).toLowerCase()
          : '';

        // Validate and format the lastmod date
        const rawLastMod = sp?.lastmod?.value || '';
        const lastmod = formatLastModDate(rawLastMod);

        // Debug logging for date validation
        if (rawLastMod && !lastmod) {
          localDebug.sitemap('[Sitemap] Skipped invalid lastmod date:', rawLastMod);
        }

        sitemapResult += `
        <url>
            <loc>${xmlEscape(fullUrl)}</loc>
            ${!excludeLastMod && lastmod ? `<lastmod>${xmlEscape(lastmod)}</lastmod>` : ''}
            ${
              !excludeChangeFrequency && changeFreq
                ? `<changefreq>${xmlEscape(changeFreq)}</changefreq>`
                : ''
            }
            ${!excludePriority && priority ? `<priority>${xmlEscape(priority)}</priority>` : ''}
    
        </url>`;
      }

      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      res.write(`<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
      ${sitemapResult}
      </urlset>`);
      res.end();
    } else {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      return res.send(generateSitemapIndex(baseUrl, SITEMAP_LOCALE));
    }
  } catch (error) {
    localDebug.sitemap('[Sitemap] Sitemap generation error:', error);
    res
      .status(500)
      .send(
        'The resource you are looking for has been removed, had its name changed, or is temporarily unavailable.'
      );
  }
};

export default sitemapApi;
