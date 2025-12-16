import React, { useEffect, useMemo, useRef, useState } from 'react';
import ImageItem from '@/components/ui/Image/ImageItem';
import { ImageInsetTestimonialProps } from './ImageInsetTestimonial.types';
import {
  EditFrame,
  RichText as JssRichText,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { Container, Row } from 'react-bootstrap';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { EditFrameBackgroundImageWithFocusButton } from '@/utils/SiteCoreCustomEditBtn';
import { formatToGuid } from '@/utils/tools';
import { ImageInsetTestimonialConstants } from '@/constants/appConstants';
import { debounce } from 'lodash';
import { isEmptyRichText } from '@/utils/isEmptyRichtext';
import { useShouldRender } from '@/utils/useShouldRender';
import { BREAKPOINTS } from '@/constants/appConstants';

export const Default = (props: ImageInsetTestimonialProps): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext.pageEditing;
  const propsFieldData = props?.fields?.data?.item || {};
  const backgroundImage = propsFieldData?.backgroundImage;
  const backgroundMdImage = propsFieldData?.backgroundMdImage;
  const backgroundSmImage = propsFieldData?.backgroundSmImage;
  const quote = propsFieldData?.quote?.jsonValue;
  const quoteAuthor = propsFieldData?.quoteAuthor?.jsonValue;
  const quoteAuthorTag = propsFieldData?.quoteAuthorTag?.jsonValue;
  const backgroundColorVariant =
    (props?.params?.backgroundColorVariant &&
      JSON.parse(props?.params?.backgroundColorVariant)?.Value?.value) ||
    '';
  const textBackgroundColor =
    propsFieldData?.textBackgroundColor?.jsonValue?.fields?.Value?.value || '';
  const logo = propsFieldData?.logo;
  const focusXDesktop = propsFieldData?.focusXDesktop?.jsonValue?.value;
  const focusYDesktop = propsFieldData?.focusYDesktop?.jsonValue?.value;
  const focusXTablet = propsFieldData?.focusXTablet?.jsonValue?.value;
  const focusYTablet = propsFieldData?.focusYTablet?.jsonValue?.value;
  const focusXMobile = propsFieldData?.focusXMobile?.jsonValue?.value;
  const focusYMobile = propsFieldData?.focusYMobile?.jsonValue?.value;
  const aosAttributes = getAosAttributes(props);
  const dataSourceId = propsFieldData?.id || '';
  const formattedId = formatToGuid(dataSourceId);
  const shouldRender = useShouldRender();

  const [isInView, setIsInView] = useState(false);
  const [topPosition, setTopPosition] = useState(10);
  const [isDesktop, setIsDesktop] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const getEditFrameProps = (dataSourceId?: string) => ({
    dataSource: dataSourceId ? { itemId: dataSourceId } : undefined,
    buttons: EditFrameBackgroundImageWithFocusButton,
    title: 'Edit background image',
    tooltip: 'Modify the background content within this section',

    cssClass: 'jss-edit-frame',
    parameters: {},
  });

  const parallaxRef = useRef<HTMLDivElement>(null);
  const contentSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.lg);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Parallax scroll animation
  useEffect(() => {
    if (!isInView || !componentRef.current || !isDesktop) return;

    const handleScroll = () => {
      if (!componentRef.current) return;

      const componentRect = componentRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const componentTop = componentRect.top;
      const componentHeight = componentRect.height;
      
      const animationEndPoint = windowHeight * 0.4;
      
      const animationStart = windowHeight;
      const animationEnd = animationEndPoint - componentHeight;
      const animationRange = animationStart - animationEnd;
      
      const scrollProgress = Math.max(0, Math.min(1, 
        (animationStart - componentTop) / animationRange
      ));
      
      const startPosition = 10;
      const endPosition = 50;
      const currentPosition = startPosition + (endPosition - startPosition) * scrollProgress;
      
      setTopPosition(currentPosition);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isInView, isDesktop]);

  // Effect to adjust margin after render
  useEffect(() => {
    const { defaultDebounceTime } = ImageInsetTestimonialConstants;

    const adjustMargin = () => {
      if (typeof window !== 'undefined' && parallaxRef.current && contentSectionRef.current) {
        const contentSectionHeight = contentSectionRef.current.offsetHeight;
        parallaxRef.current.style.setProperty(
          '--content-section-height',
          `${contentSectionHeight}px`
        );
      }
    };

    // Create debounced version using lodash
    const debouncedAdjustMargin = debounce(adjustMargin, defaultDebounceTime);

    // Run once after initial render
    adjustMargin();

    // Set up event listeners with debounced function
    window.addEventListener('resize', debouncedAdjustMargin);
    window.addEventListener('load', adjustMargin);
    document.addEventListener('DOMContentLoaded', adjustMargin);

    return () => {
      window.removeEventListener('resize', debouncedAdjustMargin);
      window.removeEventListener('load', adjustMargin);
      document.removeEventListener('DOMContentLoaded', adjustMargin);
      // Make sure to cancel the debounce on cleanup
      debouncedAdjustMargin.cancel();
    };
  }, []);

  const hasQuoteValue: boolean = useMemo(() => {
    return Boolean(quote?.value && !isEmptyRichText(quote.value));
  }, [quote]);
  const hasQuoteAuthor: boolean = useMemo(() => {
    return Boolean(quoteAuthor?.value && !isEmptyRichText(quoteAuthor.value));
  }, [quoteAuthor]);
  const hasQuoteAuthorTag: boolean = useMemo(() => {
    return Boolean(quoteAuthorTag?.value && !isEmptyRichText(quoteAuthorTag.value));
  }, [quoteAuthorTag]);

  return (
    <div
      ref={componentRef}
      className={`image-inset-testimonial ${
        backgroundColorVariant && `bg-${backgroundColorVariant}`
      }`}
      {...aosAttributes}
    >
      <Container>
        <Row>
          <div className="parallax inset-image" ref={parallaxRef}>
            <div className="content-wrapper">
              <div className="media-container">
                <EditFrame {...getEditFrameProps(`${formattedId}`)}>
                  <div
                    className="bg-media"
                    style={
                      {
                        '--bg-image-desktop': `url(${backgroundImage?.src})`,
                        '--bg-image-tablet': `url(${
                          backgroundMdImage?.src || backgroundImage?.src
                        })`,
                        '--bg-image-mobile': `url(${
                          backgroundSmImage?.src || backgroundMdImage?.src || backgroundImage?.src
                        })`,
                        '--focus-x-desktop': focusXDesktop,
                        '--focus-y-desktop': focusYDesktop,
                        '--focus-x-tablet': focusXTablet,
                        '--focus-y-tablet': focusYTablet,
                        '--focus-x-mobile': focusXMobile,
                        '--focus-y-mobile': focusYMobile,
                      } as React.CSSProperties
                    }
                  />
                </EditFrame>
              </div>
              <div
                ref={contentSectionRef}
                className={`content-section ${textBackgroundColor && `bg-${textBackgroundColor}`}`}
                style={isDesktop ? {
                  top: `${topPosition}rem`,
                } : {}}
              >
                {shouldRender(hasQuoteValue) && (
                  <JssRichText tag="blockquote" className={`quote`} field={quote} />
                )}
                {(isEditing || hasQuoteAuthor || hasQuoteAuthorTag) && (
                  <div className="attribution">
                    {shouldRender(hasQuoteAuthor) && (
                      <JssRichText tag="span" className={`author`} field={quoteAuthor} />
                    )}
                    {shouldRender(hasQuoteAuthorTag) && (
                      <JssRichText tag="span" className={`tag`} field={quoteAuthorTag} />
                    )}
                  </div>
                )}
                {shouldRender(logo?.src) && (
                  <ImageItem className="logo" field={logo?.jsonValue} nextImageSrc={logo?.src} />
                )}
              </div>
            </div>
          </div>
        </Row>
      </Container>
    </div>
  );
};
