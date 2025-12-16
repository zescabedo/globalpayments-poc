export interface GPVideoInterface {
  id?: string;
  mainVideo?: {
    jsonValue: {
      value: {
        href: string;
      };
    };
  };
  vidyardId?: JsonValue;
  showVideoInModal?: {
    jsonValue: {
      value: boolean;
    };
  };
  mainImage?: ImageObject;
}
