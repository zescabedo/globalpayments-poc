# Uptick API Documentation

This documentation describes all the APIs available in the `/api/uptick` endpoint for content and author management.

## Overview

The Uptick API provides endpoints for:
- **Authors**: Managing and retrieving author information
- **Content**: Searching and retrieving content items with filtering capabilities
- **Search**: Advanced search functionality with multiple filter options

All APIs use GraphQL queries internally and support caching, pagination, and error handling.

---

## 1. Authors API

### GET `/api/uptick/authors`

Retrieves a paginated list of authors.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `lang` | string | `"en"` | Language code for localization |
| `pageSize` | number | `24` | Number of items per page (1-100) |
| `after` | string | `null` | Cursor for pagination |

#### Response Format

```typescript
{
  items: AuthorLite[];
  total: number;
  after?: string;
  hasNext: boolean;
}
```

#### AuthorLite Object

```typescript
type AuthorLite = {
  id: string;
  slug?: string;
  name?: string;
  biography?: string;
  photoUrl?: string;
  areasOfExpertise?: string[];
  href?: string; // Generated URL: /uptick/author/{slug}
}
```

#### Caching
- **Headers**: `Cache-Control: no-store` (currently disabled caching)
- **Error Handling**: Returns empty array on errors

#### Example Request
```
GET /api/uptick/authors?lang=en&pageSize=10&after=cursor123
```

---

### GET `/api/uptick/authors/[slug]`

Retrieves detailed information for a specific author by slug.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Author slug identifier |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `lang` | string | `"en"` | Language code for localization |

#### Response Format

```typescript
{
  id: string;
  slug?: string;
  name?: string;
  biography?: string;
  photoUrl?: string;
  areasOfExpertise?: string[];
}
```

#### Status Codes
- **200**: Success (returns empty object `{}` if author not found)
- **404**: Author not found

#### Caching
- **Success**: `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`
- **Error**: `Cache-Control: no-store`

#### Example Request
```
GET /api/uptick/authors/john-doe?lang=en
```

---

## 2. Content API

### GET `/api/uptick/content`

Retrieves paginated content items with advanced filtering capabilities.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `site` | string | `"corporate"` | Site name for content filtering |
| `lang` | string | `"en"` | Language code for localization |
| `pageSize` | number | `12` | Number of items per page (1-100) |
| `after` | string | `null` | Cursor for pagination |
| `types` | string | - | Comma-separated content type IDs |
| `q` | string | - | Full-text search term |
| `authorId` | string | - | Filter by author ID |

#### Response Format

```typescript
{
  items: UptickItem[];
  page: number;
  pageSize: number;
  total: number;
}
```

#### Filtering Logic

The API builds dynamic GraphQL filters based on query parameters:

1. **Content Types**: OR operation on multiple content type IDs
2. **Site Filtering**: Uses `showIn` multilist field with site-specific GUID
3. **Full-text Search**: Searches across all indexed text fields
4. **Author Filtering**: Filters content by specific author

#### Caching
- **Success**: `Cache-Control: public, s-maxage=120, stale-while-revalidate=300`
- **Error**: `Cache-Control: no-store`

#### Example Request
```
GET /api/uptick/content?site=corporate&types=guid1,guid2&q=technology&authorId=author123
```

---

### GET `/api/uptick/content/[slug]`

Retrieves a specific content item by slug.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Content item slug identifier |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `site` | string | `"corporate"` | Site name for content filtering |
| `lang` | string | `"en"` | Language code for localization |

#### Response Format

Returns a complete `UptickItem` object or empty object `{}` if not found.

#### Status Codes
- **200**: Success
- **404**: Content not found (returns empty object)

#### Caching
- **Success**: `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`
- **Error**: `Cache-Control: no-store`

#### Example Request
```
GET /api/uptick/content/my-article-slug?site=corporate&lang=en
```

---

### GET `/api/uptick/content/[slug]/related`

Retrieves related content items based on topics and industries.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Base content item slug |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `site` | string | `"corporate"` | Site name for content filtering |
| `lang` | string | `"en"` | Language code for localization |
| `limit` | number | `6` | Maximum number of related items (max 24) |
| `match` | string | `"any"` | Matching strategy: `"any"` or `"all"` |
| `types` | string | - | Comma-separated content type IDs to constrain results |

#### Related Content Logic

1. **Base Item Lookup**: Retrieves the source content item
2. **Topic/Industry Extraction**: Extracts topics and industries from base item
3. **Dynamic Filtering**: Builds GraphQL query with:
   - Content type constraints (if provided)
   - Topic matching (CONTAINS or CONTAINSALL based on `match` parameter)
   - Industry matching (CONTAINS or CONTAINSALL based on `match` parameter)
   - Site filtering via `showIn` field
