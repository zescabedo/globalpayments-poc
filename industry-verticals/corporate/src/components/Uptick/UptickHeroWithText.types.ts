import {
  ComponentParams,
  ComponentRendering,
  ImageField,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';

export interface UptickHeroWithTextFields {
  heroTitle: RichTextField;
  heroDescription: RichTextField;
  heroBrow: RichTextField;
  heroImage: ImageField;
}

export interface UptickHeroWithTextProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: UptickHeroWithTextFields;
}
