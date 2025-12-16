// Updated Analytics Tracking Utils with Sitecore goal and campaign tracking functionality
import { analyticsConstants } from '@/constants/appConstants';
import {
  triggerSitecoreGoal,
  triggerSitecoreCampaign,
} from '@/components/analytics/SitecoreTracking';
import { formatToGuid } from '@/utils/tools';

interface FormModel {
  class: string;
  'data-gpn-form-id': string;
  'data-gpn-form-name': string;
}

// Define proper window interface extensions
interface WindowWithFlags extends Window {
  __analyticsInitDone?: boolean;
  __sitecoreGoalTrackingDone?: boolean;
  __sitecoreCampaignTrackingDone?: boolean;
  __ctaFormTrackingDone?: boolean;
  __searchGoalTrackingDone?: boolean;
  __videoTrackingDone?: boolean;
  __accordionTrackingDone?: boolean;
  __audienceSelectorTrackingDone?: boolean;
  __ctaObserverDone?: boolean;
  __userInteractionTrackingDone?: boolean;
  dataLayer: DataLayerEvent[];
}

// Helper function to get typedWindow safely
const getTypedWindow = (): WindowWithFlags | null => {
  if (typeof window === 'undefined') return null;
  return window as WindowWithFlags;
};

// Remove this problematic line completely:
// const typedWindow = window as WindowWithFlags;

const {
  LaunchLeadGenModal,
  WatchVideo,
  ToggleThroughContent,
  ClickAudienceSelector,
} = analyticsConstants;

// Global flags to prevent duplicate initialization
let ctaObserver: MutationObserver | null = null;
let userInteractionHandler: ((event: Event) => void) | null = null;

// Cleanup function for proper teardown
export const cleanupAnalyticsTracking = (): void => {
  if (typeof window === 'undefined') return;
  const typedWindow = getTypedWindow();
  if (!typedWindow) return;

  // Remove MutationObserver
  if (ctaObserver) {
    ctaObserver.disconnect();
    ctaObserver = null;
  }

  // Remove global event listeners
  if (userInteractionHandler) {
    document.removeEventListener('click', userInteractionHandler);
    userInteractionHandler = null;
  }

  // Reset initialization flag
  delete typedWindow.__analyticsInitDone;
};

// Sitecore goal tracking for elements with data-sc-goal attribute
export const initSitecoreGoalTracking = (siteName: string): void => {
  if (typeof window === 'undefined') return;
  const typedWindow = getTypedWindow();
  if (!typedWindow || typedWindow.__sitecoreGoalTrackingDone) return;

  // Skip if in Experience Editor
  if (document.querySelector('.editing-mode')) {
    return;
  }

  const links = document.querySelectorAll('[data-sc-goal]:not([data-sc-goal-initialized])');
  if (!links.length) {
    typedWindow.__sitecoreGoalTrackingDone = true;
    return;
  }

  links.forEach((element) => {
    element.addEventListener('click', function (this: Element) {
      const goal = this.getAttribute('data-sc-goal');
      const goalId = formatToGuid(goal);

      if (goalId) {
        triggerSitecoreGoal(goalId, siteName);
      }
    });

    element.setAttribute('data-sc-goal-initialized', 'true');
  });

  typedWindow.__sitecoreGoalTrackingDone = true;
};

// Sitecore campaign tracking for elements with data-sc-camp attribute
export const initSitecoreCampaignTracking = (siteName: string): void => {
  if (typeof window === 'undefined') return;
  const typedWindow = getTypedWindow();
  if (!typedWindow || typedWindow.__sitecoreCampaignTrackingDone) return;

  const links = document.querySelectorAll('[data-sc-camp]:not([data-sc-camp-initialized])');
  if (!links.length) {
    typedWindow.__sitecoreCampaignTrackingDone = true;
    return;
  }

  links.forEach((element) => {
    element.addEventListener('click', function (this: Element) {
      const campaign = this.getAttribute('data-sc-camp');
      const campaignId = formatToGuid(campaign);
      if (campaignId) {
        triggerSitecoreCampaign(campaignId, siteName);
      }
    });

    element.setAttribute('data-sc-camp-initialized', 'true');
  });

  typedWindow.__sitecoreCampaignTrackingDone = true;
};

