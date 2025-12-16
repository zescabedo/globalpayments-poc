import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';

export interface FeatureVerticalVideoProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}

export type Fields = {
  data: {
    item: {
      title: JsonValue;
      subTitle: JsonValue;
      tag: JsonValue;
      details: JsonValue;
      backgroundImage: ImageObject;
      backgroundMdImage: ImageObject;
      backgroundSmImage: ImageObject;
      mainVideo: { jsonValue: { value: VideoObject } };
      vidyardId: JsonValue;
      videoType: JsonValue | null;
      showVideoInModal: {
        jsonValue: {
          value: boolean;
        };
      };
    };
  };
};
