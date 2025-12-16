import { ComponentParams, Field, ImageField, LinkField } from '@sitecore-jss/sitecore-jss-nextjs';
import ReactPlayer from 'react-player';
import { BaseComponentFields } from './ArticleDetail.types';

interface VideoBlockFields extends BaseComponentFields {
  Title: Field<string>;
  'Video link': LinkField;
  VideoImage: ImageField;
  name: Field<string>;
}

interface VideoBlockProps {
  fields: VideoBlockFields;
  params?: ComponentParams;
}

export const VideoBlock = ({ fields, params }: VideoBlockProps) => {
  const videoTitle = fields?.Title?.value;
  const videoUrl = fields['Video link']?.value?.href;
  const videoImage = fields?.VideoImage?.value?.src;

  if(!videoUrl){
    return null;
  }
  
  return (
    <div className={`uptick-content-block video-block ${params?.styles || ''}`}>
      <ReactPlayer
        title={videoTitle}
        url={videoUrl}
        controls={true}
        playing={false}
        width="100%"
        height="auto"
        light={videoImage}
      />
    </div>
  );
};