// CTA Form tracking with origin-cta parameter
export const initCTAFormTracking = (siteName: string): void => {
  if (typeof window === 'undefined') return;
  const typedWindow = getTypedWindow();
  if (!typedWindow || typedWindow.__ctaFormTrackingDone) return;

  const ctaLinks = document.querySelectorAll('a.overlay-source:not([data-cta-initialized])');

  ctaLinks.forEach((element) => {
    element.addEventListener('click', function (this: HTMLAnchorElement, event) {
      // Use the same URI checking as the original Overlay.js
      let uri = this.href;
      let useOverlayTarget = false;
      let isOverlayLink = false; // Track if this is actually an overlay link

      const overlayTarget = this.getAttribute('data-overlay-target');
      if (overlayTarget && overlayTarget.length) {
        uri = overlayTarget;
        isOverlayLink = true; // This is an overlay link
        if (overlayTarget[0] === '/') {
          uri = window.location.origin + overlayTarget;
          useOverlayTarget = true;
        }
      }

      const getDELVal = this.getAttribute('data-ea-link');
      if (!getDELVal || getDELVal === '') {
        // If no data-ea-link, don't prevent default - let the link work normally
        return;
      }

      // Only prevent default for overlay links
      if (isOverlayLink || overlayTarget) {
        event.preventDefault();
        event.stopPropagation();
      }

      const checkOriginCTA = uri.includes('origin-cta');

      // Use URL API for querystring handling
      const url = new URL(uri);
      url.searchParams.set('origin-cta', getDELVal);

      if (!checkOriginCTA) {
        if (useOverlayTarget) {
          this.setAttribute('data-overlay-target', url.toString());
        } else {
          this.href = url.toString();
        }
      }

      // Trigger goal
      const goal = this.getAttribute('data-sc-goal');
      const goalId = formatToGuid(goal) || LaunchLeadGenModal;
      triggerSitecoreGoal(goalId, siteName);

      // Set origin CTA attributes after delay
      setTimeout(() => {
        const originCtaFields = document.querySelectorAll('[data-sc-field-name="origin_cta"]');
        originCtaFields.forEach((field) => {
          field.setAttribute('data-origin-cta', getDELVal);
          if (field instanceof HTMLInputElement) {
            field.value = getDELVal;
          }
        });
      }, 2000);
    });

    element.setAttribute('data-cta-initialized', 'true');
  });

  typedWindow.__ctaFormTrackingDone = true;
};

// Component-specific tracking functions
export const initSearchGoalTracking = (siteName: string): void => {
  if (typeof window === 'undefined') return;
  const typedWindow = getTypedWindow();
  if (!typedWindow || typedWindow.__searchGoalTrackingDone) return;

  const searchInputs = document.querySelectorAll('.search-input:not([data-search-initialized])');

  searchInputs.forEach((input) => {
    input.addEventListener('change', () => {
      const goal = input.getAttribute('data-sc-goal');
      const goalId = formatToGuid(goal);
      if (goalId) {
        triggerSitecoreGoal(goalId, siteName);
      }
    });

    input.setAttribute('data-search-initialized', 'true');
  });

  typedWindow.__searchGoalTrackingDone = true;
};

export const initVideoTracking = (siteName: string): void => {
  if (typeof window === 'undefined') return;
  const typedWindow = getTypedWindow();
  if (!typedWindow || typedWindow.__videoTrackingDone) return;

  const videoWrappers = document.querySelectorAll('.gp-video:not([data-video-initialized])');
  const vidyardButtons = document.querySelectorAll(
    '.vidyard-player-embed:not([data-vidyard-initialized])'
  );

  videoWrappers.forEach((wrapper) => {
    wrapper.addEventListener('click', () => {
      const goal = wrapper.getAttribute('data-sc-goal');
      const goalId = formatToGuid(goal) || WatchVideo;
      triggerSitecoreGoal(goalId, siteName);
    });
    wrapper.setAttribute('data-video-initialized', 'true');
  });

  vidyardButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const goal = button.getAttribute('data-sc-goal');
      const goalId = formatToGuid(goal) || WatchVideo;
      triggerSitecoreGoal(goalId, siteName);
    });
    button.setAttribute('data-vidyard-initialized', 'true');
  });

  typedWindow.__videoTrackingDone = true;
};

