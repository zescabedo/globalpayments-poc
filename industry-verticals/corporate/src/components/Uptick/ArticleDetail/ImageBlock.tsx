import { imageBlockConstants } from '@/constants/appConstants';
import {
  ComponentParams,
  Field,
  Image,
  ImageField,
  RichText,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { BaseComponentFields } from './ArticleDetail.types';

interface ImageBlockProps {
  fields: Fields;
  params: ComponentParams;
}

interface Fields extends BaseComponentFields {
  Text?: Field<string>;
  Image?: ImageField;
  'Display Type'?: {
    displayName: string | null;
  };
  'Mobile Display Type'?: {
    displayName: string | null;
  };
}

export const ImageBlock = ({ fields, params }: ImageBlockProps) => {
  const hasText = Boolean(fields?.Text?.value);
  const hasImage = Boolean(fields?.Image?.value?.src);
  const displayType =
    fields?.['Display Type']?.displayName || imageBlockConstants.DEFAULT_DISPLAY_TYPE;
  const mobileDisplayType =
    fields?.['Mobile Display Type']?.displayName || imageBlockConstants.DEFAULT_MOBILE_DISPLAY_TYPE;

  const imageOrder = {
    desktop: displayType === 'ImageLeftTextRight' ? 'desktop-order-1' : 'desktop-order-2',
    mobile: mobileDisplayType === 'Image First' ? 'mobile-order-1' : 'mobile-order-2',
  };

  const textOrder = {
    desktop: displayType === 'ImageLeftTextRight' ? 'desktop-order-2' : 'desktop-order-1',
    mobile: mobileDisplayType === 'Image First' ? 'mobile-order-2' : 'mobile-order-1',
  };

  if (!hasImage && !hasText) {
    return <></>;
  }

  return (
    <div className={`uptick-content-block image-block ${params?.styles || ''}`}>
      {hasImage && (
        <div
          className={`block-column block-image ${!hasText ? 'full-width' : ''} ${
            imageOrder.desktop
          } ${imageOrder.mobile}`}
        >
          <Image field={fields?.Image} />
        </div>
      )}

      {hasText && (
        <div className={`block-column block-text ${textOrder.desktop} ${textOrder.mobile}`}>
          <RichText tag="p" field={fields?.Text} />
        </div>
      )}
    </div>
  );
};
