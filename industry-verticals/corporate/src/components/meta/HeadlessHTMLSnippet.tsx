import React from 'react';
import { ComponentParams, ComponentRendering } from '@sitecore-content-sdk/nextjs';

interface HeadlessHTMLSnippetProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: {
    Html: {
      value: string;
    };
  };
}

export const Default = (props: HeadlessHTMLSnippetProps): JSX.Element => {
  return (
    <>
      <div
        dangerouslySetInnerHTML={{
          __html: props?.fields?.Html?.value,
        }}
      />
    </>
  );
};
