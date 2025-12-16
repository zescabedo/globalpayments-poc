import { TableOfferMatrixProps, Feature } from './TableOfferMatrix.types';
import Heading from '@/components/ui/Heading/Heading';
import Ctas from '@/components/ui/CTA/CTA';
import { RichText, EditFrame, RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { Container, Row } from 'react-bootstrap';
import {
  deleteItemButton,
  moveDownItemButton,
  moveUpItemButton,
  addItemButton,
} from '@/utils/ReorderingSwitcher';
import { TableOfferMatrixConstants } from '@/constants/appConstants';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { GPImage } from '@/components/ui/Image/GPImage';
import { getAosAttributes } from '@/components/ui/AOS/AOS';

const TableOfferMatrix = (props: TableOfferMatrixProps): JSX.Element | null => {
  if (!props?.rendering?.fields?.data?.item) {
    return null;
  }

  const data = props.rendering.fields.data.item;
  const features = (data.children?.results as Feature[]) || [];
  const checkmarkImageProps = {
    item: {
      mainImage: {
        ...data.checkmarkImage,
        height: data.checkmarkImage.height?.toString() || '25',
        width: data.checkmarkImage.width?.toString() || '25',
      },
    },
  };

  const { defaulttitleHeadingLevel } = TableOfferMatrixConstants;
  const titleHeadingLevel =
    (props?.params?.titleHeadingLevel &&
      JSON.parse(props?.params?.titleHeadingLevel)?.Value?.value) ||
    defaulttitleHeadingLevel;

  const { titleClass, descriptionClass } = getFontSizeClasses(props?.params) || {};

  const columns = [
    {
      heading: data.column1Heading?.jsonValue,
      subheading: data.column1Subheading?.jsonValue,
      checkmarkKey: 'column1Checkmark',
    },
    {
      heading: data.column2Heading?.jsonValue,
      subheading: data.column2Subheading?.jsonValue,
      checkmarkKey: 'column2Checkmark',
    },
    ...(data.column3Heading?.jsonValue
      ? [
          {
            heading: data.column3Heading?.jsonValue,
            subheading: data.column3Subheading?.jsonValue,
            checkmarkKey: 'column3Checkmark',
          },
        ]
      : []),
  ];
  const backgroundColorVariant =
    (props?.params?.['Background Color Variant'] &&
      JSON.parse(props?.params?.['Background Color Variant'])?.Value?.value) ||
    '';

  const aosAttributes = props ? getAosAttributes(props) : {};

  return (
    <div
      className={`component table-offer-matrix ${backgroundColorVariant}`}
      {...(aosAttributes || {})}
    >
      <Container>
        <Row>
          <div className="table-matrix-component-header">
            {data?.title?.jsonValue?.value && (
              <Heading
                level={titleHeadingLevel}
                richText
                className={`table-matrix-header ${titleClass}`}
                field={data?.title?.jsonValue}
              />
            )}
            {data?.details?.jsonValue?.value && (
              <div className={`table-matrix-details ${descriptionClass}`}>
                <JssRichText field={data?.details?.jsonValue} />
              </div>
            )}
            <div className="table-matrix-cta">
              <Ctas {...data} />
            </div>
          </div>
        </Row>
      </Container>

      <Container>
        <div className="table-wrapper">
          <Row className="table-header-row">
            <div className="table-matrix-col-lg">
              <div className="cell">
                <div className="table-matrix-col-header">
                  <JssRichText field={data?.descriptionHeading?.jsonValue} />
                </div>
                <div className="table-matrix-col-subheader">
                  <JssRichText field={data?.descriptionSubHeading?.jsonValue} />
                </div>
              </div>
            </div>
            {columns.map((col, index) => (
              <div className="table-matrix-col-sm" key={index}>
                <div className="cell">
                  {col.heading?.value && (
                    <div className="table-matrix-col-header">
                      <JssRichText field={col?.heading} />
                    </div>
                  )}
                  {col.subheading?.value && (
                    <div className="table-matrix-col-subheader">
                      <JssRichText field={col?.subheading} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Row>

          {features.map((feature: Feature, index) => (
            <EditFrame
              key={index}
              title="Edit Table Row"
              dataSource={{ itemId: feature?.id + '' }}
              buttons={[moveUpItemButton, moveDownItemButton, deleteItemButton, addItemButton]}
            >
              <Row className="table-body-row">
                {feature.detail?.jsonValue && (
                  <div className="table-matrix-col-lg ">
                    {feature.categories?.jsonValue?.value && (
                      <RichText
                        className="table-matrix-feature-category"
                        field={feature?.categories?.jsonValue}
                        tag={'div'}
                      />
                    )}
                    <RichText className="cell" field={feature?.detail?.jsonValue} tag={'div'} />
                  </div>
                )}
                {columns.map((col, colIndex) => (
                  <div className="table-matrix-col-sm" key={colIndex}>
                    <div className="cell">
                      <div className="mobile-header">{col.heading?.value}</div>
                      <div className="col-content">
                        {feature[col.checkmarkKey]?.jsonValue?.value && (
                          <GPImage {...checkmarkImageProps} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </Row>
            </EditFrame>
          ))}
        </div>
      </Container>
    </div>
  );
};
export default TableOfferMatrix;
