import { BlogCardProps } from '@/components/layout/BlogCards/BlogCards.types';
import BlogCard from '@/components/layout/BlogCard/BlogCard';
import Heading from '@/components/ui/Heading/Heading';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';

export const BlogCardbase = ({
  props,
  className,
}: {
  props: BlogCardProps;
  className: string;
}): JSX.Element => {
  const { fields, params } = props || {};
  const backgroundColorVariantValue = params?.backgroundColorVariant
    ? JSON.parse(params.backgroundColorVariant)?.Value?.value
    : '';
  const backgroundColorVariant = backgroundColorVariantValue
    ? `bg-${backgroundColorVariantValue}`
    : '';
  const dataItem = fields?.data?.item;
  const title = dataItem?.title?.jsonValue;
  const children = dataItem?.children?.results || [];
  const aosAttributes = getAosAttributes(props);
  const { titleClass } = getFontSizeClasses(props?.params) || {};

  return (
    <div
      className={`component blog-cards ${className} ${backgroundColorVariant}`}
      {...aosAttributes}
    >
      <div className="component-content">
        <div className="container">
          <div className="row">
            {title && <Heading level={2} text={title} className={`list-title ${titleClass}`} />}

            {children?.map((child, index) => {
              const hasImage = child?.mainImage?.src;
              const hasVideo = child?.mainVideo?.jsonValue?.value?.href;
              if (!hasImage && !hasVideo) return null;
              return <BlogCard key={index} child={child} params={params} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Split50 = (props: BlogCardProps): JSX.Element => {
  return <BlogCardbase props={props} className="split-50" />;
};

export const ThreeInRow = (props: BlogCardProps): JSX.Element => {
  return <BlogCardbase props={props} className="three-in-row" />;
};
