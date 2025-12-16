import Slider from 'react-slick';
import { CardCarouselProps, CustomArrowWithDisabledProps } from './CardCarousel.types';
import Image from 'next/image';
import Heading from '@/components/ui/Heading/Heading';
import ImageItem from '@/components/ui/Image/ImageItem';
import { useCallback, useEffect, useState } from 'react';
import {
  RichText as JssRichText,
  useSitecoreContext,
  Text,
} from '@sitecore-jss/sitecore-jss-react';
import { BREAKPOINTS } from '@/constants/appConstants';
import { debounce } from 'lodash';
import Link from 'next/link';
import { generateIndustryUrl } from '@/utils/uptick/linkResolver';
import { useShouldRender } from '@/utils/useShouldRender';
const useIsMobile = (breakpoint = BREAKPOINTS.md) => {
  const [isMobile, setIsMobile] = useState(false);

  const checkMobile = useCallback(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < breakpoint);
    }
  }, [breakpoint]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const debouncedCheck = debounce(checkMobile, 150);
    checkMobile();
    window.addEventListener('resize', debouncedCheck);
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      debouncedCheck.cancel();
    };
  }, [checkMobile]);

  return isMobile;
};

const CustomNextArrow = (props: CustomArrowWithDisabledProps) => {
  const { onClick, disabled } = props;
  return (
    <button
      type="button"
      className={`custom-arrow next ${disabled ? 'disabled' : ''}`}
      onClick={!disabled ? onClick : undefined}
      aria-label="Next slide"
      aria-disabled={disabled}
    >
      <span className={`right-arrow ${disabled ? 'disabled' : ''}`}></span>
    </button>
  );
};

const CustomPrevArrow = (props: CustomArrowWithDisabledProps) => {
  const { onClick, disabled } = props;
  return (
    <button
      type="button"
      className={`custom-arrow prev ${disabled ? 'disabled' : ''}`}
      onClick={!disabled ? onClick : undefined}
      aria-label="Previous slide"
      aria-disabled={disabled}
    >
      <span className={`left-arrow ${disabled ? 'disabled' : ''}`}></span>
    </button>
  );
};

const CardCarousel = (props: CardCarouselProps) => {
  const isMobile = useIsMobile();
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext.pageEditing;
  const shouldRender = useShouldRender();
  const item = props?.fields?.data?.item;
  if (!item && !isEditing) {
    return null;
  }
  useEffect(() => {
    updateAriaHidden(currentSlide, slidesVisible);
  }, []);
  const updateAriaHidden = (startIndex: number, count: number) => {
    const slides = document.querySelectorAll('.slick-slide');
    slides.forEach((slide, index) => {
      if (index >= startIndex && index < startIndex + count) {
        slide.setAttribute('aria-hidden', 'false');
      } else {
        slide.setAttribute('aria-hidden', 'true');
      }
    });
  };
  const carouselCards = item?.CardCarousel?.targetItems || [];
  const title = item?.title?.jsonValue;
  const showDots = carouselCards.length <= 12;
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalCards = carouselCards.length;
  const slidesVisible = Number(props?.params?.SlideToShow);
  const disablePrev = currentSlide === 0;
  const disableNext = currentSlide + slidesVisible > totalCards;
  const sliderSettings = {
    dots: showDots,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: false,
    variableWidth: true,
    beforeChange: (_oldIndex: number, newIndex: number) => {
      setCurrentSlide(newIndex);
    },
    afterChange: (current: number) => {
      updateAriaHidden(current, slidesVisible);
    },
    nextArrow: <CustomNextArrow disabled={disableNext} />,
    prevArrow: <CustomPrevArrow disabled={disablePrev} />,
  };
  return (
    <div className={`component card-carousel`} aria-label="Card Carousel">
      <div className="component-content">
        <div className="container">
          <Heading level={2} text={title} className="container-title" />
          <div className="card-container">
            {isMobile ? (
              <ul className="card-list" aria-label="Carousel items">
                {carouselCards.map((card, i) => (
                  <>
                    {shouldRender(card?.Title?.jsonValue?.value) && (
                      <Link
                        href={generateIndustryUrl(card?.slug?.jsonValue?.value, sitecoreContext)}
                        key={i}
                        locale={false}
                      >
                        <li>
                          <JssRichText
                            tag="p"
                            className="mobile-card-title"
                            field={{ value: card?.name }}
                          />
                          <div className="card-img">
                            <span className="card-arrow"></span>
                          </div>
                        </li>
                      </Link>
                    )}
                  </>
                ))}
              </ul>
            ) : carouselCards.length > 4 ? (
              <Slider {...sliderSettings}>
                {carouselCards.map((card, i) => {
                  return (
                    <div className="slide-card" key={i}>
                      <Link
                        href={generateIndustryUrl(card?.slug?.jsonValue?.value, sitecoreContext)}
                        locale={false}
                      >
                        <div className="image-wrapper">
                          {card?.Image?.src && (
                            <ImageItem
                              field={card?.Image?.jsonValue}
                              nextImageSrc={card?.Image?.jsonValue?.value?.src}
                              className="card-image"
                            />
                          )}
                        </div>
                        <div className="card-desc">
                          <div className="card-title">
                            <Text tag="p" className="title-text" field={{ value: card?.name }} />
                            {card?.Icon?.jsonValue?.url && (
                              <Image
                                src={card?.Icon?.jsonValue?.url}
                                alt="card-icon"
                                width={65}
                                height={65}
                                className="card-icon"
                              />
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </Slider>
            ) : (
              <div className="static-card-wrapper">
                {carouselCards.map((card, i) => {
                  return (
                    <div className="slide-card" key={i}>
                      <Link
                        href={generateIndustryUrl(card?.slug?.jsonValue?.value, sitecoreContext)}
                        locale={false}
                      >
                        <div className="image-wrapper">
                          {card?.Image?.src && (
                            <ImageItem
                              field={card?.Image?.jsonValue}
                              nextImageSrc={card?.Image?.jsonValue?.value?.src}
                              className="card-image"
                            />
                          )}
                        </div>
                        <div className="card-desc">
                          <div className="card-title">
                            <Text tag="p" className="title-text" field={{ value: card?.name }} />
                            {card?.Icon?.jsonValue?.url && (
                              <Image
                                src={card?.Icon?.jsonValue?.url}
                                alt="card-icon"
                                width={65}
                                height={65}
                                className="card-icon"
                              />
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CardCarousel;
