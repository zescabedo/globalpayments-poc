import {
  Image as SitecoreImage,
  ImageField,
  useSitecoreContext,
  ImageFieldValue,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { useMemo } from 'react';
import Image from 'next/image';
import placeholderImage from '@/assets/images/thumbnail-default.jpg';


// Define interface for image field values
interface ImageFieldValues extends ImageFieldValue {
  alt: string;
  width: number | string;
  height: number | string;
  srcset?: string;
}

type ImageProps = {
  field?: ImageField; // Ensure null is not part of the type
  nextImageSrc?: string;
  hoverField?: ImageField;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
  tooltip?: string;
  style?: React.CSSProperties;
  deferLoading?: boolean;
  placeholderSrc?: string; // Optional custom placeholder
  usePlaceholderFallback?: boolean; // Control whether to use placeholder
};

const ImageItem = ({
  field,
  nextImageSrc,
  className,
  priority,
  onClick,
  tooltip,
  style,
  deferLoading,
  placeholderSrc = placeholderImage.src,
  usePlaceholderFallback = false,
}: ImageProps): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext && sitecoreContext?.pageState !== 'normal';

  // Safely derive field values
  const fieldValues = useMemo(() => {
    if (!field?.value) {
      return { src: '', alt: '', width: undefined, height: undefined };
    }
    const fieldValue = field.value as ImageFieldValues;
    return {
      src: fieldValue.src || '',
      alt: fieldValue.alt || '',
      width: fieldValue.width,
      height: fieldValue.height,
      srcSet: fieldValue.srcset,
    };
  }, [field]);

  // In editing mode, always use SitecoreImage if field exists
  if (isEditing) {
    return field ? (
      <SitecoreImage
        field={field}
        className={className}
        style={style}
        loading={deferLoading ? 'lazy' : 'eager'}
      />
    ) : (
      <></>
    );
  }

  // Determine the image source to use
  const imageSrc =
    nextImageSrc || fieldValues.src || (usePlaceholderFallback ? placeholderSrc : undefined);
  const imageAlt = fieldValues.alt || 'Image';

  // If no valid image source at all, return empty
  if (!imageSrc) {
    return <></>;
  }

  // If dimensions are missing, render a regular img tag
  if (!fieldValues.width || !fieldValues.height) {
    return (
      <img
        src={imageSrc}
        alt={imageAlt}
        className={className}
        srcSet={fieldValues?.srcSet}
        onClick={onClick}
        title={tooltip}
        style={style}
        loading={deferLoading ? 'lazy' : 'eager'}
      />
    );
  }

  // If we have dimensions, use Next.js Image component
  return (
    <Image
      src={imageSrc}
      alt={imageAlt}
      width={Number(fieldValues.width)}
      height={Number(fieldValues.height)}
      className={className}
      priority={priority}
      onClick={onClick}
      title={tooltip}
      unoptimized
      style={style}
      loading={deferLoading ? 'lazy' : 'eager'}
    />
  );
};

export default ImageItem;
