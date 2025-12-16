import React from 'react';
import {
  ComponentParams,
  ComponentRendering,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { useUptickCardList, ProductionApiResponse } from '@/utils/uptick/useUptickCardList';
import { UptickItem } from '@/lib/uptick/mappers';
import { SearchResultCardListFields } from '@/components/Uptick/CardList/CardList.types';
import FeaturedContent from '@/components/Uptick/FeaturedContent';

type Props = {
  rendering: ComponentRendering;
  fields: SearchResultCardListFields;
  params: ComponentParams;
  pageSize?: number;
  siteOverride?: string;
  langOverride?: string;
  fetcherOverride?: (url: string) => Promise<unknown>;
};

const SearchResultFeaturedContent = ({
  rendering,
  fields,
  params,
  pageSize = 2,
  siteOverride,
  langOverride,
  fetcherOverride,
}: Props): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const site = siteOverride || sitecoreContext?.site?.name || 'CorporateHeadless';
  const lang = langOverride || sitecoreContext?.language || 'en-us';

  // Extract multiple contentTypeIds from datasource
  const contentTypeIds: string[] =
    fields?.data?.item?.contentTypeFilter?.targetItems
      ?.map((ti) => (ti?.id || '').trim())
      .filter(Boolean) || [];
  const contentTypeSlugs: string[] =
    fields?.data?.item?.contentTypeFilter?.targetItems
      ?.map((ti) => (ti?.slug?.value || '').trim())
      .filter(Boolean) || [];
  const industryId = sitecoreContext?.route?.itemId || 'aceeec0f-a122-42c0-b87b-1d87f21122a9';

  const title = fields.data.item.componentTitle?.jsonValue?.value || 'Results';
  pageSize = Math.max(1, Number(fields.data.item?.itemsToShow?.value || 6));

  // Call the reusable hook
  const { listProps } = useUptickCardList({
    rendering,
    params,
    pageState: sitecoreContext?.pageState,
    title,
    ctaLink: fields.data.item.exploreCtaLink,
    site,
    lang,
    pageSize,
    types: contentTypeIds,
    typesSlug: contentTypeSlugs,
    industries: [industryId],
    sitecoreContext,
    fetcher: fetcherOverride as
      | ((url: string) => Promise<ProductionApiResponse<UptickItem>>)
      | undefined,
  });
  params.variant =
    pageSize >= 2 && pageSize <= 4 ? `${pageSize}-in-row` : pageSize > 4 ? '3-in-row' : 'default';

  // Render with default CardList renderer
  return <FeaturedContent {...listProps} />;
};

export default SearchResultFeaturedContent;
