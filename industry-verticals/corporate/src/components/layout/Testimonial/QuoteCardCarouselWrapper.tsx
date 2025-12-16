import dynamic from 'next/dynamic';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ComponentParams, RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { CardDataProp, QuoteCardCarouselProp } from './QuoteCardCarousel.types';
import { Container, Row } from 'react-bootstrap';
import ImageItem from '@/components/ui/Image/ImageItem';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { useShouldRender } from '@/utils/useShouldRender';
import { getPaddingValue } from '@/utils/Paddingutils';
const Slider = dynamic(() => import('react-slick'), { ssr: false });

export const QuoteCardCarouselWrapper = ({
  theme,
  cardVal,
  quoteMarkColor,
  params,
}: QuoteCardCarouselProp) => {
  const { paddingTop, paddingBottom } = getPaddingValue(params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;

  const settings = {
    dots: true,
    infinite: true,
    speed: 900,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 8000,
    accessibility: true, // Enables keyboard navigation
    pauseOnHover: true,
    pauseOnFocus: true, // Stops autoplay when interacting
  };

  return (
    <div
      className={`component quote-card-carousel ${theme} ${
        quoteMarkColor === 'bright' ? 'quote-color-bright' : ''
      } card-carousel ${paddingTopClass} ${paddingBottomClass}`}
    >
      <div className="component-content">
        <Container>
          <div role="region" aria-label="Quote Image Carousel" aria-roledescription="carousel">
            <Row>
              <div className="left-quote"></div>
              <Slider className="carousel-container slick-dotted " {...settings} aria-live="polite">
                {cardVal?.length > 0 &&
                  cardVal.map((card: CardDataProp, index: number) => {
                    return <CarouselCard params={params} cardData={card} key={index} />;
                  })}
              </Slider>
              <div className="right-quote"></div>
            </Row>
          </div>
        </Container>
      </div>
    </div>
  );
};
const CarouselCard = ({
  cardData,
  params,
}: {
  cardData: CardDataProp;
  params: ComponentParams;
}) => {
  const { titleClass, descriptionClass, tagClass } = getFontSizeClasses(params) || {};
  const shouldRender = useShouldRender();
  return (
    <div className="copy-section">
      <Row>
        <div className="copy-wrapper">
          {shouldRender(cardData?.quote?.jsonValue?.value) && (
            <div className="quote-wrapper">
              <JssRichText
                className={`quote ${titleClass}`}
                tag="blockquote"
                field={cardData?.quote?.jsonValue ?? ''}
              />
            </div>
          )}
          {(shouldRender(cardData?.quoteAuthor?.jsonValue?.value) ||
            shouldRender(cardData?.quoteAuthorTag?.jsonValue?.value)) && (
            <div className="author-wrapper">
              {shouldRender(cardData?.quoteAuthor?.jsonValue?.value) && (
                <JssRichText
                  className={`author ${descriptionClass}`}
                  tag={`p`}
                  field={cardData?.quoteAuthor?.jsonValue ?? ''}
                />
              )}
              {shouldRender(cardData?.quoteAuthorTag?.jsonValue?.value) && (
                <JssRichText
                  className={`author-tag ${tagClass}`}
                  tag={`p`}
                  field={cardData?.quoteAuthorTag?.jsonValue}
                />
              )}
            </div>
          )}

          {shouldRender(cardData?.quoteLogo?.jsonValue?.value?.src) && (
            <div className="logo">
              <ImageItem
                field={cardData?.quoteLogo?.jsonValue}
                nextImageSrc={cardData?.quoteLogo?.src}
              />
            </div>
          )}
        </div>
      </Row>
    </div>
  );
};
