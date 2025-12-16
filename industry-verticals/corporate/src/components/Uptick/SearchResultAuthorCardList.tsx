import React from 'react';
import {
  ComponentParams,
  ComponentRendering,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';
import AuthorCardList from '@/components/Uptick/AuthorCardList';
import {
  AuthorCardListProps,
  AuthorCardListFields,
} from '@/components/Uptick/AuthorCardList.types';
import { SearchResultAuthorCardListFields } from '@/components/Uptick/CardList/CardList.types';
import { buildUptickUrl } from '@/utils/uptick/buildUptickUrl';
import { AuthorCardFields, AuthorLite } from '@/components/Uptick/AuthorCard.types';
import { mapAuthorToAuthorFields } from '@/lib/uptick/mappers';
import localDebug from '@/lib/_platform/logging/debug-log';
import { useLoadMore, LoadMoreResponse } from '@/utils/uptick/useLoadMore';
import LoadMoreButton from '@/components/Uptick/LoadMoreButton/LoadMoreButton';

type Props = {
  rendering: ComponentRendering;
  fields: SearchResultAuthorCardListFields;
  params: ComponentParams;
  pageSize?: number;
  siteOverride?: string;
  langOverride?: string;
  fetcherOverride?: (url: string) => Promise<unknown>;
};

const SearchResultAuthorCardList = ({
  rendering,
  params,
  fields,
  pageSize = 10,
  siteOverride,
  langOverride,
  fetcherOverride,
}: Props): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const site = siteOverride || sitecoreContext?.site?.name || 'corporate';
  const lang = langOverride || sitecoreContext?.language || 'en';
  const fetchSMEList = fields.data.item?.fetchSMEList?.jsonValue?.value ?? 'false';

  localDebug.uptick('[SearchResultAuthorCardList] props: %o', {
    rendering,
    params,
    fields,
    pageSize,
    site,
    lang,
  });

  const url = buildUptickUrl(
    'authors',
    { site, lang, pageSize },
    { isSME: fetchSMEList ? 'true' : 'false' }
  );

  const { items, isLoading, isError, hasMore, loadMore, isLoadingMore } = useLoadMore<AuthorLite>({
    initialUrl: url,
    pageSize,
    fetcher: fetcherOverride as
      | ((url: string) => Promise<LoadMoreResponse<AuthorLite>>)
      | undefined,
  });

  localDebug.uptick('[SearchResultAuthorCardList] data:', items, isLoading, isError);

  const authors: AuthorCardFields[] = items.map((a) => mapAuthorToAuthorFields(a, sitecoreContext));
  const title = fields.data.item.componentTitle?.jsonValue?.value || 'Results';
  const subtitle = fields.data.item.componentSubTitle?.jsonValue?.value || 'Results';
  const loadMoreText = fields.data.item.loadMoreText?.jsonValue?.value || 'Load More';
  const loadingText = fields.data.item.loadingText?.jsonValue?.value || 'Loading';
  localDebug.uptick('[SearchResultAuthorCardList] authors: %o', authors);

  const authorFields: AuthorCardListFields = {
    title: { value: title || '' },
    subtitle: { value: subtitle || '' },
    authors,
  };

  const authorCardListProps: AuthorCardListProps = {
    rendering: {
      componentName: 'AuthorCardList',
      params: {} as ComponentParams,
    } as ComponentRendering,
    params: {},
    fields: authorFields,
  };

  // Render with default CardList renderer
  return (
    <>
      <AuthorCardList {...authorCardListProps} />
      <LoadMoreButton
        onClick={loadMore}
        isLoading={isLoadingMore}
        hasMore={hasMore}
        text={loadMoreText}
        loadingText={loadingText}
      />
    </>
  );
};

export default SearchResultAuthorCardList;
