import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import LinkItem from '../Link/Link';
import { EditFrame } from '@sitecore-jss/sitecore-jss-nextjs';
import { moveUpItemButton, moveDownItemButton } from '@/utils/ReorderingSwitcher';
import { LinkFieldValue } from '@sitecore-jss/sitecore-jss-dev-tools';
import React from 'react';
import { useModal } from '../Modal/ModalProvider';
import { ModalConstants } from '@/constants/appConstants';
import { constructUrlWithQuerystring } from '@/utils/urlUtils';

// NOTE - Currently GaOverrideTagging feature is not implemented as there is no suitable case yet came across development. That will be implemented as required with proper understanding of what it exactly does.

const getCtaButtonType = (position: number, buttonType: string, ctaCount: number) => {
  const singleCtaPrimaryRuleOverride = ctaCount === 1;

  if (singleCtaPrimaryRuleOverride) {
    if (buttonType === 'link-glow-base' || buttonType === 'link-glow-bright') {
      return `link-glow ${buttonType}`;
    }
    if (buttonType === 'btn-cta-appstore' || buttonType === 'btn-cta-googleplay') {
      return buttonType;
    }
    if (buttonType === 'link') {
      return buttonType;
    }
    return buttonType ? `btn ${buttonType}` : 'btn btn-cta-primary';
  }

  // Handle case when no buttonType is provided
  if (!buttonType) {
    if (position === 1) return 'btn btn-cta-primary';
    if (position === 2) return 'btn btn-cta-secondary';
    return 'btn btn-cta-tertiary';
  }

  // Handle first position special cases
  if (position === 1) {
    if (buttonType === 'btn-cta-primary') {
      return `btn ${buttonType}`;
    }
    if (buttonType === 'btn-cta-appstore' || buttonType === 'btn-cta-googleplay') {
      return buttonType;
    }
    return 'btn btn-cta-primary';
  }

  // Handle second position and beyond
  const isAppStoreButton = buttonType === 'btn-cta-appstore' || buttonType === 'btn-cta-googleplay';
  if (isAppStoreButton) {
    return buttonType;
  }

  const isLinkGlowButton = buttonType === 'link-glow-base' || buttonType === 'link-glow-bright';
  if (isLinkGlowButton) {
    return `link-glow ${buttonType}`;
  }

  const isPlainLink = buttonType === 'link';
  if (isPlainLink) {
    return buttonType;
  }

  if (buttonType === 'btn-cta-primary') {
    if (position === 2) {
      return 'btn btn-cta-secondary';
    }
    return 'btn btn-cta-tertiary';
  }

  // For any other buttonType
  if (position === 2) {
    return `btn ${buttonType}`;
  }

  return `btn ${buttonType || 'btn-cta-tertiary'}`;
};

