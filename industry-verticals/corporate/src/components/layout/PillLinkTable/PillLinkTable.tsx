import {
  RichText as JssRichText,
  EditFrame,
  useSitecoreContext,
  RichText,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { Container, Row } from 'react-bootstrap';
import { PillLinkTableProps } from './PillLinkTable.types';
import LinkItem from '@/components/ui/Link/Link';
import { PillLinkTableConstants } from '@/constants/appConstants';
import { LinkFieldValue } from '@sitecore-jss/sitecore-jss-dev-tools';
import {
  moveUpItemButton,
  moveDownItemButton,
  deleteItemButton,
  addItemToParentDatasourceButton,
} from '@/utils/ReorderingSwitcher';
import { getAosAttributes } from '@/components/ui/AOS/AOS';

import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import GPMedia from '@/components/ui/GPMedia/GPMedia';
import { useShouldRender } from '@/utils/useShouldRender';
import { getPaddingValue } from '@/utils/Paddingutils';
import { flipMediaOnMobile } from '@/utils/flipMedia';

export const Default = (props: PillLinkTableProps): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext.pageEditing;
  const propsFieldData = props?.fields?.data?.item;
  const title = propsFieldData?.title?.jsonValue || '';
  const details = propsFieldData?.details?.jsonValue;
  const layoutOption = props?.params?.Styles || props?.params?.styles || '';
  const { titleClass } = getFontSizeClasses(props?.params) || {};
  const { paddingBottom, paddingTop } = getPaddingValue(props?.params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;

  const shouldRender = useShouldRender();

  const headingsOption =
    (props?.params['headingsVisual Size'] &&
      JSON.parse(props?.params['headingsVisual Size'])?.Value?.value) ||
    '';
  const detailsOption =
    (props?.params['detailsVisual Size'] &&
      JSON.parse(props?.params['detailsVisual Size'])?.Value?.value) ||
    '';
  const titleHeadingLevel =
    (props?.params?.titleHeadingLevel &&
      JSON.parse(props?.params?.titleHeadingLevel)?.Value?.value) ||
    PillLinkTableConstants.defaultTitleTag;

  const backgroundColorVariant =
    (props?.params?.backgroundColorVariant &&
      JSON.parse(props?.params?.backgroundColorVariant)?.Value?.value) ||
    PillLinkTableConstants.defaultPillLinkColor;
  const aosAttributes = getAosAttributes(props);
  const mainImage = propsFieldData?.mainImage?.src || '';
  const mainVideo = propsFieldData?.mainVideo?.jsonValue?.value?.href || '';
  const lottieJsonData = propsFieldData?.lottieJsonData?.jsonValue?.value || '';
  const flipMediaClass = flipMediaOnMobile(props);

  return (
    <div
      className={`pill-link-table offset-center-6x4 ${layoutOption} ${headingsOption} ${detailsOption} bg-${backgroundColorVariant} ${paddingTopClass} ${paddingBottomClass}`}
      {...aosAttributes}
    >
      <Container>
        <Row className={flipMediaClass}>
          {(isEditing || mainImage || mainVideo || lottieJsonData) && (
            <div
              className={`media-section ${
                props?.params?.imageVariant && JSON.parse(props?.params?.imageVariant)?.Value?.value
              }`}
            >
              <GPMedia item={propsFieldData} params={props?.params} />
            </div>
          )}
          <div className="copy-section">
            {title && (
              <JssRichText
                className={`title ${titleClass}`}
                tag={`h${titleHeadingLevel}`}
                field={title}
              />
            )}
            {details && <JssRichText tag="p" className={`details`} field={details} />}
            <div className="cta-wrapper">
              <ul>
                {propsFieldData?.ctas?.results?.map((ctaItem, index) => {
                  const linkField = ctaItem?.cta?.jsonValue;
                  const linkFieldValue = ctaItem?.cta?.jsonValue?.value;
                  const description = ctaItem?.description?.jsonValue;
                  return (
                    shouldRender(linkField?.value?.href) && (
                      <li key={index}>
                        <div className="field-heading">
                          <EditFrame
                            title="Move CTA Item"
                            dataSource={{ itemId: ctaItem?.id + '' }}
                            buttons={[
                              moveUpItemButton,
                              moveDownItemButton,
                              deleteItemButton,
                              addItemToParentDatasourceButton,
                            ]}
                          >
                            <LinkItem
                              className={`link-glow link-glow-base`}
                              field={linkField}
                              value={linkFieldValue as LinkFieldValue}
                            />
                            {shouldRender(description?.value) && (
                              <RichText className={`details`} field={description} />
                            )}
                          </EditFrame>
                        </div>
                      </li>
                    )
                  );
                })}
              </ul>
            </div>
          </div>
        </Row>
      </Container>
    </div>
  );
};
