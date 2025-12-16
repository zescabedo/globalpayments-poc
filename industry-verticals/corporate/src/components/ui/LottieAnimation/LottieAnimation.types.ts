export interface LottieAnimationProps {
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  item: {
    lottieJsonData?: {
      jsonValue: {
        value: string;
      };
    };
  };
}
