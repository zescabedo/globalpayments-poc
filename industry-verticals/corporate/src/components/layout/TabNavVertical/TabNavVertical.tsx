import { useState } from 'react';
import { TabNavProps } from './TabNavVertical.types';
import { RichText, Text, EditFrame } from '@sitecore-jss/sitecore-jss-nextjs';
import Heading from '@/components/ui/Heading/Heading';
import { Container } from 'react-bootstrap';
import {
  TAB_NAV_VERTICAL_DEFAULT_HEADING_LEVEL,
  TAB_NAV_VERTICAL_DEFAULT_LEFT_SECTION_HEADING_LEVEL,
} from '@/constants/headingConfig';
import { BREAKPOINTS } from '@/constants/appConstants';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import {
  moveUpItemButton,
  moveDownItemButton,
  deleteItemButton,
  addItemButton,
} from '@/utils/ReorderingSwitcher';

const TabNavVertical = (props: TabNavProps): JSX.Element => {
  const { backgroundColorVariant, TabContentCardBackground, titleHeadingLevel } =
    props?.params || {};
  const [activeTab, setActiveTab] = useState<number | null>(0);
  const { Title, Tag, children } = props?.rendering?.fields?.data?.item || {};
  const bgColorVariant = backgroundColorVariant && JSON.parse(backgroundColorVariant)?.Value?.value;
  const bgColorClass = bgColorVariant ? `bg-${bgColorVariant}` : '';
  const trayBackground =
    TabContentCardBackground && JSON.parse(TabContentCardBackground)?.Value?.value;
  const bgTrayContentClass = trayBackground ? `bg-${trayBackground}` : '';

  const handleTabClick = (id: number) => {
    const isAccordion = window.innerWidth <= BREAKPOINTS.lg;
    setActiveTab(isAccordion ? (activeTab === id ? null : id) : id);
  };
  const { titleClass, tagClass } = getFontSizeClasses(props?.params) || {};

  const renderContent = (index: number) => {
    const item = children?.results[index];

    return (
      <div className="tab-content active">
        {item?.tabTitle?.jsonValue && (
          <Heading
            className="title"
            text={item.tabTitle.jsonValue}
            level={TAB_NAV_VERTICAL_DEFAULT_LEFT_SECTION_HEADING_LEVEL}
          />
        )}
        {item?.tabTag?.jsonValue && (
          <RichText tag="p" className="tag" field={item.tabTag.jsonValue} />
        )}
        <RichText className="rich-text-content" field={item?.tabRichtext?.jsonValue} />
        <RichText tag="p" className="footnote" field={item?.tabFootnote?.jsonValue} />
      </div>
    );
  };

  const renderContentOnce = activeTab !== null ? renderContent(activeTab) : null;
  const aosAttributes = getAosAttributes(props);
  return (
    <div className={`main-container ${bgColorClass}`} {...aosAttributes}>
      <Container>
        {Title?.jsonValue && (
          <Heading
            className={`main-title ${titleClass}`}
            text={Title.jsonValue}
            level={
              (titleHeadingLevel && JSON?.parse(titleHeadingLevel)?.Value?.value) ||
              TAB_NAV_VERTICAL_DEFAULT_HEADING_LEVEL
            }
          />
        )}
        {Tag?.jsonValue && <RichText tag="p" className={`tag ${tagClass}`} field={Tag.jsonValue} />}
        <div className="content">
          <div className={`tab-section `}>
            <ul className="tab-items">
              {children?.results?.map((item, index) => (
                <EditFrame
                  key={index}
                  title="Edit Tab Item"
                  dataSource={{ itemId: String(item?.id || '') }}
                  buttons={[moveUpItemButton, moveDownItemButton, addItemButton, deleteItemButton]}
                >
                  <li className="tab-item">
                    <Text
                      tag="h3"
                      className={`link ${activeTab === index ? 'active' : ''}`}
                      onClick={(e: { preventDefault: () => void }) => {
                        e.preventDefault();
                        handleTabClick(index);
                      }}
                      field={item?.tabToggleHeading?.jsonValue}
                    />
                    {activeTab === index && (
                      <div className={`accordion-content-section ${bgTrayContentClass}`}>
                        {renderContentOnce}
                      </div>
                    )}
                  </li>
                </EditFrame>
              ))}
            </ul>
          </div>
          <div className={`tab-content-section ${bgTrayContentClass}`}>{renderContentOnce}</div>
        </div>
      </Container>
    </div>
  );
};

export default TabNavVertical;
