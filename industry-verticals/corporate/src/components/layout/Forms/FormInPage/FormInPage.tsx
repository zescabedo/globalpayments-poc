import { RichText as JssRichText, Placeholder } from '@sitecore-jss/sitecore-jss-nextjs';
import { Container, Row } from 'react-bootstrap';
import ImageItem from '@/components/ui/Image/ImageItem';
import { FormInPageProps } from './FormInPage.types';
import Heading from '@/components/ui/Heading/Heading';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { formInPageConstants } from '@/constants/appConstants';
import { useShouldRender } from '@/utils/useShouldRender';
import Ctas from '@/components/ui/CTA/CTA';

const FormInPage = (props: FormInPageProps): JSX.Element | null => {
  const shouldRender = useShouldRender();
  const propsFieldData = props?.fields?.data?.item || {};

  const isSplitPage = props?.params?.FieldNames == 'Split';
  const isWidePage = props?.params?.FieldNames == 'Wide';

  const { titleClass, descriptionClass } = getFontSizeClasses(props?.params) || {};
  const { defaultTitleHeadingLevel } = formInPageConstants;
  const headingLevel =
    (props?.params?.titleHeadingLevel &&
      JSON.parse(props?.params?.titleHeadingLevel)?.Value?.value) ||
    defaultTitleHeadingLevel;
  const formSectionBackground =
    (props?.params?.FormSectionBackground &&
      'bg-' + JSON.parse(props?.params?.FormSectionBackground)?.Value?.value) ||
    'bg-base';
  const backgroundColorVariant = isSplitPage ? 'bg-white' : formSectionBackground;
  const jsonValuelogoImage = propsFieldData?.logo?.jsonValue;
  const logoImage = jsonValuelogoImage?.value?.src;
  const title = propsFieldData?.title?.jsonValue;
  const tag = propsFieldData?.tag?.jsonValue;
  const logoText = propsFieldData?.logoText?.jsonValue;
  const formIntroDescription = propsFieldData?.formIntroDescription?.jsonValue;
  const description = propsFieldData?.details?.jsonValue;

  return (
    <div
      className={`component form-in-page ${props?.className} ${
        isWidePage ? backgroundColorVariant : ''
      }`}
    >
      <div className="component-content">
        <Container>
          <Row>
            <div className={`copy-section ${isSplitPage ? backgroundColorVariant : ''}`}>
              {logoImage && isSplitPage && (
                <div className="logo">
                  <ImageItem field={jsonValuelogoImage} nextImageSrc={logoImage} />
                </div>
              )}
              {shouldRender(title) && (
                <Heading
                  level={headingLevel}
                  className={`title ${titleClass}`}
                  field={title}
                  richText
                />
              )}
              {shouldRender(tag) && isWidePage && (
                <JssRichText field={tag} className={`tag`} tag="p" />
              )}

              {shouldRender(description) && (
                <JssRichText
                  field={description}
                  className={`details ${descriptionClass}`}
                />
              )}
              {propsFieldData?.ctaLink?.jsonValue?.value?.href && (
                <div className="cta-list">
                  <Ctas {...propsFieldData} />
                </div>
              )}
            </div>

            <div className={`ec-form-section ${isSplitPage ? formSectionBackground : ''}`}>
              <div className="ec-sc-form-wrapper initialized">
                {shouldRender(tag) && isSplitPage && (
                  <JssRichText field={tag} className={`h-5 split-title`} tag="h5" />
                )}
                {shouldRender(logoImage) && isSplitPage && (
                  <div className="split-logo bg-white">
                    {shouldRender(logoText) && (
                      <JssRichText field={logoText} tag="p" className="logo-text" />
                    )}
                    <ImageItem field={jsonValuelogoImage} nextImageSrc={logoImage} />
                  </div>
                )}
                {shouldRender(formIntroDescription) && isSplitPage && (
                  <JssRichText field={formIntroDescription} tag="p" className="form-intro" />
                )}
                <Row>
                  <Placeholder name="headless-form" rendering={props.rendering} />
                </Row>
              </div>
            </div>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default FormInPage;

export const Split = (props: FormInPageProps): JSX.Element => {
  return <FormInPage {...props} className={`split-page`} />;
};

export const Wide = (props: FormInPageProps): JSX.Element => {
  return <FormInPage {...props} className={`wide`} />;
};
