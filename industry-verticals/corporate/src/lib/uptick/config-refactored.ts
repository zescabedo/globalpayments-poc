/**
 * Production-ready configuration for Uptick API system
 * Implements configuration management with environment-based overrides
 */

import type { SiteName, Language } from './types';

// Environment configuration
export interface EnvironmentConfig {
  NODE_ENV: string;
  API_TIMEOUT: number;
  CACHE_ENABLED: boolean;
  CACHE_TTL: number;
  LOG_LEVEL: string;
  GRAPHQL_ENDPOINT: string;
  RATE_LIMIT_MAX_REQUESTS: number;
  RATE_LIMIT_WINDOW_MS: number;
}

// Site configuration mapping
export const SITE_CONFIG: Record<
  SiteName,
  {
    id: string;
    name: string;
    defaultLanguage: Language;
    supportedLanguages: Language[];
  }
> = {
  corporate: {
    id: '{C8B1C1AD-D715-4E7C-834F-88D1BE893BDF}',
    name: 'Corporate',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'de', 'fr', 'es'],
  },
  nbgpay: {
    id: '{AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE}',
    name: 'NBG Pay',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'de'],
  },
  erste: {
    id: '{FFFFFFFF-1111-2222-3333-444444444444}',
    name: 'Erste',
    defaultLanguage: 'de',
    supportedLanguages: ['de', 'en'],
  },
};

// Sitecore template IDs
export const TEMPLATE_IDS = {
  UPTICK_CONTENT: '{2DA8DDA8-49F4-40C1-83FE-C465CA56B588}',
  UPTICK_AUTHOR: '{D3BC4A10-33D0-4B85-A170-5D61FBD5F44D}',
} as const;

// Sitecore path constants
export const SITECORE_PATHS = {
  UPTICK_ROOT: '{38CDA13E-B419-4B7E-BC47-AC3923F4EEFC}',
  AUTHORS_ROOT: '{404D4136-6AA0-4D1C-AD5E-7E4E1D1A892A}',
} as const;

// Content type IDs
export const CONTENT_TYPE_IDS = {
  ARTICLE: '{29F6DA70-4AD0-46E5-ABBF-F9EA55D0B047}',
  CASE_STUDY: '{CASE-STUDY-GUID-HERE}',
  EBOOK: '{EBOOK-GUID-HERE}',
  WHITEPAPER: '{WHITEPAPER-GUID-HERE}',
  PODCAST: '{PODCAST-GUID-HERE}',
} as const;

// Pagination constraints
export const PAGINATION_LIMITS = {
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 12,
  MAX_RELATED_ITEMS: 50,
  DEFAULT_RELATED_ITEMS: 6,
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  DISABLED: {
    enabled: false,
    ttl: 0,
  },
  SHORT: {
    enabled: true,
    ttl: 120000, // 2 minutes
    staleWhileRevalidate: 300000, // 5 minutes
  },
  MEDIUM: {
    enabled: true,
    ttl: 300000, // 5 minutes
    staleWhileRevalidate: 600000, // 10 minutes
  },
  LONG: {
    enabled: true,
    ttl: 900000, // 15 minutes
    staleWhileRevalidate: 1800000, // 30 minutes
  },
} as const;

// API endpoint configurations
export const API_CONFIGS = {
  AUTHORS_LIST: {
    allowedMethods: ['GET' as const],
    cache: CACHE_CONFIG.DISABLED, // As per original implementation
    timeout: 30000,
    rateLimit: {
      maxRequests: 100,
      windowMs: 60000, // 1 minute
    },
  },
  AUTHOR_DETAIL: {
    allowedMethods: ['GET' as const],
    cache: CACHE_CONFIG.MEDIUM,
    timeout: 30000,
    rateLimit: {
      maxRequests: 200,
      windowMs: 60000,
    },
  },
  CONTENT_LIST: {
    allowedMethods: ['GET' as const],
    cache: CACHE_CONFIG.SHORT,
    timeout: 30000,
    rateLimit: {
      maxRequests: 100,
      windowMs: 60000,
    },
  },
  CONTENT_DETAIL: {
    allowedMethods: ['GET' as const],
    cache: CACHE_CONFIG.MEDIUM,
    timeout: 30000,
    rateLimit: {
      maxRequests: 200,
      windowMs: 60000,
    },
  },
  RELATED_CONTENT: {
    allowedMethods: ['GET' as const],
    cache: CACHE_CONFIG.SHORT,
    timeout: 30000,
    rateLimit: {
      maxRequests: 150,
      windowMs: 60000,
    },
  },
  SEARCH: {
    allowedMethods: ['GET' as const],
    cache: CACHE_CONFIG.SHORT,
    timeout: 30000,
    rateLimit: {
      maxRequests: 50,
      windowMs: 60000,
    },
  },
} as const;

