import { generateAllContentUrl, generateIndustryUrl } from '@/utils/uptick/linkResolver';
import { getFieldValue, getLastUrlPart, getSlug, normalizeItem } from '@/utils/urlUtils';
import { useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import Link from 'next/link';
import { useMemo } from 'react';
import { TagItem, TagProps, TaxonomyTagsProps, UptickTaxonomyItem } from './TaxonomyTags.type';
import { useRouter } from 'next/router';

const buildUrl = (link: string | { href: string; querystring?: string }): string => {
  if (typeof link === 'string') return link;
  return link.querystring ? `${link.href}?${link.querystring}` : link.href;
};

const processOverrides = (overrides: UptickTaxonomyItem[]): TagItem[] => {
  return overrides
    .filter((override) => override?.name?.value && override?.link?.value?.href)
    .slice(0, 2) // Only take first 2 items
    .map((override) => {
      const name = override?.name?.value ?? '';
      const href = override?.link?.value?.href ?? '';
      const querystring = override?.link?.value?.querystring;
      const link = querystring ? `${href}?${querystring}` : href;
      const isFeatured = override?.type === 'audience';

      return { name, link, isFeatured };
    });
};

export const useTaxonomyTags = ({
  item,
  isIndustry = false,
  audienceSlug,
}: Pick<TaxonomyTagsProps, 'item' | 'isIndustry'> & {
  audienceSlug?: string;
}): TagItem[] => {
  const { sitecoreContext } = useSitecoreContext();
  return useMemo(() => {
    const tags: TagItem[] = [];
    if (!item) return tags;

    // Process overrides first (tags property) - only return 2 tags
    if (item.tags && item.tags.length > 0) {
      return processOverrides(item.tags);
    }

    // Process industries
    if (item.industries) {
      const industry = normalizeItem(item.industries);
      if (industry) {
        const title = getFieldValue(industry, 'Title') || industry.displayName || '';
        const slug = getSlug(industry);

        if (title && slug) {
          const link = generateIndustryUrl(slug, sitecoreContext);
          tags.push({ name: title, link: buildUrl(link), isFeatured: true });
        }
      }
    }

    // Process topics
    if (item.topics) {
      const topic = normalizeItem(item.topics);
      if (topic) {
        const title = getFieldValue(topic, 'Title') || topic.displayName || '';
        const slug = getSlug(topic);

        if (title && slug) {
          let link: string | { href: string; querystring?: string };

          if (isIndustry && audienceSlug) {
            link = generateIndustryUrl(audienceSlug, sitecoreContext, undefined, [slug]);
          } else {
            link = generateAllContentUrl(sitecoreContext, undefined, [slug]);
         }
          tags.push({ name: title, link: buildUrl(link) });
        }
      }
    }

    return tags;
  }, [item, sitecoreContext, isIndustry, audienceSlug]);
};

const Tag = ({
  onClick,
  disabled,
  name,
  link,
  className = '',
  variant = 'default',
  useAnchor = false,
  useButton = false,
  size = 'base',
}: TagProps & { useAnchor?: boolean; useButton?: boolean }) => {
  const mergedClass = ['uptick-tag', variant, size, className].filter(Boolean).join(' ');

  if (useButton) {
    return (
      <button className={mergedClass} onClick={onClick} disabled={disabled}>
        {name}
      </button>
    );
  }

  // Use anchor tag when useAnchor is true (useful for same-page filtering)
  if (useAnchor) {
    return (
      <a href={link || '#'} className={mergedClass}>
        {name}
      </a>
    );
  }

  return (
    <Link href={link || '#'} className={mergedClass}>
      {name}
    </Link>
  );
};

const TaxonomyTags = ({
  tagItems,
  className = '',
  item,
  isDark = false,
  isIndustry = false,
  useAnchor = false,
  size = 'base',
}: TaxonomyTagsProps & { useAnchor?: boolean }) => {
  const router = useRouter();
  // Use hook to process item if provided, otherwise use tagItems directly
  const processedTags = useTaxonomyTags({
    item,
    isIndustry,
    audienceSlug: getLastUrlPart(router.asPath.split('?')[0]),
  });
  const tags = item ? processedTags : tagItems;
  const validTags = tags?.filter((x) => x?.name && x?.link);

  if (!validTags || validTags.length === 0) {
    return null;
  }

  return (
    <ul className={`uptick-taxonomy-tags ${className}`.trim()}>
      {validTags.map((tag, index) => (
        <li key={`${tag.name}-${index}`}>
          <Tag
            {...tag}
            size={size}
            variant={tag.isFeatured ? 'featured' : 'default'}
            className={isDark ? 'dark-mode' : ''}
            useAnchor={useAnchor}
          />
        </li>
      ))}
    </ul>
  );
};

export { Tag, TaxonomyTags };
 