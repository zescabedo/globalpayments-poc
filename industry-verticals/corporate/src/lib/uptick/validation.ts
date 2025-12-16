/**
 * Validation utilities for Uptick API system
 * Provides type-safe validation with detailed error reporting
 */

import type {
  ValidationResult,
  ValidationError,
  ContentQueryParams,
  AuthorQueryParams,
  RelatedContentParams,
  SiteName,
  Language,
} from './types';

// Constants for validation
const VALID_SITES: readonly SiteName[] = ['corporate', 'nbgpay', 'erste'] as const;
const VALID_LANGUAGES: readonly Language[] = ['en', 'de', 'fr', 'es'] as const;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;
const DEFAULT_PAGE_SIZE = 12;

// Validation helper functions
function createError(
  field: string,
  code: string,
  message: string,
  value?: unknown
): ValidationError {
  return { field, code, message, value };
}

function isValidSite(site: string): site is SiteName {
  return VALID_SITES.includes(site as SiteName);
}

function isValidLanguage(lang: string): lang is Language {
  return VALID_LANGUAGES.includes(lang as Language);
}

function isValidPageSize(pageSize: number): boolean {
  return Number.isInteger(pageSize) && pageSize >= MIN_PAGE_SIZE && pageSize <= MAX_PAGE_SIZE;
}

function isValidGuid(value: string): boolean {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return guidRegex.test(value);
}

function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 100;
}