const Ctas = (props: CtaGroupInterface): JSX.Element => {
  const {
    ctasParent,
    ctaLink,
    ctaTitle,
    overrideActionStyle,
    openInModal,
    modalTheme,
    tabIndex,
    modalWidth,
    modalHeight,
    triggerGoal,
    triggerCampaign,
  } = props;
  const { openModal } = useModal();
  const { defaultModalWidth, defaultModalHeight } = ModalConstants;

  const layout =
    ctasParent?.results?.[0]?.displayIn?.targetItem?.value?.jsonValue?.value ||
    'cta-layout-horizontal';

  const ctas = ctasParent?.results?.[0]?.ctas?.results || [];

  if (ctas && ctas.length > 0) {
    return (
      <>
        <div className={`cta-list ${layout}`}>
          {ctas.map((ctaItem, index) => {
            const linkTitle = ctaItem?.ctaTitle?.jsonValue?.value || '';
            ctaItem.ctaLink.jsonValue.value.text = linkTitle
              ? linkTitle
              : ctaItem?.ctaLink?.jsonValue?.value?.text;
            const actionStyle =
              ctaItem?.overrideActionStyle?.targetItem?.value?.jsonValue?.value?.toLowerCase() ||
              '';
            const className = getCtaButtonType(index + 1, actionStyle, ctas.length);

            // Check if this CTA should open in a modal
            const shouldOpenInModal = ctaItem?.openInModal?.jsonValue?.value === true;

            // Properly construct href with querystring sanitization
            const baseHref = ctaItem?.ctaLink?.jsonValue?.value?.href || '';
            const querystring = ctaItem?.ctaLink?.jsonValue?.value?.querystring;
            const linkHref = constructUrlWithQuerystring(baseHref, querystring);

            const ctaModalTheme = ctaItem?.modalTheme?.targetItem?.value?.jsonValue?.value || '';
            const goalId = ctaItem?.triggerGoal?.jsonValue?.id || '';
            const campaignId = ctaItem?.triggerCampaign?.jsonValue?.id || '';
            const modalWidthValue = ctaItem?.modalWidth?.jsonValue?.value || defaultModalWidth;
            const modalHeightValue = ctaItem?.modalHeight?.jsonValue?.value || defaultModalHeight;

            return (
              <EditFrame
                key={index}
                title="Move CTA Item"
                dataSource={{ itemId: ctaItem?.id + '' }}
                buttons={[moveUpItemButton, moveDownItemButton]}
              >
                {ctaItem?.ctaLink?.jsonValue &&
                  (shouldOpenInModal ? (
                    <LinkItem
                      openInModal={shouldOpenInModal}
                      onClick={() =>
                        openModal(linkHref, ctaModalTheme, modalHeightValue, modalWidthValue)
                      }
                      field={ctaItem?.ctaLink.jsonValue}
                      value={ctaItem?.ctaLink.jsonValue.value as LinkFieldValue}
                      className={className}
                      tabIndex={tabIndex}
                      data-sc-goal={goalId}
                      data-sc-camp={campaignId}
                    />
                  ) : (
                    <LinkItem
                      field={ctaItem?.ctaLink.jsonValue}
                      value={ctaItem?.ctaLink.jsonValue.value as LinkFieldValue}
                      className={className}
                      tabIndex={tabIndex}
                      data-sc-goal={goalId}
                      data-sc-camp={campaignId}
                    />
                  ))}
              </EditFrame>
            );
          })}
        </div>
      </>
    );
  }

  if (ctaLink) {
    const linkTitle = ctaTitle?.jsonValue?.value || '';
    ctaLink.jsonValue.value.text = linkTitle ? linkTitle : ctaLink?.jsonValue?.value?.text;
    const actionStyle =
      overrideActionStyle?.targetItem?.value?.jsonValue?.value?.toLowerCase() || '';
    const className = getCtaButtonType(1, actionStyle, 1);

    // Check if this single CTA should open in a modal
    const shouldOpenInModal = openInModal?.jsonValue?.value ?? false;
    const baseHref = ctaLink?.jsonValue?.value?.href || '';
    const querystring = ctaLink?.jsonValue?.value?.querystring;
    const linkHref = constructUrlWithQuerystring(baseHref, querystring);

    const ctaModalTheme = modalTheme?.targetItem?.value?.jsonValue?.value || '';
    const goalId = triggerGoal?.jsonValue?.id || '';
    const campaignId = triggerCampaign?.jsonValue?.id || '';
    const modalWidthValue = modalWidth?.jsonValue?.value || defaultModalWidth;
    const modalHeightValue = modalHeight?.jsonValue?.value || defaultModalHeight;

    return (
      <>
        {ctaLink?.jsonValue &&
          (shouldOpenInModal ? (
            <LinkItem
              openInModal={shouldOpenInModal}
              onClick={() => openModal(linkHref, ctaModalTheme, modalHeightValue, modalWidthValue)}
              field={ctaLink.jsonValue}
              value={ctaLink.jsonValue.value as LinkFieldValue}
              className={className}
              tabIndex={tabIndex}
              data-sc-goal={goalId}
              data-sc-camp={campaignId}
            />
          ) : (
            <LinkItem
              field={ctaLink.jsonValue}
              value={ctaLink.jsonValue.value as LinkFieldValue}
              className={className}
              tabIndex={tabIndex}
              data-sc-goal={goalId}
              data-sc-camp={campaignId}
            />
          ))}
      </>
    );
  }

  return <></>;
};

export default Ctas;
