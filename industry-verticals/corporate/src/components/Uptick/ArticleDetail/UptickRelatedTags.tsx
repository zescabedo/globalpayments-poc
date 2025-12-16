import React from 'react';
import { useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { useI18n } from 'next-localization';
import { renderTags } from '@/utils/renderTags';

export interface RelatedTagProps {
  id: string;
  name: string;
  Title?: string;
  Slug: string;
}

function toRelatedTags(data: unknown): RelatedTagProps[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (item): item is RelatedTagProps =>
        typeof item === 'object' && item !== null && 'id' in item && 'name' in item
    )
    .map((item) => item as RelatedTagProps);
}

const UptickRelatedTags = (): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const { t } = useI18n();

  const industriesTags = toRelatedTags(sitecoreContext?.route?.fields?.Industries);
  const productsTags = toRelatedTags(sitecoreContext?.route?.fields?.Products);
  const topicsTags = toRelatedTags(sitecoreContext?.route?.fields?.Topics);

  return (
    <div className="related-sections-container">
      {t('See our related sections') && (
        <h3 className="related-sections-heading-title">{t('See our related sections')}</h3>
      )}
      <ul className="related-sections-content-list">
        {renderTags(industriesTags, 'industries', sitecoreContext)}
        {renderTags(productsTags, 'products', sitecoreContext)}
        {renderTags(topicsTags, 'topics', sitecoreContext)}
      </ul>
    </div>
  );
};

export default UptickRelatedTags;
