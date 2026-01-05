import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  RichTextField,
  Text,
  RichText,
  Link,
  LinkField,
  useSitecore,
  Placeholder,
} from '@sitecore-content-sdk/nextjs';
import { NextImage } from 'src/lib/image-components';
import { ParallaxBackgroundImage } from 'components/NonSitecore/ParallaxBackgroundImage';
import useVisibility from 'src/hooks/useVisibility';
import { ComponentProps } from 'lib/component-props';
import { DottedAccent } from 'components/NonSitecore/DottedAccent';

interface Fields {
  Eyebrow: Field<string>;
  Title: Field<string>;
  Subtitle: Field<string>;
  Text: RichTextField;
  Image: ImageField;
  Video: ImageField;
  LayeredImage?: ImageField;
  LayeredVideo?: ImageField;
  Link: LinkField;
  Link2: LinkField;
}

export type PromoCtaProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

const ArrowCircle = (): JSX.Element => {
  return (
    <span className="promo-cta-link__icon" aria-hidden="true">
      <span className="promo-cta-link__icon-inner">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
        >
          <path
            d="M4 10H14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 6L14 10L10 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
};

const hasLinkText = (link?: LinkField): boolean => {
  if (!link?.value) return false;
  
  const text = link.value.text;
  // If no text at all, return false
  if (typeof text !== 'string' || text.trim().length === 0) return false;
  
  // Sitecore displays "[No text in field]" as placeholder when field is empty
  const trimmedText = text.trim();
  const normalizedText = trimmedText.toLowerCase();
  
  // Reject if text matches Sitecore's placeholder "[No text in field]" (case-insensitive)
  // Check for exact match and any text starting with "[no text in"
  const isPlaceholder = 
    normalizedText === '[no text in field]' ||
    normalizedText.startsWith('[no text in') ||
    (trimmedText.startsWith('[') && trimmedText.includes('No text') && trimmedText.includes('field')) ||
    (trimmedText.startsWith('[') && normalizedText.includes('no text'));
  
  if (isPlaceholder) {
    return false;
  }
  
  return true;
};

const getLinkText = (link?: LinkField): string => {
  const text = link?.value?.text;
  if (typeof text === 'string' && text.trim().length > 0) return text;
  return 'Explore our payment solutions';
};

const MediaContent = ({
  video,
  image,
  className,
  isPageEditing,
  width = 900,
  height = 900,
}: {
  video?: ImageField;
  image?: ImageField;
  className?: string;
  isPageEditing: boolean;
  width?: number;
  height?: number;
}): JSX.Element => {
  const videoSrc = video?.value?.src;
  const hasVideo = videoSrc && !isPageEditing;
  
  if (hasVideo) {
    // Determine video type from file extension
    const videoType = videoSrc.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';
    
    return (
      <video
        className={className}
        autoPlay
        loop
        muted
        playsInline
        poster={image?.value?.src}
      >
        <source src={videoSrc} type={videoType} />
      </video>
    );
  }
  
  return (
    <NextImage
      field={image}
      className={className}
      width={width}
      height={height}
    />
  );
};

export const Default = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [isVisible, domRef] = useVisibility();
  const sxaStyles = `${props.params?.styles || ''}`;
  
  // Check if component has any content - if not, don't render (prevents empty/stuck components)
  const hasContent = 
    props.fields?.Title?.value ||
    props.fields?.Subtitle?.value ||
    props.fields?.Text?.value ||
    props.fields?.Image?.value?.src ||
    props.fields?.Video?.value?.src ||
    props.fields?.LayeredImage?.value?.src ||
    props.fields?.LayeredVideo?.value?.src ||
    props.fields?.Link?.value?.href ||
    props.fields?.Link2?.value?.href ||
    props.fields?.Eyebrow?.value;
  
  // Don't render if no content and not in editing mode
  if (!hasContent && !isPageEditing) {
    return <></>;
  }
  
  // Check styling options:
  // - "reverse" = Image Left (image on left, text on right) - SCSS uses flexbox row-reverse
  // - "image-right" or no special class = Image Right (text on left, image on right) - side-by-side
  // - "default" = Stacked layout (text on top, image below)
  const hasReverse = sxaStyles.includes('reverse');
  const hasImageRight = sxaStyles.includes('image-right') && !hasReverse;
  const hasDefault = sxaStyles.includes('default') && !hasReverse && !hasImageRight;
  
  // Side-by-side layout when reverse (Image Left) or image-right is applied, but not default
  const isSideBySide = (hasReverse || hasImageRight) && !hasDefault;

  // Determine column classes based on layout
  // For reverse (Image Left): SCSS reverses the flex direction, so use standard column sizes
  // For Image Right: standard side-by-side layout
  // For default: stacked layout (both full width)
  const textColClass = isSideBySide 
    ? 'col-lg-5'
    : 'col-12';
  const imageColClass = isSideBySide
    ? 'col-md-10 mx-auto col-lg-7 mx-lg-0'
    : 'col-12';

  return (
    <div className={`component promo-cta ${sxaStyles}`} id={id ? id : undefined} ref={domRef}>
      <div className="container">
        <div className={`row row-gap-4 main-content ${isSideBySide ? 'align-items-center' : ''}`}>
          <div className={`${textColClass} text-center text-lg-start`}>
            <h6 className="eyebrow-accent mb-4">
              <Text field={props.fields.Eyebrow} />
            </h6>
            <h1 className="display-lg mb-2">
              <Text field={props.fields.Title} />
            </h1>
            <div className="promo-cta-text">
              <p className="body-md mb-3">
                <Text field={props.fields.Subtitle} />
              </p>

              <RichText field={props.fields.Text} className="text-content body-md mb-5" />

              <div className="row mb-4">
                <Placeholder name="promo-cta" rendering={props.rendering} />
              </div>

              {(isPageEditing || (props.fields?.Link?.value?.href && hasLinkText(props.fields?.Link))) && (
                <Link field={props.fields.Link} className="promo-cta-link me-4">
                  <span className="promo-cta-link__text">{getLinkText(props.fields?.Link)}</span>
                  <ArrowCircle />
                </Link>
              )}
              {(isPageEditing || (props.fields?.Link2?.value?.href && hasLinkText(props.fields?.Link2))) && (
                <Link field={props.fields.Link2} className="promo-cta-link-text-only">
                  {getLinkText(props.fields?.Link2)}
                </Link>
              )}
            </div>
          </div>
          <div className={imageColClass}>
            <div className="image-wrapper">
              <DottedAccent className="dotted-accent-top" />
              <div className="promo-cta-media-container">
                <MediaContent
                  video={props.fields.Video}
                  image={props.fields.Image}
                  className={`d-block ${isSideBySide ? 'mx-lg-auto' : 'mx-auto'} img-fluid ${
                    !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
                  }`}
                  isPageEditing={isPageEditing}
                  width={900}
                  height={900}
                />
                {(props.fields?.LayeredImage?.value?.src || props.fields?.LayeredVideo?.value?.src) && (
                  <MediaContent
                    video={props.fields.LayeredVideo}
                    image={props.fields.LayeredImage}
                    className="promo-cta-layered-media"
                    isPageEditing={isPageEditing}
                    width={900}
                    height={900}
                  />
                )}
              </div>
              <DottedAccent className="dotted-accent-bottom" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Horizontal = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [isVisible, domRef] = useVisibility();
  const sxaStyles = `${props.params?.styles || ''}`;
  
  // Check if component has any content - if not, don't render (prevents empty/stuck components)
  const hasContent = 
    props.fields?.Title?.value ||
    props.fields?.Subtitle?.value ||
    props.fields?.Text?.value ||
    props.fields?.Image?.value?.src ||
    props.fields?.Video?.value?.src ||
    props.fields?.LayeredImage?.value?.src ||
    props.fields?.LayeredVideo?.value?.src ||
    props.fields?.Link?.value?.href ||
    props.fields?.Link2?.value?.href ||
    props.fields?.Eyebrow?.value;
  
  // Don't render if no content and not in editing mode
  if (!hasContent && !isPageEditing) {
    return <></>;
  }
  
  // Horizontal variant is always side-by-side, styling options control image position via SCSS:
  // - "reverse" = Image Left (image on left, text on right) - SCSS uses flexbox row-reverse
  // - "image-right" or no special class = Image Right (text on left, image on right) - default side-by-side
  // The sxaStyles already contains the styling classes, so SCSS will handle the layout

  // Determine column classes based on layout
  // For reverse (Image Left): SCSS reverses the flex direction, so use standard column sizes
  // For Image Right or default: standard side-by-side layout (text left, image right)
  const textColClass = 'col-lg-5';
  const imageColClass = 'col-md-10 mx-auto col-lg-7 mx-lg-0';

  return (
    <div className={`component promo-cta ${sxaStyles}`} id={id ? id : undefined} ref={domRef}>
      <div className="container">
        <div className="row row-gap-4 main-content align-items-center">
          <div className={`${textColClass} text-center text-lg-start`}>
            <h6 className="eyebrow-accent mb-4">
              <Text field={props.fields.Eyebrow} />
            </h6>
            <h1 className="display-lg mb-2">
              <Text field={props.fields.Title} />
            </h1>
            <div className="promo-cta-text">
              <p className="body-md mb-3">
                <Text field={props.fields.Subtitle} />
              </p>

              <RichText field={props.fields.Text} className="text-content body-md mb-5" />

              <div className="row mb-4">
                <Placeholder name="promo-cta" rendering={props.rendering} />
              </div>

              {(isPageEditing || (props.fields?.Link?.value?.href && hasLinkText(props.fields?.Link))) && (
                <Link field={props.fields.Link} className="promo-cta-link me-4">
                  <span className="promo-cta-link__text">{getLinkText(props.fields?.Link)}</span>
                  <ArrowCircle />
                </Link>
              )}
              {(isPageEditing || (props.fields?.Link2?.value?.href && hasLinkText(props.fields?.Link2))) && (
                <Link field={props.fields.Link2} className="promo-cta-link-text-only">
                  {getLinkText(props.fields?.Link2)}
                </Link>
              )}
            </div>
          </div>
          <div className={imageColClass}>
            <div className="image-wrapper">
              <DottedAccent className="dotted-accent-top" />
              <div className="promo-cta-media-container">
                <MediaContent
                  video={props.fields.Video}
                  image={props.fields.Image}
                  className={`d-block mx-lg-auto img-fluid ${
                    !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
                  }`}
                  isPageEditing={isPageEditing}
                  width={900}
                  height={900}
                />
                {(props.fields?.LayeredImage?.value?.src || props.fields?.LayeredVideo?.value?.src) && (
                  <MediaContent
                    video={props.fields.LayeredVideo}
                    image={props.fields.LayeredImage}
                    className="promo-cta-layered-media"
                    isPageEditing={isPageEditing}
                    width={900}
                    height={900}
                  />
                )}
              </div>
              <DottedAccent className="dotted-accent-bottom" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WithPlaceholderColumn = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [isVisible, domRef] = useVisibility();
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component promo-cta with-placeholder-column ${sxaStyles}`}
      id={id ? id : undefined}
      ref={domRef}
    >
      <div className="container">
        <div className="row row-gap-4 main-content align-items-center">
          <div className="col-lg-5 text-center text-lg-start">
            <h6 className="eyebrow-accent">
              <Text field={props.fields.Eyebrow} />
            </h6>
            <h1 className="display-md mb-3">
              <Text field={props.fields.Title} />
            </h1>
            <div className="promo-cta-text">
              <p className="body-md">
                <Text field={props.fields.Subtitle} />
              </p>

              <RichText field={props.fields.Text} className="text-content body-md" />

              {(isPageEditing || (props.fields?.Link?.value?.href && hasLinkText(props.fields?.Link))) && (
                <Link field={props.fields.Link} className="promo-cta-link mt-3">
                  <span className="promo-cta-link__text">{getLinkText(props.fields?.Link)}</span>
                  <ArrowCircle />
                </Link>
              )}
              {(isPageEditing || (props.fields?.Link2?.value?.href && hasLinkText(props.fields?.Link2))) && (
                <Link field={props.fields.Link2} className="promo-cta-link-text-only mt-3 mx-4">
                  {getLinkText(props.fields?.Link2)}
                </Link>
              )}
            </div>
          </div>

          <div className="col-md-12 mx-auto col-lg-7 mx-lg-0">
            <div className="row align-items-center">
              <div className="promo-cta-placeholder col-12 col-md-9">
                <div className="promo-cta-placeholder-inner">
                  <div className="row">
                    <Placeholder name="promo-cta" rendering={props.rendering} />
                  </div>
                </div>
              </div>

              <div className="image-wrapper d-none d-md-block col-md-8">
                <DottedAccent className="dotted-accent-top" />
                <MediaContent
                  video={props.fields.Video}
                  image={props.fields.Image}
                  className={`d-block mx-lg-auto img-fluid ${
                    !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
                  }`}
                  isPageEditing={isPageEditing}
                  width={900}
                  height={900}
                />
                <DottedAccent className="dotted-accent-bottom" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WithBackgroundImage = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component promo-cta with-background-image ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <ParallaxBackgroundImage BackgroundImage={props.fields.Image} />
      <div className="container">
        <div className="row justify-content-center main-content">
          <div className="col-12 mx-auto">
            <h1 className="display-xl text-center mb-3">
              <Text field={props.fields.Title} />
            </h1>
            <div className="body-md text-center">
              <RichText field={props.fields.Text} />

              {(isPageEditing || (props.fields?.Link?.value?.href && hasLinkText(props.fields?.Link))) && (
                <Link field={props.fields.Link} className="promo-cta-link mt-3">
                  <span className="promo-cta-link__text">{getLinkText(props.fields?.Link)}</span>
                  <ArrowCircle />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

