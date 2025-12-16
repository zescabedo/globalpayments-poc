import { DEFAULT_AOS_TYPE, DEFAULT_AOS_OFFSET } from '@/constants/aosDefault';

export const getAosAttributes = (props: {
  params?: {
    animationEnabled?: string;
    animationType?: string;
    animationEasing?: string;
    animationDuration?: string;
    animationOffset?: string;
    animationAnchor?: string;
    animationDelay?: string;
    animationAnchorPlacement?: string;
    [key: string]: string | undefined;
  };
}) => {
  const propsParams = props?.params || {};
  const {
    animationEnabled,
    animationType,
    animationEasing,
    animationDuration,
    animationOffset = DEFAULT_AOS_OFFSET,
    animationAnchor,
    animationDelay,
    animationAnchorPlacement,
  } = propsParams ?? {};

  const isAnimationEnabled = animationEnabled === '1';
  const parsedAnimationType = animationType && JSON.parse(animationType)?.Value?.value;
  const parsedAnimationEasing = animationEasing && JSON.parse(animationEasing)?.Value?.value;

  // Only parse anchorPlacement if animationAnchor is not set
  const parsedAnimationAnchorPlacement =
    !animationAnchor && animationAnchorPlacement
      ? JSON.parse(animationAnchorPlacement)?.Value?.value?.toLowerCase()
      : undefined;

  if (!isAnimationEnabled) return {};

  return {
    'data-aos': parsedAnimationType || DEFAULT_AOS_TYPE,
    'data-aos-duration': animationDuration,
    'data-aos-easing': parsedAnimationEasing,
    'data-aos-offset': animationOffset,
    'data-aos-once': 'true',
    ...(animationAnchor && { 'data-aos-anchor': `#${animationAnchor}` }),
    'data-aos-delay': animationDelay,
    ...(!animationAnchor &&
      parsedAnimationAnchorPlacement && {
        'data-aos-anchor-placement': parsedAnimationAnchorPlacement,
      }),
  };
};
