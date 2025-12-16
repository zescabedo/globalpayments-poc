// Note: ContentSDK uses a different tracking approach
// For now, we'll use a custom implementation or the tracking API from ContentSDK
// This may need to be updated based on ContentSDK tracking capabilities
import { trackingApi } from '@sitecore-content-sdk/nextjs/tracking';
import config from 'temp/config';
import { useCallback } from 'react';
import { AxiosError } from 'axios';
import { dataFetcher } from '@/lib/dataFetcher';
import localDebug from '@/lib/_platform/logging/debug-log';

export const getTrackingApiOptions = (siteName: string) => ({
  host: '/sitecore/api',
  serviceUrl: '/jss/track',
  querystringParams: {
    sc_apikey: config.sitecoreApiKey,
    sc_site: siteName,
  },
  fetcher: dataFetcher,
});

interface SitecoreTracking {
  triggerGoal: (goalDetails: string) => void;
  triggerCampaign: (campaignDetails: string) => void;
  triggerEvent: (eventDetails: string) => void;
  triggerPageView: (pageView: PageView) => void;
  triggerOutcome: (outcome: Outcome) => void;
}

type PageView = {
  pageId: string;
  url: string;
};

type Outcome = {
  url: string;
  pageId: string;
  outcomeId: string;
  monetaryValue: number;
};

const handleError = (error: unknown, context: string) => {
  if (
    !error ||
    !(error as AxiosError).isAxiosError ||
    (error as AxiosError).response?.status !== 400
  ) {
    localDebug.gpn(`Error :: SitecoreTracking > ${context} =>`, error);
  }
};

export const useSitecoreTracking = (siteName: string): SitecoreTracking => {
  const trackingApiOptions = getTrackingApiOptions(siteName);

  const triggerGoal = useCallback((goalDetails: string) => {
    trackingApi
      .trackEvent([{ goalId: goalDetails }], trackingApiOptions)
      .catch((error) => handleError(error, 'triggerGoal'));
  }, []);

  const triggerCampaign = useCallback((campaignDetails: string) => {
    trackingApi
      .trackEvent([{ campaignId: campaignDetails }], trackingApiOptions)
      .catch((error) => handleError(error, 'triggerCampaign'));
  }, []);

  const triggerEvent = useCallback((eventDetails: string) => {
    trackingApi
      .trackEvent([{ eventId: eventDetails }], trackingApiOptions)
      .catch((error) => handleError(error, 'triggerEvent'));
  }, []);

  const triggerPageView = useCallback((pageView: PageView) => {
    trackingApi
      .trackEvent([{ pageId: pageView.pageId, url: pageView.url }], trackingApiOptions)
      .catch((error) => handleError(error, 'triggerPageView'));
  }, []);

  const triggerOutcome = useCallback((outcome: Outcome) => {
    trackingApi
      .trackEvent(
        [
          {
            url: outcome.url,
            pageId: outcome.pageId,
            outcomeId: outcome.outcomeId,
            currencyCode: 'USD',
            monetaryValue: outcome.monetaryValue,
          },
        ],
        trackingApiOptions
      )
      .catch((error) => handleError(error, 'triggerOutcome'));
  }, []);

  return {
    triggerGoal,
    triggerCampaign,
    triggerEvent,
    triggerPageView,
    triggerOutcome,
  };
};

// Non-hook version for use in regular JavaScript
export const triggerSitecoreGoal = (goalDetails: string, siteName: string): void => {
  const trackingApiOptions = getTrackingApiOptions(siteName);

  trackingApi
    .trackEvent([{ goalId: goalDetails }], trackingApiOptions)
    .catch((error) => handleError(error, 'triggerGoal'));
};

// Non-hook version for campaigns
export const triggerSitecoreCampaign = (campaignDetails: string, siteName: string): void => {
  const trackingApiOptions = getTrackingApiOptions(siteName);

  trackingApi
    .trackEvent([{ campaignId: campaignDetails }], trackingApiOptions)
    .catch((error) => handleError(error, 'triggerCampaign'));
};

// Non-hook version for events
export const triggerSitecoreEvent = (eventDetails: string, siteName: string): void => {
  const trackingApiOptions = getTrackingApiOptions(siteName);

  trackingApi
    .trackEvent([{ eventId: eventDetails }], trackingApiOptions)
    .catch((error) => handleError(error, 'triggerEvent'));
};
