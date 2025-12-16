import { Placeholder, RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { NewsletterProps, NewsletterLayoutProps, NewsletterLayoutType } from './Newsletter.types';
import { Container, Row } from 'react-bootstrap';
import ImageItem from '@/components/ui/Image/ImageItem';
import LinkItem from '@/components/ui/Link/Link';
import { useModal } from '@/components/ui/Modal/ModalProvider';
import { useShouldRender } from '@/utils/useShouldRender';

const NewsletterCTA = ({ data, props }: NewsletterLayoutProps) => {
  const shouldRender = useShouldRender();
  const ctaType = data?.cta?.targetItem?.ctaType?.value;
  const ctaInternalField = data?.cta?.targetItem?.internalLink?.jsonValue;
  const ctaInternalFieldHref = ctaInternalField?.value?.href || '';
  const ctaFormField = data?.cta?.targetItem?.ctaLink?.jsonValue;
  const ctaFormFieldHref = ctaFormField?.value?.href || '';
  const { openModal } = useModal();
  const ctaFormOpenInModal = data?.cta?.targetItem?.openInModal?.jsonValue?.value;
  const ctaFormModalTheme = data?.cta?.targetItem?.modalTheme?.targetItem?.value?.jsonValue?.value;

  if (!ctaType) return null;

  switch (ctaType) {
    case 'Internal Link':
      return shouldRender(ctaInternalFieldHref) ? (
        <div className="newsletter-cta">
          <LinkItem
            className="link-cta"
            field={ctaInternalField}
            value={{
              text: ctaInternalField?.value?.text,
              href: ctaInternalFieldHref,
            }}
          />
        </div>
      ) : null;

    case 'Form':
      return shouldRender(ctaFormFieldHref) ? (
        <div className="newsletter-cta">
          <LinkItem
            className="link-cta"
            field={ctaFormField}
            value={{
              text: ctaFormField?.value?.text,
              href: ctaFormFieldHref,
            }}
            onClick={() => openModal(ctaFormField?.value?.href as string, ctaFormModalTheme)}
            openInModal={ctaFormOpenInModal}
          />
        </div>
      ) : null;

    case 'Subscribe':
      return (
        <>
          <div className="subscribe-form">
            <Row>
              <Placeholder name="headless-form" rendering={props?.rendering} />
            </Row>
          </div>
        </>
      );

    default:
      return null;
  }
};

// Layout 1: Default / NewsletterWithText
const DefaultLayout = ({ data, layoutType, props, style }: NewsletterLayoutProps) => {
  const shouldRender = useShouldRender();
  return (
    <section className={`uptick-newsletter newsletter-default ${style}`}>
      <Container>
        <div className="wrapper-content">
          <div className="content">
            {shouldRender(data?.description?.jsonValue?.value) && (
              <RichText field={data?.description?.jsonValue} className="description" />
            )}
            <div className="cta-container">
              <NewsletterCTA data={data} layoutType={layoutType} props={props} />
              {shouldRender(data?.disclaimer?.jsonValue?.value) && (
                <div className="privacy">
                  <RichText
                    field={data?.disclaimer?.jsonValue}
                    tag="p"
                    className="disclaimer-text"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

// Layout 2: NewsLetterWithBanner
const NewsLetterWithBannerLayout = ({ data, layoutType, props, style }: NewsletterLayoutProps) => {
  const shouldRender = useShouldRender();

  return (
    <section className={`uptick-newsletter newsletter-with-banner ${style}`}>
      <div className="wrapper-content">
        <div className="image-container">
          {shouldRender(data?.image?.src) && (
            <ImageItem
              field={data?.image?.jsonValue}
              nextImageSrc={data?.image?.jsonValue?.value?.src}
            />
          )}
        </div>
        <div className="text-content">
          {shouldRender(data?.description?.jsonValue?.value) && (
            <RichText field={data?.description?.jsonValue} className="description" />
          )}
          <div className="cta-container">
            <NewsletterCTA data={data} layoutType={layoutType} props={props} />
          </div>
          {shouldRender(data?.disclaimer?.jsonValue?.value) && (
            <div className="privacy">
              <RichText field={data?.disclaimer?.jsonValue} tag="p" className="disclaimer-text" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Layout 3: NewsLetterBlock
const NewsLetterBlockLayout = ({
  data,
  layoutType,
  props,
  className,
  style,
}: NewsletterLayoutProps) => {
  const shouldRender = useShouldRender();
  return (
    <section className={`uptick-newsletter newsletter-block ${className} ${style}`}>
      <Container>
        <div className="block-container">
          <div className="block-content">
            <div className="block-text">
              {shouldRender(data?.description?.jsonValue?.value) && (
                <RichText field={data?.description?.jsonValue} className="description" />
              )}
            </div>
            <div className="block-cta">
              <NewsletterCTA data={data} layoutType={layoutType} props={props} />
            </div>
          </div>
          {shouldRender(data?.disclaimer?.jsonValue?.value) && (
            <div className="block-disclaimer">
              <RichText field={data?.disclaimer?.jsonValue} tag="p" className="disclaimer-text" />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

// Main component
const Newsletter = (props: NewsletterProps & { layoutType: NewsletterLayoutType }): JSX.Element => {
  const { rendering, layoutType, className, params } = props;
  const style = params?.Styles;
  const newsletterData = rendering?.fields?.data?.item;
  if (!newsletterData) {
    return <></>;
  }

  const layouts = {
    default: DefaultLayout,
    NewsLetterWithBanner: NewsLetterWithBannerLayout,
    NewsLetterBlock: NewsLetterBlockLayout,
  };

  const LayoutComponent = layouts[layoutType] || layouts.default;

  return (
    <LayoutComponent
      data={newsletterData}
      layoutType={layoutType}
      props={props}
      className={className}
      style={style}
    />
  );
};

// Sitecore
export const UptickNewsletterWithText = (props: NewsletterProps): JSX.Element => {
  const fieldNames = props.rendering?.params?.FieldNames;
  const layoutType: NewsletterLayoutType =
    fieldNames === 'NewsletterWithText' ? 'default' : 'default';
  return <Newsletter {...props} layoutType={layoutType} />;
};

export const UptickNewsletterWithBanner = (props: NewsletterProps): JSX.Element => (
  <Newsletter {...props} layoutType="NewsLetterWithBanner" />
);

export const UptickNewsletterBlock = (props: NewsletterProps): JSX.Element => (
  <Newsletter {...props} layoutType="NewsLetterBlock" />
);

export const UptickNewsletterBlockWithFullWidth = (props: NewsletterProps): JSX.Element => (
  <Newsletter {...props} layoutType="NewsLetterBlock" className="with-full-width" />
);

export default UptickNewsletterWithText;
