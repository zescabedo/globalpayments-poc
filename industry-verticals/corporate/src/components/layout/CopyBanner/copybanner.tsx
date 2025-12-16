import { RichText, ComponentParams } from '@sitecore-jss/sitecore-jss-nextjs';
import { CopyBannerFields } from '@/components/layout/CopyBanner/copybanner.types';
import { Container } from 'react-bootstrap';
import { copyBannerConstants } from '@/constants/appConstants';
import Heading, { HeadingElementProps } from '@/components/ui/Heading/Heading';
import Ctas from '@/components/ui/CTA/CTA';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { getPaddingValue } from '@/utils/Paddingutils';
import { useShouldRender } from '@/utils/useShouldRender';
import { Brow } from '@/components/ui/Brow/Brow';

interface CopyBannerProps {
  params: ComponentParams;
  fields: CopyBannerFields;
}

export const Default = (props: CopyBannerProps): JSX.Element => {
  const shouldRender = useShouldRender();
  const { params, fields } = props;

  const { defaulttitleHeadingLevel } = copyBannerConstants;

  const backgroundColorVariant =
    (params?.backgroundColorVariant && JSON.parse(params?.backgroundColorVariant)?.Value?.value) ||
    '';
  const backgroundColorClass = backgroundColorVariant ? `bg-${backgroundColorVariant}` : '';

  const { paddingBottom, paddingTop } = getPaddingValue(params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;

  const headingLevel =
    (params?.titleHeadingLevel && JSON.parse(params?.titleHeadingLevel)?.Value?.value) ||
    defaulttitleHeadingLevel;

  const { titleClass, descriptionClass } =
    getFontSizeClasses(props?.params) || {};


  const titleField = fields?.data?.item?.title?.jsonValue;
  const tagField = fields?.data?.item?.tag?.jsonValue;
  const eyebrow = fields?.data?.item?.eyebrow?.jsonValue;
  const details = fields?.data?.item?.details?.jsonValue;
  const legalText = fields?.data?.item?.legalText?.jsonValue;
  const propsFieldData = fields?.data?.item;
  const backgroundImage = propsFieldData?.backgroundImage;
  const backgroundMdImage = propsFieldData?.backgroundImage;
  const backgroundSmImage = propsFieldData?.backgroundImage;
  const ctasParent = fields?.data?.item?.ctasParent;

  const focusValues = {
    mediaSize: fields?.data?.item?.mediaSize?.targetItem?.Value?.jsonValue?.value,
    xMobile: fields?.data?.item?.focusXMobile?.jsonValue?.value,
    yMobile: fields?.data?.item?.focusYMobile?.jsonValue?.value,
    xTablet: fields?.data?.item?.focusXTablet?.jsonValue?.value,
    yTablet: fields?.data?.item?.focusYTablet?.jsonValue?.value,
    xDesktop: fields?.data?.item?.focusXDesktop?.jsonValue?.value,
    yDesktop: fields?.data?.item?.focusYDesktop?.jsonValue?.value,
  };

  return (
    <div
      className={`component copy-banner ${backgroundColorClass} ${paddingTopClass} ${paddingBottomClass}`}
      style={
        {
          '--bg-image-desktop': `url(${backgroundImage?.src})`,
          '--bg-image-tablet': `url(${backgroundMdImage?.src || backgroundImage?.src})`,
          '--bg-image-mobile': `url(${
            backgroundSmImage?.src || backgroundMdImage?.src || backgroundImage?.src
          })`,
          '--mediaSize': focusValues.mediaSize ? focusValues.mediaSize : 'auto',
          '--focus-x-desktop': focusValues.xDesktop,
          '--focus-y-desktop': focusValues.yDesktop,
          '--focus-x-tablet': focusValues.yTablet,
          '--focus-y-tablet': focusValues.yTablet,
          '--focus-x-mobile': focusValues.xMobile,
          '--focus-y-mobile': focusValues.yMobile,
        } as React.CSSProperties
      }
    >
      <div className="component-content">
        <Container>
          <div>
            <Container>
              <div className="row">
                <div className="copy-section">
                  {shouldRender(titleField) && (
                    <Heading
                      level={headingLevel as HeadingElementProps['level']}
                      className={`title ${titleClass}`}
                      field={titleField}
                      richText
                    />
                  )}
                  {shouldRender(eyebrow) && <Brow field={eyebrow} tag="p" richText />}
                  {shouldRender(tagField) && <RichText className="tag" tag="p" field={tagField} />}
                  {shouldRender(details) && (
                    <RichText className={`details ${descriptionClass}`} field={details} />
                  )}
                  {shouldRender(legalText) && <RichText className="legal" field={legalText} />}
                  {ctasParent && (
                    <div className="btn-wrap">
                      <Ctas {...propsFieldData} />
                    </div>
                  )}
                  {shouldRender(propsFieldData?.trustpilotSnippetCode?.jsonValue?.fields?.TrustpilotCode?.value) && (
                    <div className="trustpilot-container">
                      <RichText field={propsFieldData?.trustpilotSnippetCode?.jsonValue?.fields?.TrustpilotCode} />
                    </div>
                  )}
                </div>
              </div>
            </Container>
          </div>
        </Container>
      </div>
    </div>
  );
};
