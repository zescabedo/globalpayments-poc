import Heading from '@/components/ui/Heading/Heading';
import { RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import React from 'react';
import { Container, Row } from 'react-bootstrap';
import { ProductSpotlight } from './ProductSpotlight.types';
import Ctas from '@/components/ui/CTA/CTA';
import { GPImage } from '@/components/ui/Image/GPImage';
import { ProductSpotlightConstants } from '@/constants/appConstants';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { useShouldRender } from '@/utils/useShouldRender';
import { getPaddingValue } from '@/utils/Paddingutils';
import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { flipMediaOnMobile } from '@/utils/flipMedia';

const ProductSpotlightComponent = (props: ProductSpotlight): JSX.Element => {
  const shouldRender = useShouldRender();

  const { fields, params } = props || {};
  const { Styles = '' } = params || {};
  const { paddingTop, paddingBottom } = getPaddingValue(params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;
  const reverseLayout = params?.['Reverse Layout'] ? params?.['Reverse Layout'] === '1' : false;
  const ctasParent = fields?.data?.item?.ctasParent;
  const flipMediaClass = flipMediaOnMobile(props);

  //params
  const titleHeadingLevel = params?.titleHeadingLevel
    ? JSON.parse(params.titleHeadingLevel)?.Value?.value
    : ProductSpotlightConstants.defaultTitleHeadingLevel;

  //fields
  const item = fields?.data?.item || {};
  const title = item?.title?.jsonValue;
  const tag = item?.tag?.jsonValue;
  const content = item?.content?.jsonValue;
  const price = item?.price?.jsonValue;
  const priceSubtext = item?.priceSubtext?.jsonValue;
  const priceDetail = item?.priceDetail?.jsonValue;
  const priceDetailSubtext = item?.priceDetailSubtext?.jsonValue;
  const showPrice = shouldRender(price?.value) || shouldRender(priceSubtext?.value) || shouldRender(priceDetail?.value) || shouldRender(priceDetailSubtext?.value);
  const noSpacerClass = showPrice ? 'no-spacer' : '';
  const noContentSectionClass = (shouldRender(content?.value) || shouldRender(item?.ctaTitle?.jsonValue?.value)) ? '' : 'no-content-section';

  const backgroundColorVariant =
    (props?.params?.backgroundColorVariant &&
      `bg-${JSON.parse(props?.params?.backgroundColorVariant)?.Value?.value}`) ||
    'bg-subtle';

  //AOS
  const aosAttributes = getAosAttributes(props);

  return (
    <div
      className={`component product-spotlight ${backgroundColorVariant} ${Styles} ${paddingTopClass} ${paddingBottomClass} ${
        reverseLayout ? 'reverse-layout' : ''
      }`}
      {...aosAttributes}
    >
      <div className="component-content">
        <Container>
          <Row>
            <div className="price-offer">
              <div className="price-offer-intro">
                {shouldRender(title?.value) && (
                  <Heading
                    level={titleHeadingLevel}
                    richText={true}
                    className={`title`}
                    field={title}
                  />
                )}
                {shouldRender(tag?.value) && <RichText field={tag} tag="p" className={`tag`} />}
                {ctasParent && (
                  <div className="btn-wrap">
                    <Ctas ctasParent={ctasParent as CtaGroupInterface['ctasParent']} />
                  </div>
                )}
              </div>

              <div className={`price-offer-content`}>
                <div className={`spotlight ${flipMediaClass} ${noContentSectionClass}`}>
                  {showPrice && <div className="price-content">
                    <div className="pricing-card">
                      <div className="pricing-card-header">
                        {shouldRender(price?.value) && <Heading
                          level={3}
                          richText={true}
                          className={`price-display`}
                          field={price}
                        />}
                        {shouldRender(priceSubtext?.value) && <RichText field={priceSubtext} tag="p" className={`price-description`} />}
                      </div>
                      <div className="pricing-card-divider"></div>
                      <div className="pricing-card-footer">
                        {shouldRender(priceDetail?.value) && <RichText field={priceDetail} tag="p" className={`interest-statement`} />}
                        {shouldRender(priceDetailSubtext?.value) && <RichText field={priceDetailSubtext} tag="p" className={`payment-text`} />}
                      </div>
                    </div>
                  </div>}
                  {(shouldRender(content?.value) || shouldRender(item?.ctaTitle?.jsonValue?.value)) && 
                    <div className={`list bg-white ${noSpacerClass}`}>
                      {shouldRender(content?.value) && <RichText field={content} />}
                      {item?.ctaLink && item?.ctaTitle && (
                        <div className="cta-wrapper">
                          <Ctas {...item} ctasParent={undefined} />
                        </div>
                      )}
                    </div>
                  }

                  <div className={`image-wrapper ${noSpacerClass}`}>
                    {item && <GPImage item={item} params={props?.params} />}
                  </div>
                </div>
              </div>
            </div>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default ProductSpotlightComponent;
