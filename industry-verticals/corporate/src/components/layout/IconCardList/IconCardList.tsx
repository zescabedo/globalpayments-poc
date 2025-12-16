import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EditFrame, RichText, useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { IconCardListProps, ChildResult } from './IconCardList.types';
import { Container, Row, Col } from 'react-bootstrap';
import Heading from '@/components/ui/Heading/Heading';
import { IconCardConstants } from '@/constants/appConstants';
import Ctas from '@/components/ui/CTA/CTA';
import {
  addItemButton,
  deleteItemButton,
  moveDownItemButton,
  moveUpItemButton,
} from '@/utils/ReorderingSwitcher';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { EditCTAButtons, EditIconButtons } from '@/utils/SiteCoreCustomEditBtn';
import { useShouldRender } from '@/utils/useShouldRender';
import { getPaddingValue } from '@/utils/Paddingutils';
import { overrideSingleCTAActionStyle } from '@/utils/overrideFirstCTA';

const IconCardList = (props: IconCardListProps): JSX.Element | null => {
  const { titleHeadingLevel, backgroundColorVariant, cardBackgroundColorVariant } = props?.params;
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext.pageEditing;
  const cssClass = props?.cssClass;
  const childrenResults = props?.rendering?.fields?.data?.item?.children?.results || [];
  const { paddingTop, paddingBottom } = getPaddingValue(props?.params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;

  const [svgContent, setSvgContent] = useState<string[]>([]);
  const shouldRender = useShouldRender();

  useEffect(() => {
    const fetchSVGs = async () => {
      const svgPromises = childrenResults.map(async (card) => {
        const iconUrl = card?.icon?.jsonValue?.url;
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
  }, [childrenResults]);

  const bgColorVariant = backgroundColorVariant && JSON.parse(backgroundColorVariant)?.Value?.value;
  const cardBgColor =
    (cardBackgroundColorVariant && JSON.parse(cardBackgroundColorVariant)?.Value?.value) ||
    'subtle';
  const bgColorClass = bgColorVariant ? `bg-${bgColorVariant}` : 'bg-white';

  const showLargeIcon = cssClass?.includes('xl-icon');
  const horizontalIcon = cssClass?.includes('horizontal-icon');
  const { titleClass, descriptionClass } = getFontSizeClasses(props?.params) || {};
  const aosAttributes = getAosAttributes(props);

  const getIconEditFrameProps = (dataSource?: string) => ({
    dataSource: dataSource ? { itemId: dataSource } : undefined,
    buttons: EditIconButtons,
    title: 'Edit Icon',
    tooltip: 'Modify the Icon within this section',

    cssClass: 'jss-edit-frame',
    parameters: {},
  });

  const getCTAEditFrameProps = (dataSource?: string) => ({
    dataSource: dataSource ? { itemId: dataSource } : undefined,
    buttons: EditCTAButtons,
    title: 'Edit CTA',
    tooltip: 'Modify the CTA within this section',

    cssClass: 'jss-edit-frame',
    parameters: {},
  });

  return (
    <div
      className={`icon-card-component ${bgColorClass} ${paddingTopClass} ${paddingBottomClass}`}
      {...aosAttributes}
    >
      <Container>
        <Row className={`icon-card-row ${horizontalIcon ? 'row-5-5' : ''}`}>
          {childrenResults?.map((card: ChildResult, cardIndex: number) => {
            const hasCTA = card?.ctaLink?.jsonValue?.value?.href;
            const dataSourceId = card?.id || '';

            const CardContent = (
              <>
                <div className="media-section">
                  <EditFrame {...getIconEditFrameProps(`${dataSourceId}`)}>
                    <div className="icon">
                      <div
                        className={`svgicon ${card?.iconColourVariant?.targetItem?.value?.jsonValue?.value}`}
                      >
                        {svgContent[cardIndex] ? (
                          <span dangerouslySetInnerHTML={{ __html: svgContent[cardIndex] }} />
                        ) : (
                          isEditing && (
                            <span className="empty-icon-placeholder">[No icon in field]</span>
                          )
                        )}
                      </div>
                    </div>
                  </EditFrame>
                </div>

                <div className="copy-section">
                  {card?.title?.jsonValue && (
                    <Heading
                      className={`title ${titleClass}`}
                      field={card?.title?.jsonValue}
                      richText
                      level={
                        (titleHeadingLevel && JSON?.parse(titleHeadingLevel)?.Value?.value) ||
                        IconCardConstants?.DefaultHeadigLevel
                      }
                    />
                  )}
                  {card?.details?.jsonValue && (
                    <RichText
                      className={`details ${descriptionClass}`}
                      field={card?.details?.jsonValue}
                    />
                  )}
                  {shouldRender(hasCTA) && (
                    <div className="cta">
                      <EditFrame {...getCTAEditFrameProps(`${dataSourceId}`)}>
                        {showLargeIcon ? <Ctas {...overrideSingleCTAActionStyle(card, 'link-glow-base', true)} /> : <Ctas {...card} />}
                      </EditFrame>
                    </div>
                  )}
                </div>
              </>
            );

            return (
              <Col key={cardIndex} className={`icon-card-wrapper ${cssClass || ''}`}>
                <EditFrame
                  key={cardIndex}
                  title="Edit Icon Card"
                  dataSource={{ itemId: card?.id + '' }}
                  buttons={[moveUpItemButton, moveDownItemButton, addItemButton, deleteItemButton]}
                >
                  {hasCTA ? (
                    <div
                      className={`icon-card ec-clickable-card ${
                        !showLargeIcon && !horizontalIcon ? `bg-${cardBgColor}` : ''
                      }`}
                    >
                      <Link
                        href={card?.ctaLink?.jsonValue?.value?.href || ''}
                        target={card?.ctaLink?.jsonValue?.value?.target || '_self'}
                        aria-label={card?.ctaTitle?.jsonValue?.value || ''}
                        className="ec-card-link-overlay"
                      />
                      {CardContent}
                    </div>
                  ) : (
                    <div
                      className={`icon-card ${
                        !showLargeIcon && !horizontalIcon ? `bg-${cardBgColor}` : ''
                      }`}
                    >
                      {CardContent}
                    </div>
                  )}
                </EditFrame>
              </Col>
            );
          })}
        </Row>
      </Container>
    </div>
  );
};

export default IconCardList;
