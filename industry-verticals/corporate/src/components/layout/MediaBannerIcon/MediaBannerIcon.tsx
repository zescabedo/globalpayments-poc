import { MediaBannerIconListProps } from './MediaBannerIcon.types';
import Heading from '@/components/ui/Heading/Heading';
import { EditFrame, RichText, useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { Container } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { MediaBannerIconListConstant } from '@/constants/appConstants';
import GPMedia from '@/components/ui/GPMedia/GPMedia';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { useShouldRender } from '@/utils/useShouldRender';
import {
  addItemToParentDatasourceButton,
  deleteItemButton,
  moveDownItemButton,
  moveUpItemButton,
} from '@/utils/ReorderingSwitcher';
import { getIconEditFrameProps } from '@/utils/editFrames';
import { getPaddingValue } from '@/utils/Paddingutils';
import { flipMediaOnMobile } from '@/utils/flipMedia';

const MediaBannerIconLists = (props: MediaBannerIconListProps): JSX.Element => {
  const shouldRender = useShouldRender();
  const { title, tag, icons } = props?.rendering?.fields?.data?.item || {};
  const { backgroundColorVariant, titleHeadingLevel, imageVariant, Styles } = props?.params;
  const [svgContent, setSvgContent] = useState<string[]>([]);
  const { paddingBottom, paddingTop } = getPaddingValue(props?.params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext.pageEditing;
  const flipMediaClass = flipMediaOnMobile(props);

  useEffect(() => {
    if (icons?.targetItems) {
      const fetchSVGs = async () => {
        const svgPromises = icons.targetItems.map(async (icon) => {
          const iconUrl = icon?.icon?.jsonValue.url;
          if (iconUrl) {
            const response = await fetch(iconUrl);
            if (response.ok) {
              return response.text();
            }
          }
          return '';
        });

        const svgData = await Promise.all(svgPromises);
        setSvgContent(svgData);
      };

      fetchSVGs();
    }
  }, []);
  const items = props?.rendering?.fields?.data?.item;

  const bgColorVariant = backgroundColorVariant && JSON.parse(backgroundColorVariant)?.Value?.value;
  const bgColorClass = bgColorVariant ? `bg-${bgColorVariant}` : '';

  const wrapperClassName = `media-banner-wrapper row ${Styles || ''} ${flipMediaClass}`;
  const parsedImageVariant = imageVariant && JSON.parse(imageVariant)?.Value?.value;
  const headingLevel =
    titleHeadingLevel && JSON.parse(titleHeadingLevel)?.Value?.value
      ? JSON.parse(titleHeadingLevel)?.Value?.value
      : MediaBannerIconListConstant.tabDefaultHeadingLevel;
  const aosAttributes = getAosAttributes(props);
  const { titleClass, descriptionClass } =
    getFontSizeClasses(props?.params) || {};

  return (
    <div
      className={`media-banner-icon-list-component ${bgColorClass} ${paddingTopClass} ${paddingBottomClass}`}
      {...aosAttributes}
    >
      <Container>
        <div className={wrapperClassName}>
          <div className="media-section ">
            <div className={`main-banner-image ${parsedImageVariant}`}>
              <GPMedia item={items} params={props?.params} />
            </div>
          </div>

          <div className="copy-section">
            {shouldRender(title?.jsonValue) && (
              <Heading
                level={headingLevel}
                field={title?.jsonValue}
                richText
                className={`title ${titleClass}`}
              />
            )}
            {shouldRender(tag?.jsonValue) && (
              <RichText tag="p" field={tag.jsonValue} className={`tag ${descriptionClass}`} />
            )}

            <div className="icon-section">
              {icons?.targetItems?.map((icon, index) => {
                const dataSourceId = icon?.id || '';

                return (
                  <EditFrame
                    key={index}
                    title="Edit Icon Card"
                    dataSource={{ itemId: icon?.id + '' }}
                    buttons={[
                      moveUpItemButton,
                      moveDownItemButton,
                      addItemToParentDatasourceButton,
                      deleteItemButton,
                    ]}
                  >
                    <div key={index} className="icon-item">
                      <EditFrame {...getIconEditFrameProps(dataSourceId)}>
                        <div className="icon icon-image">
                          {svgContent[index] ? (
                            <div
                              className={`svgicon ${icon?.iconColourVariant?.targetItem?.value?.jsonValue?.value}`}
                              dangerouslySetInnerHTML={{ __html: svgContent[index] || '' }}
                            />
                          ) : (
                            isEditing && (
                              <span className="empty-icon-placeholder">[No icon in field]</span>
                            )
                          )}
                        </div>
                      </EditFrame>

                      <div className="icon-details">
                        <RichText
                          tag="p"
                          field={icon?.iconTitle?.jsonValue}
                          className="icon-title"
                        />
                        <RichText
                          tag="p"
                          field={icon?.iconDetails?.jsonValue}
                          className="icon-description"
                        />
                      </div>
                    </div>
                  </EditFrame>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MediaBannerIconLists;
