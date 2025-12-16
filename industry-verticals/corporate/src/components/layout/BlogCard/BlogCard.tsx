import { RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import LinkItem from '@/components/ui/Link/Link';
import { BlogCardtype } from '@/components/layout/BlogCards/BlogCards.types';
import { GPImage } from '@/components/ui/Image/GPImage';
import Heading from '@/components/ui/Heading/Heading';
import { GPVideo } from '@/components/ui/Video/GPVideo';
import { formatDate } from '@/utils/DateUtils';
import { useShouldRender } from '@/utils/useShouldRender';

const BlogCard = ({
  child,
  params,
  cardCopyBgColor,
}: {
  child: BlogCardtype;
  params?: {
    [key: string]: string;
  };
  cardCopyBgColor?: string;
}): JSX.Element => {
  const shouldRender = useShouldRender();
  const mainImage = child?.mainImage?.jsonValue;
  const staticBlogPifType = child?.staticBlogPifType?.jsonValue?.value;
  const staticCategories = child?.staticCategories?.jsonValue;
  const title = child?.title?.jsonValue;
  const blogReadTime = child?.blogReadTime?.jsonValue;
  const blogPublishDate = formatDate(child?.blogPublishDate?.jsonValue?.value);
  const blogSubCategory = child?.blogSubCategory?.jsonValue;
  const details = child?.details?.jsonValue;
  const mainVideohref = child?.mainVideo?.jsonValue?.value?.href;

  return (
    <div className="blog-card ec-clickable-card">
      {mainImage && (
        <div className="media-section">
          {mainVideohref ? (
            <GPVideo item={child} />
          ) : mainImage ? (
            <GPImage item={child} params={params} />
          ) : null}
        </div>
      )}

      <div className={`copy-section ${cardCopyBgColor}`}>
        {shouldRender(staticBlogPifType) && (
          <div className="text-breadcrumb">
            {child.StaticBlogPifTypeLink?.jsonValue?.value?.href ? (
              <a href={child.StaticBlogPifTypeLink.jsonValue.value.href} className="blog-tag">
                {staticBlogPifType}
              </a>
            ) : (
              <span className="blog-tag">{staticBlogPifType}</span>
            )}

            {shouldRender(staticCategories) && (
              <RichText tag="span" className="blog-tag secondary" field={staticCategories} />
            )}
          </div>
        )}

        {shouldRender(title) && <RichText className="title" field={title} richText tag="p" />}
        {shouldRender(details) && <RichText className="details" field={details} tag="p" />}
        <div className="meta-section">
          {shouldRender(blogSubCategory) && (
            <span className="meta-item featured">{blogSubCategory.value}</span>
          )}
          {shouldRender(blogPublishDate) && (
            <span className="meta-item">{blogPublishDate}</span>
          )}
          {shouldRender(blogReadTime) && <span className="meta-item">{blogReadTime.value}</span>}
        </div>
      </div>

      <div className="ec-card-link-overlay">
        {shouldRender(child?.blogLink?.jsonValue?.value?.href) && (
          <LinkItem
            aria-label={title?.value}
            field={child?.blogLink?.jsonValue}
            value={{
              ...child?.blogLink?.jsonValue.value,
              href: child?.blogLink?.jsonValue.value.href || '#',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BlogCard;
