import { ComponentParams, RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import ImageItem from '@/components/ui/Image/ImageItem';
import { EditFrame } from '@sitecore-jss/sitecore-jss-nextjs';
import Ctas from '@/components/ui/CTA/CTA';
import { CardItem, PromoHiLoDataprop } from './PromoHiLoCard.type';
import { Container, Row } from 'react-bootstrap';
import Heading from '@/components/ui/Heading/Heading';
import {
  addItemButton,
  deleteItemButton,
  moveDownItemButton,
  moveUpItemButton,
} from '@/utils/ReorderingSwitcher';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { PromoHiLoCardConstant } from '@/constants/appConstants';

const PromoHiLoDataCard = ({
  data,
  showCta,
  params,
  imageVariantClass,
}: {
  data: CardItem;
  showCta?: boolean;
  params: ComponentParams;
  imageVariantClass: string;
}) => {
  const { titleClass, descriptionClass, tagClass } = getFontSizeClasses(params) || {};
  const titleHeadingLevel =
    (params?.titleHeadingLevel && JSON.parse(params?.titleHeadingLevel)?.Value?.value) ||
    PromoHiLoCardConstant?.defaultTitleHeadingLevel;
  return (
    <div className="hi-lo-card-container">
      {(data?.mainImage?.jsonValue ||
        data?.mainMdImage?.jsonValue ||
        data?.mainSmImage?.jsonValue) && (
        <div className="hi-lo-card-image">
          <div className={`image-wrapper ${imageVariantClass}`}>
            <ImageItem
              field={
                data?.mainImage?.jsonValue ||
                data?.mainMdImage?.jsonValue ||
                data?.mainSmImage?.jsonValue
              }
              nextImageSrc={
                data?.mainImage?.src || data?.mainMdImage?.src || data?.mainSmImage?.src
              }
            />
          </div>
        </div>
      )}

      <div className="hi-lo-card-text">
        {data?.mainTitle?.jsonValue?.value && (
          <>
            <Heading
              richText
              className={` hi-lo-card-heading ${titleClass}`}
              tag={`h${titleHeadingLevel}`}
              field={data?.mainTitle?.jsonValue}
            />
          </>
        )}

        {data?.tag?.jsonValue?.value && (
          <JssRichText
            className={`hi-lo-card-subtitle ${tagClass}`}
            tag={`p`}
            field={data?.tag?.jsonValue ?? ''}
          />
        )}
        {data?.bodyCopy?.jsonValue?.value && (
          <JssRichText
            className={`hi-lo-card-description ${descriptionClass}`}
            tag={`p`}
            field={data?.bodyCopy?.jsonValue ?? ''}
          />
        )}
        {showCta && (
          <div>
            <Ctas {...data} />
          </div>
        )}
      </div>
    </div>
  );
};
const PromoHiLoCardWrapper = ({
  cardData,
  cardType,
  showCta,
}: {
  cardData: PromoHiLoDataprop;
  cardType: string;
  showCta?: boolean;
}) => {
  const theme = JSON?.parse(cardData?.params?.backgroundColorVariant || '{}')?.Value?.value ?? '';
  const bgTheme = theme ? `bg-${theme}` : '';
  const cardItems = cardData?.fields?.data?.item?.children?.results || [];
  const header = cardData?.fields?.data?.item?.header?.jsonValue;
  const imageType = JSON?.parse(cardData?.params?.ImageTreatment || '{}')?.Value?.value ?? 'square';
  const imageVariantClass = imageType ? `media-treatment-${imageType}` : '';

  return (
    <div className={`component `}>
      <div className="component-content">
        <div className={`component hi-lo-cards ${bgTheme} ${cardType}`}>
          <Container>
            {header?.value && (
              <>
                <Heading richText className="hi-lo-cards-title" tag={`h3`} field={header} />
              </>
            )}

            {cardItems?.length > 0 && (
              <Row className="hi-lo-cards-wrapper">
                {cardItems.map((item: CardItem, key: number) => {
                  return (
                    <EditFrame
                      key={key}
                      title="Edit Content Stats"
                      dataSource={{ itemId: item?.id }}
                      buttons={[
                        moveUpItemButton,
                        moveDownItemButton,
                        addItemButton,
                        deleteItemButton,
                      ]}
                    >
                      <PromoHiLoDataCard
                        imageVariantClass={imageVariantClass}
                        showCta={showCta}
                        data={item}
                        key={key}
                        params={cardData?.params}
                      />
                    </EditFrame>
                  );
                })}
              </Row>
            )}
          </Container>
        </div>
      </div>
    </div>
  );
};
export default PromoHiLoCardWrapper;
