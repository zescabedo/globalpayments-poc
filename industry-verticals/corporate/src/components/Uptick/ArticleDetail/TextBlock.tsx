import React from 'react';
import { RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { TextBlockProps } from './TextBlock.types';

export const TextBlock = ({ fields }: TextBlockProps): JSX.Element | null => {
  if (!fields?.Text) return null;

  const isHighlight = fields?.Highlight?.value === true;

  return (
    <div className={`uptick-content-block text-block ${isHighlight ? 'block-highlight' : ''}`}>
      <JssRichText field={fields.Text} />
    </div>
  );
};
