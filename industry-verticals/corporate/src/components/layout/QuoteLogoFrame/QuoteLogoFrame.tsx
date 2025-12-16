import { RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { Container, Row } from 'react-bootstrap';
import ImageItem from '@/components/ui/Image/ImageItem';
import { QuoteLogoFrameCardProps } from './QuoteLogoFrame.types';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getBodyTextFontSize } from '@/utils/fontSizeUtils';

const QuoteLogoFrameCard = (props: QuoteLogoFrameCardProps): JSX.Element | null => {
  const item = props?.fields?.data?.item || {};
  const backgroundColorVariant =
    (props?.params?.backgroundColorVariant &&
      'bg-' + JSON.parse(props?.params?.backgroundColorVariant)?.Value?.value) ||
    'bg-white';
  const foregroundColorVariant =
    (props?.params?.foregroundColorVariant &&
      'bg-' + JSON.parse(props?.params?.foregroundColorVariant)?.Value?.value) ||
    'bg-subtle';

  const quoteClass = getBodyTextFontSize('QuoteFontSize', props?.params);
  const quoteAuthorClass = getBodyTextFontSize('QuoteAuthorFontSize', props?.params);
  const quoteAuthorTagClass = getBodyTextFontSize('QuoteAuthorTagFontSize', props?.params);
  const aosAttributes = getAosAttributes(props);
  return (
    <div
      className={`component quote-logo-frame logo-frame ${backgroundColorVariant}`}
      {...aosAttributes}
    >
      <div className="component-content">
        <Container className={`${foregroundColorVariant}`}>
          <Row>
            <div className="copy-section">
              {item?.quoteLogo?.jsonValue?.value?.src && (
                <div className="logo">
                  <ImageItem
                    field={item?.quoteLogo?.jsonValue}
                    nextImageSrc={item?.quoteLogo?.src}
                  />
                </div>
              )}
              {item?.quote?.jsonValue?.value && (
                <div className={`quote-wrapper `}>
                  <JssRichText
                    className={`quote ${quoteClass}`}
                    field={item?.quote?.jsonValue}
                    tag="blockquote"
                  />
                </div>
              )}
              {(item?.quoteAuthor?.jsonValue?.value || item?.quoteAuthorTag?.jsonValue?.value) && (
                <div className="author-wrapper">
                  {item?.quoteAuthor?.jsonValue?.value && (
                    <JssRichText
                      className={`author ${quoteAuthorClass}`}
                      field={item?.quoteAuthor?.jsonValue}
                      tag="p"
                    />
                  )}
                  {item?.quoteAuthorTag?.jsonValue?.value && (
                    <JssRichText
                      className={`author-tag ${quoteAuthorTagClass}`}
                      field={item?.quoteAuthorTag?.jsonValue}
                      tag="p"
                    />
                  )}
                </div>
              )}
            </div>
          </Row>
        </Container>
      </div>
    </div>
  );
};
export default QuoteLogoFrameCard;
