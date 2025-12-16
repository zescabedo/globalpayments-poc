import { RichText, EditFrame } from '@sitecore-jss/sitecore-jss-nextjs';
import { ContentListProps } from './ContentList.types';
import { LinkFieldValue } from '@sitecore-jss/sitecore-jss-dev-tools';
import { Container, Row } from 'react-bootstrap';
import Heading from '@/components/ui/Heading/Heading';
import { CONTENT_LIST_DEFAULT_HEADING_LEVEL } from '@/constants/headingConfig';
import {
  moveUpItemButton,
  moveDownItemButton,
  deleteItemButton,
  addItemToParentDatasourceButton,
  addItemButton,
} from '@/utils/ReorderingSwitcher';
import LinkItem from '@/components/ui/Link/Link';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';

export const ContentList = (props: ContentListProps): JSX.Element => {
  const { fields, params } = props || {};
  const { Styles = '' } = params || {};

  //params
  const titleHeadingLevel =
    (params?.titleHeadingLevel && JSON.parse(params?.titleHeadingLevel)?.Value?.value) ||
    CONTENT_LIST_DEFAULT_HEADING_LEVEL;
  const contentItems = fields?.data?.item?.contentItems?.results || [];

  const backgroundColorVariant = params?.backgroundColorVariant
    ? `bg-${JSON.parse(params.backgroundColorVariant)?.Value?.value}`
    : '';
  const toggleSticky = params?.ToggleSticky;

  //fields
  const item = fields?.data?.item || {};
  const title = item?.title?.jsonValue || null;
  const tag = item?.tag?.jsonValue || null;
  const details = item?.details?.jsonValue || null;

  //AOS
  const aosAttributes = getAosAttributes(props);
  const { titleClass, tagClass, descriptionClass } = getFontSizeClasses(props?.params) || {};

  return (
    <div
      className={`component content-list ${backgroundColorVariant} ${Styles}`}
      {...aosAttributes}
    >
      <div className="component-content">
        <Container>
          <Row>
            <div className="copy-section">
              <div className={`copy-section-contents ${toggleSticky === '1' ? 'sticky' : ''}`}>
                {title && (
                  <Heading
                    level={titleHeadingLevel}
                    richText={true}
                    className={`title ${titleClass}`}
                    field={title}
                  />
                )}

                {tag && <RichText field={tag} tag="p" className={`tag ${tagClass}`} />}

                {details && (
                  <div className={`details ${descriptionClass}`}>
                    <RichText field={details} />
                  </div>
                )}
              </div>
            </div>

            {contentItems?.length > 0 && (
              <div className="list-section">
                <ul>
                  {contentItems?.map((item, index) => {
                    const linkList = item?.linkList?.results?.[0]?.links?.results || [];
                    return (
                      <EditFrame
                        key={index}
                        title="Edit Content item"
                        dataSource={{ itemId: item?.id + '' }}
                        buttons={[
                          moveUpItemButton,
                          moveDownItemButton,
                          addItemToParentDatasourceButton,
                          deleteItemButton,
                        ]}
                      >
                        <li key={index}>
                          <div className="list-item">
                            {item?.title?.jsonValue && (
                              <RichText field={item.title.jsonValue} tag="p" className="title" />
                            )}

                            {item?.tag?.jsonValue && (
                              <RichText field={item.tag.jsonValue} tag="p" className="tag" />
                            )}

                            {linkList?.length > 0 && (
                              <p className="list-link">
                                {linkList.map((linkItem, index) => {
                                  const linkField = linkItem?.link?.jsonValue;
                                  const linkFieldValue = linkItem?.link?.jsonValue?.value;

                                  return (
                                    <EditFrame
                                      key={index}
                                      title="Add link item"
                                      dataSource={{ itemId: item?.linkList?.results?.[0]?.id + '' }}
                                      buttons={[addItemButton]}
                                    >
                                      <EditFrame
                                        key={index}
                                        title="Edit link item"
                                        dataSource={{
                                          itemId: linkItem?.id + '',
                                        }}
                                        buttons={[
                                          moveUpItemButton,
                                          moveDownItemButton,
                                          deleteItemButton,
                                        ]}
                                      >
                                        <LinkItem
                                          className="content-list-link"
                                          field={linkField}
                                          value={linkFieldValue as LinkFieldValue}
                                        />
                                      </EditFrame>
                                    </EditFrame>
                                  );
                                })}
                              </p>
                            )}
                          </div>
                        </li>
                      </EditFrame>
                    );
                  })}
                </ul>
              </div>
            )}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default ContentList;
