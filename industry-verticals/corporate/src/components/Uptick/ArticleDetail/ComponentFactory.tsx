import React from 'react';
import { FactoryProps, BaseComponentFields } from './ArticleDetail.types';
import { TextBlock } from './TextBlock';
import { TitleBlock } from './TitleBlock';
import { TwoColumnQuoteBlock } from './TwoColumnQuoteBlock';
import { TestimonialBlock } from './TestimonialBlock';
import { HorizontalLineBlock } from './HorizontalLineBlock';
import localDebug from '@/lib/_platform/logging/debug-log';
import { AudioPlaybackBlock } from './AudioPlaybackBlock';
import { ImageBlock } from './ImageBlock';
import { TwoColumnTextBlock } from './TwoColumnTextBlock';
import { InteractiveBlock } from './InteractiveBlock';
import { VideoBlock } from './VideoBlock';

const componentRegistry: Record<
  string,
  React.ComponentType<{ fields: BaseComponentFields; params?: Record<string, unknown> }>
> = {
  HorizontalLineBlock,
  TextBlock,
  TwoColumnQuoteBlock,
  TitleBlock,
  TestimonialBlock,
  AudioPlaybackBlock,
  ImageBlock,
  TwoColumnTextBlock,
  InteractiveBlock,
  VideoBlock,
};

export const ComponentFactory = <T extends BaseComponentFields>({
  fields,
  params,
}: FactoryProps<T>): JSX.Element | null => {
  if (!fields?.componentType) return null;

  const Component = componentRegistry[fields.componentType];
  if (!Component) {
    localDebug.uptick(`No component mapped for type: ${fields.componentType}`);
    return null;
  }

  return <Component fields={fields} params={params} />;
};
