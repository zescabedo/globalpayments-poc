import { useState } from 'react';
import { TabsProps } from '../TabsComponent/TabsComponent.types';
import Heading from '@/components/ui/Heading/Heading';
import {
  RichText,
  EditFrame,
  Placeholder,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { Container } from 'react-bootstrap';
import {
  moveUpItemButton,
  moveDownItemButton,
  deleteItemButton,
  addItemButton,
} from '@/utils/ReorderingSwitcher';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { TabsConstant } from '@/constants/appConstants';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getPaddingValue } from '@/utils/Paddingutils';

const TabsComponent = (props: TabsProps): JSX.Element => {
  const { Title, Details } = props?.rendering?.fields?.data?.item || {};
  const { backgroundColorVariant, titleHeadingLevel, Styles } = props?.params;
  const [activeTab, setActiveTab] = useState(0);
  const { paddingTop, paddingBottom } = getPaddingValue(props?.params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = !!sitecoreContext?.pageEditing;

  const handleTabClick = (index: number) => {
    if (isEditing) return;
    setActiveTab(activeTab === index ? -1 : index);
  };

  const bgColorVariant = backgroundColorVariant && JSON.parse(backgroundColorVariant)?.Value?.value;
  const colorClass = bgColorVariant ? `bg-${bgColorVariant}` : '';
  const titleMainHeadingLevel =
    (titleHeadingLevel && JSON.parse(titleHeadingLevel)?.Value?.value) || '';

  const validTabs =
    props?.rendering?.fields?.data?.item?.children?.results?.filter((tab) =>
      tab?.Heading?.jsonValue?.value?.trim()
    ) || [];

  const { titleClass, descriptionClass } = getFontSizeClasses(props?.params) || {};

  const aosAttributes = getAosAttributes(props);
  return (
    <div
      className={`tab-component ${colorClass} ${Styles} ${paddingTopClass} ${paddingBottomClass}`}
      {...aosAttributes}
    >
      <Container>
        <div className="header-section">
          {Title?.jsonValue && (
            <Heading
              level={titleMainHeadingLevel || TabsConstant.tabDefaultHeadingLevel}
              richText
              field={Title?.jsonValue}
              className={`tabs-title ${titleClass}`}
            />
          )}
          {Details?.jsonValue && (
            <RichText
              field={Details?.jsonValue}
              tag="div"
              className={`details ${descriptionClass}`}
            />
          )}
        </div>

        <div className="tabs-row-variant">
          {validTabs?.map((tab, idx) => (
            <EditFrame
              key={tab?.id}
              title="Move Tab Item"
              dataSource={{ itemId: tab?.id + '' }}
              buttons={[moveUpItemButton, moveDownItemButton, deleteItemButton, addItemButton]}
            >
              <div
                className={`tab-item-variant ${activeTab === idx ? 'active' : ''}`}
                onClick={() => {
                  if (!isEditing) setActiveTab(idx);
                }}
              >
                <RichText field={tab?.Heading?.jsonValue} tag="span" className="tab-item" />
              </div>
            </EditFrame>
          ))}
        </div>

        <div className="tabs-accordion">
          {validTabs?.map((accordion, idx) => {
            const placeholderIndex = accordion?.placeholderIndex?.jsonValue?.value;

            return (
              <div key={accordion?.id} className="accordion-item">
                <div
                  className={`accordion-header ${activeTab === idx ? 'active' : ''}`}
                  onClick={() => handleTabClick(idx)}
                >
                  <RichText
                    tag="div"
                    className="accordion-header-title "
                    field={accordion?.Heading?.jsonValue}
                  />
                  <span className="icon"></span>
                </div>

                {(isEditing || activeTab === idx) && accordion?.Content?.jsonValue?.value && (
                  <div className="accordion-content">
                    <RichText field={accordion?.Content?.jsonValue} />
                  </div>
                )}

                {/* In EE, don't render this placeholder here to avoid duplicates */}
                {!isEditing && (
                  <div
                    className={`accordion-content 
                      ${activeTab !== idx ? 'hide' : ''}
                      `}
                  >
                    <Placeholder
                      name={`tab-content-${placeholderIndex}-{*}`}
                      rendering={props?.rendering}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {validTabs[activeTab]?.Content?.jsonValue?.value && (
          <div className="tabs-content">
            {activeTab !== -1 && validTabs[activeTab] && (
              <div className={`tab-content-item active`}>
                <div className="content-section">
                  <RichText field={validTabs[activeTab]?.Content?.jsonValue} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* EE Only: Stacked placeholders so every tab is editable. */}
        {validTabs?.map((tabData, idx) => {
          const placeholderIndex = tabData?.placeholderIndex?.jsonValue?.value ?? idx;
          const isActivePlaceholder =
            Number(validTabs[activeTab]?.placeholderIndex?.jsonValue?.value ?? activeTab) ===
            Number(placeholderIndex);

          // Add a label for EE authors to identify each tab's placeholder
          const tabName = tabData?.Heading?.jsonValue?.value?.trim() || '(untitled)';

          return (
            <div key={idx} className={`tab-placeholder-content`}>
              <div
                className={`tab-placeholder-content-item ${
                  isEditing || isActivePlaceholder ? '' : 'hide'
                } `}
              >
                {/* EE Only: Label above the inline placeholder */}
                {isEditing ? (
                  <div>
                    === Placeholder for Tab {idx}: {tabName} ===
                  </div>
                ) : null}

                <div className="content-section">
                  <Placeholder
                    name={`tab-content-${placeholderIndex}-{*}`}
                    rendering={props?.rendering}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </Container>
    </div>
  );
};

export default TabsComponent;
