import { DateTime } from 'luxon';

const COOKIE_EXPIRY_DAYS = 30;
const ALLOWED_TRACKING_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'li_fat_id',
  'affiliateid',
];

const saveParamsToCookie = (params: Record<string, string>) => {
  const expiryDate = DateTime.now().plus({ days: COOKIE_EXPIRY_DAYS }).toJSDate().toUTCString();

  Object.entries(params).forEach(([key, value]) => {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; expires=${expiryDate}`;
  });
};

const getParamsFromCookies = (): Record<string, string> => {
  const cookies = document.cookie.split('; ');
  const result: Record<string, string> = {};

  cookies.forEach((cookie) => {
    const [key, value] = cookie.split('=');
    if (ALLOWED_TRACKING_KEYS.includes(key)) {
      result[key] = decodeURIComponent(value || '');
    }
  });

  return result;
};

const getTrackingParameters = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const trackingParams: Record<string, string> = {};

  params.forEach((value, key) => {
    if (ALLOWED_TRACKING_KEYS.includes(key)) {
      trackingParams[key] = value;
    }
  });

  if (Object.keys(trackingParams).length > 0) {
    saveParamsToCookie(trackingParams);
    return trackingParams;
  }

  return getParamsFromCookies();
};

export const populateTrackingFields = (doc: Document = document): void => {
  const trackingParams = getTrackingParameters();
  if (Object.keys(trackingParams).length === 0) return;

  doc.querySelectorAll('form').forEach((form) => {
    Object.entries(trackingParams).forEach(([key, value]) => {
      const inputField = form.querySelector<HTMLInputElement>(
        `input[type='hidden'][class*='${key}']`
      );
      if (inputField) {
        inputField.value = value;
      }
    });
  });
};

export const observeFormsForTracking = (doc: Document = document): void => {
  const observer = new MutationObserver(() => {
    populateTrackingFields(doc);
  });

  observer.observe(doc.body, {
    childList: true,
    subtree: true,
  });

  // Initial pass
  populateTrackingFields(doc);
};

function hookIframe(iframe: HTMLIFrameElement) {
  const onLoad = () => {
    const doc = iframe.contentDocument;
    if (doc?.body) {
      observeFormsForTracking(doc);
    }
  };

  // Already loaded
  if (iframe.contentDocument?.readyState === 'complete') {
    onLoad();
  } else {
    iframe.addEventListener('load', onLoad);
  }
}

export const bootstrapTracking = (): void => {
  observeFormsForTracking(document);

  document.querySelectorAll('iframe').forEach((iframe) => {
    hookIframe(iframe as HTMLIFrameElement);
  });

  const frameObserver = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (node instanceof HTMLIFrameElement) {
          hookIframe(node);
        }
      });
    });
  });

  frameObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

// Auto-start once the top-level DOM is ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    bootstrapTracking();
  });
}
