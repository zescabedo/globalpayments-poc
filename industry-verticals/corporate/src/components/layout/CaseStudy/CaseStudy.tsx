import { RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { CaseStudyProps } from './CaseStudy.types';
import { Container, Row } from 'react-bootstrap';
import ImageItem from '@/components/ui/Image/ImageItem';
import { GPImage } from '@/components/ui/Image/GPImage';
import Ctas from '@/components/ui/CTA/CTA';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { caseStudyConstants } from '@/constants/appConstants';
import { useShouldRender } from '@/utils/useShouldRender';

export const CaseStudy = (props: CaseStudyProps): JSX.Element => {
  const shouldRender = useShouldRender();
  const propsFieldData = props?.fields?.data?.item || {};
  const title = propsFieldData?.title?.jsonValue || '';
  const isQuoteVariant = props?.className === 'quote-variant';
  const name = propsFieldData?.quoteName?.jsonValue || { value: '' };
  const company = propsFieldData?.quoteCompany?.jsonValue || { value: '' };
  const tag = propsFieldData?.tag?.jsonValue;
  const imageVariant =
    props?.params?.imageVariant && JSON.parse(props?.params?.imageVariant)?.Value?.value;
  const backgroundColorVariant =
    (props?.params?.backgroundColorVariant &&
      'bg-' + JSON.parse(props?.params?.backgroundColorVariant)?.Value?.value) ||
    '';
  const contentColumnBackgroundColorVariant =
    (props?.params?.foreGroundColorVariant &&
      JSON.parse(props?.params?.foreGroundColorVariant)?.Value?.value) ||
    'bg-base';
  const aosAttributes = getAosAttributes(props);
  const { titleClass } = getFontSizeClasses(props?.params) || {};

  const { defaultTitleHeadingLevel } = caseStudyConstants;

  return (
    <div className={`component case-study ${props.className}`} {...aosAttributes}>
      <div className={`component-content ${backgroundColorVariant}`}>
        <Container>
          <Row>
            <div className={`copy-section ${contentColumnBackgroundColorVariant}`}>
              <div className={`copy-wrapper ${imageVariant} `}>
                {propsFieldData?.logo?.jsonValue?.value?.src && !isQuoteVariant && (
                  <ImageItem
                    field={propsFieldData?.logo?.jsonValue}
                    nextImageSrc={propsFieldData?.logo?.jsonValue?.value?.src}
                    className="logo"
                  />
                )}
                {title?.value && !isQuoteVariant && (
                  <JssRichText
                    className={`title ${titleClass}`}
                    tag={`h${defaultTitleHeadingLevel}`}
                    field={title}
                  />
                )}
                {tag?.value && <JssRichText tag="p" className="tag" field={tag} />}
                {propsFieldData?.ctaLink?.jsonValue?.value?.href && !isQuoteVariant && (
                  <div className="cta-list">
                    <Ctas {...propsFieldData} />
                  </div>
                )}
                {isQuoteVariant && (
                  <div className="quote-author">
                    {shouldRender(name) && <JssRichText tag="span" className="name" field={name} />}
                    {shouldRender(company) && shouldRender(name) && <span>,&nbsp;</span>}
                    {shouldRender(company) && (
                      <JssRichText tag="span" className="company" field={company} />
                    )}
                  </div>
                )}
              </div>
            </div>

            {propsFieldData?.mainImage?.src && (
              <div className="media-section">
                <GPImage item={propsFieldData} params={props?.params} />
              </div>
            )}
          </Row>
        </Container>
      </div>
    </div>
  );
};
export default CaseStudy;

export function Quote({ fields, params }: CaseStudyProps) {
  return <CaseStudy fields={fields} params={params} className="quote-variant" />;
}