// Environment-based configuration
function getEnvironmentConfig(): EnvironmentConfig {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_TIMEOUT: parseInt(process.env.UPTICK_API_TIMEOUT || '30000', 10),
    CACHE_ENABLED: process.env.UPTICK_CACHE_ENABLED !== 'false',
    CACHE_TTL: parseInt(process.env.UPTICK_CACHE_TTL || '300000', 10),
    LOG_LEVEL: process.env.UPTICK_LOG_LEVEL || 'info',
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT || '',
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.UPTICK_RATE_LIMIT_MAX || '100', 10),
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.UPTICK_RATE_LIMIT_WINDOW || '60000', 10),
  };
}

// Configuration utilities
export class ConfigService {
  private static instance: ConfigService;
  private config: EnvironmentConfig;

  private constructor() {
    this.config = getEnvironmentConfig();
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  getSiteConfig(siteName: SiteName) {
    return SITE_CONFIG[siteName];
  }

  getSiteId(siteName: SiteName): string {
    return SITE_CONFIG[siteName]?.id || SITE_CONFIG.corporate.id;
  }

  isValidSite(siteName: string): siteName is SiteName {
    return siteName in SITE_CONFIG;
  }

  isValidLanguageForSite(siteName: SiteName, language: string): language is Language {
    const siteConfig = SITE_CONFIG[siteName];
    return siteConfig?.supportedLanguages.includes(language as Language) || false;
  }

  getDefaultLanguageForSite(siteName: SiteName): Language {
    return SITE_CONFIG[siteName]?.defaultLanguage || 'en';
  }

  // Cache configuration with environment overrides
  getCacheConfig(configName: keyof typeof CACHE_CONFIG) {
    const baseConfig = CACHE_CONFIG[configName];

    if (!this.config.CACHE_ENABLED) {
      return CACHE_CONFIG.DISABLED;
    }

    return {
      ...baseConfig,
      ttl: this.config.CACHE_TTL || baseConfig.ttl,
    };
  }

  // API configuration with environment overrides
  getApiConfig(configName: keyof typeof API_CONFIGS) {
    const baseConfig = API_CONFIGS[configName];

    return {
      ...baseConfig,
      timeout: this.config.API_TIMEOUT || baseConfig.timeout,
      cache: this.getCacheConfig('MEDIUM'), // Default cache strategy
      rateLimit: {
        maxRequests:
          this.config.RATE_LIMIT_MAX_REQUESTS || baseConfig.rateLimit?.maxRequests || 100,
        windowMs: this.config.RATE_LIMIT_WINDOW_MS || baseConfig.rateLimit?.windowMs || 60000,
      },
    };
  }

  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }
}

// Export default instance
export const configService = ConfigService.getInstance();

// Legacy exports for backward compatibility
export const SITE_IDS: Record<string, string> = Object.fromEntries(
  Object.entries(SITE_CONFIG).map(([key, value]) => [key, value.id])
);

export const DEFAULT_PAGE_SIZE = PAGINATION_LIMITS.DEFAULT_PAGE_SIZE;
export const MAX_PAGE_SIZE = PAGINATION_LIMITS.MAX_PAGE_SIZE;
export const UPTICK_ROOT_ID = SITECORE_PATHS.UPTICK_ROOT;
export const UPTICK_ROOT_PATH = '/sitecore/content/Global/Lists/Uptick';
export const DEFAULT_SORT = 'contentPublishedDate desc';
