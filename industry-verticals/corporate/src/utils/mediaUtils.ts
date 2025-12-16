import { MediaItem } from '@/components/ui/GPMedia/GPMedia.types';
import { YOUTUBE_VIDEO_ID_REGEX } from '@/constants/appConstants';

export const getMediaType = (item: MediaItem, className?: string) => {
  const isVideoVariant = className === 'tall-wide-video';
  const hasBackgroundVideo = isVideoVariant && !!item?.backgroundVideo?.jsonValue?.value?.href;
  const hasImage =
    item?.backgroundImage?.src ||
    item?.backgroundMdImage?.src ||
    item?.backgroundSmImage?.src ||
    item?.mainImage?.jsonValue ||
    item?.mainMdImage?.jsonValue ||
    item?.mainSmImage?.jsonValue;
  if (item?.lottieJsonData?.jsonValue?.value) return 'lottie';
  if (hasBackgroundVideo || item?.mainVideo?.jsonValue?.value?.href) return 'video';
  if (hasImage) return 'image';
  return '';
};

export const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = YOUTUBE_VIDEO_ID_REGEX;
  const match = url.match(regExp);
  return match ? match[1] : null;
};
