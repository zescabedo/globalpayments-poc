import { formatToGuid } from '@/utils/tools';
import { GPVideoInterface } from './Video.types';
import { EditFrame, useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import React, { forwardRef } from 'react';
import { useEffect, useState } from 'react';

const editFrameButtons = [
  {
    header: 'FieldEditButton',
    icon: '/~/icon/Office/16x16/pencil.png',
    fields: ['MainVideo'],
    tooltip: 'Click to edit the main video field directly in the editor',
  },
];

const getEditFrameProps = (dataSource?: string) => ({
  dataSource: dataSource ? { itemId: dataSource } : undefined,
  buttons: editFrameButtons,
  title: 'Edit Video',
  tooltip: 'Modify the video content within this section',
  cssClass: 'jss-edit-frame',
  parameters: {},
});

interface GPVideoProps {
  item: GPVideoInterface;
  className?: string;
  videoRef?: React.Ref<HTMLVideoElement>;
}

export const GPVideo = forwardRef<HTMLVideoElement, GPVideoProps>(
  ({ item, className, videoRef }, ref) => {
    const internalRef = React.useRef<HTMLVideoElement>(null);
    const resolvedRef = videoRef || ref || internalRef;
    const { sitecoreContext } = useSitecoreContext();
    const isEditing = sitecoreContext && sitecoreContext?.pageEditing;
    const videoUrl = item?.mainVideo?.jsonValue?.value?.href;
    const vidyardId = item?.vidyardId?.jsonValue?.value;
    const showVideoInModal = item?.showVideoInModal?.jsonValue?.value;

    const dataSorceId = item?.id || '';
    const formattedId = formatToGuid(dataSorceId);

    const [isClient, setIsClient] = useState(false);

    // Ensure client-side only rendering
    useEffect(() => {
      setIsClient(true);
    }, []);

    if (!videoUrl && !isEditing && !vidyardId) return null;

    const videoElement = videoUrl ? (
      <video
        ref={resolvedRef}
        autoPlay
        loop
        muted
        playsInline
        className={`gp-video ${className}` || ''}
        poster={item?.mainImage?.src || ''}
      >
        <source src={videoUrl || ''} />
        Your browser does not support the video tag.
      </video>
    ) : vidyardId && isClient ? (
      <div className="vidyard-video">
        <div
          className="vidyard-player-embed"
          data-uuid={vidyardId}
          data-v="4"
          data-type={showVideoInModal ? 'lightbox' : 'inline'}
          data-autoplay="1"
        ></div>
      </div>
    ) : isEditing ? (
      <span>Edit Video</span>
    ) : null;

    return isEditing ? (
      <EditFrame {...getEditFrameProps(`${formattedId}`)}>{videoElement}</EditFrame>
    ) : (
      videoElement
    );
  }
);

GPVideo.displayName = 'GPVideo';
