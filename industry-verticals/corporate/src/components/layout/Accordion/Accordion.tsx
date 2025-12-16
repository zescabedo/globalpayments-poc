import React, { useEffect, useState } from 'react';
import { Accordion as BootstrapAccordion, Container, Row } from 'react-bootstrap';
import { RichText as JssRichText, useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { AccordionProps } from './Accordion.types';
import { AccordionConstants, BREAKPOINTS } from '@/constants/appConstants';
import Head from 'next/head';
import Ctas from '@/components/ui/CTA/CTA';
import { useShouldRender } from '@/utils/useShouldRender';

import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { debounce } from 'lodash';
import { overrideSingleCTAActionStyle } from '@/utils/overrideFirstCTA';

const generateTrackingProps = (goalId?: string, campaignId?: string) => {
  const trackingProps: Record<string, string> = {};
  if (goalId) trackingProps['data-sc-goal'] = goalId;
  if (campaignId) trackingProps['data-sc-camp'] = campaignId;
  return trackingProps;
};

const Accordion = (props: AccordionProps): JSX.Element => {
  const shouldRender = useShouldRender();
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext && sitecoreContext?.pageEditing;

  const propsFieldData = props?.fields?.data?.item;
  const { defaultTitleHeadingLevel, defaultDebounceTime } = AccordionConstants;
  const title = propsFieldData?.title?.jsonValue || '';
  const titleHeadingLevel =
    (props?.params?.titleHeadingLevel &&
      JSON.parse(props?.params?.titleHeadingLevel)?.Value?.value) ||
    defaultTitleHeadingLevel;
  const canOpenMultiple: boolean =
    !!props?.params?.CanOpenMultiple && props?.params?.CanOpenMultiple === '1';
  const expandedByDefault: boolean =
    !!props?.params?.ExpandedByDefault && props?.params?.ExpandedByDefault === '1';
  const expandOnHover: boolean =
    !!props?.params?.ExpandOnHover && props?.params?.ExpandOnHover === '1';
  const accordionItems = propsFieldData?.accordionItems?.results || [];
  const enableFAQSchema = propsFieldData?.enableFAQSchema?.jsonValue?.value;

  const { titleClass, descriptionClass } =
    getFontSizeClasses(props?.params) || {};

  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [isTablet, setIsTablet] = useState<boolean>(false);

  // Generate FAQ Schema from accordion items
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: accordionItems.map((item) => ({
      '@type': 'Question',
      name: item.trayHeading?.jsonValue?.value || '',
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.trayContent?.jsonValue?.value || '',
      },
    })),
  };

  const handleAccordionToggle = (eventKey: string) => {
    if (!isEditing) {
      if (canOpenMultiple) {
        setActiveKeys((prev) =>
          prev.includes(eventKey) ? prev.filter((key) => key !== eventKey) : [...prev, eventKey]
        );
      } else {
        setActiveKeys((prev) => (prev.includes(eventKey) ? [] : [eventKey]));
      }
    }
  };

  const handleMouseEnter = (eventKey: string) => {
    if (!isEditing && expandOnHover && !isTablet) {
      if (canOpenMultiple) {
        setActiveKeys((prev) => (!prev.includes(eventKey) ? [...prev, eventKey] : prev));
      } else {
        setActiveKeys((prev) => (prev.includes(eventKey) ? prev : [eventKey]));
      }
    }
  };

  useEffect(() => {
    if (isEditing) {
      // In Experience Editor, open all accordions by default
      setActiveKeys(accordionItems.map((_, index) => index.toString()));
    } else if (expandedByDefault) {
      // In normal mode, follow the expandedByDefault setting
      setActiveKeys(['0']);
    }
  }, [expandedByDefault, isEditing, accordionItems]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = debounce(() => {
      const tabletBreakpoint = BREAKPOINTS.md;
      const newIsTablet = window.innerWidth <= tabletBreakpoint;
      setIsTablet(newIsTablet);
    }, defaultDebounceTime);

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel();
    };
  }, []);

  return (
    <>
      {enableFAQSchema && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        </Head>
      )}
      <Container>
        <Row className={`accordion-wrapper`}>
          <JssRichText
            tag={`h${titleHeadingLevel}`}
            className={`field-header-title ${titleClass}`}
            field={title}
          />
          <BootstrapAccordion
            activeKey={activeKeys}
            className="accordion-items"
            alwaysOpen={canOpenMultiple}
          >
            {accordionItems.map((accordionItem, index) => {
              const eventKey = index.toString();
              const ctaLink = accordionItem?.ctaLink;
                  const goalId = accordionItem?.triggerGoal?.jsonValue?.id;
                  const campaignId = accordionItem?.triggerCampaign?.jsonValue?.id;

                  const trackingProps = generateTrackingProps(goalId, campaignId);

              return (
                shouldRender(accordionItem?.trayHeading?.jsonValue?.value) &&
                shouldRender(accordionItem?.trayContent?.jsonValue?.value) && (
                  <React.Fragment key={index}>
                    <BootstrapAccordion.Item
                      eventKey={eventKey}
                      onMouseEnter={() => handleMouseEnter(eventKey)}
                    >
                      <BootstrapAccordion.Header onClick={() => handleAccordionToggle(eventKey)} {...trackingProps}>
                        <JssRichText
                          tag="p"
                          className="field-trayheading"
                          field={accordionItem?.trayHeading?.jsonValue}
                        />
                      </BootstrapAccordion.Header>
                      <BootstrapAccordion.Body className="bg-subtle">
                        <div className="field-traycontent">
                          {shouldRender(accordionItem?.traySubheading?.jsonValue?.value) && (
                            <JssRichText
                              tag="h5"
                              className="field-traysubheading"
                              field={accordionItem?.traySubheading?.jsonValue}
                            />
                          )}
                          <JssRichText
                            field={accordionItem?.trayContent?.jsonValue}
                            className={descriptionClass}
                          />
                          {ctaLink?.jsonValue?.value?.href && <Ctas {...overrideSingleCTAActionStyle(accordionItem, 'link-glow-base', true)} />}
                        </div>
                      </BootstrapAccordion.Body>
                    </BootstrapAccordion.Item>
                    <hr />
                  </React.Fragment>
                )
              );
            })}
          </BootstrapAccordion>
        </Row>
      </Container>
    </>
  );
};

export default Accordion;