export const initAccordionTracking = (siteName: string): void => {
  if (typeof window === 'undefined') return;
  const typedWindow = getTypedWindow();
  if (!typedWindow || typedWindow.__accordionTrackingDone) return;

  const accordionHeaders = document.querySelectorAll(
    '.accordion .accordion-header:not([data-accordion-initialized])'
  );

  accordionHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const goal = header.getAttribute('data-sc-goal');
      const goalId = formatToGuid(goal) || ToggleThroughContent;
      triggerSitecoreGoal(goalId, siteName);
    });
    header.setAttribute('data-accordion-initialized', 'true');
  });

  typedWindow.__accordionTrackingDone = true;
};

export const initAudienceSelectorTracking = (siteName: string): void => {
  if (typeof window === 'undefined') return;
  const typedWindow = getTypedWindow();
  if (!typedWindow || typedWindow.__audienceSelectorTrackingDone) return;

  const audienceSelectors = document.querySelectorAll(
    '.audience-selector .tab-item-variant .tab-item:not([data-audience-initialized])'
  );

  audienceSelectors.forEach((selector) => {
    selector.addEventListener('click', () => {
      const goal = selector.getAttribute('data-sc-goal');
      const goalId = formatToGuid(goal) || ClickAudienceSelector;
      triggerSitecoreGoal(goalId, siteName);
    });
    selector.setAttribute('data-audience-initialized', 'true');
  });

  typedWindow.__audienceSelectorTrackingDone = true;
};


export const addGAAttributes = (element: Element | null): void => {
  if (!element) return;

  // Check if manually overridden
  const hasManualOverride =
    element.hasAttribute('data-ea-zone') ||
    element.hasAttribute('data-ea-type') ||
    element.hasAttribute('data-ea-link');

  if (hasManualOverride) return;

  // Determine location
  let location = 'Body';
  if (document.querySelector('header')?.contains(element)) location = 'Header';
  if (document.querySelector('footer')?.contains(element)) location = 'Footer';

  // Generate link text
  const text = element.textContent?.replace(/\s+/g, ' ').trim() || 'Unnamed';
  const linkText = `${window.location.pathname}|${fixForCloudflare(text)}`;

  // Apply attributes
  element.setAttribute('data-ea-zone', location);
  element.setAttribute('data-ea-type', 'click');
  element.setAttribute('data-ea-link', linkText);
  element.setAttribute('data-ea-title', document.title);
};

// Protected CTA observation with singleton pattern
export const observeCTAs = (): void => {
  if (typeof window === 'undefined') return;
  const typedWindow = getTypedWindow();
  if (!typedWindow || typedWindow.__ctaObserverDone) return;

  // 1. Initial tagging of existing CTAs
  document
    .querySelectorAll(
      "a:not([data-ea-link]), a.btn:not([data-ea-link]), a[class*='link']:not([data-ea-link])"
    )
    .forEach((el) => addGAAttributes(el));

  // 2. Set up MutationObserver for dynamically added CTAs (singleton)
  if (ctaObserver) {
    ctaObserver.disconnect();
  }

  ctaObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;

        if (
          node.matches(
            "a:not([data-ea-link]), a.btn:not([data-ea-link]), a[class*='link']:not([data-ea-link])"
          )
        ) {
          addGAAttributes(node);
        }

        node
          .querySelectorAll(
            "a:not([data-ea-link]), a.btn:not([data-ea-link]), a[class*='link']:not([data-ea-link])"
          )
          .forEach(addGAAttributes);
      });
    });
  });

  ctaObserver.observe(document.body, { childList: true, subtree: true });
  typedWindow.__ctaObserverDone = true;
};

const fixForCloudflare = (original: string): string => {
  let linkText = original.trim();
  const words = ['select', 'start', 'more'];
  const replacementWordOnly = '~$1~';
  const replacementMultipleWords = '~$1~ $2';

  words.forEach((element) => {
    const regexWordOnly = new RegExp(`^(${element})$`, 'i');
    const regexMultipleWords = new RegExp(`^(${element})[\\s]+(.*)$`, 'i');

    linkText = linkText.replace(regexWordOnly, replacementWordOnly);
    linkText = linkText.replace(regexMultipleWords, replacementMultipleWords);
  });

  return linkText;
};

