import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { LottieAnimationProps } from './LottieAnimation.types';
import debug from '@/lib/_platform/logging/debug-log';
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  item,
  loop = true,
  autoplay = true,
  className = '',
}) => {
  const [lottieData, setLottieData] = useState(null);
  const log = debug.gpn;
  useEffect(() => {
    // Ensure lottieJsonData is parsed correctly
    if (item?.lottieJsonData?.jsonValue?.value) {
      try {
        setLottieData(JSON.parse(item?.lottieJsonData?.jsonValue?.value));
      } catch (error) {
        setLottieData(null);
        log(`Failed to parse Lottie JSON data: ${(error as Error).message}`);
      }
    }
  }, [item?.lottieJsonData?.jsonValue?.value]);
  return (
    <Lottie
      className={`lottie-animation ${className}`}
      animationData={lottieData}
      loop={loop}
      autoplay={autoplay}
    />
  );
};

export default LottieAnimation;
