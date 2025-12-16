import { ImageField, RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import Link from 'next/link';
import { useI18n } from 'next-localization';
import ImageItem from '@/components/ui/Image/ImageItem';

type TestimonialRendererProps = {
  testimonialText?: string;
  authorName?: string;
  authorPosition?: string;
  authorCompany?: string;
  showSocialMediaLink?: boolean;
  companyLogo?: ImageField;
};

export const TestimonialRenderer = ({
  testimonialText,
  authorName,
  authorPosition,
  authorCompany,
  showSocialMediaLink = false,
  companyLogo,
}: TestimonialRendererProps): JSX.Element => {
  const { t } = useI18n();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const tweetIntentLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`;

  return (
    <>
      <div className="quote-content">
        <JssRichText className="quote-text" tag="blockquote" field={{ value: testimonialText }} />
        <div className="quote-cite">
          <div className="author-content">
            <span className="quote-author">{authorName}</span>
            <span className="author-position">
              {authorPosition}
              {authorCompany && authorPosition ? `, ${authorCompany}` : ''}
            </span>
          </div>
          {companyLogo?.value?.src && (
            <div className="company-logo">
              <ImageItem field={companyLogo} nextImageSrc={companyLogo?.value.src} />
            </div>
          )}
        </div>
      </div>
      {showSocialMediaLink && (
        <div className="social-share">
          <div className="share-link">
            <Link
              href={tweetIntentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="tweet-link"
            >
              <span className="tweet-text">{t('Click to tweet')}</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
