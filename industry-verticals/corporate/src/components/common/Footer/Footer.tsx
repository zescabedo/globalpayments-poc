import React, { useMemo } from 'react';
import { Container, Row } from 'react-bootstrap';
import { FooterLinkItem, FooterProps } from './Footer.types';
import ImageItem from '@/components/ui/Image/ImageItem';
import { RichText as JssRichText } from '@sitecore-jss/sitecore-jss-react';
import LinkItem from '@/components/ui/Link/Link';
import { FooterConstants } from '@/constants/appConstants';
import { LinkFieldValue } from '@sitecore-jss/sitecore-jss-dev-tools';
import { useModal } from '@/components/ui/Modal/ModalProvider';
import { isEmptyRichText } from '@/utils/isEmptyRichtext';
import { useShouldRender } from '@/utils/useShouldRender';

const renderLinks = (links: FooterLinkItem[]) => {
  return links.map((linkItem, index) => {
    const linkItemField = linkItem?.footerLink?.jsonValue;
    const linkItemFieldValue = linkItem?.footerLink?.jsonValue?.value;

    return (
      linkItemFieldValue?.href && (
        <li key={index}>
          <LinkItem
            className={`${linkItemFieldValue?.linktype === 'external' && 'link-external'} link-xs footer-link`}
            field={linkItemField}
            value={linkItemFieldValue as LinkFieldValue}
          />
        </li>
      )
    );
  });
};

