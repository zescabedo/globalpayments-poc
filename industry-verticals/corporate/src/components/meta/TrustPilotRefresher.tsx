import { useEffect } from 'react';
import { useRouter } from 'next/router';

const TrustpilotWidgetRefresher = () => {
  const router = useRouter();

  useEffect(() => {
    // Function to initialize Trustpilot widget
    const initializeTrustpilot = () => {
      if (window.Trustpilot) {
        // Check if there are any Trustpilot widgets on the page before attempting to load
        const trustpilotElement = document.querySelector('.trustpilot-widget');
        if (trustpilotElement) {
          window.Trustpilot.loadFromElement(trustpilotElement);
        }
      }
    };

    // Initialize Trustpilot on route change
    initializeTrustpilot();

    // Listen for route changes
    const handleRouteChange = () => {
      initializeTrustpilot();
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Cleanup listener on unmount
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return null;
};

export default TrustpilotWidgetRefresher;
