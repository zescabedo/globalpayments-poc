import Heading from '@/components/ui/Heading/Heading';
import {
  CustomArrowWithDisabledProps,
  FocusedCardCarouselProps,
} from './FocusedCardCarousel.types';
import ImageItem from '@/components/ui/Image/ImageItem';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import LinkItem from '@/components/ui/Link/Link';
import gsap from 'gsap';
import useIsMobile from '@/hooks/useIsMobile';
import { Accordion as BootstrapAccordion } from 'react-bootstrap';
import { RichText as JssRichText, useSitecoreContext } from '@sitecore-jss/sitecore-jss-react';
import { focusedCardConstant } from '@/constants/appConstants';
import { generateUptickUrls } from '@/utils/uptick/linkResolver';

const CustomNextArrow = ({ onClick, disabled }: CustomArrowWithDisabledProps) => (
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

const CustomPrevArrow = ({ onClick, disabled }: CustomArrowWithDisabledProps) => (
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

const FocusedCardCarousel = (props: FocusedCardCarouselProps) => {
  const isMobile = useIsMobile();
  const { sitecoreContext } = useSitecoreContext();
  const { focusedCardCarousel, featuredCards } = props?.fields?.data;
  const { title } = focusedCardCarousel;
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isAnimating = useRef(false);
  const previousIndex = useRef(0);
  const descriptionContentRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const getContainerOffset = (index: number) => {
    if (index === 0) return 0;

    const expandedWidth = focusedCardConstant.EXPANDED_WIDTH;
    const normalWidth = focusedCardConstant.NORMAL_WIDTH;
    const gap = focusedCardConstant.GAP;

    const offset = -(expandedWidth + gap) - (index - 1) * (normalWidth + gap);
    return offset + focusedCardConstant.CARD_OFFSET;
  };

  const handleCardClick = (index: number) => {
    if (isAnimating.current || index === selectedCardIndex) return;
    setSelectedCardIndex(index);
  };

  const handlePrev = () => {
    if (isAnimating.current || selectedCardIndex === 0) return;
    setSelectedCardIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (isAnimating.current || selectedCardIndex === featuredCards.results?.length - 1) return;
    setSelectedCardIndex((prev) => prev + 1);
  };

  // Set initial positions and sizes on mount
  useEffect(() => {
    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      const content = card.querySelector('.focused-card-item-content');

      if (index === selectedCardIndex) {
        // Set expanded card initial state
        gsap.set(card, {
          x: 0,
          width: focusedCardConstant.EXPANDED_WIDTH,
          height: focusedCardConstant.EXPANDED_HEIGHT,
        });
        if (content) {
          gsap.set(content, {
            width: focusedCardConstant.EXPANDED_CONTENT_WIDTH,
            height: focusedCardConstant.EXPANDED_CONTENT_HEIGHT,
            fontSize: focusedCardConstant.EXPANDED_CONTENT_FONT,
          });
        }
      } else {
        // Set normal card initial state
        gsap.set(card, {
          x: 0,
          width: focusedCardConstant.NORMAL_WIDTH,
          height: focusedCardConstant.NORMAL_HEIGHT,
        });
        if (content) {
          gsap.set(content, {
            width: focusedCardConstant.CONTENT_WIDTH,
            height: focusedCardConstant.CONTENT_HEIGHT,
            fontSize: focusedCardConstant.CONTENT_FONT,
          });
        }
      }
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCardIndex, featuredCards.results?.length]);

  // Animate description content fade
  useEffect(() => {
    if (!descriptionContentRef.current) return;

    const timeline = gsap.timeline();

    // Fade out
    timeline.to(descriptionContentRef.current, {
      opacity: 0,
      duration: focusedCardConstant.DURATION,
      ease: 'power2.out',
    });

    // Fade in with new content
    timeline.to(descriptionContentRef.current, {
      opacity: 1,
      duration: focusedCardConstant.DURATION,
      ease: 'power2.in',
    });
  }, [selectedCardIndex]);

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isAnimating.current) return;

    isDragging.current = true;
    dragStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragCurrentX.current = dragStartX.current;
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current) return;

    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragCurrentX.current = currentX;
    const delta = currentX - dragStartX.current;

    // Apply drag offset to all cards
    const baseOffset = getContainerOffset(selectedCardIndex);
    cardRefs.current.forEach((card) => {
      if (!card) return;
      gsap.set(card, { x: baseOffset + delta });
    });
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;

    isDragging.current = false;
    const delta = dragCurrentX.current - dragStartX.current;
    const threshold = focusedCardConstant.THRESHOLD; // Minimum drag distance to trigger slide

    if (Math.abs(delta) > threshold) {
      if (delta > 0 && selectedCardIndex > 0) {
        // Dragged right - go to previous
        setSelectedCardIndex((prev) => prev - 1);
      } else if (delta < 0 && selectedCardIndex < featuredCards.results?.length - 1) {
        // Dragged left - go to next
        setSelectedCardIndex((prev) => prev + 1);
      } else {
        // Snap back to current position
        snapToCurrentPosition();
      }
    } else {
      // Snap back to current position
      snapToCurrentPosition();
    }
  };

  const snapToCurrentPosition = () => {
    const offset = getContainerOffset(selectedCardIndex);
    cardRefs.current.forEach((card) => {
      if (!card) return;
      gsap.to(card, { x: offset, duration: 0.3, ease: 'power2.out' });
    });
  };

  useEffect(() => {
    if (cardRefs.current.length === 0) return;

    isAnimating.current = true;
    const timeline = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false;
      },
    });

    // Animate all cards sliding
    cardRefs.current.forEach((card) => {
      if (!card) return;

      timeline.to(
        card,
        {
          x: getContainerOffset(selectedCardIndex),
          duration: 0.7,
          ease: 'power2.out',
        },
        0
      );
    });

    // Animate previous card shrinking
    const prevCard = cardRefs.current[previousIndex.current];
    if (prevCard && previousIndex.current !== selectedCardIndex) {
      const prevContent = prevCard.querySelector('.focused-card-item-content');

      timeline.to(
        prevCard,
        {
          width: focusedCardConstant.NORMAL_WIDTH,
          height: focusedCardConstant.NORMAL_HEIGHT,
          duration: 0.7,
          ease: 'power2.out',
        },
        0
      );

      if (prevContent) {
        timeline.to(
          prevContent,
          {
            width: focusedCardConstant.CONTENT_WIDTH,
            height: focusedCardConstant.CONTENT_HEIGHT,
            fontSize: focusedCardConstant.CONTENT_FONT,
            duration: 0.7,
            ease: 'power2.out',
          },
          0
        );
      }
    }

    // Animate new card growing
    const newCard = cardRefs.current[selectedCardIndex];
    if (newCard) {
      const newContent = newCard.querySelector('.focused-card-item-content');

      timeline.to(
        newCard,
        {
          width: focusedCardConstant.EXPANDED_WIDTH,
          height: focusedCardConstant.EXPANDED_HEIGHT,
          duration: 0.7,
          ease: 'power2.out',
        },
        0
      );

      if (newContent) {
        timeline.to(
          newContent,
          {
            width: focusedCardConstant.EXPANDED_CONTENT_WIDTH,
            height: focusedCardConstant.EXPANDED_CONTENT_HEIGHT,
            fontSize: focusedCardConstant.EXPANDED_CONTENT_FONT,
            duration: 0.7,
            ease: 'power2.out',
          },
          0
        );
      }
    }

    previousIndex.current = selectedCardIndex;
  }, [selectedCardIndex]);

  return (
    <div className="component focused-card-carousel">
      <div className="component-content">
        <div className="container">
          <Heading level={1} text={title?.jsonValue} className="container-title" />
          <div className="focused-card-container">
            {isMobile ? (
              <>
                <BootstrapAccordion defaultActiveKey="0" className="mobile-accordion">
                  {featuredCards?.results &&
                    featuredCards?.results?.length > 0 &&
                    featuredCards?.results?.map((card, i) => {
                      return (
                        <BootstrapAccordion.Item eventKey={String(i)} key={i}>
                          <BootstrapAccordion.Header>
                            <JssRichText tag="span" field={card?.title?.jsonValue} />
                          </BootstrapAccordion.Header>
                          <BootstrapAccordion.Body>
                            <JssRichText
                              tag="p"
                              field={card?.promoSummary?.jsonValue}
                              className="accordion-description"
                            />
                            <div className="btn-cta-tertiary">
                              <LinkItem
                                value={{
                                  href: generateUptickUrls({
                                    sitecoreContext,
                                    kind: 'industry',
                                    slug: featuredCards?.results[selectedCardIndex]?.slug?.jsonValue
                                      ?.value,
                                  }),
                                  text: focusedCardCarousel?.exploreContent?.jsonValue?.value.replace(
                                    '{CardName}',
                                    card?.title?.jsonValue?.value
                                  ),
                                }}
                              />
                            </div>
                          </BootstrapAccordion.Body>
                        </BootstrapAccordion.Item>
                      );
                    })}
                </BootstrapAccordion>
              </>
            ) : (
              <>
                <div className="focused-card-description">
                  <div ref={descriptionContentRef} className="focused-card-content-col">
                    <JssRichText
                      tag="div"
                      field={featuredCards?.results[selectedCardIndex]?.promoTitle?.jsonValue}
                      className="selected-card-title"
                    />

                    <JssRichText
                      className="focused-card-summary"
                      tag="p"
                      field={featuredCards?.results[selectedCardIndex]?.promoSummary?.jsonValue}
                    />
                  </div>
                  <div className="btn-cta-tertiary">
                    <LinkItem
                      value={{
                        href: generateUptickUrls({
                          sitecoreContext,
                          kind: 'industry',
                          slug: featuredCards?.results[selectedCardIndex]?.slug?.jsonValue?.value,
                        }),
                        text: focusedCardCarousel?.learnMore?.jsonValue?.value,
                      }}
                    />
                  </div>
                  <div className="custom-arrows">
                    <CustomPrevArrow disabled={selectedCardIndex === 0} onClick={handlePrev} />
                    <CustomNextArrow
                      disabled={selectedCardIndex === featuredCards.results?.length - 1}
                      onClick={handleNext}
                    />
                  </div>
                </div>

                <div
                  className="focused-card-list"
                  ref={containerRef}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  {featuredCards?.results &&
                    featuredCards?.results?.length > 0 &&
                    featuredCards?.results?.map((card, index) => {
                      const cardImage = card?.promoImage?.jsonValue;
                      const imageAlt = cardImage?.value?.alt || card?.title?.jsonValue?.value;
                      return (
                        <div key={index} onClick={() => handleCardClick(index)}>
                          <div
                            ref={(el) => (cardRefs.current[index] = el)}
                            className={`focused-card-item ${
                              selectedCardIndex === index ? 'active' : ''
                            }`}
                          >
                            <div className="focused-card-item-image">
                              <ImageItem
                                field={{ value: { ...(cardImage?.value || {}), alt: imageAlt } }}
                                nextImageSrc={card?.promoImage?.jsonValue?.value?.src}
                              />
                            </div>
                            <div className="focused-card-item-content">
                              <JssRichText tag="p" field={card?.title?.jsonValue} />
                              {selectedCardIndex === index && card?.promoIcon?.jsonValue?.url && (
                                <div className="promo-image">
                                  <Image
                                    src={card?.promoIcon?.jsonValue?.url}
                                    width={48}
                                    height={48}
                                    className="svgicon"
                                    alt={card?.promoIcon?.jsonValue?.name}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusedCardCarousel;