function sanitizeString(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function sanitizeArray(arr: unknown[]): string[] {
  return arr
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map(sanitizeString)
    .slice(0, 20); // Limit array size
}

// Core validation functions
export function validateBaseParams(params: { site?: string; lang?: string }): ValidationResult {
  const errors: ValidationError[] = [];

  if (!params.site) {
    errors.push(createError('site', 'REQUIRED', 'Site parameter is required'));
  } else if (!isValidSite(params.site)) {
    errors.push(
      createError(
        'site',
        'INVALID_VALUE',
        `Invalid site. Must be one of: ${VALID_SITES.join(', ')}`,
        params.site
      )
    );
  }

  if (!params.lang) {
    errors.push(createError('lang', 'REQUIRED', 'Language parameter is required'));
  } else if (!isValidLanguage(params.lang)) {
    errors.push(
      createError(
        'lang',
        'INVALID_VALUE',
        `Invalid language. Must be one of: ${VALID_LANGUAGES.join(', ')}`,
        params.lang
      )
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePaginationParams(params: {
  pageSize?: number;
  after?: string | null;
}): ValidationResult {
  const errors: ValidationError[] = [];

  if (params.pageSize !== undefined) {
    if (!isValidPageSize(params.pageSize)) {
      errors.push(
        createError(
          'pageSize',
          'INVALID_RANGE',
          `Page size must be between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}`,
          params.pageSize
        )
      );
    }
  }

  if (params.after !== undefined && params.after !== null && typeof params.after !== 'string') {
    errors.push(
      createError('after', 'INVALID_TYPE', 'After cursor must be a string', params.after)
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateContentQueryParams(params: Partial<ContentQueryParams>): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate base params
  const baseValidation = validateBaseParams(params);
  errors.push(...baseValidation.errors);

  // Validate pagination
  const paginationValidation = validatePaginationParams(params);
  errors.push(...paginationValidation.errors);

  // Validate optional filters
  if (params.types && Array.isArray(params.types)) {
    params.types.forEach((type, index) => {
      if (typeof type !== 'string' || !isValidGuid(type)) {
        errors.push(
          createError(`types[${index}]`, 'INVALID_GUID', 'Content type must be a valid GUID', type)
        );
      }
    });
  }

  if (params.q && typeof params.q === 'string' && params.q.length > 200) {
    errors.push(
      createError('q', 'TOO_LONG', 'Search query must be 200 characters or less', params.q)
    );
  }

  if (params.authorId && typeof params.authorId === 'string' && !isValidGuid(params.authorId)) {
    errors.push(
      createError('authorId', 'INVALID_GUID', 'Author ID must be a valid GUID', params.authorId)
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateAuthorQueryParams(params: Partial<AuthorQueryParams>): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate base params
  const baseValidation = validateBaseParams(params);
  errors.push(...baseValidation.errors);

  // Validate pagination
  const paginationValidation = validatePaginationParams(params);
  errors.push(...paginationValidation.errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateRelatedContentParams(
  params: Partial<RelatedContentParams>
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate base params
  const baseValidation = validateBaseParams(params);
  errors.push(...baseValidation.errors);

  // Validate slug
  if (!params.slug) {
    errors.push(createError('slug', 'REQUIRED', 'Slug parameter is required'));
  } else if (!isValidSlug(params.slug)) {
    errors.push(
      createError(
        'slug',
        'INVALID_FORMAT',
        'Slug must contain only lowercase letters, numbers, and hyphens',
        params.slug
      )
    );
  }

  // Validate limit
  if (params.limit !== undefined) {
    if (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 50) {
      errors.push(
        createError('limit', 'INVALID_RANGE', 'Limit must be between 1 and 50', params.limit)
      );
    }
  }

  // Validate match strategy
  if (params.match && !['any', 'all'].includes(params.match)) {
    errors.push(
      createError('match', 'INVALID_VALUE', 'Match strategy must be "any" or "all"', params.match)
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateAuthorSlug(slug: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!slug) {
    errors.push(createError('slug', 'REQUIRED', 'Author slug is required'));
  } else if (!isValidSlug(slug)) {
    errors.push(
      createError(
        'slug',
        'INVALID_FORMAT',
        'Slug must contain only lowercase letters, numbers, and hyphens',
        slug
      )
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Sanitization functions
export function sanitizeContentQueryParams(
  params: Record<string, unknown>
): Partial<ContentQueryParams> {
  return {
    site: typeof params.site === 'string' ? sanitizeString(params.site) : undefined,
    lang: typeof params.lang === 'string' ? sanitizeString(params.lang) : undefined,
    pageSize:
      typeof params.pageSize === 'string'
        ? Math.min(
            Math.max(parseInt(params.pageSize, 10) || DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE),
            MAX_PAGE_SIZE
          )
        : typeof params.pageSize === 'number'
        ? Math.min(Math.max(params.pageSize, MIN_PAGE_SIZE), MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE,
    after: typeof params.after === 'string' ? sanitizeString(params.after) || null : null,
    types: Array.isArray(params.types) ? sanitizeArray(params.types) : undefined,
    topics: Array.isArray(params.topics) ? sanitizeArray(params.topics) : undefined,
    categories: Array.isArray(params.categories) ? sanitizeArray(params.categories) : undefined,
    industries: Array.isArray(params.industries) ? sanitizeArray(params.industries) : undefined,
    q: typeof params.q === 'string' ? sanitizeString(params.q).slice(0, 200) : undefined,
    authorId: typeof params.authorId === 'string' ? sanitizeString(params.authorId) : undefined,
  };
}

export function sanitizeAuthorQueryParams(
  params: Record<string, unknown>
): Partial<AuthorQueryParams> {
  return {
    site: typeof params.site === 'string' ? sanitizeString(params.site) : undefined,
    lang: typeof params.lang === 'string' ? sanitizeString(params.lang) : undefined,
    pageSize:
      typeof params.pageSize === 'string'
        ? Math.min(
            Math.max(parseInt(params.pageSize, 10) || DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE),
            MAX_PAGE_SIZE
          )
        : typeof params.pageSize === 'number'
        ? Math.min(Math.max(params.pageSize, MIN_PAGE_SIZE), MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE,
    after: typeof params.after === 'string' ? sanitizeString(params.after) || null : null,
  };
}

export function sanitizeRelatedContentParams(
  slug: string,
  params: Record<string, unknown>
): Partial<RelatedContentParams> {
  return {
    site: typeof params.site === 'string' ? sanitizeString(params.site) : undefined,
    lang: typeof params.lang === 'string' ? sanitizeString(params.lang) : undefined,
    slug: sanitizeString(slug),
    limit:
      typeof params.limit === 'string'
        ? Math.min(Math.max(parseInt(params.limit, 10) || 6, 1), 50)
        : typeof params.limit === 'number'
        ? Math.min(Math.max(params.limit, 1), 50)
        : 6,
    match:
      typeof params.match === 'string' && ['any', 'all'].includes(params.match)
        ? (params.match as 'any' | 'all')
        : 'any',
    types: Array.isArray(params.types) ? sanitizeArray(params.types) : undefined,
  };
}
