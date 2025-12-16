import { RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { Params, Fields } from './QuoteImage.types';
import ImageItem from '@/components/ui/Image/ImageItem';
import { Container, Row } from 'react-bootstrap';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import GPMedia from '@/components/ui/GPMedia/GPMedia';

type QuoteProps = {
  params: Params;
  fields: Fields;
};

export const Default = (props: QuoteProps): JSX.Element => {
  const { fields, params } = props || {};
  const {
    backgroundColorVariant = '{}',
    quoteMarksColorVariant = '{}',
    Styles = '',
  } = params || {};

  const componentBackgroundColour = JSON.parse(backgroundColorVariant)?.Value?.value
    ? `bg-${JSON.parse(backgroundColorVariant)?.Value?.value}`
    : '';
  const quoteMarksColorVariantClass = JSON.parse(quoteMarksColorVariant)?.Value?.value
    ? `quote-color-${JSON.parse(quoteMarksColorVariant)?.Value?.value}`
    : '';

  const items = fields?.data?.item || {};
  const quote = items?.quote?.jsonValue || null;
  const quoteAuthor = items?.quoteAuthor?.jsonValue || null;
  const quoteAuthorTag = items?.quoteAuthorTag?.jsonValue || null;
  const quoteLogo = items?.quoteLogo || null;
  const aosAttributes = getAosAttributes(props);

  return (
    <div
      className={`component quote-image ${componentBackgroundColour} ${quoteMarksColorVariantClass} ${Styles} `}
      {...aosAttributes}
    >
      <div className="component-content">
        <Container>
          <Row>
            <div className="copy-section">
              <span className="icon"></span>
              <div className="quote-wrapper">
                {quote && <RichText tag="blockquote" className="quote" field={quote} />}
              </div>
              <div className="author-wrapper">
                {quoteAuthor && <RichText tag="p" className="author" field={quoteAuthor} />}
                {quoteAuthorTag && (
                  <RichText tag="p" className="author-tag" field={quoteAuthorTag} />
                )}
              </div>
              {quoteLogo && (
                <div className="logo">
                  <ImageItem
                    className="bg-img"
                    field={quoteLogo?.jsonValue || undefined}
                    nextImageSrc={quoteLogo?.src || undefined}
                  />
                </div>
              )}
            </div>

            <div className="media-section">
              <GPMedia item={items} params={props?.params} />
            </div>
          </Row>
        </Container>
      </div>
    </div>
  );
};
