import { useRef, useState } from 'react';
import { FeaturedHerotypes } from './featuredhero.types';
import Ctas from '@/components/ui/CTA/CTA';
import Heading from '@/components/ui/Heading/Heading';
import { EditFrame, RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { GPImage } from '@/components/ui/Image/GPImage';
import { Container, Row } from 'react-bootstrap';
import { formatToGuid } from '@/utils/tools';

import {
  EditFrameBackgroundImageWithFocusButton,
  editFrameMainVideoButtons,
} from '@/utils/SiteCoreCustomEditBtn';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { FeaturedHeroConstants } from '@/constants/appConstants';
import { getYouTubeVideoId } from '@/utils/mediaUtils';
import { useShouldRender } from '@/utils/useShouldRender';
import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';

export const Default = (props: FeaturedHerotypes): JSX.Element => {
  const { params, fields } = props || {};
  const shouldRender = useShouldRender();

  //Params
  const headingSize =
    (params?.titleHeadingLevel && JSON.parse(params?.titleHeadingLevel)?.Value?.value) ||
    FeaturedHeroConstants.defaultTitleHeadingLevel;
  const heroBackground = params?.heroBackground
    ? `featured-bg-${JSON.parse(params?.heroBackground)?.Value?.value}`
    : 'featured-bg-base';
  const squareCornersClass = params?.imageSquareCorners === '1' ? 'square-corners' : '';

  //fields
  const item = fields?.data?.item;
  const dataSourceId = item?.id || '';
  const videoType = item?.videoType?.jsonValue?.fields?.Value?.value;
  const formattedId = formatToGuid(dataSourceId);
  const titleField = item?.title?.jsonValue;
  const tagField = item?.tag?.jsonValue;
  const details = item?.details?.jsonValue;
  const videoPause = item?.videoPause?.jsonValue?.value;
  const videoPlay = item?.videoPlay?.jsonValue?.value;
  const mainVideo = item?.mainVideo?.jsonValue?.value?.href || '';
  const vidyardId = item?.vidyardId?.jsonValue?.value;
  const ctasParent = item?.ctasParent;
  const backgroundImage = item?.backgroundImage;
  const backgroundMdImage = item?.backgroundMdImage;
  const backgroundSmImage = item?.backgroundSmImage;
  const focusXDesktop = item?.focusXDesktop?.jsonValue?.value;
  const focusMediaSize = item?.mediaSize?.targetItem?.Value?.jsonValue?.value;
  const focusYDesktop = item?.focusYDesktop?.jsonValue?.value;
  const focusXTablet = item?.focusXTablet?.jsonValue?.value;
  const focusYTablet = item?.focusYTablet?.jsonValue?.value;
  const focusXMobile = item?.focusXMobile?.jsonValue?.value;
  const focusYMobile = item?.focusYMobile?.jsonValue?.value;
  const showVideoInModal = item?.showVideoInModal?.jsonValue?.value;
  const [videoState, setVideoState] = useState<string>('video_start');

  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      const videoElement = videoRef.current;
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setShowControls(isPlaying);
      setIsPlaying(!isPlaying);
      const currentTime = videoElement.currentTime;
      const duration = videoElement.duration;
      const percent = (currentTime / duration) * 100;
      let newVideoState = 'video_start';
      if (percent > 0 && percent < 100) {
        newVideoState = 'video_progress';
      } else if (percent === 100) {
        newVideoState = 'video_complete';
      }
      setVideoState(newVideoState);

      if (window.dataLayer) {
        window.dataLayer.push({
          event: videoState,
          video: {
            id: item?.mainVideo?.jsonValue?.value?.id, // Video ID
            current_time: currentTime.toFixed(2), // Current time of video
            duration: duration.toFixed(2), // Total duration
            percent: percent.toFixed(2), // Percentage of video watched
            provider: item?.videoType?.jsonValue?.name,
            title: item?.mainVideo?.jsonValue?.value?.text || 'Unknown Video', // Video title
          },
        });
      }
    }
  };

  const handleVideoHover = () => {
    if (isPlaying) {
      setShowControls(true);
    }
  };

  const handleVideoLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  const getEditFrameProps = (dataSource?: string) => ({
    dataSource: dataSource ? { itemId: dataSource } : undefined,
    buttons: EditFrameBackgroundImageWithFocusButton,
    title: 'Edit background image',
    tooltip: 'Modify the background content within this section',

    cssClass: 'jss-edit-frame',
    parameters: {},
  });

  const VideoEditFrameProps = (dataSource?: string) => ({
    dataSource: dataSource ? { itemId: dataSource } : undefined,
    buttons: editFrameMainVideoButtons,
    title: 'Edit Video',
    tooltip: 'Modify the video content within this section',
    cssClass: 'jss-edit-frame',
    parameters: {},
  });

  //AOS
  const aosAttributes = getAosAttributes(props);

  return (
    <div className={`component featured-hero-video bg-white ${heroBackground}`} {...aosAttributes}>
      <EditFrame {...getEditFrameProps(`{${formattedId}}`)}>
        <div
          className="circle-pattern"
          style={
            {
              '--bg-image-desktop': `url(${backgroundImage?.src})`,
              '--bg-image-tablet': `url(${backgroundMdImage?.src || backgroundImage?.src})`,
              '--bg-image-mobile': `url(${backgroundSmImage?.src || backgroundImage?.src})`,
              '--mediaSize': focusMediaSize ? focusMediaSize : 'auto',
              '--focus-x-desktop': focusXDesktop,
              '--focus-y-desktop': focusYDesktop,
              '--focus-x-tablet': focusXTablet,
              '--focus-y-tablet': focusYTablet,
              '--focus-x-mobile': focusXMobile,
              '--focus-y-mobile': focusYMobile,
            } as React.CSSProperties
          }
        >
          <Container>
            {titleField || tagField || ctasParent ? (
              <Row>
                <div className="hero-text-block">
                  {titleField && (
                    <Heading
                      level={headingSize}
                      className={`hero-heading`}
                      field={titleField}
                      richText
                    />
                  )}
                  {shouldRender(tagField) && (
                    <JssRichText tag={'p'} field={tagField} className={`hero-body`} />
                  )}
                  {shouldRender(details) && (
                    <JssRichText tag={'p'} field={details} className={`hero-details`} />
                  )}
                  {shouldRender(ctasParent) && (
                    <Ctas ctasParent={ctasParent as CtaGroupInterface['ctasParent']} />
                  )}
                </div>
              </Row>
            ) : null}
            <Row>
              <div className={`hero-media-block ${squareCornersClass}`}>
                {mainVideo && videoType === 'youtube' ? (
                  <div className="featuredHeroVideo">
                    <EditFrame {...VideoEditFrameProps(`${formattedId}`)}>
                      {(() => {
                        const videoId = getYouTubeVideoId(mainVideo);
                        return (
                          videoId && (
                            <iframe
                              width="100%"
                              height="400"
                              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              className="featuredHeroYouTubeIframe"
                            ></iframe>
                          )
                        );
                      })()}
                    </EditFrame>
                  </div>
                ) : mainVideo ? (
                  <>
                    <EditFrame {...VideoEditFrameProps(`${formattedId}`)}>
                      <div 
                        className="video-container"
                        onMouseEnter={handleVideoHover}
                        onMouseLeave={handleVideoLeave}
                      >
                        <video ref={videoRef} preload="auto" className="featuredHeroVideo">
                          <source src={mainVideo} type="video/mp4" />
                        </video>

                        <div className={`videocontrols ${showControls ? 'show' : 'hide'}`}>
                          <button
                            className={`btn btn-cta-primary with-icon heroplayPauseBtn ${isPlaying ? 'pause-state' : 'play-state'}`}
                            onClick={handlePlayPause}
                            title="Video Call to action"
                          >
                            {isPlaying ? videoPause : videoPlay}
                          </button>
                        </div>
                      </div>
                    </EditFrame>
                  </>
                ) : vidyardId ? (
                  <div className="featuredHeroVideo">
                    <div id="vidyard-thumb-hide">
                      <div
                        className="vidyard-player-embed"
                        data-uuid={vidyardId}
                        data-v="4"
                        data-type={showVideoInModal ? 'lightbox' : 'inline'}
                        data-autoplay="0"
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="hero-media">
                    <GPImage item={item} params={props?.params} className="hero-image" />
                  </div>
                )}
              </div>
            </Row>
          </Container>
          <div className="full-bleed-container"></div>
        </div>
      </EditFrame>
    </div>
  );
};
