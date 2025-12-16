import { TestimonialBlockProps } from './TestimonialBlock.types';
import { TestimonialRenderer } from './TestimonialRenderer';

export const TestimonialBlock = (props: TestimonialBlockProps): JSX.Element | null => {
  const { fields, params } = props;

  const testimonialText = fields?.Testimonial?.value;
  const authorName = fields?.Author?.value;
  const authorPosition = fields?.['Author Position']?.value;
  const authorCompany = fields?.['Author Company']?.value;
  const showSocialMediaLink = fields?.['Add Social Media Link']?.value === true;
  const companyLogo = fields?.['Company Logo'];
  const hasCompanyLogo = companyLogo?.value?.src;

  return (
    <div
      className={`uptick-content-block uptick-testimonial-block ${params?.styles || ''} ${
        hasCompanyLogo ? 'with-company-logo' : ''
      }`}
    >
      <TestimonialRenderer
        testimonialText={testimonialText}
        authorName={authorName}
        authorPosition={authorPosition}
        authorCompany={authorCompany}
        showSocialMediaLink={showSocialMediaLink}
        companyLogo={companyLogo}
      />
    </div>
  );
};
