import { MediaBannerProps } from '@/components/layout/Mediabannersteps/MediaBannerSteps.types';
import { Container } from 'react-bootstrap';
import { Text, RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import Ctas from '@/components/ui/CTA/CTA';
import { GPMedia } from '@/components/ui/GPMedia/GPMedia';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { mediaBannerStepsConstants } from '@/constants/appConstants';
import { getMediaType } from '@/utils/mediaUtils';

export const MediaBannerSteps = (props: MediaBannerProps & { layoutType: string }): JSX.Element => {
  const { fields, params } = props || {};
  const {
    brow = { jsonValue: { value: '' } },
    title = { jsonValue: { value: '' } },
    tag = { jsonValue: { value: '' } },
    steps = { targetItems: [] },
  } = fields?.data?.item || {};

  const item = fields?.data?.item || {};

  const { Styles = '' } = params || {};

  const mediaType = getMediaType(fields?.data?.item);
  const backgroundColorVariant =
    (props?.params?.backgroundColorVariant &&
      JSON.parse(props?.params?.backgroundColorVariant)?.Value?.value) ||
    mediaBannerStepsConstants.defaultBackgroundColour;
  const bgClass = backgroundColorVariant ? `bg-${backgroundColorVariant}` : '';

  const imageVariantType =
    (props?.params?.imageVariant && JSON.parse(props?.params?.imageVariant)?.Value?.value) ||
    mediaBannerStepsConstants.defaultImageVariant;

  const titleLevel =
    (props?.params?.titleHeadingLevel &&
      JSON.parse(props?.params?.titleHeadingLevel)?.Value?.value) ||
    mediaBannerStepsConstants.defaulttitleHeadingLevel;

  const aosAttributes = getAosAttributes(props);

  const { titleClass, tagClass, descriptionClass } = getFontSizeClasses(props?.params) || {};

  return (
    <div
      className={`component media-banner media-banner-steps ${
        Styles || ''
      } ${bgClass} offset-outer-4x5 `}
      {...aosAttributes}
    >
      <div className="component-content">
        <Container>
          <div className="row flip-textimage-in-mobile">
            <div className={`media-section ${imageVariantType}`}>
              <>
                <GPMedia className={mediaType} item={item} params={props?.params} />
                {mediaType === 'image' && <div className="parallax-circle"></div>}
              </>
            </div>

            <div className="copy-section">
              {brow?.jsonValue?.value && (
                <JssRichText clasName={'brow'} tag="p" field={brow.jsonValue} />
              )}
              {title?.jsonValue?.value && (
                <Text
                  tag={`h${titleLevel}`}
                  className={`title ${titleClass}`}
                  field={title.jsonValue}
                />
              )}

              {tag?.jsonValue?.value && (
                <JssRichText className={`tag ${tagClass}`} tag="p" field={tag.jsonValue} />
              )}

              {item?.ctasParent && <Ctas {...item} />}

              {steps?.targetItems?.length > 0 &&
                steps.targetItems.map((step, index) => (
                  <div key={index} className="step-container">
                    <span className="icon"> {index + 1} </span>
                    <div className="text-section">
                      {step.stepTitle?.jsonValue?.value && (
                        <Text className="title" tag="p" field={step.stepTitle.jsonValue} />
                      )}
                      {step.stepDetails?.jsonValue?.value && (
                        <JssRichText
                          className={`tag ${descriptionClass}`}
                          tag="p"
                          field={step.stepDetails.jsonValue}
                        />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export const Offset_Outer_4_by_5 = (props: MediaBannerProps): JSX.Element => (
  <MediaBannerSteps {...props} layoutType="offset-outer-4x5" />
);
