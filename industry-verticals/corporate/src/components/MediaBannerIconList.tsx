import MediaBannerIconLists from './layout/MediaBannerIcon/MediaBannerIcon';
import { MediaBannerIconListProps } from './layout/MediaBannerIcon/MediaBannerIcon.types';

export const Offset_Center_4_by_7 = (props: MediaBannerIconListProps): JSX.Element => {
  return <MediaBannerIconLists rendering={props.rendering} params={props.params} />;
};

export const Default = (props: MediaBannerIconListProps): JSX.Element => {
  return <MediaBannerIconLists rendering={props.rendering} params={props.params} />;
};
