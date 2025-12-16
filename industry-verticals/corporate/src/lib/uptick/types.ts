/**
 * Core types for the Uptick API system
 * Provides type safety across all API operations
 */

// Base API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  processingTime: number;
  cacheInfo?: CacheInfo;
}

export interface CacheInfo {
  hit: boolean;
  ttl: number;
  source: 'memory' | 'redis' | 'database';
}

// Pagination Types
export interface PaginationParams {
  pageSize: number;
  after?: string | null;
}

export interface PaginationMeta {
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
  pageSize: number;
  after?: string | null;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

// Query Parameters
export interface BaseQueryParams {
  site: string;
  lang: string;
}

export interface ContentQueryParams extends BaseQueryParams, PaginationParams {
  types?: string[];
  topics?: string[];
  categories?: string[];
  industries?: string[];
  q?: string;
  authorId?: string;
}

export interface AuthorQueryParams extends BaseQueryParams, PaginationParams {
  // No additional filters for now
}

export interface RelatedContentParams extends BaseQueryParams {
  slug: string;
  limit?: number;
  match?: 'any' | 'all';
  types?: string[];
}

// Entity Types
export interface Author {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly biography?: string;
  readonly photoUrl?: string;
  readonly areasOfExpertise: readonly string[];
  readonly href: string;
}

export interface ContentItem {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary?: string;
  readonly contentType: string;
  readonly contentTypeName: string;
  readonly publishedDate?: string;
  readonly authors: readonly Author[];
  readonly topics: readonly string[];
  readonly topicsDisplay: readonly string[];
  readonly categories: readonly string[];
  readonly categoriesDisplay: readonly string[];
  readonly industries: readonly string[];
  readonly mainImageUrl?: string;
  readonly mainImageAlt?: string;
  readonly mainImageSrcSet?: string;
  readonly cardImageUrl?: string;
  readonly cardImageAlt?: string;
  readonly cardImageSrcSet?: string;
  readonly href: string;
  readonly readTime?: string;
}

// Search Types - keeping for clarity and future extensions
export type SearchQueryParams = ContentQueryParams;

// API Configuration
export interface ApiConfig {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly retryAttempts: number;
  readonly cacheEnabled: boolean;
  readonly logLevel: 'error' | 'warn' | 'info' | 'debug';
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

// GraphQL Types
export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
}

export interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

// Site Configuration
export interface SiteConfig {
  readonly id: string;
  readonly name: string;
  readonly defaultLanguage: string;
  readonly supportedLanguages: readonly string[];
}

// Constants as types for better type safety
export type SiteName = 'corporate' | 'nbgpay' | 'erste';
export type Language = 'en' | 'de' | 'fr' | 'es';
export type ContentType = 'article' | 'case-study' | 'ebook' | 'whitepaper' | 'podcast';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Request Context
export interface RequestContext {
  readonly requestId: string;
  readonly startTime: number;
  readonly userAgent?: string;
  readonly ipAddress?: string;
  readonly site: SiteName;
  readonly language: Language;
}
