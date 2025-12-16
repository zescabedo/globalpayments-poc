/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import {
  ComponentParams,
  ComponentRendering,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';
import RelatedContentCardsDefault from '@/components/Uptick/RelatedContentCardsDefault';
import {
  CardListFields,
  CardListProps,
  SearchResultRelatedContentCardFields,
} from './CardList.types';
import { CardFields } from '@/components/Uptick/CardList/Card.types';
import { mapUptickToCardFields } from '@/lib/uptick/mappers';
import { buildUptickUrl } from '@/utils/uptick/buildUptickUrl';
import { useBffList } from '@/utils/uptick/useBffList';
import type { UptickItem } from '@/lib/uptick/mappers';
import { ProductionApiResponse } from '@/utils/uptick/useUptickCardList';
import localDebug from '@/lib/_platform/logging/debug-log';
import { UPTICK_APIS } from '@/constants/appConstants';

type Props = {
  rendering: ComponentRendering;
  params: ComponentParams;
  fields: SearchResultRelatedContentCardFields; // only DS now—current item comes from context processor
};

/** 👇 Adjust here if your context processor uses different keys */
function pickCurrentFromContext(scCtx: Record<string, unknown>) {
  // Extract from Sitecore layout service route.fields
  const route = (scCtx?.route as Record<string, unknown>) || {};
  const uc = (route?.fields as Record<string, unknown>) || {};

  // Get slug - handle both Field<string> format and plain string
  const slug = uc.Slug?.value || uc.Slug || route?.displayName || '';

  // Get ContentType array and extract first item's ID
  const contentTypeArray = Array.isArray(uc.ContentType) ? uc.ContentType : [];
  const contentType = contentTypeArray.length > 0 ? contentTypeArray[0] : null;
  const contentTypeId = contentType?.id || '';
  const contentTypeName = contentType?.name || '';

  // Get Industries array and map to IDs
  const industriesArray = Array.isArray(uc.Industries) ? uc.Industries : [];
  const industries = industriesArray.map((i: any) => i?.id).filter(Boolean);

  // Get Topics array and map to IDs
  const topicsArray = Array.isArray(uc.Topics) ? uc.Topics : [];
  const topics = topicsArray.map((t: any) => t?.id).filter(Boolean);

  // Get Products array and map to IDs
  const productsArray = Array.isArray(uc.Products) ? uc.Products : [];
  const products = productsArray.map((p: any) => p?.id).filter(Boolean);

  return {
    slug,
    contentTypeId,
    industries,
    topics,
    products,
    contentTypeName,
  };
}

const SearchResultRelatedContentCards = ({ rendering, params, fields }: Props) => {
  const { sitecoreContext } = useSitecoreContext();
  const site = sitecoreContext?.site?.name || 'corporate';
  const lang = sitecoreContext?.language || 'en';

  const title = fields.data.item?.componentTitle?.value || 'Related content';

  const N = Math.max(1, Number(fields.data.item?.itemsToShow?.value || 3));
  const excludeSameType =
    String(fields.data.item?.excludeSameContentType?.value ?? '1') === '1' ||
    String(fields.data.item?.excludeSameContentType?.value ?? 'true') === 'true';

  const tagScope = 'Audience';
  const restrictTypeIds = fields.data.item?.contentTypeFilter?.targetItems
    ?.map((t) => t?.id)
    .filter(Boolean);

  // 🔹 Current item from context processor
  const {
    slug: currentSlug,
    contentTypeId: currentTypeId,
    industries: currIndustries,
    topics: currTopics,
    products: currProducts,
    contentTypeName: currentContentTypeName,
  } = pickCurrentFromContext(sitecoreContext);

  localDebug.uptick('[SearchResultRelatedContentCards] context: %o', {
    sitecoreContext,
    currentSlug,
    currentTypeId,
    currentContentTypeName,
    currIndustries,
    currTopics,
    currProducts,
  });

  // DYNAMIC by tag (related API); ask for extra to allow filtering/exclusions
  const relatedUrl = buildUptickUrl(
    'related',
    { site, lang, pageSize: N * 3 },
    {},
    {
      slug: currentSlug,
      match: 'any',
      types: restrictTypeIds?.length ? restrictTypeIds : undefined,
      limit: N * 3,
    }
  );
  const { data: relatedData } = useBffList<ProductionApiResponse<UptickItem>>(relatedUrl);

  localDebug.uptick('[SearchResultRelatedContentCards] URLs: %o', { relatedUrl });

  // FALLBACK latest
  const latestUrl = buildUptickUrl('content', { site, lang, pageSize: N * 3 });
  const { data: latestData } = useBffList<ProductionApiResponse<UptickItem>>(latestUrl);

  localDebug.uptick('[SearchResultRelatedContentCards] latest URL: %o', { latestUrl });

  // Resolve override slugs from DS multilist
  const sameTagSlugs =
    fields.data.item?.overrideSameTag?.targetItems?.map(
      (x) => x?.url?.path?.split('/').pop() || ''
    ) || [];
  const otherTagSlugs =
    fields.data.item?.overrideOtherTag?.targetItems?.map(
      (x) => x?.url?.path?.split('/').pop() || ''
    ) || [];

  localDebug.uptick('[SearchResultRelatedContentCards] override slugs: %o', {
    sameTagSlugs,
    otherTagSlugs,
  });

  // FIX: Build URLs for all override items upfront (hooks must be called unconditionally)
  const sameTagUrls = sameTagSlugs
    .filter(Boolean)
    .map(
      (s) =>
        `${UPTICK_APIS.content}${encodeURIComponent(s)}?site=${encodeURIComponent(
          site
        )}&lang=${encodeURIComponent(lang)}`
    );

  const otherTagUrls = otherTagSlugs
    .filter(Boolean)
    .map(
      (s) =>
        `${UPTICK_APIS.content}${encodeURIComponent(s)}?site=${encodeURIComponent(
          site
        )}&lang=${encodeURIComponent(lang)}`
    );

  // Call hooks for each URL (must be unconditional and in same order)
  const sameTagResults = sameTagUrls.map((url) =>
    useBffList<ProductionApiResponse<UptickItem>>(url)
  );
  const otherTagResults = otherTagUrls.map((url) =>
    useBffList<ProductionApiResponse<UptickItem>>(url)
  );

  // Extract items from results
  const sameTagItems = sameTagResults
    .map((r) => r.data?.data?.content?.[0])
    .filter(Boolean) as UptickItem[];

  const otherTagItems = otherTagResults
    .map((r) => r.data?.data?.content?.[0])
    .filter(Boolean) as UptickItem[];

  // Helpers
  // FIX: Normalize GUID format for comparison (handle with/without braces)
  const normalizeId = (id: string | undefined): string => {
    if (!id) return '';
    // Remove braces and convert to lowercase for comparison
    return id.replace(/[{}]/g, '').toLowerCase();
  };

  // Tag filter for "overrideSameTag" must match current page's tag scope
  // Using IDs for matching instead of names
  const currentTagsSet = new Set(
    (tagScope === 'Audience' ? currIndustries : currTopics).map(
      (x: string) => normalizeId(x) // Normalize to remove braces
    )
  );

  const sharesTag = (it: UptickItem) => {
    // Match by ID - BFF returns objects with lowercase GUIDs without braces
    const list = (tagScope === 'Audience' ? it.industries : it.topics) || [];
    return list.some((item: any) => {
      // item might be an object with 'id' property or a string
      const itemId = typeof item === 'object' ? item?.id : item;
      const normalized = normalizeId(String(itemId || ''));
      return currentTagsSet.has(normalized);
    });
  };

  // Filter to exclude current article by slug
  const isNotCurrentArticle = (it: UptickItem) => {
    const itemSlug = String(it.slug || '').toLowerCase();
    const currentSlugLower = String(currentSlug || '').toLowerCase();
    const isCurrentArticle = itemSlug === currentSlugLower;

    if (isCurrentArticle) {
      localDebug.uptick('[SearchResultRelatedContentCards] Filtering out current article:', {
        itemSlug,
        currentSlug: currentSlugLower,
      });
    }

    return !isCurrentArticle;
  };

  // Check if content type matches (use ContentType.name vs contentTypeName)
  const isSameContentType = (it: UptickItem) => {
    const itemTypeName = String(it.contentTypeName || '').toLowerCase();
    const currentTypeName = String(currentContentTypeName || '').toLowerCase();
    const matches = itemTypeName === currentTypeName;

    localDebug.uptick('[SearchResultRelatedContentCards] Type comparison:', {
      itemTypeName,
      currentContentTypeName,
      currentTypeName,
      matches,
    });

    return matches;
  };

  // For related data: only filter out current article (ignore excludeSameType)
  const isValidForRelated = (it: UptickItem) => {
    return isNotCurrentArticle(it);
  };

  // For latest data: filter out current article AND apply excludeSameType
  const isValidForLatest = (it: UptickItem) => {
    if (!isNotCurrentArticle(it)) return false;
    if (!excludeSameType) return true;
    return !isSameContentType(it); // Exclude if same type
  };

  const uniqById = <T extends { id?: string }>(arr: T[]) => {
    const seen = new Set<string>();
    return arr.filter((x) => {
      const k = x?.id || '';
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  // Build final list per precedence
  const relatedContent = Array.isArray(relatedData?.data)
    ? relatedData.data
    : relatedData?.data?.content || [];
  const latestContent = Array.isArray(latestData?.data)
    ? latestData.data
    : latestData?.data?.content || [];

  localDebug.uptick('[SearchResultRelatedContentCards] Raw API data:', {
    relatedCount: relatedContent.length,
    latestCount: latestContent.length,
    relatedSuccess: relatedData?.success,
    latestSuccess: latestData?.success,
    currentSlug,
    currentContentTypeName,
    excludeSameType,
  });

  // NEW LOGIC: Related data ignores excludeSameType, only filters current article
  const dynamicFirst = uniqById(relatedContent.filter(isValidForRelated));

  // Override items also only filter current article
  const sameTagOverrides = uniqById(
    (sameTagItems || []).filter((it) => sharesTag(it) && isValidForRelated(it))
  );
  const otherTagOverrides = uniqById((otherTagItems || []).filter(isValidForRelated));

  // Latest data applies both filters: current article + excludeSameType
  const latestFallback = uniqById(latestContent.filter(isValidForLatest));

  localDebug.uptick('[SearchResultRelatedContentCards] Filtered pools: %o', {
    dynamicFirstCount: dynamicFirst.length,
    sameTagOverridesCount: sameTagOverrides.length,
    otherTagOverridesCount: otherTagOverrides.length,
    latestFallbackCount: latestFallback.length,
    itemsNeeded: N,
    relatedIgnoresExcludeFlag: true,
    latestRespectsExcludeFlag: excludeSameType,
  });

  const merged: UptickItem[] = [];
  const pushUntilN = (src: UptickItem[]) => {
    for (const it of src) {
      if (merged.length >= N) break;
      if (!merged.find((m) => m.id === it.id)) merged.push(it);
    }
  };

  // Precedence: Dynamic → OverrideSameTag → OverrideOtherTag → Latest
  pushUntilN(dynamicFirst);
  localDebug.uptick('[SearchResultRelatedContentCards] After dynamic:', { count: merged.length });

  pushUntilN(sameTagOverrides);
  localDebug.uptick('[SearchResultRelatedContentCards] After sameTag overrides:', {
    count: merged.length,
  });

  pushUntilN(otherTagOverrides);
  localDebug.uptick('[SearchResultRelatedContentCards] After otherTag overrides:', {
    count: merged.length,
  });

  pushUntilN(latestFallback);
  localDebug.uptick('[SearchResultRelatedContentCards] After latest fallback:', {
    count: merged.length,
  });

  // Map to CardFields and build final props
  const cards: CardFields[] = merged.map((c) => mapUptickToCardFields(c, sitecoreContext));

  localDebug.uptick('[SearchResultRelatedContentCards] Final merged items: %o', {
    totalCount: merged.length,
    itemIds: merged.map((m) => ({ id: m.id, slug: m.slug, contentType: m.contentType })),
    cards: cards.length,
  });

  // Optionally append restrictTypes to CTA
  let finalCtaLink = fields.data.item?.exploreCtaLink;
  if (finalCtaLink?.value?.href && restrictTypeIds?.length) {
    const u = new URL(finalCtaLink.value.href, 'http://dummy');
    u.searchParams.set('types', restrictTypeIds.join(','));
    finalCtaLink = { value: { ...finalCtaLink.value, href: u.pathname + u.search } };
  }

  const listFields: CardListFields = {
    title: { value: title },
    ctaLink: finalCtaLink?.jsonValue,
    subtitle: { value: '' },
    cards,
  };
  const listProps: CardListProps = { rendering, params, fields: listFields };

  return <RelatedContentCardsDefault {...listProps} />;
};

export default SearchResultRelatedContentCards;