// Protected user interaction tracking with singleton pattern
export const trackUserInteractions = (): void => {
  if (typeof window === 'undefined') return;
  const typedWindow = getTypedWindow();
  if (!typedWindow || typedWindow.__userInteractionTrackingDone) return;

  // Remove existing handler if it exists
  if (userInteractionHandler) {
    document.removeEventListener('click', userInteractionHandler);
  }

  userInteractionHandler = (event: Event) => {
    const element = (event.target as Element).closest("a.btn, a[class^='link-']");
    if (!element) return;

    // Use typedWindow for dataLayer access
    typedWindow.dataLayer = typedWindow.dataLayer || [];
    typedWindow.dataLayer.push({
      event: 'cta_click',
      eventCategory: 'User Engagement',
      eventAction: 'Click',
      eventLabel:
        (element as HTMLElement)?.innerText || element.getAttribute('aria-label') || 'Unnamed CTA',
      pagePath: window.location.pathname,
      pageTitle: document.title,
      eaZone: element.getAttribute('data-ea-zone') || 'Body',
      eaType: element.getAttribute('data-ea-type') || 'click',
      eaLink: element.getAttribute('data-ea-link') || window.location.pathname,
    });
  };

  document.addEventListener('click', userInteractionHandler);
  typedWindow.__userInteractionTrackingDone = true;
};

// Main initialization with master singleton pattern
export const initializeAnalyticsTracking = (siteName: string): void => {
  if (typeof window === 'undefined') return;
  const typedWindow = getTypedWindow();
  if (!typedWindow || typedWindow.__analyticsInitDone) return;

  // Basic CTA and interaction tracking
  observeCTAs();
  trackUserInteractions();

  // Initialize all Sitecore-specific tracking
  initSitecoreGoalTracking(siteName);
  initSitecoreCampaignTracking(siteName);
  initCTAFormTracking(siteName);
  initSearchGoalTracking(siteName);
  initVideoTracking(siteName);
  initAccordionTracking(siteName);
  initAudienceSelectorTracking(siteName);

  // Mark as initialized
  typedWindow.__analyticsInitDone = true;
};

export const initialFormDataLayer = (formModel: FormModel) => {
  const typedWindow = getTypedWindow();
  if (!typedWindow) return;

  typedWindow.dataLayer = typedWindow.dataLayer || [];

  const currentFormId = formModel['data-gpn-form-id'];
  const currentFormName = formModel['data-gpn-form-name'];

  // Find the last form_view event (from end)
  const lastFormViewEvent = [...typedWindow.dataLayer]
    .reverse()
    .find((event) => event.event === 'form_view');

  const isSameFormView = lastFormViewEvent && lastFormViewEvent.form?.id === currentFormId;

  if (!isSameFormView) {
    typedWindow.dataLayer.push({
      event: 'form_view',
      form: {
        id: currentFormId,
        name: currentFormName,
      },
    });
  }
};

export const submitFormDataLayer = (formModel: FormModel) => {
  const typedWindow = getTypedWindow();
  if (!typedWindow) return;

  const formElement = document.querySelector(`.${formModel.class}`);
  if (formElement) {
    const lastCtaEaTitle = sessionStorage.getItem('lastCtaEaLink') || '';
    const lastCtaHref = sessionStorage.getItem('lastCtaHref') || '';

    typedWindow.dataLayer = typedWindow.dataLayer || [];
    typedWindow.dataLayer.push({
      event: 'form_submit',
      form: {
        id: formModel['data-gpn-form-id'],
        name: formModel['data-gpn-form-name'],
        click_cta: lastCtaEaTitle,
      },
      virtual_url: lastCtaHref,
    });
    sessionStorage.removeItem('lastCtaEaLink');
    sessionStorage.removeItem('lastCtaHref');
  }
};

export const searchInputDataLayer = (searchText: string) => {
  const typedWindow = getTypedWindow();
  if (!typedWindow) return;

  typedWindow.dataLayer = typedWindow.dataLayer || [];
  typedWindow.dataLayer.push({
    event: 'view_search_results',
    search: {
      term: searchText,
      type: 'site',
    },
  });
};
