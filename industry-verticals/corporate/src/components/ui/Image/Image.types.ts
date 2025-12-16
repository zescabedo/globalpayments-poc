export interface GPImageInterface {
  mainImage?: ImageObject;
  mainMdImage?: ImageObject;
  mainSmImage?: ImageObject;
  focusXDesktop?: JsonValue;
  focusYDesktop?: JsonValue;
  focusXTablet?: JsonValue;
  focusYTablet?: JsonValue;
  focusXMobile?: JsonValue;
  focusYMobile?: JsonValue;
  mediaSize?: {
    targetItem: {
      Value: {
        jsonValue: {
          value: string;
        };
      };
    };
  };
}

export interface GPImageProps {
  item: GPImageInterface;
  className?: string;
  params?: {
    [key: string]: string;
  };
}
