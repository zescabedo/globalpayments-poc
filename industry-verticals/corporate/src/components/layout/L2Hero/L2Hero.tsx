import { RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { L2HeroProps } from './L2Hero.types';
import Ctas from '@/components/ui/CTA/CTA';
import { Brow } from '@/components/ui/Brow/Brow';
import Heading, { HeadingElementProps } from '@/components/ui/Heading/Heading';
import { L2HeroConstants } from '@/constants/appConstants';
import { Container, Row } from 'react-bootstrap';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import GPMedia from '@/components/ui/GPMedia/GPMedia';
import { getMediaType } from '@/utils/mediaUtils';
import { getPaddingValue } from '@/utils/Paddingutils';
import { useShouldRender } from '@/utils/useShouldRender';
import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';

const L2Hero = (
  props: L2HeroProps & { layoutType: 'split50' | 'split50-contained' | 'split40-60-contained' }
): JSX.Element => {
  const shouldRender = useShouldRender();
  const { fields, params, layoutType } = props || {};
  const { paddingBottom, paddingTop } = getPaddingValue(params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;

  const backgroundColorVariant =
    params?.backgroundColorVariant && JSON.parse(params?.backgroundColorVariant)?.Value?.value
      ? `bg-${JSON.parse(params?.backgroundColorVariant)?.Value?.value}`
      : ``;

  //fields
  const propsFieldData = fields?.data?.item;
  const brow = propsFieldData?.brow?.jsonValue;
  const title = propsFieldData?.title?.jsonValue;
  const tag = propsFieldData?.tag?.jsonValue;
  const legalText = propsFieldData?.legalText?.jsonValue;
  const details = propsFieldData?.details?.jsonValue;
  const ctasParent = propsFieldData?.ctasParent;

  const { defaultTitleHeadingLevel } = L2HeroConstants;

  const imageVariantType =
    (props?.params?.imageVariant && JSON.parse(props?.params?.imageVariant)?.Value?.value) || '';

  const headingLevel =
    (params?.titleHeadingLevel && JSON.parse(params?.titleHeadingLevel)?.Value?.value) ||
    defaultTitleHeadingLevel;

  const { titleClass, tagClass } = getFontSizeClasses(props?.params) || {};

  const mediaType = getMediaType(propsFieldData);

  return (
    <div
      className={`l2-hero ${layoutType} ${params?.styles} ${backgroundColorVariant} ${paddingTopClass} ${paddingBottomClass}`}
    >
      <Container>
        <Row>
          {/* Copy Section */}
          <div className="copy-section">
            {shouldRender(title) && (
              <Heading
                level={headingLevel as HeadingElementProps['level']}
                className={`title ${titleClass}`}
                field={title}
                richText
              />
            )}
            {shouldRender(brow) && <Brow className="brow" field={brow} richText />}
            {shouldRender(tag) && <RichText field={tag} className={`tag ${tagClass}`} />}
            {shouldRender(details) && <RichText field={details} className="details" />}
            {shouldRender(legalText) && <RichText field={legalText} className="legal-text" />}
            {ctasParent && <Ctas ctasParent={ctasParent as CtaGroupInterface['ctasParent']} />}
            {shouldRender(propsFieldData?.trustpilotSnippetCode?.jsonValue?.fields?.TrustpilotCode?.value) && (
              <div className="trustpilot-container">
                <RichText field={propsFieldData?.trustpilotSnippetCode?.jsonValue?.fields?.TrustpilotCode} />
              </div>
            )}
          </div>

          {/* Media Section */}
          <div className={`media-section ${imageVariantType}`}>
            {mediaType === 'image' && <div className="hero-background"></div>}
            <GPMedia item={propsFieldData} className={mediaType} />
          </div>
        </Row>
      </Container>
    </div>
  );
};

export const Default = (props: L2HeroProps): JSX.Element => (
  <L2Hero {...props} layoutType="split50" />
);

export const Split50 = (props: L2HeroProps): JSX.Element => (
  <L2Hero {...props} layoutType="split50" />
);

export const Split50Contained = (props: L2HeroProps): JSX.Element => (
  <L2Hero {...props} layoutType="split50-contained" />
);

export const Split4060 = (props: L2HeroProps): JSX.Element => (
  <L2Hero {...props} layoutType="split40-60-contained" />
);
