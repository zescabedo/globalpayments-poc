import React, { JSX } from 'react';
import { ImageField, Image, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ParallaxBanner } from 'react-scroll-parallax';

export type ParallaxImageProps = {
  BackgroundImage: ImageField;
};

export const ParallaxBackgroundImage = (props: ParallaxImageProps): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  // Don't render anything if there's no image value (even in editing mode to avoid placeholder)
  const hasImage = props.BackgroundImage?.value?.src;
  if (!hasImage) {
    return <></>;
  }

  return isPageEditing ? (
    <Image field={props.BackgroundImage} className="background-image"></Image>
  ) : (
    <ParallaxBanner
      layers={[
        {
          image: `${props.BackgroundImage?.value?.src || ''}`,
          speed: -15,
        },
      ]}
      className="parallax-background-image"
    />
  );
};
