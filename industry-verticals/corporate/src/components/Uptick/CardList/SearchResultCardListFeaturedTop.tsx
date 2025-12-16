import React from 'react';
import {
  ComponentParams,
  ComponentRendering,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';
import CardListDefault from '@/components/Uptick/CardList/CardListDefault';
import { useUptickCardList, ProductionApiResponse } from '@/utils/uptick/useUptickCardList';
import { UptickItem } from '@/lib/uptick/mappers';
import { SearchResultCardListFields } from '@/components/Uptick/CardList/CardList.types';

type Props = {
  rendering: ComponentRendering;
  fields: SearchResultCardListFields;
  params: ComponentParams;
  pageSize?: number;
  siteOverride?: string;
  langOverride?: string;
  fetcherOverride?: (url: string) => Promise<unknown>;
};

const SearchResultCardListFeaturedTop = ({
  rendering,
  fields,
  params,
  pageSize = 5,
  siteOverride,
  langOverride,
  fetcherOverride,
}: Props): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const pageState = sitecoreContext?.pageState;
  const site = siteOverride || sitecoreContext?.site?.name || 'corporate';
  const lang = langOverride || sitecoreContext?.language || 'en';

  // Extract multiple contentTypeIds from datasource
  const contentTypeIds: string[] =
    fields?.data?.item?.contentTypeFilter?.targetItems
      ?.map((ti) => (ti?.id || '').trim())
      .filter(Boolean) || [];
  const contentTypeSlugs: string[] =
    fields?.data?.item?.contentTypeFilter?.targetItems
      ?.map((ti) => (ti?.slug?.value || '').trim())
      .filter(Boolean) || [];

  const title = fields.data.item?.componentTitle?.jsonValue?.value || 'Level up';
  const ctaLink = fields.data.item?.exploreCtaLink;
  const ctaLinkTextOverride = fields.data.item?.exploreCtaText?.jsonValue?.value ?? 'Explore more';

  // Call the reusable hook
  const { listProps } = useUptickCardList({
    rendering,
    params,
    pageState,
    title,
    ctaLink,
    site,
    lang,
    pageSize,
    types: contentTypeIds,
    typesSlug: contentTypeSlugs,
    sitecoreContext,
    ctaLinkTextOverride: ctaLinkTextOverride,
    fetcher: fetcherOverride as
      | ((url: string) => Promise<ProductionApiResponse<UptickItem>>)
      | undefined,
  });
  params.variant = 'feature-on-top';
  // Render with default CardList renderer
  return <CardListDefault {...listProps} />;
};

export default SearchResultCardListFeaturedTop;
