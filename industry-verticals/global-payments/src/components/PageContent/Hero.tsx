import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  RichTextField,
  Text,
  RichText,
  useSitecore,
  Link,
  LinkField,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import { ScrollRevealText } from 'src/components/NonSitecore/ScrollRevealText';

interface Fields {
  // Content fields
  Tag?: Field<string>; // Tag Line
  Title: Field<string>;
  Details?: RichTextField; // Details Text
  Text?: RichTextField; // Fallback for existing content
  
  // Media fields
  BackgroundImage?: ImageField; // Background Desktop Image (fallback)
  BackgroundDesktopImage?: ImageField;
  BackgroundTabletImage?: ImageField;
  BackgroundMobileImage?: ImageField;
  Image?: ImageField; // Main Image (fallback)
  MainImage?: ImageField;
  
  // Video fields
  VideoURL?: LinkField;
  VideoType?: Field<string>;
  VidyardId?: Field<string>;
  ShowVideoInModal?: Field<boolean>;
  VideoPlayButtonText?: Field<string>;
  VideoPauseButtonText?: Field<string>;
  
  // CTA fields
  Link?: LinkField; // Fallback
  CtaTitle?: Field<string>;
  CtaLink?: LinkField;
  CtaStyle?: Field<string>;
}

export type HeroProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: HeroProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  
  // Parse params for styling options (matching Storybook parameter names)
  const heroBackground = props.params?.HeroBackground || props.params?.heroBackground;
  const titleHeadingLevel = props.params?.TitleHeadingLevel || props.params?.titleHeadingLevel || '1';
  const imageSquareCorners = props.params?.ImageSquareCorners === '1' || props.params?.imageSquareCorners === '1';
  const animationEnabled = props.params?.AnimationEnabled === 'true' || props.params?.animationEnabled === 'true';
  const animationType = props.params?.AnimationType || props.params?.animationType || 'fade-up';
  const animationEasing = props.params?.AnimationEasing || props.params?.animationEasing || '';
  const animationDuration = props.params?.AnimationDuration || props.params?.animationDuration || '';
  const mediaSize = props.params?.MediaSize || props.params?.mediaSize || 'auto';

  // Safe field access with fallbacks
  const tag = props.fields?.Tag;
  const title = props.fields?.Title;
  const details = props.fields?.Details || props.fields?.Text;
  
  // Background images - responsive support
  const backgroundDesktop = props.fields?.BackgroundDesktopImage || props.fields?.BackgroundImage;
  const backgroundTablet = props.fields?.BackgroundTabletImage;
  const backgroundMobile = props.fields?.BackgroundMobileImage;
  
  // Main image
  const mainImage = props.fields?.MainImage || props.fields?.Image;
  
  // CTA
  const ctaLink = props.fields?.CtaLink || props.fields?.Link;
  const ctaTitle = props.fields?.CtaTitle;
  const ctaStyle = props.fields?.CtaStyle;
  
  // Video
  const videoURL = props.fields?.VideoURL;
  const videoType = props.fields?.VideoType?.value;
  const vidyardId = props.fields?.VidyardId?.value;

  // Determine heading tag - default to h1
  const headingLevel = titleHeadingLevel || '1';
  const HeadingTag = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  // Default background image (transparent logo on white background)
  const defaultBackgroundImage = '/hero-background.png';

  // Build background image CSS variables for circle-pattern
  // Always set default background, then override if field values are provided
  const backgroundStyle: React.CSSProperties & {
    '--bg-image-desktop'?: string;
    '--bg-image-tablet'?: string;
    '--bg-image-mobile'?: string;
    '--mediaSize'?: string;
  } = {
    '--bg-image-desktop': `url(${defaultBackgroundImage})`,
    '--bg-image-tablet': `url(${defaultBackgroundImage})`,
    '--bg-image-mobile': `url(${defaultBackgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100%',
  };
  
  // Override with field values if provided
  if (backgroundDesktop?.value?.src) {
    backgroundStyle['--bg-image-desktop'] = `url(${backgroundDesktop.value.src})`;
  }
  if (backgroundTablet?.value?.src) {
    backgroundStyle['--bg-image-tablet'] = `url(${backgroundTablet.value.src})`;
  }
  if (backgroundMobile?.value?.src) {
    backgroundStyle['--bg-image-mobile'] = `url(${backgroundMobile.value.src})`;
  }
  
  if (mediaSize) {
    backgroundStyle['--mediaSize'] = mediaSize;
  }

  // Determine background class based on heroBackground param
  const bgClass = heroBackground ? `featured-bg-${heroBackground}` : 'bg-white';
  // Note: featured-hero-video class appears to always be present in Storybook
  const videoClass = 'featured-hero-video';
  
  // AOS animation attributes
  const aosAttributes: React.HTMLAttributes<HTMLDivElement> & {
    'data-aos'?: string;
    'data-aos-duration'?: string;
    'data-aos-easing'?: string;
    'data-aos-offset'?: string;
    'data-aos-once'?: string;
  } = {};
  if (animationEnabled) {
    aosAttributes['data-aos'] = animationType || 'fade-up';
    aosAttributes['data-aos-duration'] = animationDuration || '';
    aosAttributes['data-aos-easing'] = animationEasing || '';
    aosAttributes['data-aos-offset'] = '120';
    aosAttributes['data-aos-once'] = 'true';
  }

  // Map CTA style to Global Payments button classes
  const getCtaClassName = (style?: string) => {
    if (!style) return 'btn btn-cta-primary';
    const styleMap: { [key: string]: string } = {
      'primary': 'btn btn-cta-primary',
      'secondary': 'btn btn-cta-secondary',
      'tertiary': 'btn btn-cta-tertiary',
      'btn-cta-primary': 'btn btn-cta-primary',
      'btn-cta-secondary': 'btn btn-cta-secondary',
      'btn-cta-tertiary': 'btn btn-cta-tertiary',
      'btn-cta-googleplay': 'btn btn-cta-googleplay',
      'btn-cta-appstore': 'btn btn-cta-appstore',
      'Link-glow-base': 'Link-glow-base',
      'link-glow-bright': 'link-glow-bright',
      'link': 'link',
    };
    return styleMap[style] || 'btn btn-cta-primary';
  };

  // Build component classes matching Storybook structure
  const componentClasses = [
    'component',
    videoClass,
    bgClass,
    sxaStyles,
    imageSquareCorners ? 'square-corners' : '',
    animationEnabled ? 'aos-init aos-animate' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div 
      className={componentClasses}
      id={id ? id : undefined}
      {...aosAttributes}
    >
      <div className="circle-pattern" style={backgroundStyle}>
        <div className="container">
          {/* Text Content Row */}
          <div className="row">
            <div className="hero-text-block">
              {/* Title */}
              {(title?.value || isPageEditing) && title && (
                <Text field={title} tag={HeadingTag} className="hero-heading" />
              )}
              
              {/* Tag Line */}
              {(tag?.value || isPageEditing) && tag && (
                <Text field={tag} tag="p" className="hero-body" />
              )}
              
              {/* Details/Description */}
              {(details?.value || isPageEditing) && details && (
                <div className="body-md">
                  <RichText field={details} />
                </div>
              )}
              
              {/* CTA */}
              {(isPageEditing || ctaLink?.value?.href) && ctaLink && (
                <div className="cta-list all">
                  <Link 
                    field={ctaLink} 
                    className={getCtaClassName(ctaStyle?.value)}
                  >
                    <span className="link-inner">
                      {ctaTitle?.value || ctaLink.value?.text || 'Learn More'}
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Media Row */}
          {(mainImage?.value?.src || videoURL?.value?.href) && (
            <div className="row">
              <div className={`hero-media-block ${imageSquareCorners ? 'square-corners' : ''}`}>
                <div className="hero-media">
                  {mainImage?.value?.src && (
                    <picture>
                      <NextImage
                        field={mainImage}
                        className="gp-img hero-image"
                        width={700}
                        height={700}
                        alt={typeof mainImage.value?.alt === 'string' ? mainImage.value.alt : 'Hero image'}
                      />
                    </picture>
                  )}
                  
                  {/* Video support */}
                  {videoURL?.value?.href && (
                    <div className="hero-video">
                      {videoType === 'youtube' && (
                        <iframe
                          src={videoURL.value.href}
                          className="hero-video-iframe"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                      {videoType === 'vidyard' && vidyardId && (
                        <div className="hero-vidyard" data-uuid={vidyardId} />
                      )}
                      {videoType === 'mp4' && (
                        <video className="hero-video-element" controls>
                          <source src={videoURL.value.href} type="video/mp4" />
                        </video>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="full-bleed-container"></div>
      </div>
    </div>
  );
};

export const LargeScrollingAnimation = (props: HeroProps): JSX.Element => {
  const id = props.params.RenderingIdentifier || 'AnimateHero2';
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  
  const title = props.fields?.Title;
  const titleText = title?.value ? String(title.value) : '';

  return (
    <div className={`component hero large-scrolling-animation bg-white ${sxaStyles}`} id={id}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="hero-text-block">
              {isPageEditing ? (
                <Text field={title} tag="h1" className="hero-heading" />
              ) : (
                <h1 className="hero-heading">
                  <ScrollRevealText
                    startColor="#D3D3D3"
                    endColor="#2729FF"
                    direction="left-to-right"
                    startThreshold={0.9}
                    endThreshold={0.5}
                    once={false}
                    smoothing={0}
                  >
                    {titleText}
                  </ScrollRevealText>
                </h1>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};