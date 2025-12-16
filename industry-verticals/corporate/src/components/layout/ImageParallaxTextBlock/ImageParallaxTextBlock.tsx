import Heading from '../../ui/Heading/Heading';
import { RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { ImageParallaxTextBlock } from './ImageParallaxTextBlock.types';
import { Container, Row } from 'react-bootstrap';
import { GPImage } from '../../ui/Image/GPImage';
import Ctas from '../../ui/CTA/CTA';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { ImageParallaxTextBlockConstants, BREAKPOINTS } from '@/constants/appConstants';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { useEffect, useRef, useState } from 'react';

const parralaxStartPosition = 16;

export const Default = (props: ImageParallaxTextBlock): JSX.Element => {
  const { fields, params } = props || {};
  const [isInView, setIsInView] = useState(false);
  const [bottomPosition, setBottomPosition] = useState(parralaxStartPosition);
  const [isDesktop, setIsDesktop] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);
  const contentSectionRef = useRef<HTMLDivElement>(null);

  const { defaultTitleHeadingLevel, defaultCardBackgroundColor } = ImageParallaxTextBlockConstants;

  //params
  const componentBackgroundColour =
    params?.backgroundColorVariant && JSON.parse(params?.backgroundColorVariant)?.Value?.value
      ? `bg-${JSON.parse(params?.backgroundColorVariant)?.Value?.value}`
      : '';

  const headingSize =
    (props?.params?.titleHeadingLevel &&
      JSON.parse(props?.params?.titleHeadingLevel)?.Value?.value) ||
      defaultTitleHeadingLevel;

  //fields
  const propsFieldData = fields?.data?.item;
  const title = propsFieldData?.title?.jsonValue;
  const details = propsFieldData?.details?.jsonValue;
  const mainImage = propsFieldData?.mainImage || null;
  const backgroundColorValue =
    propsFieldData?.textboxBackgroundColor?.jsonValue?.fields?.Value?.value || '';
  const cardbackgroundColor = backgroundColorValue
    ? `bg-${backgroundColorValue}`
    : defaultCardBackgroundColor;
  //AOS
  const aosAttributes = getAosAttributes(props);

  const { titleClass, descriptionClass } =
    getFontSizeClasses(props?.params) || {};

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.md);
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
        threshold: 0.1,
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

  // this replaces the CSS animation which was not reliable
  useEffect(() => {
    if (!isInView || !componentRef.current || !isDesktop) return;

    const handleScroll = () => {
      if (!componentRef.current) return;

      const componentRect = componentRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const componentTop = componentRect.top;
      const componentHeight = componentRect.height;
      
      // complete animation 40% from top of viewport
      const animationEndPoint = windowHeight * 0.4;
      
      const animationStart = windowHeight;
      const animationEnd = animationEndPoint - componentHeight;
      const animationRange = animationStart - animationEnd;
      
      const scrollProgress = Math.max(0, Math.min(1, 
        (animationStart - componentTop) / animationRange
      ));
      
      const startPosition = parralaxStartPosition;
      const endPosition = 2.4;
      const currentPosition = startPosition - (startPosition - endPosition) * scrollProgress;
      
      setBottomPosition(currentPosition);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isInView, isDesktop]);

  return (
    <div
      ref={componentRef}
      className={`component image-parallax-text-block ${componentBackgroundColour}`}
      {...aosAttributes}
    >
      <div className="component-content">
        <Container>
          <Row>
            <div className="parallax-image">
              <div className="content-wrapper">
                <div className="content-image">
                  {mainImage ? <GPImage item={propsFieldData} params={props?.params} /> : null}
                </div>
                <div 
                  ref={contentSectionRef}
                  className={`content-section rich-text ${cardbackgroundColor}`}
                  style={isDesktop ? {
                    bottom: `${bottomPosition}rem`,
                  } : {}}
                >
                  {title && (
                    <Heading
                      level={headingSize}
                      className={`title ${titleClass}`}
                      field={title}
                      richText
                    />
                  )}
                  {details && (
                    <RichText className={`details ${descriptionClass}`} field={details} />
                  )}
                  <div className="cta-container">
                    {propsFieldData?.ctaLink?.jsonValue?.value?.href && (
                      <Ctas {...propsFieldData} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Row>
        </Container>
      </div>
    </div>
  );
};
