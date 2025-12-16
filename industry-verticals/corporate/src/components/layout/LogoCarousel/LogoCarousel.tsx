import Slider from 'react-slick';
import ImageItem from '@/components/ui/Image/ImageItem';
import { CarouselProps } from './LogoCarousel.types';
import { LogoCarouselConstants } from '@/constants/appConstants';
import { Container, Row } from 'react-bootstrap';
import {
  moveUpItemButton,
  moveDownItemButton,
  deleteItemButton,
  addItemButton,
} from '@/utils/ReorderingSwitcher';
import { EditFrame, useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { useShouldRender } from '@/utils/useShouldRender';
import { BREAKPOINTS } from '@/constants/appConstants';
import { getPaddingValue } from '@/utils/Paddingutils';

const CarouselComponent = ({
  fields,
  params,
  className = 'large-images',
  slidesToShow = 6,
}: {
  fields: CarouselProps['fields'];
  params: CarouselProps['params'];
  className: string;
  slidesToShow: number;
}) => {
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext && sitecoreContext?.pageEditing;
  const images = fields?.data?.item?.children?.results || [];
  const useStaticGrid = images.length < 6;
  const { paddingBottom, paddingTop } = getPaddingValue(params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;
  const mdSlidesToshow = slidesToShow == 12 ? 7 : 3.5;
  const smSlidesToshow = slidesToShow == 12 ? 3.5 : 1.5;

  const shouldRender = useShouldRender();
  //params
  const isLoop = params?.Loop === '1';
  const componentBackgroundColour = JSON.parse(params?.backgroundColorVariant)?.Value?.value
    ? `bg-${JSON.parse(params?.backgroundColorVariant)?.Value?.value}`
    : '';
  const isDeferLoading = Boolean(params?.deferLoading);

  const sliderSettings = {
    dots: false,
    arrows: false,
    infinite: isLoop,
    speed: isEditing ? 0 : LogoCarouselConstants.SPEED,
    slidesToShow: slidesToShow == 12 ? Math.min(images.length, 12) : slidesToShow,
    slidesToScroll: LogoCarouselConstants.SLIDES_TO_SCROLL,
    autoplay: !isEditing && images.length >= slidesToShow,
    responsive: [
      {
        breakpoint: BREAKPOINTS.md,
        settings: {
          slidesToShow: mdSlidesToshow,
          autoplay: !isEditing && images.length >= mdSlidesToshow,
        },
      },
      {
        breakpoint: BREAKPOINTS.sm,
        settings: {
          slidesToShow: smSlidesToshow,
          autoplay: !isEditing && images.length >= smSlidesToshow,
        },
      },
    ],
    pauseOnHover: true,
    pauseOnFocus: true,
    autoplaySpeed: LogoCarouselConstants.AUTOPLAY_SPEED,
    variableWidth: false,
    draggable: !isEditing,
    swipe: !isEditing,
    accessibility: !isEditing,
  };

  return (
    <div
      className={`component logo-carousel ${isLoop ? 'looped' : ''} ${componentBackgroundColour} ${className} ${paddingTopClass} ${paddingBottomClass}`}
    >
      <div className="component-content">
        <Container>
          <Row>
            <div className="disable_wrap"></div>
            {useStaticGrid ? (
              <div className="static-logo-grid">
                {images.map(
                  (item, index) =>
                    shouldRender(item?.Image?.jsonValue.value.src) && (
                      <div key={index} className="static-logo-item">
                        <div className="image-wrapper">
                          <EditFrame
                            key={index}
                            title="Edit Content Item"
                            dataSource={{ itemId: String(item?.id || '') }}
                            buttons={[
                              moveUpItemButton,
                              moveDownItemButton,
                              addItemButton,
                              deleteItemButton,
                            ]}
                          >
                            <ImageItem
                              className="logo-img"
                              field={item.Image?.jsonValue}
                              nextImageSrc={item.Image?.src}
                              deferLoading={isDeferLoading}
                            />
                          </EditFrame>
                        </div>
                      </div>
                    )
                )}
              </div>
            ) : (
              Array.isArray(images) &&
              images.length > 0 && (
                <Slider
                  {...sliderSettings}
                  className={`logo-carousel_container slides-${images.length}`}
                  aria-label="carousel"
                  aria-roledescription="carousel"
                  aria-live="polite"
                >
                  {images.map(
                    (item, index) =>
                      shouldRender(item?.Image?.jsonValue?.value?.src) && (
                        <div key={index} className="slick-slide">
                          <div className="image-wrapper">
                            <EditFrame
                              key={index}
                              title="Edit Content Item"
                              dataSource={{ itemId: String(item?.id || '') }}
                              buttons={[
                                moveUpItemButton,
                                moveDownItemButton,
                                addItemButton,
                                deleteItemButton,
                              ]}
                            >
                              <ImageItem
                                className="logo-img"
                                field={item.Image.jsonValue}
                                nextImageSrc={item.Image.src}
                                deferLoading={isDeferLoading}
                              />
                            </EditFrame>
                          </div>
                        </div>
                      )
                  )}
                </Slider>
              )
            )}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default CarouselComponent;

export function SmallImages({ fields, params }: CarouselProps) {
  return (
    <CarouselComponent fields={fields} params={params} className="small-images" slidesToShow={12} />
  );
}

export function LargeImages({ fields, params }: CarouselProps) {
  return (
    <CarouselComponent fields={fields} params={params} className="large-images" slidesToShow={6} />
  );
}
