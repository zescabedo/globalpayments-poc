import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { LinkField, ComponentParams } from '@sitecore-jss/sitecore-jss-nextjs';

export interface BlogCardtype {
  title: JsonValue;
  tag: JsonValue;
  details: JsonValue;
  staticCategories: JsonValue;
  staticBusinessSize: JsonValue;
  blogReadTime: JsonValue;
  blogPublishDate: JsonValue;
  blogSubCategory: JsonValue;
  blogLink: {
    jsonValue: LinkField;
  };
  staticBlogPifType: JsonValue;
  StaticBlogPifTypeLink: {
    jsonValue: {
      value: {
        href: string;
        linktype: string;
      };
    };
  };
  backgroundImage: ImageObject;
  backgroundMdImage: ImageObject;
  backgroundSmImage: ImageObject;
  backgroundVideo: VideoFields;
  mainImage: ImageObject;
  mainMdImage: ImageObject;
  mainSmImage: ImageObject;
  mainVideo: VideoFields;
  vidyardId: JsonValue;
  videoType: JsonValue | null;
}

export interface Item extends CtaGroupInterface {
  title: JsonValue;
  brow: JsonValue;
  tag: JsonValue;
  details: JsonValue;
  children: {
    results: BlogCardtype[];
  };
}

export interface BlogCardProps {
  params: ComponentParams;
  fields: {
    data: {
      item: Item;
    };
  };
}
