import React from 'react';
import useSWR from 'swr';
import {
  ComponentParams,
  ComponentRendering,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';
import ContentCardCarousel from './ContentCardCarousel';
import { CardFields } from './CardList/Card.types';
import { CardListFields, CardListProps } from './CardList/CardList.types';
import { PagedResult } from '@/types/uptick';
import { makeIndustry, makeTopic, TaxonomyItem, UptickItem } from '@/lib/uptick/mappers';
import { Field, RichTextField, ImageField, LinkField } from '@sitecore-jss/sitecore-jss-nextjs';
import { UptickTaxonomyItem } from './UptickTaxonomy.types';

type Props = {
  title?: string;
  pageSize?: number; // default 8
  defaultTypes?: string[];
  defaultTags?: string[];
  defaultTopics?: string[];
  defaultProducts?: string[];
  defaultIndustries?: string[];

  siteOverride?: string;
  langOverride?: string;
  fetcherOverride?: (url: string) => Promise<PagedResult<UptickItem>>;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ContentCardCarouselSearch({
  title,
  pageSize = 8,
  defaultTypes,
  defaultTags,
  defaultTopics,
  defaultProducts,
  defaultIndustries,
  siteOverride,
  langOverride,
  fetcherOverride,
}: Props) {
  const { sitecoreContext } = useSitecoreContext();
  const pageState = sitecoreContext?.pageState;

  const site = siteOverride || sitecoreContext?.site?.name || 'corporate';
  const lang = langOverride || sitecoreContext?.language || 'en';

  // Prepare URL and fetcher for SWR
  const params = new URLSearchParams({
    site,
    lang,
    page: '1',
    pageSize: String(pageSize),
    sort: '-publishedDate',
  });
  if (defaultTypes?.length) params.append('types', defaultTypes.join(','));
  if (defaultTags?.length) params.append('tags', defaultTags.join(','));
  if (defaultTopics?.length) params.append('topics', defaultTopics.join(','));
  if (defaultProducts?.length) params.append('products', defaultProducts.join(','));
  if (defaultIndustries?.length) params.append('industries', defaultIndustries.join(','));

  const url = `/api/uptick/content?${params.toString()}`;
  const _fetcher = fetcherOverride || fetcher;

  // Always call hooks at the top level
  const { data, error, isLoading } = useSWR<PagedResult<UptickItem>>(url, _fetcher);

  const isEditLike = pageState && pageState !== 'normal';
  if (isEditLike) {
    const fields: CardListFields = {
      title: { value: title || 'Carousel (editor placeholder)' },
      subtitle: { value: '' },
      cards: [],
    };
    const props: CardListProps = {
      rendering: {
        componentName: 'ContentCardCarousel',
        params: {} as ComponentParams,
      } as ComponentRendering,
      params: {},
      fields,
    };
    return <ContentCardCarousel {...props} />;
  }

  if (error || isLoading || !data) {
    const label = error ? 'Failed to load' : isLoading ? 'Loading…' : title || 'Content';
    const fields: CardListFields = { title: { value: label }, subtitle: { value: '' }, cards: [] };
    return (
      <ContentCardCarousel
        rendering={
          {
            componentName: 'ContentCardCarousel',
            params: {} as ComponentParams,
          } as ComponentRendering
        }
        params={{}}
        fields={fields}
      />
    );
  }

  const cards: CardFields[] = data.items.map(toCardFields);

  const fields: CardListFields = {
    title: { value: title || '' },
    subtitle: { value: '' },
    cards,
  };

  const props: CardListProps = {
    rendering: {
      componentName: 'ContentCardCarousel',
      params: {} as ComponentParams,
    } as ComponentRendering,
    params: {},
    fields,
  };

  return <ContentCardCarousel {...props} />;
}

function toCardFields(it: UptickItem): CardFields {

  const topics = it.topics || [];
  const topicsDisplay = it.topicsDisplay || [];
  const industries = it.industries || [];
  const industriesDisplay = it.industriesDisplay || [];

  let slotA: TaxonomyItem | undefined;
  let slotB: TaxonomyItem | undefined;

  if (industries.length > 0) {
    // A = first audience
    slotA = makeIndustry(industries[0], industriesDisplay[0]);

    // B = first topic (if any)
    if (topics.length > 0) {
      slotB = makeTopic(topics[0], topicsDisplay[0]);
    }
  } else {
    // No audience: A = first topic (if any)
    if (topics.length > 0) {
      slotA = makeTopic(topics[0], topicsDisplay[0]);
    }
    // B = next topic (distinct) if available
    if (topics.length > 1) {
      slotB = makeTopic(topics[1], topicsDisplay[1]);
    }
  }

  // Final list: up to two items, with the fallback behavior baked in
  const taxonomies = [slotA, slotB].filter(Boolean) as TaxonomyItem[];

  const image: ImageField = {
    value: it.cardImageUrl
      ? { src: it.cardImageUrl, alt: it.title }
      : it.mainImageUrl
      ? { src: it.mainImageUrl, alt: it.title }
      : { src: '', alt: '' },
  };

  const contentListingUrl: LinkField = {
    value: it.href ? { href: it.href, text: it.title } : { href: '#', text: it.title },
  };

  // Note: your CardListDefaultItem supports RichTextField for description/title
  const description: RichTextField = { value: it.summary || '' };

  const titleField: Field<string> = { value: it.title };

  return {
    title: titleField,
    description,
    taxonomies,
    contentListingUrl,
    image,
    contentType: { jsonValue: { value: it.contentType } },
    publishedDate: { jsonValue: { value: it.publishedDate ?? '' } },
    readTime: { jsonValue: { value: '4 mins' } }, // if you compute/extend later, plug here
    authorNameTag: it.authors?.[0]?.name ?? '',
    showContentListingLink: true,
  };
}
