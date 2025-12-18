import { ImageField } from '@sitecore-content-sdk/nextjs';
import { NextImage } from 'src/lib/image-components';
import { JSX } from 'react';

export const IconAccent = ({
  image,
  inverted,
}: {
  image: ImageField;
  inverted?: boolean;
}): JSX.Element => {
  return (
    <div className={`icon-accent ${inverted ? 'inverted' : ''}`}>
      <NextImage field={image} width={32} height={32} />
    </div>
  );
};
