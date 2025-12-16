import React, { useRef } from 'react';
import { BlogCardProps } from '@/components/layout/BlogCards/BlogCards.types';
import Slider from 'react-slick';
import BlogCard from '@/components/layout/BlogCard/BlogCard';
import { BREAKPOINTS } from '@/constants/appConstants';
import { getPaddingValue } from '@/utils/Paddingutils';
import { getAosAttributes } from '@/components/ui/AOS/AOS';

export const Default = (props: BlogCardProps): JSX.Element => {
  const { fields, params } = props || {};
  const backgroundColorVariantValue = params?.backgroundColorVariant
    ? JSON.parse(params.backgroundColorVariant)?.Value?.value
    : '';
  const backgroundColorVariant = backgroundColorVariantValue
    ? `bg-${backgroundColorVariantValue}`
    : '';
  const cardBackgroundValue = params?.cardBackground
    ? JSON.parse(params.cardBackground)?.Value?.value
    : '';
  const cardBackgroundVariant = cardBackgroundValue ? `bg-${cardBackgroundValue}` : 'bg-subtle';
  const { paddingTop, paddingBottom } = getPaddingValue(params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;
  const aosAttributes = getAosAttributes(props);

  const dataItem = fields?.data?.item;
  const children = dataItem?.children?.results || [];

  const sliderRef = useRef<Slider | null>(null);

  const shouldShowStaticOnDesktop = children.length <= 3;

  const settings = {
    infinite: false,
    speed: 500,
    slidesToScroll: 1,
    arrows: false,
    variableWidth: false,
    slidesToShow: 3.5,
    dots: true,
    responsive: [
      {
        breakpoint: 9999,
        settings: shouldShowStaticOnDesktop
          ? {
              infinite: false,
              slidesToShow: children.length,
              slidesToScroll: children.length,
              swipe: false,
              draggable: false,
              touchMove: false,
              arrows: false,
              dots: false,
              variableWidth: false,
            }
          : {
              infinite: false,
              slidesToShow: 3.5,
            },
      },
      {
        breakpoint: BREAKPOINTS.md,
        settings: {
          infinite: false,
          slidesToShow: 2.75,
          swipe: true,
          draggable: true,
          touchMove: true,
          dots: true,
          variableWidth: false,
        },
      },
      {
        breakpoint: BREAKPOINTS.sm,
        settings: {
          infinite: false,
          slidesToShow: 1.5,
          swipe: true,
          draggable: true,
          touchMove: true,
          dots: true,
          variableWidth: false,
        },
      },
    ],
  };
  return (
    <div
      id="content"
      className={`container-fluid ${backgroundColorVariant} ${params?.styles}`}
      {...aosAttributes}
    >
      <div className="row">
        <div
          className={`component blogcards-carousel ${paddingTopClass} ${paddingBottomClass}`}
          role="region"
          aria-labelledby="blog-carousel"
        >
          <div className="component-content">
            <div className="blogcards-carousel_container container">
              <Slider className="blogcards-carousel_row row" {...settings} ref={sliderRef}>
                {children?.map((child, index) => {
                  const hasImage = child?.mainImage?.src;
                  const hasVideo = child?.mainVideo?.jsonValue?.value?.href;
                  if (!hasImage && !hasVideo) return null;
                  return (
                    <BlogCard key={index} child={child} cardCopyBgColor={cardBackgroundVariant} />
                  );
                })}
              </Slider>
              {!shouldShowStaticOnDesktop && (
                <div className="btn-wrappper has-cta">
                  <div className="arrow-wrapper">
                    <button
                      className={`blog-card-carousel-arrow blog-card-carousel-arrow-back slick-arrow `}
                      aria-label="Previous"
                      aria-labelledby="blog-carousel"
                      onClick={() => sliderRef.current?.slickPrev()}
                    ></button>
                    <button
                      className={`blog-card-carousel-arrow blog-card-carousel-arrow-next slick-arrow`}
                      aria-label="Next"
                      aria-labelledby="blog-carousel"
                      onClick={() => sliderRef.current?.slickNext()}
                    ></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
