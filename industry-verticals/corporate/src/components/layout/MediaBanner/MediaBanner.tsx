import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { MediaBannerProps } from '@/components/layout/MediaBanner/MediaBanner.types';
import { Container } from 'react-bootstrap';
import { RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import Ctas from '@/components/ui/CTA/CTA';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { mediaBannerConstants } from '@/constants/appConstants';
import { getMediaType } from '@/utils/mediaUtils';
import GPMedia from '@/components/ui/GPMedia/GPMedia';
import { getPaddingValue } from '@/utils/Paddingutils';
import { useShouldRender } from '@/utils/useShouldRender';
import { flipMediaOnMobile } from '@/utils/flipMedia';
import { overrideCTAGroupActionStyle } from '@/utils/overrideFirstCTA';
gsap.registerPlugin(ScrollTrigger);

export const MediaBanner = (props: MediaBannerProps & { layoutType: string }): JSX.Element => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const shouldRender = useShouldRender();

  useEffect(() => {
    if (parallaxRef.current) {
      const element = parallaxRef.current;

      gsap.to(element, {
        x: 40 - 0,
        y: 25 - 0,
        scrollTrigger: {
          trigger: element,
          start: 'center center',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }, []);

  const { fields, params, layoutType } = props || {};
  const {
    title = { jsonValue: { value: '' } },
    tag = { jsonValue: { value: '' } },
    legalText = { jsonValue: { value: '' } },
    details = { jsonValue: { value: '' } },
  } = fields?.data?.item || {};
  const item = fields?.data?.item || {};

  const { Styles = '' } = params || {};

  const mediaType = getMediaType(item);

  const backgroundColorVariant =
    (props?.params?.backgroundColorVariant &&
      JSON.parse(props?.params?.backgroundColorVariant)?.Value?.value) ||
    mediaBannerConstants.defaultBackgroundColour;
  const bgClass = backgroundColorVariant ? `bg-${backgroundColorVariant}` : '';

  const { paddingBottom, paddingTop } = getPaddingValue(params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;

  const imageVariantType =
    (props?.params?.imageVariant && JSON.parse(props?.params?.imageVariant)?.Value?.value) || '';

  const layoutClass = `component media-banner ${paddingTopClass} ${paddingBottomClass}  ${
    layoutType || 'default'
  } ${Styles || ''}  ${bgClass || ''}`;
  const aosAttributes = getAosAttributes(props);

  const {
    titleClass,
    tagClass,
    descriptionClass,
  } = getFontSizeClasses(props?.params) || {};

  const { defaulttitleHeadingLevel } = mediaBannerConstants;

  const selectedTitleHeadingLevel =
    (props?.params?.titleHeadingLevel &&
      JSON.parse(props?.params?.titleHeadingLevel)?.Value?.value) ||
    defaulttitleHeadingLevel;

  const flipMediaClass = flipMediaOnMobile(props);

  // Override first CTA action style to "link-glow-base" if it's the only CTA and not already set https://edynamic.atlassian.net/browse/GPES-445
  if (item?.ctasParent?.results?.[0]?.ctas?.results?.length === 1) {
    overrideCTAGroupActionStyle(item, 'link-glow-base', true);
  }

  return (
    <div className={layoutClass} {...aosAttributes}>
      <div className="component-content">
        <Container>
          <div className={`row ${flipMediaClass}`}>
            {/* Media Section */}
            <div className={`media-section ${imageVariantType}`}>
              <GPMedia className={mediaType} item={item} params={props?.params} />
            </div>

            {/* Copy Section */}
            <div className="copy-section">
              {shouldRender(title?.jsonValue?.value) && (
                <JssRichText
                  tag={`h${selectedTitleHeadingLevel}`}
                  className={`title ${titleClass}`}
                  field={title.jsonValue}
                />
              )}
              {shouldRender(tag?.jsonValue?.value) && (
                <JssRichText
                  className={`tag ${tagClass}`}
                  field={tag.jsonValue}
                />
              )}
              {shouldRender(details?.jsonValue?.value) && (
                <JssRichText className={`details ${descriptionClass}`} field={details.jsonValue} />
              )}
              {shouldRender(legalText?.jsonValue?.value) && (
                <JssRichText tag={`p`} className={`legal`} field={legalText.jsonValue} />
              )}
              {/* CTAs */}
              {item?.ctasParent && <Ctas {...item} />}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export const Offset_Center_4_by_8 = (props: MediaBannerProps): JSX.Element => (
  <MediaBanner {...props} layoutType="default" />
);

export const Offset_Center_6_by_5 = (props: MediaBannerProps): JSX.Element => (
  <MediaBanner {...props} layoutType="offset-center-6x5" />
);

export const Offset_Outer_4_by_5 = (props: MediaBannerProps): JSX.Element => (
  <MediaBanner {...props} layoutType="offset-outer-4x5" />
);

export const Default = (props: MediaBannerProps): JSX.Element => (
  <MediaBanner {...props} layoutType="default" />
);
