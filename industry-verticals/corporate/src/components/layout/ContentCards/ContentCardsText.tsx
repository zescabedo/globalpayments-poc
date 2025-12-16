import Link from 'next/link';
import { EditFrame, RichText, useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { ContentCardsProps, ChildResult } from './ContentCards.types';
import { Container, Row } from 'react-bootstrap';
import Heading from '@/components/ui/Heading/Heading';
import { CONTENT_CARDS_DEFAULT_HEADING_LEVEL } from '@/constants/headingConfig';
import Ctas from '@/components/ui/CTA/CTA';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import {
  addItemToParentDatasourceButton,
  deleteItemButton,
  moveDownItemButton,
  moveUpItemButton,
} from '@/utils/ReorderingSwitcher';
import { useShouldRender } from '@/utils/useShouldRender';

const ContentCards = (props: ContentCardsProps): JSX.Element | null => {
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext && sitecoreContext?.pageState !== 'normal';
  const { cardType, FieldNames, backgroundColorVariant, cardBackgroundColorVariant } =
    props?.params;
  const childrenResults = props?.rendering?.fields?.data?.item?.children?.results || [];
  const bgColorVariant =
    (backgroundColorVariant &&
      'bg-' + JSON.parse(props?.params?.backgroundColorVariant)?.Value?.value) ||
    'bg-white';

  const parsedCardType = cardType && JSON?.parse(cardType)?.Value?.value;
  const cardBackgroundColor =
    (cardBackgroundColorVariant && 'bg-' + JSON.parse(cardBackgroundColorVariant)?.Value?.value) ||
    '';
  const shouldRender = useShouldRender();

  const cardsPerRowMapping: { [key: string]: string } = {
    TwoCards: 'two-in-row',
    ThreeCards: 'three-in-row',
    FourCards: 'four-in-row',
  };
  const cardsPerRow = cardsPerRowMapping[FieldNames];
  const aosAttributes = getAosAttributes(props);
  const { titleClass, tagClass } = getFontSizeClasses(props?.params) || {};
  return (
    <div className={`content-cards-component ${bgColorVariant}`} {...aosAttributes}>
      <Container>
        <Row className="content-card-row">
          {childrenResults?.map((card: ChildResult, cardIndex: number) => {
            if (!isEditing && !card?.title?.jsonValue?.value) {
              return null;
            }
            const linkField = card?.cta?.jsonValue;
            const CardContent = (
              <EditFrame
                key={cardIndex}
                title="Edit Content Card"
                dataSource={{ itemId: card?.id + '' }}
                buttons={[
                  moveUpItemButton,
                  moveDownItemButton,
                  addItemToParentDatasourceButton,
                  deleteItemButton,
                ]}
              >
                <div className={`content-card-wrapper`}>
                  <div className={`card-inner ${cardBackgroundColor}`}>
                    <Heading
                      className={`title ${titleClass}`}
                      field={card?.title?.jsonValue}
                      level={CONTENT_CARDS_DEFAULT_HEADING_LEVEL}
                      richText
                    />
                    <RichText
                      className={`tag ${tagClass}`}
                      tag={'p'}
                      field={card?.tag?.jsonValue}
                    />
                    {parsedCardType === 'action' &&
                      shouldRender(card?.ctaTitle?.jsonValue?.value) && (
                        <div className="cta">
                          <Ctas {...card} />
                        </div>
                      )}
                  </div>
                </div>
              </EditFrame>
            );
            return (
              <div key={cardIndex} className={`content-card  ${cardsPerRow}`}>
                {cardType && linkField?.value?.href ? (
                  <Link href={linkField.value.href} legacyBehavior>
                    <div className="ec-clickable-card">{CardContent}</div>
                  </Link>
                ) : (
                  CardContent
                )}
              </div>
            );
          })}
        </Row>
      </Container>
    </div>
  );
};

export default ContentCards;
