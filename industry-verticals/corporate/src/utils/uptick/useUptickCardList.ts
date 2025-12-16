'use client';

import { CardListFields, CardListProps } from '@/components/Uptick/CardList/CardList.types';
import { CardFields } from '@/components/Uptick/CardList/Card.types';
import { mapUptickToCardFields } from '@/lib/uptick/mappers';
import { useBffList } from './useBffList';
import { UptickItem } from '@/lib/uptick/mappers';
import {
  ComponentParams,
  ComponentRendering,
  SitecoreContextValue,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { buildUptickUrl } from './buildUptickUrl';
import { generateAllContentUrl } from './linkResolver';
import localDebug from '@/lib/_platform/logging/debug-log';

type Endpoint = 'content' | 'search' | 'related' | 'authors';

// Production API response format (matches actual API structure)
export interface ProductionApiResponse<T> {
  success: boolean;
  data: {
    content: T[];
    total: number;
    hasNext: boolean;
    after?: string;
  };
  meta: {
    requestId: string;
    timestamp: string;
    processingTime: number;
  };
}

type Args = {
  // rendering context
  rendering: unknown;
  params: unknown;
  pageState?: string;

  // UI authored
  title: string;
  ctaLink?: CTAField;
  ctaLinkTextOverride?: string;

  // query context
  endpoint?: Endpoint; // default 'content'
  site: string;
  lang: string;
  pageSize?: number;

  // filters
  types?: string[];
  typesSlug?: string[];
  topics?: string[];
  categories?: string[];
  industries?: string[];
  q?: string;
  authorId?: string;

  // related-only
  slug?: string;
  match?: 'any' | 'all';
  limit?: number;

  sitecoreContext?: SitecoreContextValue;
  fetcher?: (url: string) => Promise<ProductionApiResponse<UptickItem>>;
};

export function useUptickCardList({
  rendering,
  params,
  pageState,
  title,
  ctaLink,
  endpoint = 'content',
  site,
  lang,
  pageSize = 12,
  types,
  typesSlug,
  topics,
  categories,
  industries,
  q,
  authorId,
  slug,
  match = 'any',
  limit,
  sitecoreContext,
  ctaLinkTextOverride,
  fetcher,
}: Args) {
  // Build URL per endpoint
  const url =
    endpoint === 'related'
      ? buildUptickUrl(
          'related',
          { site, lang, pageSize },
          {},
          { slug: slug || '', match, types, limit }
        )
      : buildUptickUrl(
          endpoint,
          { site, lang, pageSize },
          { types, topics, categories, industries, q, authorId }
        );

  const { data, isError, isLoading } = useBffList<ProductionApiResponse<UptickItem>>(url, fetcher);

  // Debug logging
  localDebug.uptick('[useUptickCardList] Debug info: %o', {
    url,
    isError,
    isLoading,
    hasData: !!data,
    dataType: typeof data,
    dataSuccess: data?.success,
    dataContent: Array.isArray(data?.data?.content) ? data.data.content.length : 'not array',
  });

  // EE/Preview: placeholder only
  const isEditLike = pageState && pageState !== 'normal';
  if (isEditLike) {
    const placeholderFields: CardListFields = {
      title: { value: title || 'Results' },
      subtitle: { value: '' },
      cards: [],
    };
    const placeholderProps: CardListProps = {
      rendering: rendering as ComponentRendering,
      params: params as ComponentParams,
      fields: placeholderFields,
    };
    return { isEditLike: true, isLoading: false, isError: false, listProps: placeholderProps };
  }

  if (isError || isLoading || !data) {
    const stateTitle = isError
      ? `${title || 'Results'} (error)`
      : `${title || 'Results'} (loading…)`;
    const placeholderFields: CardListFields = {
      title: { value: stateTitle },
      subtitle: { value: '' },
      cards: [],
    };
    const placeholderProps: CardListProps = {
      rendering: rendering as ComponentRendering,
      params: params as ComponentParams,
      fields: placeholderFields,
    };
    return {
      isEditLike: false,
      isLoading: !!isLoading,
      isError: !!isError,
      listProps: placeholderProps,
    };
  }

  // Extract items from production API response format
  let items: UptickItem[];

  if (!data || !data.success || !Array.isArray(data.data?.content)) {
    localDebug.uptickBff.warn(
      '[useUptickCardList] Invalid production API response format: %o',
      data
    );
    items = [];
  } else {
    items = data.data.content;
  }

  const cards: CardFields[] =
    authorId && authorId != ''
      ? filterArticlesByAuthorId(items, authorId).map((item) =>
          mapUptickToCardFields(item, sitecoreContext ?? {})
        )
      : items.map((item) => mapUptickToCardFields(item, sitecoreContext ?? {}));

  //Build search Url
  let finalCtaLink = ctaLink?.jsonValue;
  const { href, querystring } = buildSearchExploreUrl(
    finalCtaLink?.value?.href,
    sitecoreContext ?? {},
    typesSlug?.length ? typesSlug : types
  );
  if (href) {
    finalCtaLink = {
      value: {
        ...finalCtaLink?.value,
        href: href,
        querystring: querystring ? querystring : finalCtaLink?.value?.querystring || '',
        text: ctaLinkTextOverride,
      },
    };
  }

  const fields: CardListFields = {
    title: { value: title || '' },
    ctaLink: finalCtaLink,
    subtitle: { value: '' },
    cards,
  };

  const listProps: CardListProps = {
    rendering: rendering as ComponentRendering,
    params: params as ComponentParams,
    fields,
  };
  return { isEditLike: false, isLoading: false, isError: false, listProps };
}

function buildSearchExploreUrl(
  ctaOverridehref: string,
  sitecoreContext: SitecoreContextValue,
  queryTypes?: string[] | undefined
) {
  if (ctaOverridehref) {
    const u = new URL(ctaOverridehref, 'http://dummy');
    if (queryTypes?.length) {
      u.searchParams.set('types', queryTypes.join(','));
    }
    return { href: u.pathname, querystring: u.search };
  }
  //fallback to default
  return generateAllContentUrl(sitecoreContext, queryTypes, undefined, undefined, true);
}

function filterArticlesByAuthorId(content: UptickItem[], authorId: string) {
  if (!Array.isArray(content)) return content;
  return content.filter((c) => c.authors?.some((a) => a.id === authorId));
}
