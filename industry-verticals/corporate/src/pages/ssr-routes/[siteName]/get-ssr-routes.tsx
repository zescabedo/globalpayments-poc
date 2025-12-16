import { GetStaticProps, GetStaticPaths } from 'next';
import { executeGraphQL } from '@/lib/graphql/fetchGraphQL';
import { GET_SSR_PAGES_QUERY } from '@/lib/graphql/queries/get-ssr-pages';
import localDebug from '@/lib/_platform/logging/debug-log';
import { SSRPageConstants } from '@/constants/appConstants';
import { Site, sites } from '@/utils/locales';
import i18nConfig from '@i18n/i18nLocales.json';

interface SearchResult {
  search: {
    results: SSRRoutesResult[];
    pageInfo: {
      hasNext: boolean;
      endCursor: string;
    };
    total: number;
  };
}

interface SSRRoutesResult {
  url: {
    path: string;
  };
}

interface SSRRoutesPageProps {
  routes: string[];
  language: string;
  error?: string;
}

const normalizeLanguageCode = (lang: string): string => {
  // Handle two-part language codes (e.g., en-US, fr-CA)
  if (SSRPageConstants.languageCodeRegex.test(lang)) {
    return lang.replace(
      SSRPageConstants.languageCodeRegex,
      (_, l, c) => `${l.toLowerCase()}-${c.toUpperCase()}`
    );
  }
  // Handle single language codes (e.g., en, fr) - ensure lowercase
  return lang.toLowerCase();
};

async function fetchAllSSRRoutes(language: string, siteName: string): Promise<string[]> {
  const allRoutes: string[] = [];
  let hasNextPage = true;
  let afterCursor: string | null = null;

  try {
    while (hasNextPage) {
      const formattedLang = normalizeLanguageCode(language);

      localDebug.ssrRouting(`[SSR Routing] Formatted language code: ${formattedLang}`);

      const variables: { language: string; siteName: string; after: string | null } = {
        language: formattedLang,
        siteName: siteName.toLocaleLowerCase(),
        after: afterCursor,
      };

      localDebug.ssrRouting(
        `[SSR Routing] Fetching SSR routes in get-ssr-routes ssg page for ${siteName} and ${language} with afterCursor: ${afterCursor}`
      );

      const result = await executeGraphQL<SearchResult>(GET_SSR_PAGES_QUERY, variables);

      if (!result?.search) {
        break;
      }

      // Add current page routes to accumulated results
      const currentRoutes = result.search.results
        .map((item: SSRRoutesResult) => item?.url?.path)
        .filter(Boolean);

      allRoutes.push(...currentRoutes);

      // Check if there are more pages
      hasNextPage = result.search.pageInfo.hasNext;
      afterCursor = result.search.pageInfo.endCursor;

      // Safety check to prevent infinite loops
      if (!afterCursor && hasNextPage) {
        break;
      }
    }
    localDebug.ssrRouting(
      `[SSR Routing] Fetched SSR routes in get-ssr-routes ssg page for ${siteName} and ${language} are ${allRoutes}`
    );

    return allRoutes;
  } catch (error) {
    localDebug.ssrRouting('Error fetching SSR routes from Sitecore:', error);
    return [];
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Generate paths for all sites and their supported languages
  const paths = sites.flatMap((site) => {
    // Get all unique languages and clean them
    const siteLanguages = new Set(
      Object.values(site.languages)
        .flat()
        .map((lang) => {
          const cleanLocale = lang.trim().split(',')[0].trim();
          return cleanLocale;
        })
    );

    // Only include locales that exist in i18nLocales.json
    const validLocales = Array.from(siteLanguages).filter((lang) => i18nConfig.includes(lang));

    return validLocales.map((locale) => ({
      params: {
        siteName: site.name.toLowerCase(),
      },
      locale,
    }));
  });

  return {
    paths,
    fallback: 'blocking', // Use blocking fallback to ensure SSR for all paths
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const language = context.locale || 'en';
  const siteName = context.params?.siteName as string;
  const { RevalidationDuration } = SSRPageConstants;

  // Validate if this site/locale combination is supported
  const siteConfig = sites.find((site) => site.name.toLowerCase() === siteName.toLowerCase());

  if (!siteConfig || !isLocaleSupported(siteConfig, language)) {
    return { notFound: true };
  }

  localDebug.ssrRouting(
    `[SSR Routing] Generating SSR routes in get-ssr-routes ssg page for ${siteName} and ${language}`
  );

  try {
    const routes = await fetchAllSSRRoutes(language, siteName);
    return {
      props: {
        routes,
      },
      revalidate: Number(process.env.REVALIDATION_DURATION) || RevalidationDuration,
    };
  } catch (error) {
    return {
      props: {
        routes: [],
        error: 'Failed to fetch routes',
      },
      revalidate: 60,
    };
  }
};

export default function SSRRoutesPage({ routes, language, error }: SSRRoutesPageProps) {
  return (
    <div>
      <script
        id="ssr-routes-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ routes, language, error }),
        }}
      />
    </div>
  );
}

// Helper function to check if locale is supported for site
function isLocaleSupported(site: Site, locale: string): boolean {
  return Object.values(site.languages)
    .flat()
    .some((lang) => lang.toLowerCase() === locale.toLowerCase());
}
