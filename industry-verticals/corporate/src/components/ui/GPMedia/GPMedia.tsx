import React from 'react';
import LottieAnimation from '../LottieAnimation/LottieAnimation';
import { GPVideo } from '../Video/GPVideo';
import { GPImage } from '../Image/GPImage';
import { GPImageInterface } from '../Image/Image.types';
import { GPVideoInterface } from '../Video/Video.types';
import { GPMediaProps } from './GPMedia.types';
import { getMediaType } from '@/utils/mediaUtils';

export const GPMedia: React.FC<GPMediaProps> = ({ item, params, className }) => {
  const mediaType = getMediaType(item);

  const renderMedia = () => {
    switch (mediaType) {
      case 'lottie':
        return <LottieAnimation className={`${className} ${mediaType}`} item={item} />;
      case 'video':
        return <GPVideo className={`${className} ${mediaType}`} item={item as GPVideoInterface} />;
      case 'image':
        return (
          <GPImage
            className={`${className} ${mediaType}`}
            item={item as GPImageInterface}
            params={params}
          />
        );
      default:
        return null;
    }
  };

  return renderMedia();
};

export default GPMedia;
