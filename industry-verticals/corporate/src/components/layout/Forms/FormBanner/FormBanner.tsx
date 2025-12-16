import { FormBannerProps } from './FormBanner.types';
import { Container, Row } from 'react-bootstrap';
import { RichText as JssRichText, Placeholder } from '@sitecore-jss/sitecore-jss-nextjs';
import Heading from '@/components/ui/Heading/Heading';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { formBannerConstants } from '@/constants/appConstants';

const FormBanner = (props: FormBannerProps): JSX.Element | null => {
  const propsFieldData = props?.fields?.data?.item || {};
  const { titleClass, tagClass, descriptionClass } = getFontSizeClasses(props?.params) || {};
  const backgroundColorVariant =
    (props?.params?.backgroundColorVariant &&
      'bg-' + JSON.parse(props?.params?.backgroundColorVariant)?.Value?.value) ||
    '';
  const { defaultTitleHeadingLevel } = formBannerConstants;
  const headingLevel =
    (props?.params?.titleHeadingLevel &&
      JSON.parse(props?.params?.titleHeadingLevel)?.Value?.value) ||
    defaultTitleHeadingLevel;

  return (
    <div className={`component form-banner ${backgroundColorVariant}`}>
      <div className="component-content">
        <Container>
          <Row>
            <div className="copy-section">
              {propsFieldData?.title?.jsonValue?.value && (
                <Heading
                  level={headingLevel}
                  className={`title ${titleClass}`}
                  field={propsFieldData?.title?.jsonValue}
                  richText
                />
              )}
            </div>
            <div className="ec-form-section">
              {propsFieldData?.tag?.jsonValue?.value && (
                <JssRichText
                  field={propsFieldData?.tag?.jsonValue}
                  className={`tag ${tagClass}`}
                  tag="p"
                />
              )}

              {propsFieldData?.details?.jsonValue?.value && (
                <JssRichText
                  field={propsFieldData?.details?.jsonValue}
                  className={`details ${descriptionClass}`}
                />
              )}
              <Row>
                <Placeholder name="headless-form" rendering={props.rendering} />
              </Row>
            </div>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default FormBanner;
