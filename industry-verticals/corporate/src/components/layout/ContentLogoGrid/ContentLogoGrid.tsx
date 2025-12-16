import React from 'react';
import { ContentLogoGridProps } from './ContentLogoGrid.types';
import Heading from '@/components/ui/Heading/Heading';
import Ctas from '@/components/ui/CTA/CTA';
import ImageItem from '@/components/ui/Image/ImageItem';
import { Container, Row } from 'react-bootstrap';
import { EditFrame, RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import {
  moveUpItemButton,
  moveDownItemButton,
  deleteItemButton,
  addItemButton,
} from '@/utils/ReorderingSwitcher';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { contentLogoGridConstants } from '@/constants/appConstants';
import { getPaddingValue } from '@/utils/Paddingutils';
import { flipMediaOnMobile } from '@/utils/flipMedia';

export const Default = (props: ContentLogoGridProps): JSX.Element => {
  const propsFieldData = props?.fields?.data?.item || {};
  const { ctaLink } = propsFieldData;
  const { paddingTop, paddingBottom } = getPaddingValue(props?.params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;
  const { defaultTitleHeadingLevel } = contentLogoGridConstants;
  const title = propsFieldData?.title?.jsonValue || '';
  const details = propsFieldData?.details?.jsonValue || '';
  const titleHeadingLevel =
    (props?.params?.titleHeadingLevel &&
      JSON.parse(props?.params?.titleHeadingLevel)?.Value?.value) ||
    defaultTitleHeadingLevel;
  const backgroundColorVariant =
    (props?.params?.backgroundColorVariant &&
      JSON.parse(props?.params?.backgroundColorVariant)?.Value?.value) ||
    '';
  const logos = propsFieldData?.logos?.results || [];
  const { titleClass, descriptionClass } =
    getFontSizeClasses(props?.params) || {};
  const aosAttributes = getAosAttributes(props);

  const flipMediaClass = flipMediaOnMobile(props);

  return (
    <section
      className={`content-logo-grid ${
        backgroundColorVariant && `bg-${backgroundColorVariant}`
      } ${paddingTopClass} ${paddingBottomClass} ${props.className}`}
      {...aosAttributes}
    >
      <Container>
        <Row className={flipMediaClass}>
          <div className="content-wrapper">
            {title?.value && (
              <Heading
                className={`title ${titleClass}`}
                richText
                level={titleHeadingLevel}
                field={title}
              />
            )}
            {details?.value && (
              <JssRichText className={`details ${descriptionClass}`} field={details} />
            )}
            {ctaLink?.jsonValue?.value?.href && <Ctas {...propsFieldData} />}
          </div>
          {logos.length > 0 && (
            <div className="logo-gallery">
              {logos?.map((logo, index) => (
                <EditFrame
                  key={index}
                  title="Move Logo Images"
                  dataSource={{ itemId: logo?.id + '' }}
                  buttons={[moveUpItemButton, moveDownItemButton, addItemButton, deleteItemButton]}
                >
                  <div className="logo-wrapper">
                    <ImageItem
                      className="content-list-link"
                      field={logo?.image?.jsonValue}
                      nextImageSrc={logo?.image?.src}
                    />
                  </div>
                </EditFrame>
              ))}
            </div>
          )}
        </Row>
      </Container>
    </section>
  );
};

export const SixPerRow = (props: ContentLogoGridProps): JSX.Element => {
  return <Default {...props} className="six-in-row" />;
};

export const FivePerRow = (props: ContentLogoGridProps): JSX.Element => {
  return <Default {...props} className="five-in-row" />;
};

export const FourPerRow = (props: ContentLogoGridProps): JSX.Element => {
  return <Default {...props} className="four-in-row" />;
};

export const ThreePerRow = (props: ContentLogoGridProps): JSX.Element => {
  return <Default {...props} className="three-in-row" />;
};
