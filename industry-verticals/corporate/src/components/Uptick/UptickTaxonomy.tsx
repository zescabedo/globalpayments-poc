import { Link } from '@sitecore-jss/sitecore-jss-nextjs';
import { UptickTaxonomyProps } from '@/components/Uptick/UptickTaxonomy.types';
import localDebug from '@/lib/_platform/logging/debug-log';

export const UptickTaxonomy = (props: UptickTaxonomyProps): JSX.Element => {
  localDebug.uptick('[UptickTaxonomy] props: %o', props);
  const validTaxonomyItems = props?.taxonomyItems?.filter((x) => x.name.value && x.link.value);
  localDebug.uptick('[UptickTaxonomy] validTaxonomyItems: %o', validTaxonomyItems);
  const authorClass = props.isForAuthorCard ? 'author-variant' : '';

  if (!validTaxonomyItems || validTaxonomyItems.length == 0) {
    return <></>;
  }

  return (
    <ul className={`uptick-content-taxonomy ${authorClass}`}>
      {validTaxonomyItems.map((taxonomyItem, index) => {
        return (
          <li key={index}>
            <Link field={taxonomyItem.link}>
              <a
                className={`uptick-tag-component tag-${taxonomyItem.type} tags-item ${
                  taxonomyItem.isFeatured ? 'featured' : ''
                }`}
              >
                {taxonomyItem.name.value}
              </a>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
