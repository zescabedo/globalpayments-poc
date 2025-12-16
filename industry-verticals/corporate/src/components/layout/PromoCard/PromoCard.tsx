import { RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { PromoCardProps, ChildResult } from './PromoCard.types';
import { Container, Row, Col } from 'react-bootstrap';
import Heading from '@/components/ui/Heading/Heading';
import { PROMO_CARDS_IN_A_ROW } from '@/constants/cardConfig';
import { PromoCardConstants } from '@/constants/appConstants';
import Link from 'next/link';
import Ctas from '@/components/ui/CTA/CTA';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { GPVideo } from '@/components/ui/Video/GPVideo';
import { GPImage } from '@/components/ui/Image/GPImage';
import { getPaddingValue } from '@/utils/Paddingutils';
import { overrideSingleCTAActionStyle } from '@/utils/overrideFirstCTA';

const PromoCards = (props: PromoCardProps): JSX.Element | null => {
  const params = props?.params;
  const { FieldNames, backgroundColorVariant, cardBackground, cardStyle } = props?.params || {};
  const childrenResults = props?.rendering?.fields?.data?.item?.children?.results || [];
  const { paddingTop, paddingBottom } = getPaddingValue(props?.params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;

  const bgColorVariant = backgroundColorVariant && JSON.parse(backgroundColorVariant)?.Value?.value;
  const cardBackgroundVariant = cardBackground && JSON.parse(cardBackground)?.Value?.value;
  const cardStyleVariant = cardStyle && JSON.parse(cardStyle)?.Value?.value;
  const bgColorClass = bgColorVariant ? `bg-${bgColorVariant}` : '';
  const cardNumberToVariantMapping: { [key: number]: string } = {
    2: 'two-in-row',
    3: 'three-in-row',
    4: 'four-in-row',
  };
  const cardsPerRowMapping: { [key: string]: string } = {
    TwoCardInRow: 'two-in-row',
    ThreeCardInRow: 'three-in-row',
    FourCardInRow: 'four-in-row',
  };

  const cardsPerRow = FieldNames
    ? cardsPerRowMapping[FieldNames]
    : cardNumberToVariantMapping[PROMO_CARDS_IN_A_ROW] || 'three-in-row';

  const aosAttributes = getAosAttributes(props);
  const { titleClass, descriptionClass } =
    getFontSizeClasses(props?.params) || {};

  // Parse heading level from params (stringified JSON, like ProductSpotlight)
  const headingLevel = params?.titleHeadingLevel
    ? JSON.parse(params.titleHeadingLevel)?.Value?.value
    : PromoCardConstants.defaultTitleHeadingLevel;

  return (
    <div
      className={`promo-card-component ${cardsPerRow} ${bgColorClass} ${cardStyleVariant} ${paddingTopClass} ${paddingBottomClass}`}
      {...aosAttributes}
    >
      <Container>
        <Row className="promo-card-row">
          {childrenResults.map((card: ChildResult, cardIndex: number) => {
            const hasVideo = card?.mainVideo?.jsonValue?.value?.href;
            const linkField = card?.ctaLink?.jsonValue;
            const linkName = card?.ctaTitle?.jsonValue?.value;
            if (linkField) linkField.value.title = linkName || linkField.value.title;
            const linkFieldValue = card?.ctaLink?.jsonValue?.value;

            const cardContent = (
              <div className="promo-card">
                <div className="card-inner">
                  <div className="media-content">
                    {hasVideo ? (
                      <GPVideo item={card} className="video" />
                    ) : (
                      <GPImage item={card} params={params} className="image" />
                    )}
                  </div>

                  <div
                    className={`text-content ${
                      cardStyleVariant === 'uniform' ? `bg-${cardBackgroundVariant}` : ''
                    }`}
                  >
                    <Heading
                      className={`title ${titleClass}`}
                      field={card?.title?.jsonValue}
                      level={headingLevel}
                      richText={true}
                    />
                    <RichText
                      className={`description ${descriptionClass}`}
                      tag="p"
                      field={card?.tag?.jsonValue}
                    />
                    {linkFieldValue?.href && (
                      <div className="cta">
                        {cardStyleVariant === 'uniform' ? <Ctas {...overrideSingleCTAActionStyle(card, 'link-glow-base', true)} /> : <Ctas {...card} />}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );

            return (
              <Col key={cardIndex} className="promo-card-wrapper">
                {card?.ctaLink?.jsonValue?.value?.href ? (
                  <Link href={card.ctaLink.jsonValue.value.href} legacyBehavior>
                    <div className="ec-clickable-card">{cardContent}</div>
                  </Link>
                ) : (
                  cardContent
                )}
              </Col>
            );
          })}
        </Row>
      </Container>
    </div>
  );
};

export default PromoCards;