export const Default = (props: FooterProps): JSX.Element => {
  const shouldRender = useShouldRender();
  const { openModal } = useModal();

  const {
    defaultFooterBackgroundColorVariant,
    defaultFooterNumberOfItemsInFirstColumn,
    defaultRegionSelectorModalTheme,
  } = FooterConstants;
  const id = props?.params?.RenderingIdentifier;
  const propsFieldData = props?.fields?.data?.item;
  const showRegionSelector = propsFieldData?.showRegionSelector?.jsonValue?.value;
  const showSubscribeCta = propsFieldData?.showSubscribeCta?.jsonValue?.value;
  const showActionCta = propsFieldData?.showActionCta?.jsonValue?.value;
  const showFooterLinks = propsFieldData?.showFooterLinks?.jsonValue?.value;
  const regionSelectorLinkField = propsFieldData?.regionSelectorModal?.jsonValue;
  const regionSelectorLinkFieldValue = propsFieldData?.regionSelectorModal?.jsonValue?.value;
  const showRegionSelectorInModal = propsFieldData?.showRegionSelectorInModal?.jsonValue?.value;
  const footerNumberOfItemsInFirstColumn =
    Number(propsFieldData?.footerNumberOfItemsInFirstColumn?.jsonValue?.value) ||
    defaultFooterNumberOfItemsInFirstColumn;
  const footerLinks = propsFieldData?.footerLinks?.targetItems || [];
  const actionCtaTitle =
    propsFieldData?.actionCtaTitle?.jsonValue || propsFieldData?.actionCtaText?.jsonValue;
  const actionCtaLinkField = propsFieldData?.actionCtaLink?.jsonValue;
  const actionCtaText = propsFieldData?.actionCtaText?.jsonValue;
  const actionCtaLinkFieldValue = propsFieldData?.actionCtaLink?.jsonValue?.value;
  if (actionCtaText?.value) {
    actionCtaLinkFieldValue.text = actionCtaText.value;
  }
  const socialIconsTitle = propsFieldData?.socialIconsTitle?.jsonValue;
  const socialIcons = propsFieldData?.socialIcons?.targetItems || [];
  const subscribeCtaTitle = propsFieldData?.subscribeCtaTitle?.jsonValue;
  const subscribeCtaText = propsFieldData?.subscribeCtaText?.jsonValue;
  const subscribeCtaLinkField = propsFieldData?.subscribeCtaLink?.jsonValue;
  const subscribeCtaLinkFieldValue = propsFieldData?.subscribeCtaLink?.jsonValue?.value;
  const leftColumnTitle = propsFieldData?.leftColumnTitle?.jsonValue;
  const leftColumnDetails = propsFieldData?.leftColumnDetails?.jsonValue;
  const middleColumnTitle = propsFieldData?.middleColumnTitle?.jsonValue;
  const middleColumnDetails = propsFieldData?.middleColumnDetails?.jsonValue;
  const rightColumnTitle = propsFieldData?.rightColumnTitle?.jsonValue;
  const rightColumnDetails = propsFieldData?.rightColumnDetails?.jsonValue;
  const disclaimer = propsFieldData?.disclaimer?.jsonValue;
  const copyright = propsFieldData?.copyright?.jsonValue;
  const links = propsFieldData?.links?.jsonValue;
  const regionSelectorModalTheme =
    propsFieldData?.regionSelectorModalTheme?.targetItem?.value?.jsonValue?.value ||
    defaultRegionSelectorModalTheme;

  const backgroundColorVariant =
    (props?.params?.backgroundColorVariant &&
      JSON.parse(props?.params?.backgroundColorVariant)?.Value?.value) ||
    defaultFooterBackgroundColorVariant;
  const isLightVariant =
    backgroundColorVariant === 'light' ||
    backgroundColorVariant === 'white' ||
    backgroundColorVariant === 'subtle' ||
    backgroundColorVariant === 'faint';
  const outlineButtonClass = isLightVariant ? 'btn-outline-base' : 'btn-outline-white';
  const svgIconClass = isLightVariant ? 'black' : 'white';

  const { columnOneLinks, columnTwoLinks } = useMemo(() => {
    const columnOneLinks = footerLinks.slice(0, footerNumberOfItemsInFirstColumn);
    const columnTwoLinks = footerLinks.slice(footerNumberOfItemsInFirstColumn);
    return { columnOneLinks, columnTwoLinks };
  }, [footerLinks, footerNumberOfItemsInFirstColumn]);

  const hasMiddleRowContent: boolean = useMemo(() => {
    return Boolean(
      (leftColumnTitle?.value && !isEmptyRichText(leftColumnTitle?.value)) ||
        (leftColumnDetails?.value && !isEmptyRichText(leftColumnDetails?.value)) ||
        (middleColumnTitle?.value && !isEmptyRichText(middleColumnTitle?.value)) ||
        (middleColumnDetails?.value && !isEmptyRichText(middleColumnDetails?.value)) ||
        (rightColumnTitle?.value && !isEmptyRichText(rightColumnTitle?.value)) ||
        (rightColumnDetails?.value && !isEmptyRichText(rightColumnDetails?.value))
    );
  }, [
    leftColumnTitle,
    leftColumnDetails,
    middleColumnTitle,
    middleColumnDetails,
    rightColumnTitle,
    rightColumnDetails,
  ]);

  return (
    <div className={`footer bg-${backgroundColorVariant}`} id={id ? id : undefined}>
      <Container>
        <Row className="first-row">
          <div className="logo-column">
            {shouldRender(propsFieldData?.logo?.src) && (
              <ImageItem
                field={propsFieldData?.logo?.jsonValue}
                nextImageSrc={propsFieldData?.logo?.jsonValue?.value?.src}
              />
            )}
            {showRegionSelector && shouldRender(regionSelectorLinkFieldValue?.href) && (
              <div className="region-selector">
                <LinkItem
                  className={`btn ${outlineButtonClass} btn-sm with-icon`}
                  field={regionSelectorLinkField}
                  value={regionSelectorLinkFieldValue as LinkFieldValue}
                  onClick={() =>
                    openModal(regionSelectorLinkFieldValue.href!, regionSelectorModalTheme)
                  }
                  openInModal={showRegionSelectorInModal}
                  icon={
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`svgicon ${svgIconClass} hover-reverse`}
                    >
                      <path
                        className="svg-icon-fill"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6.79157 13.0416C7.95476 13.0416 9.03115 12.7508 10.0207 12.1692C11.0103 11.5876 11.7959 10.8021 12.3775 9.81248C12.9591 8.8229 13.2499 7.74651 13.2499 6.58332C13.2499 5.42013 12.9591 4.34374 12.3775 3.35416C11.7959 2.36458 11.0103 1.57899 10.0207 0.997394C9.03115 0.415798 7.95476 0.125 6.79157 0.125C5.62838 0.125 4.55199 0.415798 3.56241 0.997394C2.57283 1.57899 1.78724 2.36458 1.20565 3.35416C0.62405 4.34374 0.333252 5.42013 0.333252 6.58332C0.333252 7.74651 0.62405 8.8229 1.20565 9.81248C1.78724 10.8021 2.57283 11.5876 3.56241 12.1692C4.55199 12.7508 5.62838 13.0416 6.79157 13.0416ZM8.53635 4.08332H5.04678C5.394 2.76388 5.97559 1.73958 6.79156 1.01041C7.60753 1.73958 8.18913 2.76388 8.53635 4.08332ZM11.8436 4.08332H9.42176C9.12663 2.90277 8.65788 1.90451 8.01552 1.08854C8.84885 1.27951 9.59971 1.63541 10.2681 2.15624C10.9365 2.67708 11.4617 3.31944 11.8436 4.08332ZM4.16137 4.08332H1.7395C2.12144 3.31944 2.64661 2.67708 3.31501 2.15624C3.98342 1.63541 4.73428 1.27951 5.56761 1.08854C4.92525 1.90451 4.4565 2.90277 4.16137 4.08332ZM12.1561 8.24997H9.57801C9.75162 7.13887 9.75162 6.02776 9.57801 4.91665H12.1561C12.5034 6.02776 12.5034 7.13887 12.1561 8.24997ZM8.74469 8.24997H4.83844C4.64747 7.13887 4.64747 6.02776 4.83844 4.91665H8.74469C8.93566 6.02776 8.93566 7.13887 8.74469 8.24997ZM4.00512 8.24997H1.427C1.07978 7.13887 1.07978 6.02776 1.427 4.91665H4.00512C3.83151 6.02776 3.83151 7.13887 4.00512 8.24997ZM6.79156 12.1562C5.97559 11.427 5.394 10.4027 5.04678 9.0833H8.53635C8.18913 10.4027 7.60753 11.427 6.79156 12.1562ZM5.56761 12.0781C4.73428 11.8871 3.98342 11.5312 3.31501 11.0104C2.64661 10.4895 2.12144 9.84719 1.7395 9.0833H4.18741C4.46519 10.2639 4.92525 11.2621 5.56761 12.0781ZM8.01552 12.0781C8.65788 11.2621 9.11794 10.2639 9.39572 9.0833H11.8436C11.4617 9.84719 10.9365 10.4895 10.2681 11.0104C9.59971 11.5312 8.84885 11.8871 8.01552 12.0781Z"
                        fill="none"
                      ></path>
                    </svg>
                  }
                />
              </div>
            )}
            {shouldRender(propsFieldData?.trustpilotSnippetCode?.jsonValue?.fields?.TrustpilotCode?.value) && (
              <div className="trustpilot-container">
                <JssRichText field={propsFieldData?.trustpilotSnippetCode?.jsonValue?.fields?.TrustpilotCode} />
              </div>
            )}
          </div>
          {showFooterLinks && footerLinks && footerLinks?.length && (
            <div className="links-column">
              <div className="row">
                <div className="first-set-links">
                  <ul>{renderLinks(columnOneLinks)}</ul>
                </div>
                <div className="second-set-links">
                  <ul>{renderLinks(columnTwoLinks)}</ul>
                </div>
              </div>
            </div>
          )}
          {showActionCta && (
            <div className="cta-column">
              {shouldRender(actionCtaTitle?.value) && (
                <JssRichText tag="p" className="cta-title" field={actionCtaTitle} />
              )}
              {shouldRender(actionCtaLinkFieldValue?.href) && (
                <LinkItem
                  className='btn btn-outline-base btn-sm'
                  field={actionCtaLinkField}
                  value={actionCtaLinkFieldValue as LinkFieldValue}
                />
              )}
            </div>
          )}
          {(socialIcons?.length || showSubscribeCta) && (
            <div className="social-column">
              <div className="social-links-container">
                {shouldRender(socialIconsTitle?.value) && (
                  <JssRichText className="column-title" tag="p" field={socialIconsTitle} />
                )}
                {socialIcons && socialIcons?.length && (
                  <ul className="social-links">
                    {socialIcons?.map((socialIcon, index) => {
                      const socialLinkField = socialIcon?.url?.jsonValue;
                      const socialLinkFieldValue = socialIcon?.url?.jsonValue?.value;
                      return (
                        shouldRender(socialLinkFieldValue?.href) && (
                          <li key={index}>
                            <LinkItem
                              className="footer-link"
                              field={socialLinkField}
                              value={socialLinkFieldValue as LinkFieldValue}
                              icon={
                                <ImageItem
                                  field={socialIcon?.image?.jsonValue}
                                  nextImageSrc={socialIcon?.image?.src}
                                />
                              }
                            />
                          </li>
                        )
                      );
                    })}
                  </ul>
                )}
              </div>
              {showSubscribeCta && (
                <div className="subscribe-cta-container">
                  {shouldRender(subscribeCtaTitle?.value) && (
                    <JssRichText className="column-title" tag="p" field={subscribeCtaTitle} />
                  )}
                  {subscribeCtaText && (
                    <div className="subscribe-cta-text">
                      {shouldRender(subscribeCtaText?.value) && (
                        <JssRichText tag="p" field={subscribeCtaText} />
                      )}
                      {shouldRender(subscribeCtaLinkFieldValue?.href) && (
                        <LinkItem
                          field={subscribeCtaLinkField}
                          value={subscribeCtaLinkFieldValue as LinkFieldValue}
                          openInModal={true}
                          onClick={() => openModal(subscribeCtaLinkFieldValue?.href as string)}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Row>

        {/* Only show first hr if there's content in first row AND either middle section or third row has content */}
        {hasMiddleRowContent && (
          <div className="hr-row">
            <hr />
          </div>
        )}

        {hasMiddleRowContent && (
          <>
            <Row className="middle-content-section">
              {(shouldRender(leftColumnTitle?.value) || shouldRender(leftColumnDetails?.value)) && (
                <div className="left-column">
                {shouldRender(leftColumnTitle?.value) && (
                  <JssRichText className="title" tag="p" field={leftColumnTitle} />
                )}
                {shouldRender(leftColumnDetails?.value) && (
                  <JssRichText className="details" field={leftColumnDetails} />
                  )}
                </div>
              )}
              {(shouldRender(middleColumnTitle?.value) || shouldRender(middleColumnDetails?.value)) && (
                <div className="middle-column">
                {shouldRender(middleColumnTitle?.value) && (
                  <JssRichText className="title" tag="p" field={middleColumnTitle} />
                )}
                {shouldRender(middleColumnDetails?.value) && (
                  <JssRichText className="details" field={middleColumnDetails} />
                )}
              </div>
              )}
              {(shouldRender(rightColumnTitle?.value) || shouldRender(rightColumnDetails?.value)) && (
                <div className="right-column">
                  {shouldRender(rightColumnTitle?.value) && (
                    <JssRichText className="title" tag="p" field={rightColumnTitle} />
                  )}
                  {shouldRender(rightColumnDetails?.value) && (
                    <JssRichText className="details" field={rightColumnDetails} />
                  )}
                </div>
              )}
            </Row>
          </>
        )}
        <div className="hr-row">
          <hr />
        </div>
        <Row className="third-row">
          <div className="bottom-section">
            <div className="text-content">
              {shouldRender(disclaimer?.value) && (
                <JssRichText className="disclaimer" field={disclaimer} />
              )}
              <div className="copyright-container">
                <div className="copyright">
                  {shouldRender(copyright?.value) && (
                    <>
                      <span>&copy; {new Date().getFullYear()}</span>
                      <JssRichText tag="span" className="copyright-text" field={copyright} />
                    </>
                  )}
                </div>
              </div>
            </div>
            {shouldRender(links?.value) && (
              <JssRichText tag="span" className="links" field={links} />
            )}
          </div>
        </Row>
      </Container>
    </div>
  );
};
