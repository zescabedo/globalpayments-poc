import Link from 'next/link';
import { EditFrame, RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { ProductCardProps, ChildResult } from './ProductCard.types';
import { Container, Row, Col } from 'react-bootstrap';
import Heading from '@/components/ui/Heading/Heading';
import ImageItem from '@/components/ui/Image/ImageItem';
import { PRODUCT_CARD_DEFAULT_HEADING_LEVEL } from '@/constants/headingConfig';
import Ctas from '@/components/ui/CTA/CTA';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { PRODUCT_CARDS_IN_A_ROW } from '@/constants/cardConfig';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import {
  addItemToParentDatasourceButton,
  deleteItemButton,
  moveDownItemButton,
  moveUpItemButton,
} from '@/utils/ReorderingSwitcher';

const ProductCard = (props: ProductCardProps): JSX.Element | null => {
  const { FieldNames, titleHeadingLevel, backgroundColorVariant, cardBackground } = props?.params;
  const childrenResults = props?.rendering?.fields?.data?.item?.children?.results || [];

  const bgColorVariant = backgroundColorVariant && JSON.parse(backgroundColorVariant)?.Value?.value;
  const bgColorClass = bgColorVariant ? `bg-${bgColorVariant}` : '';
  const bgCardBackground = cardBackground && JSON.parse(cardBackground)?.Value?.value;
  const bgCardColorClass = bgCardBackground ? `bg-${bgCardBackground}` : '';
  const cardNumberToVariantMapping: { [key: number]: string } = {
    2: 'two-in-row',
    3: 'three-in-row',
    4: 'four-in-row',
  };
  const cardsPerRowMapping: { [key: string]: string } = {
    TwoCardsInARow: 'two-in-row',
    ThreeCardsInARow: 'three-in-row',
    FourCardsInARow: 'four-in-row',
  };
  const cardsPerRow = FieldNames
    ? cardsPerRowMapping[FieldNames]
    : cardNumberToVariantMapping[PRODUCT_CARDS_IN_A_ROW] || 'four-in-row';
  const aosAttributes = getAosAttributes(props);

  const { titleClass, tagClass } = getFontSizeClasses(props?.params) || {};

  return (
    <div className={`product-cards-component ${bgColorClass}`} {...aosAttributes}>
      <Container>
        <Row className="product-card-row">
          {childrenResults?.map((card: ChildResult, cardIndex: number) => {
            const mainTitleTextColor = card?.mainTitleTextColor?.jsonValue?.fields?.Value?.value;
            const titleColorClass = mainTitleTextColor ? `text-${mainTitleTextColor}` : '';

            const CardContent = (
              <EditFrame
                key={cardIndex}
                title="Edit Product Card"
                dataSource={{ itemId: card?.id }}
                buttons={[
                  moveUpItemButton,
                  moveDownItemButton,
                  addItemToParentDatasourceButton,
                  deleteItemButton,
                ]}
              >
                <div className={`product-card ec-clickable-card ${bgCardColorClass}`}>
                  <div className={`product-card-text-section `}>
                    <Heading
                      className={`product-card-title ${titleClass} ${titleColorClass}`}
                      text={card?.title?.jsonValue}
                      level={
                        (titleHeadingLevel && JSON?.parse(titleHeadingLevel)?.Value?.value) ||
                        PRODUCT_CARD_DEFAULT_HEADING_LEVEL
                      }
                    />
                    <RichText
                      className={`product-card-tag ${tagClass}`}
                      tag={'p'}
                      field={card?.tag?.jsonValue}
                    />

                    <div className="promo-card-cta">
                      <Ctas {...card} />
                    </div>
                  </div>
                  <div className="media-section">
                    <ImageItem
                      field={card.mainImage.jsonValue}
                      nextImageSrc={card?.mainImage?.src}
                      className="product-card-image"
                    />
                  </div>
                </div>
              </EditFrame>
            );
            return (
              <Col key={cardIndex} className={`product-card-wrapper ${cardsPerRow}`}>
                {card?.ctaLink?.jsonValue?.value?.href ? (
                  <Link href={card.ctaLink.jsonValue.value.href} legacyBehavior>
                    {CardContent}
                  </Link>
                ) : (
                  CardContent
                )}
              </Col>
            );
          })}
        </Row>
      </Container>
    </div>
  );
};
export default ProductCard;
