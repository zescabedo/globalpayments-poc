import { CtaGroupInterface } from "@/components/ui/CTA/cta.types";

export const overrideCTAGroupActionStyle = (
  item: any,
  styleValue: string,
  onlyIfNotSet = false
): CtaGroupInterface => {

  const ctasParent = item?.ctasParent;
  if (!ctasParent?.results?.[0]?.ctas?.results) {
    return item;
  }
  const cta = ctasParent?.results?.[0]?.ctas?.results?.[0];

  const currentActionStyle = cta?.overrideActionStyle?.targetItem?.value?.jsonValue?.value;

  if (!onlyIfNotSet || !currentActionStyle) {
    cta.overrideActionStyle = {
      targetItem: {
        value: {
          jsonValue: {
            value: styleValue,
          },
        },
      },
    };
  }

  return item;
};

export const overrideSingleCTAActionStyle = (
    item: any,
    styleValue: string,
    onlyIfNotSet = false
  ): CtaGroupInterface => {
  
  const currentActionStyle = item?.overrideActionStyle?.targetItem?.value?.jsonValue?.value;
  
  if (onlyIfNotSet && currentActionStyle) {
    return item;
  }
  
  return {...item, overrideActionStyle: {
    targetItem: {
      value: {
        jsonValue: {
          value: styleValue,
        },
      },
    },
  }}
};

