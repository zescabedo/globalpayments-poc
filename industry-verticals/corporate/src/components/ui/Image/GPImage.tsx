import ImageItem from './ImageItem';
import { BREAKPOINTS } from '@/constants/appConstants';
import { GPImageProps } from './Image.types';

export const GPImage = (props: GPImageProps) => {
  const {
    mainImage,
    mainMdImage,
    mainSmImage,
    focusXMobile,
    focusYMobile,
    focusXTablet,
    focusYTablet,
    focusXDesktop,
    focusYDesktop,
    mediaSize,
  } = props?.item ?? {};
  const isDeferLoading = Boolean(props?.params?.deferLoading);
  const isPriorityLoading = Boolean(props?.params?.priorityLoading);
  const className = props?.className || '';

  if (!mainImage) return null;

  const focusValues = {
    mediaSize: mediaSize?.targetItem?.Value?.jsonValue?.value,
    xMobile: focusXMobile?.jsonValue?.value,
    yMobile: focusYMobile?.jsonValue?.value,
    xTablet: focusXTablet?.jsonValue?.value,
    yTablet: focusYTablet?.jsonValue?.value,
    xDesktop: focusXDesktop?.jsonValue?.value,
    yDesktop: focusYDesktop?.jsonValue?.value,
  };

  const isMediaSizeRequired = focusValues?.mediaSize?.length;
  return (
    <picture>
      {mainSmImage && (
        <source media={`(max-width: ${BREAKPOINTS.md - 1}px)`} srcSet={mainSmImage.src || ''} />
      )}
      {mainMdImage && (
        <source media={`(max-width: ${BREAKPOINTS.lg - 1}px)`} srcSet={mainMdImage.src || ''} />
      )}
      {mainImage && (
        <ImageItem
          className={`gp-img ${className} ${isMediaSizeRequired ? 'object-fit' : ''}`}
          style={
            {
              '--object-fit': focusValues.mediaSize,
              '--focus-x-sm': focusValues.xMobile,
              '--focus-y-sm': focusValues.yMobile,
              '--focus-x-md': focusValues.xTablet,
              '--focus-y-md': focusValues.yTablet,
              '--focus-x-lg': focusValues.xDesktop,
              '--focus-y-lg': focusValues.yDesktop,
            } as React.CSSProperties
          }
          field={mainImage?.jsonValue}
          nextImageSrc={mainImage?.src}
          deferLoading={isDeferLoading}
          priority={isPriorityLoading}
        />
      )}
    </picture>
  );
};
