import { RelatedTagProps } from '@/components/Uptick/ArticleDetail/UptickRelatedTags';
import { generateIndustryUrl, generateProductUrl, generateTopicUrl } from './uptick/linkResolver';
import { SitecoreContextValue } from '@sitecore-content-sdk/nextjs';
import localDebug from '@/lib/_platform/logging/debug-log';
import { Tag } from '@/components/Uptick/TaxonomyTags/TaxonomyTags';

export const renderTags = (
  tags: RelatedTagProps[],
  tagType: 'industries' | 'products' | 'topics',
  sitecoreContext: SitecoreContextValue
) => {
  return tags.map((relTag, index) => {
    let href = '/';

    const slug = relTag?.Slug;

    if (!slug) {
      localDebug.uptick.warn(`Missing slug for tag:`, relTag);
      return null;
    }

    switch (tagType) {
      case 'industries':
        href = generateIndustryUrl(slug, sitecoreContext) as string;
        break;
      case 'products':
        href = generateProductUrl(slug, sitecoreContext, false) as string;
        break;
      case 'topics':
        href = generateTopicUrl(slug, sitecoreContext, false) as string;
        break;
    }

    return (
      <li key={`${tagType}-${relTag.id}-${index}`} className="tag-topic">
        <Tag
          link={href}
          name={relTag?.Title?.trim() || relTag?.name}
          variant={tagType === 'industries' ? 'featured' : 'default'}
        />
      </li>
    );
  });
};
