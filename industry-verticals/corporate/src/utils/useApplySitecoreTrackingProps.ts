import { useMemo } from 'react';

const useApplySitecoreTrackingProps = (goalId?: string, campaignId?: string) => {
  return useMemo(() => {
    const trackingProps: Record<string, string> = {};
    if (goalId) trackingProps['data-sc-goal'] = goalId;
    if (campaignId) trackingProps['data-sc-camp'] = campaignId;
    return trackingProps;
  }, [goalId, campaignId]);
};

export default useApplySitecoreTrackingProps;
