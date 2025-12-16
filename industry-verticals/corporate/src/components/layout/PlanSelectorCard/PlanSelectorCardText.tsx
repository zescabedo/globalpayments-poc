import { EditFrame, RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { PlanSelectorCardsProps } from './PlanSelectorCard.types';
import { Container, Row } from 'react-bootstrap';
import Heading from '@/components/ui/Heading/Heading';
import Ctas from '@/components/ui/CTA/CTA';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { PLAN_CARDS_DEFAULT_HEADING_LEVEL } from '@/constants/headingConfig';
import {
  deleteItemButton,
  moveDownItemButton,
  moveUpItemButton,
  addItemButton,
} from '@/utils/ReorderingSwitcher';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';

const PlanSelectorCard = (props: PlanSelectorCardsProps): JSX.Element | null => {
  const { FieldNames, titleHeadingLevel } = props?.params;
  const results = props?.rendering?.fields?.data?.item?.caseStudyCards?.results || [];
  const item = props?.rendering?.fields?.data?.item || {};
  const defaulttitlevalue = PLAN_CARDS_DEFAULT_HEADING_LEVEL;
  const aosAttributes = getAosAttributes(props);
  const { titleClass, tagClass, descriptionClass } = getFontSizeClasses(props?.params) || {};

  const cardsPerRowMapping: { [key: string]: string } = {
    ThreeInRow: 'three-in-row',
    FourInRow: 'four-in-row',
    FiveInRow: 'five-in-row',
  };
  const cardsPerRow = cardsPerRowMapping[FieldNames];
  const titleMainHeadingLevel =
    (titleHeadingLevel && JSON.parse(titleHeadingLevel)?.Value?.value) || defaulttitlevalue;

  return (
    <div className={`plan-card-selector ${cardsPerRow}`} {...aosAttributes}>
      <Container className="wrapper">
        <Row>
          {item?.title && (
            <div className="brow">
              <div className="plan-card-brow">
                <RichText field={item?.title?.jsonValue} />
              </div>
            </div>
          )}
          <div className={`row plan-card-container`}>
            {results.map((card, index) => (
              <EditFrame
                key={index}
                title="Move Plan Card"
                dataSource={{ itemId: card?.id + '' }}
                buttons={[moveUpItemButton, moveDownItemButton, deleteItemButton, addItemButton]}
              >
                <div className={`plan-card text-center ec-clickable-card`} key={index}>
                  <div className="details">
                    {card?.title?.jsonValue && (
                      <>
                        <Heading
                          level={titleMainHeadingLevel}
                          text={card?.title?.jsonValue}
                          className={`plan-card-header ${titleClass}`}
                        />
                        {card?.tag?.jsonValue && (
                          <RichText
                            className={`tag ${tagClass}`}
                            field={card?.tag?.jsonValue}
                            tag={'p'}
                          />
                        )}
                      </>
                    )}
                    {card?.details?.jsonValue?.value?.trim() && (
                      <>
                        <hr />
                        <RichText
                          field={card?.details?.jsonValue}
                          className={`${descriptionClass}`}
                        />
                      </>
                    )}
                    {card?.details2?.jsonValue?.value?.trim() && (
                      <>
                        <hr />
                        <RichText
                          field={card?.details2?.jsonValue}
                          className={`${descriptionClass}`}
                        />
                      </>
                    )}
                    {card?.ctaLink?.jsonValue?.value && (
                      <div className="promo-card-cta">
                        <Ctas {...card} />
                      </div>
                    )}
                  </div>
                </div>
              </EditFrame>
            ))}
          </div>
          {item?.disclaimer?.jsonValue?.value && (
            <div className="plan-card-disclaimer">
              <RichText field={item?.disclaimer?.jsonValue} />
            </div>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default PlanSelectorCard;
