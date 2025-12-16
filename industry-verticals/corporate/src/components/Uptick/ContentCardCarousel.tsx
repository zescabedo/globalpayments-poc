import React, { useMemo, useState, useCallback, useEffect } from 'react';
import Slider from 'react-slick';
import { Container, Row } from 'react-bootstrap';
import { Link, RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { CardListProps } from '@/components/Uptick/CardList/CardList.types';
import CardListDefaultItem from '@/components/Uptick/CardList/CardListDefaultItem';

type ArrowProps = { onClick?: () => void; disabled?: boolean };

const CustomPrev: React.FC<ArrowProps> = ({ onClick, disabled }) => (
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

const CustomNext: React.FC<ArrowProps> = ({ onClick, disabled }) => (
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

const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);
  const check = useCallback(() => {
    if (typeof window !== 'undefined') setIsMobile(window.innerWidth < breakpoint);
  }, [breakpoint]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    check();
    const onResize = () => check();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [check]);

  return isMobile;
};

const ContentCardCarousel = (props: CardListProps): JSX.Element => {
  const { fields } = props || {};
  const cards = fields?.cards || [];
  const isMobile = useIsMobile();
  const [current, setCurrent] = useState(0);

  // thresholds from story:
  // desktop: 4 full + 1 partial; tablet: 2 + 1 partial; mobile: 1 + 1 partial
  // we’ll implement “partial” via variableWidth and fixed slide width (312px).
  const showChromeDesktop = cards.length > 4;
  const showChromeTablet = cards.length > 2;
  const showChromeMobile = cards.length > 1;

  const showDots = isMobile ? showChromeMobile : showChromeDesktop;

  // for disabling arrows: left disabled when first 5 are visible, right disabled when last 5 visible
  const total = cards.length;
  const slidesVisible = isMobile ? 1 : 4; // logical visibility
  const disablePrev = current === 0;
  const disableNext = current + slidesVisible >= total;

  const settings = useMemo(
    () => ({
      dots: showDots,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      variableWidth: true,
      centerMode: false,
      beforeChange: (_old: number, next: number) => setCurrent(next),
      nextArrow: <CustomNext disabled={disableNext} />,
      prevArrow: <CustomPrev disabled={disablePrev} />,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            dots: showChromeTablet,
            arrows: showChromeTablet,
            variableWidth: true,
          },
        },
        {
          breakpoint: 640,
          settings: {
            dots: showChromeMobile,
            arrows: showChromeMobile,
            variableWidth: true,
          },
        },
      ],
    }),
    [showDots, showChromeTablet, showChromeMobile, disableNext, disablePrev]
  );

  return (
    <div className="component content-card-carousel" aria-label="Content Card Carousel">
      <div className="component-content">
        <Container>
          <Row>
            <div className="title-row">
              {fields?.title?.value && <RichText tag="h2" field={fields.title} className="title" />}
              {fields.ctaLink?.value?.href && (
                <Link field={fields.ctaLink} className="btn-cta-tertiary">
                  {fields.ctaLink?.value.text || 'Explore more'}
                </Link>
              )}
            </div>
          </Row>

          <Row>
            {cards.length > 0 ? (
              <Slider {...settings}>
                {cards.map((card, i) => (
                  <CardListDefaultItem {...card} key={card?.title?.value || i} />
                ))}
              </Slider>
            ) : (
              <div className="text-muted small">No items</div>
            )}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default ContentCardCarousel;