4. **Exclusion**: Filters out the base item from results

#### Response Format

Returns an array of `UptickItem[]` objects.

#### Matching Strategies
- **`any`**: Uses `CONTAINS` operator (matches any of the topics/industries)
- **`all`**: Uses `CONTAINSALL` operator (matches all topics/industries)

#### Caching
- **Success**: `Cache-Control: public, s-maxage=120, stale-while-revalidate=300`
- **Error**: `Cache-Control: no-store`

#### Example Request
```
GET /api/uptick/content/my-article/related?limit=5&match=any&types=guid1,guid2
```

---

## 3. Search API

### GET `/api/uptick/search`

Advanced search endpoint with comprehensive filtering options.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `site` | string | `"corporate"` | Site name for content filtering |
| `lang` | string | `"en"` | Language code for localization |
| `pageSize` | number | `12` | Number of items per page (1-100) |
| `after` | string | `null` | Cursor for pagination |
| `q` | string | - | Full-text search term |
| `types` | string | - | Comma-separated content type GUIDs |
| `topics` | string | - | Comma-separated topic filters |
| `categories` | string | - | Comma-separated category/industry filters |
| `industries` | string | - | Comma-separated audience filters |
| `authorId` | string | - | Filter by author ID |

#### Response Format

```typescript
{
  items: UptickItem[];
  total: number;
  pageInfo: {
    hasNext: boolean;
    endCursor: string | null;
  };
}
```

#### Advanced Filtering

The search API supports multiple filter types:

1. **Content Types**: OR operation on multiple GUIDs
2. **Topics**: OR operation on topic names/IDs
3. **Categories/Industries**: Maps to "industries" field with OR operation
4. **Industries**: OR operation on audience segments
5. **Author**: Specific author filtering
6. **Site Scope**: Uses `showIn` multilist for site-specific content
7. **Full-text**: Searches across all indexed text fields

#### Filter Mapping

| Query Param | GraphQL Field | Description |
|-------------|---------------|-------------|
| `types` | `contentType` | Content type GUIDs |
| `topics` | `topics` | Topic tags/categories |
| `categories` | `industries` | Industry/category classifications |
| `industries` | `industries` | Target audience segments |
| `authorId` | `author` | Author identifier |

#### Caching
- **Success**: `Cache-Control: public, s-maxage=120, stale-while-revalidate=300`
- **Error**: `Cache-Control: no-store`

#### Example Request
```
GET /api/uptick/search?q=technology&types=guid1,guid2&topics=ai,machine-learning&categories=tech&industries=developers
```

---

## 4. Legacy Content API

### GET `/api/uptick/contentold`

**Note**: This appears to be a legacy endpoint that may be deprecated. It uses older GraphQL queries and mappers.

---

## Common Features

### Error Handling

All APIs follow consistent error handling:
- **Graceful Degradation**: Returns empty results instead of throwing errors
- **Logging**: Errors are logged server-side for debugging
- **Cache Headers**: Error responses use `Cache-Control: no-store`

### Caching Strategy

- **Content APIs**: 2-minute cache with 5-minute stale-while-revalidate
- **Author Detail**: 5-minute cache with 10-minute stale-while-revalidate
- **Author List**: Currently no caching (no-store)

### Pagination

- **Cursor-based**: Uses GraphQL cursor pagination with `after` parameter
- **Page Size Limits**: Maximum 100 items per request
- **Metadata**: Returns `hasNext` and cursor information for client-side pagination

### Internationalization

- **Language Support**: All endpoints accept `lang` parameter
- **Default**: English (`"en"`) is the default language

### Site Multi-tenancy

- **Site Filtering**: Uses `showIn` multilist field with site-specific GUIDs
- **Configuration**: Site IDs are managed in `@/lib/uptick/config`

---

## Data Types

### UptickItem
The main content item type returned by content endpoints. Exact structure depends on the `mapUptickItem` mapper function.

### AuthorLite
Simplified author representation for list views.

### PagedResult&lt;T&gt;
Generic pagination wrapper containing:
- `items`: Array of result items
- `page`: Current page number
- `pageSize`: Items per page
- `total`: Total number of items

---

## Dependencies

- **GraphQL Client**: `@/lib/graphql/fetchGraphQL`
- **Queries**: `@/lib/uptick/queries`
- **Mappers**: `@/lib/uptick/mappers`
- **Configuration**: `@/lib/uptick/config`
- **Types**: `@/types/uptick`