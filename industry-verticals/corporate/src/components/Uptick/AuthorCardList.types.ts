import { AuthorCardFields } from '@/components/Uptick/AuthorCard.types';

import {
  ComponentParams,
  ComponentRendering,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';

export interface AuthorCardListFields {
  title: RichTextField;
  subtitle: RichTextField;
  authors: AuthorCardFields[];
}

export interface AuthorCardListProps {
  rendering: ComponentRendering;
  params: ComponentParams;
  fields: AuthorCardListFields;
}
