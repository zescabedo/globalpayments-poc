import Slider from 'react-slick';
import { Container, Row } from 'react-bootstrap';
import { CaseStudyCarouselProps } from './CaseStudyCarousel.types';
import Heading from '@/components/ui/Heading/Heading';
import { RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import ImageItem from '@/components/ui/Image/ImageItem';
import Ctas from '@/components/ui/CTA/CTA';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { useRef, useState } from 'react';
import { BREAKPOINTS, caseStudyCarouselConstants } from '@/constants/appConstants';
import {
  moveUpItemButton,
  moveDownItemButton,
  deleteItemButton,
  addItemButton,
} from '@/utils/ReorderingSwitcher';
import { EditFrame } from '@sitecore-jss/sitecore-jss-nextjs';
import LinkItem from '@/components/ui/Link/Link';
import { useModal } from '@/components/ui/Modal/ModalProvider';

export const Default = (props: CaseStudyCarouselProps) => {
  const { fields, params } = props || {};
  const [currentSlide, setCurrentSlide] = useState(0);
  const { openModal } = useModal();

  //Params
  const headingSize =
    (params?.headingSize && JSON.parse(params?.headingSize)?.Value?.value) ||
    caseStudyCarouselConstants.defaultHeadingSize;

  const isBottomTrayEnabled = params?.isBottomTrayEnabled === '1';

  const backgroundColorVariant =
    (props?.params?.backgroundColorVariant &&
      'bg-' + JSON.parse(props?.params?.backgroundColorVariant)?.Value?.value) ||
    '';

  // fields
  const item = fields?.data?.item || {};
  const title = item?.title?.jsonValue;
  const details = item?.details?.jsonValue;
  const carouselItems = item?.caseStudyCards?.results || [];

  //AOS
  const aosAttributes = getAosAttributes(props);

  //Carousel
  const sliderTopRef = useRef<Slider>(null);
  const sliderBottomRef = useRef<Slider>(null);

  const commonSettings = {
    dots: false,
    infinite: true,
  };

  const handleCardClick = (index: number) => {
    setCurrentSlide(index);
    if (sliderTopRef.current) {
      sliderTopRef.current.slickGoTo(index);
    }
    if (sliderBottomRef.current) {
      sliderBottomRef.current.slickGoTo(index);
    }
  };

  const topSliderSettings = {
    ...commonSettings,
    asNavFor: isBottomTrayEnabled && sliderBottomRef.current ? sliderBottomRef.current : undefined,
    slidesToScroll: caseStudyCarouselConstants.slidesToScroll,
    slidesToShow: caseStudyCarouselConstants.sliderTopSlidesToShowLg,
    arrows: true,
    speed: 500,
    accessibility: true,
    variableWidth: true,
    beforeChange: (_oldIndex: number, newIndex: number) => {
      setCurrentSlide(newIndex);
    },
    responsive: [
      {
        breakpoint: BREAKPOINTS.md,
        settings: {
          slidesToShow: caseStudyCarouselConstants.sliderTopSlidesToShowMd,
        },
      },
      {
        breakpoint: BREAKPOINTS.sm,
        settings: {
          variableWidth: false,
          slidesToShow: caseStudyCarouselConstants.sliderTopSlidesToShowSm,
        },
      },
    ],
  };

  const bottomSliderSettings = {
    ...commonSettings,
    slidesToShow: caseStudyCarouselConstants.sliderBottomSlidesToShow,
    speed: 600,
    asNavFor: sliderTopRef?.current || undefined,
  };

  return (
    <Container fluid>
      <Row>
        <div
          className={`component case-study-carousel ${backgroundColorVariant}`}
          {...aosAttributes}
        >
          <Container>
            <Row>
              <div className="intro-column">
                <div className="intro-section">
                  {title && (
                    <Heading level={headingSize} className="headline" field={title} richText />
                  )}
                  {details?.value && <RichText field={details} className="description" />}
                  {item?.ctaTitle && item?.ctaLink && <Ctas {...item} />}
                </div>
              </div>
            </Row>

            {carouselItems?.length > 0 && (
              <Row>
                <div className="sliderColumn">
                  <div className="card-carousel-container">
                    {/* Top Image Carousel */}
                    <Slider
                      ref={sliderTopRef}
                      {...topSliderSettings}
                      className="card-carousel-top ec-clickable-card"
                    >
                      {carouselItems?.map(
                        (item, index) =>
                          item?.mainImage?.jsonValue && (
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
                              <div
                                key={index}
                                className={`cardSlide ${currentSlide === index ? 'active' : ''}`}
                                onClick={() => handleCardClick(index)}
                                role="button"
                                tabIndex={-1}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    handleCardClick(index);
                                  }
                                }}
                              >
                                {item?.mainImage?.jsonValue && (
                                  <div className="image-container">
                                    <ImageItem
                                      field={item?.mainImage?.jsonValue}
                                      nextImageSrc={item?.mainImage?.src}
                                      className="main-image"
                                    />
                                  </div>
                                )}
                                {(item?.overlayLogo?.jsonValue || item?.categoryTag?.jsonValue) && (
                                  <div className="sliderOverlay">
                                    {item?.overlayLogo?.jsonValue && (
                                      <div className="overlayLogo">
                                        <ImageItem
                                          field={item.overlayLogo.jsonValue}
                                          nextImageSrc={item.overlayLogo.src}
                                        />
                                      </div>
                                    )}

                                    {item?.categoryTag?.jsonValue && (
                                      <RichText
                                        tag="span"
                                        field={item.categoryTag.jsonValue}
                                        className="categoryTag"
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                              {!isBottomTrayEnabled &&
                                item?.ctaLink?.jsonValue?.value?.href &&
                                item?.ctaLink?.jsonValue?.value?.href !== '#' && (
                                  <LinkItem
                                    className="ec-card-link-overlay"
                                    field={item.ctaLink?.jsonValue}
                                    value={{
                                      ...item?.ctaLink?.jsonValue?.value,
                                      href: item?.ctaLink?.jsonValue?.value?.href || '#',
                                    }}
                                    openInModal={item?.openInModal?.jsonValue?.value}
                                    onClick={() =>
                                      openModal(
                                        item?.ctaLink?.jsonValue?.value?.href as string,
                                        item?.modalTheme?.targetItem?.value?.jsonValue?.value
                                      )
                                    }
                                  />
                                )}
                            </EditFrame>
                          )
                      )}
                    </Slider>

                    {/* Bottom Content Carousel */}
                    {isBottomTrayEnabled && (
                      <Slider
                        {...bottomSliderSettings}
                        ref={sliderBottomRef}
                        className="card-carousel-bottom"
                      >
                        {carouselItems?.map((item, index) => (
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
                            <div
                              key={index}
                              className={`container-tray ${currentSlide === index ? 'active' : ''}`}
                            >
                              <div className="row">
                                {item?.backgroundImage && (
                                  <div className="tray-logo">
                                    <ImageItem
                                      field={item.backgroundImage.jsonValue}
                                      nextImageSrc={item.backgroundImage.src}
                                    />
                                  </div>
                                )}
                                <div className="tray-content">
                                  {item?.details?.jsonValue && (
                                    <RichText
                                      tag="p"
                                      field={item.details.jsonValue}
                                      className="description"
                                    />
                                  )}
                                  {item?.authorTag?.jsonValue && (
                                    <div className="address-wrapper">
                                      <p className="address">
                                        {item?.authorName?.jsonValue && (
                                          <span className="name">
                                            <RichText
                                              tag="span"
                                              field={item.authorName.jsonValue}
                                            />
                                            ,{' '}
                                          </span>
                                        )}
                                        <RichText tag="span" field={item.authorTag.jsonValue} />
                                      </p>
                                    </div>
                                  )}
                                  {item?.ctaTitle && item?.ctaLink && (
                                    <Ctas {...item} tabIndex={-1} />
                                  )}
                                </div>
                              </div>
                            </div>
                          </EditFrame>
                        ))}
                      </Slider>
                    )}
                  </div>
                </div>
              </Row>
            )}
          </Container>
        </div>
      </Row>
    </Container>
  );
};
