import { TwoColumnQuoteBlockProps } from './TwoColumnQuoteBlock.types';
import { RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { TestimonialRenderer } from './TestimonialRenderer';

export const TwoColumnQuoteBlock = (props: TwoColumnQuoteBlockProps): JSX.Element | null => {
  const { fields, params } = props;
  const text = fields?.Text;
  const textValue = text?.value;

  const testimonialText = fields?.Testimonial?.value;
  const authorName = fields?.Author?.value;
  const authorPosition = fields?.['Author Position']?.value;
  const authorCompany = fields?.['Author Company']?.value;
  const showSocialMediaLink = fields?.['Add Social Media Link']?.value === true;

  const displayType = fields?.['Display Type']?.fields?.Value?.value;
  const isQuoteRightColumn = displayType === 'RightSideTestimonial';

  return (
    <div
      className={`uptick-content-block two-column-quote-block ${
        isQuoteRightColumn ? 'quote-right' : ''
      } ${!textValue ? 'without-text' : ''}  ${params?.styles || ''}`}
    >
      <section className="quote-layout">
        <div className="quote-text-column">
          <JssRichText className="text" field={{ value: textValue }} />
        </div>
        <div className="quote-main-column">
          <div className="uptick-testimonial-block">
            <TestimonialRenderer
              testimonialText={testimonialText}
              authorName={authorName}
              authorPosition={authorPosition}
              authorCompany={authorCompany}
              showSocialMediaLink={showSocialMediaLink}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
