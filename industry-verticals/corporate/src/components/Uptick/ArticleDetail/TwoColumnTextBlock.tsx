import React from 'react';
import { RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { TwoColumnTextBlockProps } from './TwoColumnTextBlock.types';

export const TwoColumnTextBlock = (props: TwoColumnTextBlockProps): JSX.Element | null => {
  const { fields, params } = props;

  const leftColumnText = fields?.['Left Column Text']?.value;
  const rightColumnText = fields?.['Right Column Text']?.value;

  return (
    <div
      className={`uptick-content-block two-column-text-block ${params?.styles || ''}`}
      aria-label="Two Column Text Block"
    >
      <section className="columns">
        <div className="column left-column-text">
          {leftColumnText && <JssRichText field={{ value: leftColumnText }} />}
        </div>

        <div className="column right-column-text">
          {rightColumnText && <JssRichText field={{ value: rightColumnText }} />}
        </div>
      </section>
    </div>
  );
};
