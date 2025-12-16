import React from 'react';
import { CaseStudyHeroProps } from './CaseStudyHero.types';
import { Container, Row } from 'react-bootstrap';
import { RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import ImageItem from '@/components/ui/Image/ImageItem';
import Ctas from '@/components/ui/CTA/CTA';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { CaseStudyHeroConstant } from '@/constants/appConstants';
import Heading from '@/components/ui/Heading/Heading';
import { GPImage } from '@/components/ui/Image/GPImage';

export const Default = (props: CaseStudyHeroProps): JSX.Element => {
  const backgroundColorVariant =
    props?.params?.backgroundColorVariant &&
    JSON.parse(props?.params?.backgroundColorVariant)?.Value.value;
  const theme = backgroundColorVariant ? `bg-${backgroundColorVariant}` : '';
  const caseStudyData = props?.fields?.data?.item;
  const aosAttributes = getAosAttributes(props);

  const { titleClass, descriptionClass } = getFontSizeClasses(props?.params) || {};
  const titleHeadingLevel =
    (props?.params?.titleHeadingLevel &&
      JSON.parse(props?.params?.titleHeadingLevel)?.Value?.value) ||
    CaseStudyHeroConstant?.defaultTitleHeadingLevel;

  return (
    <div className={`component case-study-section ${theme} `} {...aosAttributes}>
      <Container>
        {caseStudyData?.title?.jsonValue?.value && (
          <Row>
            <Heading
              className={`case-study-heading ${titleClass}`}
              richText
              level={titleHeadingLevel}
              field={caseStudyData?.title?.jsonValue ?? ''}
            />
          </Row>
        )}
        {(caseStudyData?.mainImage?.jsonValue ||
          caseStudyData?.mainMdImage?.jsonValue ||
          caseStudyData?.mainSmImage?.jsonValue) && (
          <div className="cutout-image">
            <GPImage item={caseStudyData} params={props?.params} />
          </div>
        )}

        {(caseStudyData?.logo?.src ||
          caseStudyData?.details?.jsonValue?.value ||
          caseStudyData?.ctaLink?.jsonValue?.value?.href) && (
          <div className="content-wrapper">
            <Row>
              {caseStudyData?.logo?.src && (
                <div className="logo-column">
                  <div className="logo-placeholder">
                    <ImageItem
                      field={caseStudyData?.logo?.jsonValue}
                      nextImageSrc={caseStudyData?.logo?.src}
                    />
                  </div>
                </div>
              )}
              {(caseStudyData?.details?.jsonValue?.value ||
                caseStudyData?.ctaLink?.jsonValue?.value?.href) && (
                <div className="content-column">
                  {caseStudyData?.details?.jsonValue?.value && (
                    <JssRichText
                      className={`case-study-text ${descriptionClass}`}
                      field={caseStudyData?.details?.jsonValue}
                    />
                  )}
                  {caseStudyData?.ctaLink?.jsonValue?.value?.href && <Ctas {...caseStudyData} />}
                </div>
              )}
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
};
