import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Accordion as BootstrapAccordion, Container, Row } from 'react-bootstrap';
import { SelectorBundleCardsProps } from './SelectorBundleCards.types';
import {
  EditFrame,
  RichText as JssRichText,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';
import Heading from '@/components/ui/Heading/Heading';
import Ctas from '@/components/ui/CTA/CTA';
import { GPImage } from '@/components/ui/Image/GPImage';
import { GPVideo } from '@/components/ui/Video/GPVideo';
import {
  moveUpItemButton,
  moveDownItemButton,
  deleteItemButton,
  addItemButton,
} from '@/utils/ReorderingSwitcher';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import Link from 'next/link';
import { SelectorBundleCardsConstants } from '@/constants/appConstants';
import LinkItem from '@/components/ui/Link/Link';
import { useI18n } from 'next-localization';
import { useShouldRender } from '@/utils/useShouldRender';
import { getPaddingValue } from '@/utils/Paddingutils';
import { overrideSingleCTAActionStyle } from '@/utils/overrideFirstCTA';
import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import useIsMobile from '@/hooks/useIsMobile';

interface ProductRequestLink {
  jsonValue?: {
    value?: {
      title?: string;
      text?: string;
      href?: string;
    };
  };
}

const editAllCardFieldsButton = {
  header: 'Edit Card Content',
  icon: '/~/icon/Office/16x16/pencil.png',
  fields: [
    'title',
    'tag',
    'details',
    'productName',
    'productPrice',
    'featureTitle',
    'productFeatures',
    'productNotes',
    'ctaLink',
    'productRequestLink',
    'showTopCTA',
    'showBottomCTA',
    'mainVideo',
    'image',
  ],
  tooltip: 'Edit all card content and settings',
};

export const Default = (props: SelectorBundleCardsProps): JSX.Element => {
  const { t } = useI18n();
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext && sitecoreContext?.pageEditing;
  const shouldRender = useShouldRender();
  const { paddingTop, paddingBottom } = getPaddingValue(props?.params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;
  const isMobile = useIsMobile();

  // Height equalization state and refs
  const titleGroupRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeAccordionKeys, setActiveAccordionKeys] = useState<string[]>([]);

  const propsFieldData = props?.fields?.data?.item || {};
  const title = propsFieldData?.title?.jsonValue || '';
  const tag = propsFieldData?.tag?.jsonValue || '';
  const details = propsFieldData?.details?.jsonValue || '';
  const cards = propsFieldData?.children?.results || [];
  const backgroundColorVariant =
    (props?.params?.backgroundColorVariant &&
      JSON.parse(props?.params?.backgroundColorVariant)?.Value?.value) ||
    '';
  const titleHeadingLevel =
    (props?.params?.titleHeadingLevel &&
      JSON.parse(props?.params?.titleHeadingLevel)?.Value?.value) ||
    SelectorBundleCardsConstants.defaultTitleHeadingLevel;
  const variant = props?.params?.FieldNames;
  const cardsPerRowMapping: { [key: string]: string } = {
    TwoInARow: 'cards-2-row',
    ThreeInARow: 'cards-3-row',
    FourInARow: 'cards-4-row',
  };
  const cardsPerRow = cardsPerRowMapping[variant];
  const aosAttributes = getAosAttributes(props);
  const { titleClass, tagClass } =
    getFontSizeClasses(props?.params) || {};

  const cardTitleClass = props?.params?.productPriceFontSize
      ? `h-${JSON.parse(props?.params?.productPriceFontSize)?.Value?.value}`
      : ''

  const getRequestButtonText = (productRequestLink: ProductRequestLink): string => {
    return (
      productRequestLink?.jsonValue?.value?.title ||
      productRequestLink?.jsonValue?.value?.text ||
      t('Request')
    );
  };

  const debouncedEqualizeHeights = useCallback(() => {
    let timeoutId: NodeJS.Timeout;

    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (titleGroupRefs.current.length === 0) return;

        titleGroupRefs.current.forEach((ref) => {
          if (ref) {
            ref.style.height = 'auto';
          }
        });

        let maxHeight = 0;
        titleGroupRefs.current.forEach((ref) => {
          if (ref) {
            const height = ref.offsetHeight;
            if (height > maxHeight) {
              maxHeight = height;
            }
          }
        });

        if (maxHeight > 0) {
          titleGroupRefs.current.forEach((ref) => {
            if (ref) {
              ref.style.height = `${maxHeight}px`;
            }
          });
        }
      }, 300);
    };
  }, []);

  // Height equalization effect for card intros
  useEffect(() => {
    const equalizeHeights = debouncedEqualizeHeights();
    const initialTimeoutId = setTimeout(equalizeHeights, 800);

    window.addEventListener('resize', equalizeHeights);

    return () => {
      clearTimeout(initialTimeoutId);
      window.removeEventListener('resize', equalizeHeights);
    };
  }, [cards, debouncedEqualizeHeights]);

  const handleAccordionSelect = (eventKey: string | null) => {
    if (isMobile || isEditing) {
      if (eventKey) {
        setActiveAccordionKeys([eventKey]);
      } else {
        setActiveAccordionKeys([]);
      }
    } else {
      if (eventKey) {
        const allAccordionKeys = cards
          .map((_, idx) => {
            const card = cards[idx];
            const hasFeatures = shouldRender(card?.featureTitle?.jsonValue?.value) && 
                               shouldRender(card?.productFeatures?.jsonValue?.value);
            return hasFeatures ? `accordion-${idx}` : null;
          })
          .filter((key) => key !== null);
        setActiveAccordionKeys(allAccordionKeys);
      } else {
        setActiveAccordionKeys([]);
      }
    }
  };

  return (
    <div
      className={`component selector-bundle-cards ${
        cardsPerRow || `cards-2-row`
      } ${paddingTopClass} ${paddingBottomClass} ${
        backgroundColorVariant && `bg-${backgroundColorVariant}`
      }`}
      {...aosAttributes}
    >
      <div className="component-content">
        <Container>
          <Row>
            <div className="product-card-title">
              {shouldRender(title?.value) && (
                <Heading
                  level={titleHeadingLevel}
                  richText
                  className={`title ${titleClass}`}
                  field={title}
                />
              )}
              {shouldRender(tag?.value) && (
                <JssRichText className={`subtitle ${tagClass}`} field={tag} />
              )}
            </div>
          </Row>
          <Row className="cards-row">
            {cards?.length &&
              cards?.map((card, index) => {
                const cardTitle = card?.title?.jsonValue || '';
                const cardDetails = card?.details?.jsonValue || '';
                const productName = card?.productName?.jsonValue || '';
                const productPrice = card?.productPrice?.jsonValue || '';
                const featureTitle = card?.featureTitle?.jsonValue || '';
                const productFeatures = card?.productFeatures?.jsonValue || '';
                const mainVideo = card?.mainVideo?.jsonValue?.value?.href || '';
                const cardLink = card?.ctaLink?.jsonValue?.value?.href || '';
                const showTopCTA = card?.showTopCTA?.jsonValue?.value;
                const showBottomCTA = card?.showBottomCTA?.jsonValue?.value;
                const productNotes = card?.productNotes?.jsonValue || '';
                const productLink = card?.productRequestLink?.jsonValue?.value?.href || '';
                const productRequestLink = card?.productRequestLink || {};
                productRequestLink.jsonValue.value.title = getRequestButtonText(productRequestLink);
                
                const shouldShowProductInfo =
                  shouldRender(productName?.value) ||
                  shouldRender(productPrice?.value) ||
                  (showBottomCTA && productLink) ||
                  (shouldRender(featureTitle?.value) && shouldRender(productFeatures?.value));

                const cardTitleContent = (
                  <>
                    {cardLink
                      ? cardTitle?.value && (
                          <LinkItem
                            className="product-title"
                            field={card?.ctaLink?.jsonValue}
                            value={{
                              text: cardTitle?.value,
                              href: cardLink,
                            }}
                          />
                        )
                      : shouldRender(cardTitle?.value) && (
                          <Heading className="product-title" richText field={cardTitle} />
                        )}
                    {shouldRender(cardDetails?.value) && (
                      <JssRichText className={`product-details`} field={cardDetails} />
                    )}
                    {showTopCTA && (
                      <div className="product-cta">
                        {/* Force top CTA action style to "tertiary" - always override https://edynamic.atlassian.net/browse/GPES-653 */}
                        <Ctas {...overrideSingleCTAActionStyle(card, 'btn-cta-tertiary', false)} />
                      </div>
                    )}
                  </>
                );

                const cardProductContent = (
                  <>
                    {shouldRender(productName?.value) || shouldRender(productPrice?.value) ? (
                      <div className="product-info">
                        {shouldRender(productName?.value) && (
                          <JssRichText field={productName} className="product-name" />
                        )}
                        {shouldRender(productPrice?.value) && (
                          <JssRichText
                            field={productPrice}
                            className={`product-price ${cardTitleClass}`}
                          />
                        )}
                      </div>
                    ) : null}
                    {showBottomCTA && shouldRender(productLink) && (
                      <div className="product-request">
                        <Ctas
                          ctaLink={productRequestLink}
                          overrideActionStyle={card?.productRequestLinkCtaStyle}
                        />
                      </div>
                    )}
                    {shouldRender(featureTitle?.value) && shouldRender(productFeatures?.value) && (
                      <div className="product-features">
                        <BootstrapAccordion
                          activeKey={activeAccordionKeys.includes(`accordion-${index}`) ? `accordion-${index}` : undefined}
                          onSelect={(eventKey) => handleAccordionSelect(eventKey as string | null)}
                        >
                          <BootstrapAccordion.Item eventKey={`accordion-${index}`}>
                            <BootstrapAccordion.Header>
                              {shouldRender(featureTitle?.value) && (
                                <JssRichText field={featureTitle} className="features" />
                              )}
                            </BootstrapAccordion.Header>
                            <BootstrapAccordion.Body>
                              {shouldRender(productFeatures?.value) && (
                                <div className="field-traycontent">
                                  <JssRichText field={productFeatures} />
                                </div>
                              )}
                            </BootstrapAccordion.Body>
                          </BootstrapAccordion.Item>
                        </BootstrapAccordion>
                        {shouldRender(productNotes?.value) && (
                          <JssRichText field={productNotes} className="product-notes" />
                        )}
                      </div>
                    )}
                  </>
                );

                return (
                  <div key={index} className="product-wrapper">
                    <EditFrame
                      key={index}
                      title="Add/Remove/Move Cards"
                      dataSource={{ itemId: card?.id + '' }}
                      buttons={[
                        editAllCardFieldsButton,
                        moveUpItemButton,
                        moveDownItemButton,
                        addItemButton,
                        deleteItemButton,
                      ]}
                    >
                      <div className="product-card bg-white">
                        {cardLink ? (
                          <div
                            ref={(el) => {
                              titleGroupRefs.current[index] = el;
                            }}
                            className={`product-title-group ${cardLink && 'ec-clickable-card'}`}
                          >
                            <Link
                              href={cardLink}
                              className="link-overlay"
                              aria-label={cardTitle?.value || 'View details'}
                            />
                            {cardTitleContent}
                          </div>
                        ) : (
                          <div
                            ref={(el) => {
                              titleGroupRefs.current[index] = el;
                            }}
                            className="product-title-group"
                          >
                            {cardTitleContent}
                          </div>
                        )}
                        <div
                          className={`image-wrapper ${mainVideo && 'has-video'} ${
                            isEditing && `is-editing`
                          }`}
                        >
                          <GPImage item={card} />
                          {shouldRender(mainVideo) && (
                            <GPVideo className="card-video" item={card} />
                          )}
                        </div>
                        {shouldShowProductInfo && <hr />}
                        <>
                          {(shouldShowProductInfo || productLink) && (
                            <div
                              className={`product-info-group ${productLink && 'ec-clickable-card'}`}
                            >
                              {productLink && <Link href={productLink} className="link-overlay" aria-label={cardTitle?.value || 'View details'} />}
                              {cardProductContent}
                            </div>
                          )}
                        </>
                      </div>
                    </EditFrame>
                  </div>
                );
              })}
          </Row>
          {(shouldRender(details?.value) || propsFieldData?.ctaLink?.jsonValue?.value?.href) && (
            <Row>
              <div className="cta-wrapper">
                <div className={`cta-box bg-white`}>
                  {shouldRender(details?.value) && (
                    <Heading
                      level={titleHeadingLevel}
                      richText
                      className={`title ${titleClass}`}
                      field={details}
                    />
                  )}
                  {propsFieldData?.ctaLink?.jsonValue?.value?.href && (
                    <div>
                      <Ctas {...propsFieldData} />
                    </div>
                  )}
                </div>
              </div>
            </Row>
          )}
        </Container>
      </div>
    </div>
  );
};

export const TwoInARow = (props: SelectorBundleCardsProps): JSX.Element => {
  return <Default {...props} />;
};
export const ThreeInARow = (props: SelectorBundleCardsProps): JSX.Element => {
  return <Default {...props} />;
};
export const FourInARow = (props: SelectorBundleCardsProps): JSX.Element => {
  return <Default {...props} />;
};
