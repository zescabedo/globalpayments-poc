import React, { useEffect } from 'react';
import { useSitecoreContext } from '@sitecore-content-sdk/nextjs';
import { useSitecoreTracking } from './SitecoreTracking';
import config from '@/temp/config';

interface PageViewTrackerProps {
  children: React.ReactNode;
  trackingDisabled?: boolean;
}

export const PageViewTracker: React.FC<PageViewTrackerProps> = ({ children, trackingDisabled }) => {
  const { sitecoreContext } = useSitecoreContext();
  const siteName = sitecoreContext?.site?.name || config.sitecoreSiteName;
  const { triggerPageView } = useSitecoreTracking(siteName);

  useEffect(() => {
    // Skip tracking if trackingDisabled flag is true
    if (trackingDisabled) {
      return;
    }

    if (sitecoreContext?.route) {
      const pageId = sitecoreContext.route.itemId || '';
      const url = window.location.pathname;

      triggerPageView({
        pageId,
        url,
      });
    }
  }, [sitecoreContext?.route, triggerPageView]);

  return <>{children}</>;
};

export default PageViewTracker;
