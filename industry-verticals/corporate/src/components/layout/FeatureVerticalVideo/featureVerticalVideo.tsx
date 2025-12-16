import React from 'react';
import { Container, Row } from 'react-bootstrap';
import { RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import Heading from '@/components/ui/Heading/Heading';
import { FeatureVerticalVideoProps } from './featureVerticalVideo.types';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { featureVerticalVideoConstant } from '@/constants/appConstants';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { GPVideo } from '@/components/ui/Video/GPVideo';

export const FeatureVerticalVideo = (props: FeatureVerticalVideoProps): JSX.Element => {
  const propsField = props?.fields?.data?.item || {};
  const propsParams = props?.params || {};
  const { defaultTitleHeadingLevel, defaultSubtitleHeadingLevel } = featureVerticalVideoConstant;
  const titleHeadingLevel =
    (props?.params?.titleHeadingLevel &&
      JSON.parse(props?.params?.titleHeadingLevel)?.Value?.value) ||
    defaultTitleHeadingLevel;
  const subTitleHeadingLevel =
    (props?.params?.subTitleLevel && JSON.parse(props?.params?.subTitleLevel)?.Value?.value) ||
    defaultSubtitleHeadingLevel;
  const backgroundColorVariant =
    (propsParams?.backgroundColorVariant &&
      'bg-' + JSON.parse(propsParams?.backgroundColorVariant)?.Value?.value) ||
    '';
  const { titleClass, tagClass, descriptionClass, subTitleClass } =
    getFontSizeClasses(props?.params) || {};
  const backgroundImage = propsField?.backgroundImage;
  const backgroundMdImage = propsField?.backgroundMdImage;
  const backgroundSmImage = propsField?.backgroundSmImage;
  const aosAttributes = getAosAttributes(props);

  return (
    <div
      className={`component feature-vertical-video phone-frame ${backgroundColorVariant}`}
      {...aosAttributes}
    >
      <div
        className="bg-media media-focal-set initialized"
        style={
          {
            '--bg-image-desktop': `url(${backgroundImage?.src})`,
            '--bg-image-tablet': `url(${backgroundMdImage?.src || backgroundImage?.src})`,
            '--bg-image-mobile': `url(${backgroundSmImage?.src || backgroundImage?.src})`,
          } as React.CSSProperties
        }
      ></div>
      <div className="component-content">
        <Container>
          <Row className="content-wrapper">
            <div className="media-section">
              <div className="mobile">
                <div className="ivideo">
                  <GPVideo item={propsField} />
                </div>
              </div>
            </div>
            <div className="copy-section">
              {propsField?.title?.jsonValue?.value && (
                <Heading
                  richText
                  className={`title ${titleClass}`}
                  level={titleHeadingLevel}
                  field={propsField?.title?.jsonValue}
                />
              )}

              {propsField?.subTitle?.jsonValue?.value && (
                <Heading
                  richText
                  className={`sub-title ${subTitleClass}`}
                  level={subTitleHeadingLevel}
                  field={propsField?.subTitle?.jsonValue}
                />
              )}
              {propsField?.tag?.jsonValue?.value && (
                <JssRichText
                  className={`tag ${tagClass}`}
                  field={propsField?.tag?.jsonValue}
                  tag="p"
                />
              )}
              {propsField?.details?.jsonValue?.value && (
                <JssRichText
                  className={`details ${descriptionClass}`}
                  field={propsField?.details?.jsonValue}
                />
              )}
            </div>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default FeatureVerticalVideo;
