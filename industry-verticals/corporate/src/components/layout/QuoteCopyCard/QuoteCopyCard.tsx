import { RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { Container, Row } from 'react-bootstrap';
import { QuoteCopyCardProps } from './QuoteCopyCard.types';
import ImageItem from '@/components/ui/Image/ImageItem';
import Ctas from '@/components/ui/CTA/CTA';
import Heading from '@/components/ui/Heading/Heading';
import { GPMedia } from '@/components/ui/GPMedia/GPMedia';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { quotecopycardConstants } from '@/constants/appConstants';

const QuoteCopyCard = (props: QuoteCopyCardProps): JSX.Element | null => {
  const rendering = props?.rendering || {};

  const propsFieldData = rendering?.fields?.data?.item || {};
  const item = rendering?.fields?.data?.item || {};
  const imageVariant = props?.params?.imageVariant || '';
  const backgroundColorVariant = props?.params?.backgroundColorVariant || '';

  const aosAttributes = getAosAttributes(props);
  const styles = props?.params?.Styles || '';
  const logoDeferLoading = Boolean(props?.params?.deferLoading);

  const bgColorVariant = backgroundColorVariant && JSON.parse(backgroundColorVariant)?.Value?.value;
  const bgColorClass = bgColorVariant ? `bg-${bgColorVariant}` : '';
  const foregroundColorVariant =
    (props?.params?.foreGroundColorVariant &&
      'bg-' + JSON.parse(props?.params?.foreGroundColorVariant)?.Value?.value) ||
    'bg-subtle';

  const ImageVariantType = imageVariant ? JSON.parse(imageVariant)?.Value?.value || '' : '';
  const { titleClass, tagClass } = getFontSizeClasses(props?.params) || {};

  const titleLevel =
    (props?.params?.titleHeadingLevel &&
      JSON.parse(props?.params?.titleHeadingLevel)?.Value?.value) ||
    quotecopycardConstants.defaulttitleHeadingLevel;

  return (
    <div
      className={`component quote-copy-card  offset-center-5x2x5 ${styles} ${bgColorClass} `}
      {...aosAttributes}
    >
      <div className="component-content">
        <Container>
          <Row>
            {item?.title?.jsonValue && (
              <div className={`copy-card-section ${foregroundColorVariant}`}>
                <Heading
                  richText
                  level={titleLevel}
                  className={`title ${titleClass}`}
                  field={item?.title?.jsonValue}
                />

                <RichText className={`tag ${tagClass}`} tag="p" field={item?.tag?.jsonValue} />
                <div className="cta-link">
                  <Ctas {...propsFieldData} />
                </div>
              </div>
            )}
            <div className={`quote-card-section ${foregroundColorVariant}`}>
              <div className={`media-section ${ImageVariantType}`}>
                <GPMedia item={item} params={props?.params} />
              </div>
              <div className="copy-section">
                <div className="logo">
                  {item?.quoteLogo?.jsonValue?.value && (
                    <ImageItem
                      className={''}
                      nextImageSrc={item?.quoteLogo?.src}
                      field={item?.quoteLogo?.jsonValue}
                      deferLoading={logoDeferLoading}
                    />
                  )}
                </div>
                {item?.quote?.jsonValue && (
                  <div className="quote-wrapper">
                    <RichText className={'quote'} tag="blockquote" field={item?.quote?.jsonValue} />
                  </div>
                )}
                {(item?.quoteAuthor?.jsonValue?.value ||
                  item?.quoteAuthorTag?.jsonValue?.value) && (
                  <div className="author-wrapper">
                    {item?.quoteAuthor?.jsonValue?.value && (
                      <RichText
                        className={'author-name'}
                        field={item?.quoteAuthor?.jsonValue}
                        tag="p"
                      />
                    )}
                    {item?.quoteAuthorTag?.jsonValue?.value && (
                      <RichText
                        className={'author-quote-tag'}
                        field={item?.quoteAuthorTag?.jsonValue}
                        tag="p"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default QuoteCopyCard;
