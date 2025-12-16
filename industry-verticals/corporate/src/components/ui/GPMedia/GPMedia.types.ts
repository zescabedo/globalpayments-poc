import { GPImageInterface } from '../Image/Image.types';
import { GPVideoInterface } from '../Video/Video.types';

export type MediaItem = Partial<GPVideoInterface> &
  Partial<GPImageInterface> & {
    lottieJsonData?: JsonValue;
    backgroundMdImage?: ImageObject;
    backgroundSmImage?: ImageObject;
    backgroundVideo?: { jsonValue: { value: VideoObject } };
    backgroundImage?: ImageObject;
  };

export interface GPMediaProps {
  item: MediaItem;
  params?: {
    [key: string]: string;
  };
  className?: string;
}
