import { FeatureContentDataProps } from './FeatureContent.types';
import { RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { Container, Row } from 'react-bootstrap';
import Ctas from '@/components/ui/CTA/CTA';
import Heading from '@/components/ui/Heading/Heading';
import { Brow } from '@/components/ui/Brow/Brow';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
export const Default = (props: FeatureContentDataProps): JSX.Element => {
  const backgroundColorValue =
    props?.params?.backgroundColorVariant &&
    (JSON.parse(props?.params?.backgroundColorVariant)?.Value?.value ?? '');
  const backgroundColorVariant = backgroundColorValue ? `bg-${backgroundColorValue}` : '';
  const featureData = props?.fields?.data?.item ?? {};
  const aosAttributes = getAosAttributes(props);
  const { titleClass, tagClass, descriptionClass } = getFontSizeClasses(props?.params) || {};

  return (
    <div className="container-fluid">
      <Row>
        <div className={`component feature-content ${backgroundColorVariant}`} {...aosAttributes}>
          <div className="component-content">
            <Container>
              <Row>
                <div className="copy-section">
                  {featureData?.title?.jsonValue?.value && (
                    <Heading
                      richText
                      className={`title ${titleClass}`}
                      tag="h4"
                      field={featureData?.title?.jsonValue}
                    />
                  )}
                  {featureData?.brow?.jsonValue?.value && (
                    <Brow
                      richText
                      className="brow"
                      tag={`p`}
                      field={featureData?.brow?.jsonValue}
                    />
                  )}
                  {featureData?.tag?.jsonValue?.value && (
                    <JssRichText
                      className={`tag ${tagClass}`}
                      tag={`p`}
                      field={featureData?.tag?.jsonValue}
                    />
                  )}
                  {featureData?.details?.jsonValue?.value && (
                    <JssRichText
                      className={`details ${descriptionClass}`}
                      field={featureData?.details?.jsonValue}
                    />
                  )}
                  {featureData?.ctaTitle?.jsonValue?.value && (
                    <div className="cta-list">
                      <Ctas {...featureData} />
                    </div>
                  )}
                </div>
                {(featureData?.chartTitle?.jsonValue?.value ||
                  featureData?.chartTag?.jsonValue?.value ||
                  featureData?.chartRTE?.jsonValue ||
                  featureData?.chartFootnote?.jsonValue?.value) && (
                  <div className="chart-section">
                    <div className="chart-block">
                      {(featureData?.chartTitle?.jsonValue?.value ||
                        featureData?.chartTag?.jsonValue?.value) && (
                        <>
                          <div className="chart-header">
                            {featureData?.chartTitle?.jsonValue?.value && (
                              <Heading
                                richText
                                className={`title ${titleClass}`}
                                tag="h6"
                                field={featureData?.chartTitle?.jsonValue}
                              />
                            )}

                            {featureData?.chartTag?.jsonValue?.value && (
                              <>
                                <JssRichText
                                  className={`tag ${tagClass}`}
                                  tag={`p`}
                                  field={featureData?.chartTag?.jsonValue}
                                />
                              </>
                            )}
                          </div>
                        </>
                      )}
                      {featureData?.chartRTE?.jsonValue && (
                        <>
                          <hr />
                          <JssRichText
                            className="media-section"
                            field={featureData?.chartRTE?.jsonValue}
                          />
                        </>
                      )}
                      {featureData?.chartFootnote?.jsonValue?.value && (
                        <>
                          <hr />
                          <div className="chart-footer">
                            <JssRichText
                              tag={`p`}
                              className="footnote"
                              field={featureData?.chartFootnote?.jsonValue}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </Row>
            </Container>
          </div>
        </div>
      </Row>
    </div>
  );
};
