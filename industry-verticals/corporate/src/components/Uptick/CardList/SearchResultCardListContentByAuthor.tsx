import React from 'react';
import {
  ComponentParams,
  ComponentRendering,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';
import CardListDefault from '@/components/Uptick/CardList/CardListDefault';
import { UptickItem, mapUptickToCardFields } from '@/lib/uptick/mappers';
import {
  SearchResultCardListFields,
  CardListFields,
} from '@/components/Uptick/CardList/CardList.types';
import { useLoadMore, LoadMoreResponse } from '@/utils/uptick/useLoadMore';
import LoadMoreButton from '@/components/Uptick/LoadMoreButton/LoadMoreButton';
import { buildUptickUrl } from '@/utils/uptick/buildUptickUrl';
import { CardFields } from '@/components/Uptick/CardList/Card.types';

type Props = {
  rendering: ComponentRendering;
  fields: SearchResultCardListFields;
  params: ComponentParams;
  pageSize?: number;
  siteOverride?: string;
  langOverride?: string;
  fetcherOverride?: (url: string) => Promise<unknown>;
};

type InnerProps = Props & {
  authorId: string;
  authorName: string;
  site: string;
  lang: string;
};

const SearchResultCardListContentByAuthorInner = ({
  rendering,
  fields,
  params,
  pageSize = 12,
  fetcherOverride,
  authorId,
  authorName,
  site,
  lang,
}: InnerProps): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const authorBookMark = 'authorName';

  const contentTypeIds: string[] =
    fields?.data?.item?.contentTypeFilter?.targetItems
      ?.map((ti) => (ti?.id || '').trim())
      .filter(Boolean) || [];

  let title = fields.data.item.componentTitle?.jsonValue?.value || 'Results';
  if (authorName) {
    title = title.replace(`{{${authorBookMark}}}`, authorName.split(' ')[0]);
  }
  const loadMoreText = fields.data.item.loadMoreText?.jsonValue?.value || 'Load More';
  const loadingText = fields.data.item.loadingText?.jsonValue?.value || 'Loading';

  // Build URL for content API with filters
  const url = buildUptickUrl(
    'content',
    { site, lang, pageSize },
    { types: contentTypeIds, authorId }
  );

  // Use Load More hook
  const { items, hasMore, loadMore, isLoadingMore } = useLoadMore<UptickItem>({
    initialUrl: url,
    pageSize,
    fetcher: fetcherOverride as
      | ((url: string) => Promise<LoadMoreResponse<UptickItem>>)
      | undefined,
  });

  // Filter items by authorId if needed
  const filteredItems =
    authorId && authorId !== ''
      ? items.filter((item) => item.authors?.some((a) => a.id === authorId))
      : items;

  // Map to card fields
  const cards: CardFields[] = filteredItems.map((item) =>
    mapUptickToCardFields(item, sitecoreContext ?? {})
  );

  const cardListFields: CardListFields = {
    title: { value: title || '' },
    subtitle: { value: '' },
    cards,
  };

  const listProps = {
    rendering,
    params,
    fields: cardListFields,
  };

  // Only show Load More if we have filtered items and there are more results
  const shouldShowLoadMore = hasMore && filteredItems.length > pageSize;

  // Render with default CardList renderer and Load More button
  return (
    <>
      <CardListDefault {...listProps} />
      <LoadMoreButton
        onClick={loadMore}
        isLoading={isLoadingMore}
        hasMore={shouldShowLoadMore}
        text={loadMoreText}
        loadingText={loadingText}
      />
    </>
  );
};

const SearchResultCardListContentByAuthor = (props: Props): JSX.Element => {
  const { siteOverride, langOverride } = props;
  const { sitecoreContext } = useSitecoreContext();
  const site = siteOverride || sitecoreContext?.site?.name || 'CorporateHeadless';
  const lang = langOverride || sitecoreContext?.language || 'en-US';
  const authorId = sitecoreContext?.route?.itemId || '';
  const authorName = (sitecoreContext?.route?.fields?.givenname as unknown as string) || '';

  return (
    <SearchResultCardListContentByAuthorInner
      key={authorId}
      {...props}
      authorId={authorId}
      authorName={authorName}
      site={site}
      lang={lang}
    />
  );
};

export default SearchResultCardListContentByAuthor;
