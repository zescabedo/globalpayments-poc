import { HeroProps } from './Hero.types.js';
import { Container } from 'react-bootstrap';
import { RichText, EditFrame } from '@sitecore-jss/sitecore-jss-nextjs';
import Ctas from '@/components/ui/CTA/CTA';
import React, { useState, useRef } from 'react';
import { L1HeroConstants } from '@/constants/appConstants';
import { Brow } from '@/components/ui/Brow/Brow';
import Heading from '@/components/ui/Heading/Heading';
import { formatToGuid } from '@/utils/tools';
import { EditFrameBackgroundImageWithFocusButton } from '@/utils/SiteCoreCustomEditBtn';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import GPMedia from '@/components/ui/GPMedia/GPMedia';
import { getMediaType } from '@/utils/mediaUtils';
import { GPVideo } from '@/components/ui/Video/GPVideo';

interface L1HeroBaseProps extends HeroProps {
  className: string;
}

const { defaultTitleTag } = L1HeroConstants;

const L1HeroWide = (props: L1HeroBaseProps): JSX.Element => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };
  const { fields, params, className } = props || {};
  const { Styles = '' } = params || {};

  const getEditFrameProps = (dataSource?: string) => ({
    dataSource: dataSource ? { itemId: dataSource } : undefined,
    buttons: EditFrameBackgroundImageWithFocusButton,
    title: 'Edit background image',
    tooltip: 'Modify the background content within this section',

    cssClass: 'jss-edit-frame',
    parameters: {},
  });

  // Params
  const headingSize =
    (params?.headingSize && JSON.parse(params?.headingSize)?.Value?.value) || defaultTitleTag;

  // Fields
  const item = fields?.data?.item || {};
  const dataSorceId = item?.id || '';
  const formattedId = formatToGuid(dataSorceId);
  const brow = item?.brow?.jsonValue || null;
  const title = item?.title?.jsonValue || null;
  const tag = item?.tag?.jsonValue || null;
  const propsFieldData = props?.fields?.data?.item || {};
  const backgroundImage = propsFieldData?.backgroundImage;
  const backgroundMdImage = propsFieldData?.backgroundMdImage;
  const backgroundSmImage = propsFieldData?.backgroundSmImage;

  //AOS
  const aosAttributes = getAosAttributes(props);

  const { titleClass, tagClass } = getFontSizeClasses(props?.params) || {};

  const focusXDesktop = propsFieldData?.focusXDesktop?.jsonValue?.value;
  const focusYDesktop = propsFieldData?.focusYDesktop?.jsonValue?.value;
  const focusXTablet = propsFieldData?.focusXTablet?.jsonValue?.value;
  const focusYTablet = propsFieldData?.focusYTablet?.jsonValue?.value;
  const focusXMobile = propsFieldData?.focusXMobile?.jsonValue?.value;
  const focusYMobile = propsFieldData?.focusYMobile?.jsonValue?.value;
  const mediaSize = propsFieldData?.mediaSize?.targetItem?.Value?.jsonValue?.value || 'cover';
  const mediaType = getMediaType(propsFieldData, className);

  const renderBackground = () => {
    switch (mediaType) {
      case 'lottie':
        return <GPMedia item={propsFieldData} className="background-tall-wide" />;
      case 'video':
        return (
          <GPVideo
            item={{
              id: dataSorceId,
              mainVideo: {
                ...propsFieldData?.backgroundVideo,
              },
            }}
            className="background-video"
            videoRef={videoRef}
          />
        );
      case 'image':
        return null; // Images are handled via CSS background
      default:
        return null;
    }
  };

  // adding bg-black forces the right color scheme for CTA's, but does not change the background due to l1hero stylesheet override
  return (
    <div className={`component l1hero ${className} ${Styles} bg-black `}>
      <div className={`component-content`}>
        <EditFrame {...getEditFrameProps(`{${formattedId}}`)}>
          <Container
            {...aosAttributes}
            fluid
            style={
              mediaType === 'image'
                ? ({
                    '--bg-image-desktop': `url(${backgroundImage?.src})`,
                    '--bg-image-tablet': `url(${backgroundMdImage?.src || backgroundImage?.src})`,
                    '--bg-image-mobile': `url(${backgroundSmImage?.src || backgroundImage?.src})`,
                    '--media-size': mediaSize,
                    '--focus-x-desktop': focusXDesktop,
                    '--focus-y-desktop': focusYDesktop,
                    '--focus-x-tablet': focusXTablet,
                    '--focus-y-tablet': focusYTablet,
                    '--focus-x-mobile': focusXMobile,
                    '--focus-y-mobile': focusYMobile,
                  } as React.CSSProperties)
                : {}
            }
          >
            {renderBackground()}
            <Container>
              <div className={`hero-container`}>
                <div className="copy-section">
                  {title && (
                    <Heading
                      tag={`h${headingSize}`}
                      className={`title ${titleClass}`}
                      field={title}
                      richText
                    />
                  )}
                  {brow && <Brow className="brow" field={brow} tag="p" richText />}
                  {tag && <RichText tag="p" field={tag} className={`tag ${tagClass}`} />}
                  {item?.ctasParent && <Ctas {...item} />}
                </div>
                {mediaType === 'video' && (
                  <button
                    onClick={togglePlay}
                    role="button"
                    className={`video-control-button ${isPlaying ? 'playing' : 'paused'}`}
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    tabIndex={0}
                  ></button>
                )}
              </div>
            </Container>
          </Container>
        </EditFrame>
      </div>
    </div>
  );
};

export const TallWideVideo = (props: HeroProps): JSX.Element => {
  return <L1HeroWide {...props} className="tall-wide-video" />;
};

export const TallWideImage = (props: HeroProps): JSX.Element => {
  return <L1HeroWide {...props} className="tall-wide" />;
};