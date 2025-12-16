import React from 'react';
import { Container, Row } from 'react-bootstrap';
import { L3HeroProps } from './L3Hero.types';
import { RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { L3HeroConstants } from '@/constants/appConstants';
import { Brow } from '@/components/ui/Brow/Brow';
import Heading from '@/components/ui/Heading/Heading';
import Ctas from '@/components/ui/CTA/CTA';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { GPMedia } from '@/components/ui/GPMedia/GPMedia';
import { getMediaType } from '@/utils/mediaUtils';

interface L3HeroBaseProps extends L3HeroProps {
  className: string;
}

export const Default = (props: L3HeroBaseProps): JSX.Element => {
  const { params, className } = props || {};
  const { defaultTitleTag, defaultBackgroundColour, defaultClassName, defaultImageType } =
    L3HeroConstants;
  const propsFieldData = props?.fields?.data?.item;
  const brow = propsFieldData?.brow?.jsonValue;
  const title = propsFieldData?.title?.jsonValue;
  const tag = propsFieldData?.tag?.jsonValue;
  const titleHeadingLevel =
    (params?.titleHeadingLevel && JSON.parse(params?.titleHeadingLevel)?.Value?.value) ||
    defaultTitleTag;
  const heroBackground =
    (params?.heroBackground && JSON.parse(params?.heroBackground)?.Value?.value) ||
    defaultBackgroundColour;
  const { titleClass, tagClass } = getFontSizeClasses(props?.params) || {};
  const mediaType = getMediaType(propsFieldData);
  const imageType =
    propsFieldData?.imageType?.targetItem?.Value?.jsonValue?.value || defaultImageType;

  return (
    <div className={`l3-hero ${className || defaultClassName} ${heroBackground}`}>
      <Container>
        <Row>
          <div className="copy-section">
            {title?.value && (
              <Heading
                level={titleHeadingLevel}
                className={`title ${titleClass}`}
                field={title}
                richText
              />
            )}
            {brow?.value && <Brow className={`brow`} field={brow} richText />}
            {tag?.value && <JssRichText className={`tag ${tagClass}`} field={tag} />}
            <Ctas {...propsFieldData} />
          </div>
          <div className={`media-section ${mediaType} ${imageType}`}>
            <GPMedia item={propsFieldData} />
          </div>
        </Row>
      </Container>
    </div>
  );
};

export const HorizontalColourBlock = (props: L3HeroProps): JSX.Element => {
  return <Default {...props} className="horizontal-colour-block" />;
};

export const NoColourBlockWithBreakoutImage = (props: L3HeroProps): JSX.Element => {
  return <Default {...props} className="no-colour-breakout" />;
};

export const NoColourBlock = (props: L3HeroProps): JSX.Element => {
  return <Default {...props} className="no-colour-block" />;
};

export const VerticalColourBlockWithBreakoutImage = (props: L3HeroProps): JSX.Element => {
  return <Default {...props} className="vert-colour-breakout" />;
};
