import { ComponentParams } from '@sitecore-content-sdk/nextjs';
export const getFontSizeClasses = (params?: ComponentParams) => {
  if (!params)
    return {
      tagClass: '',
      titleClass: '',
      descriptionClass: '',
      subTitleClass: '',
      tagStyle: {},
      titleStyle: {},
      descriptionStyle: {},
    };

  const tagFontSize = params.tagFontSize ? JSON.parse(params.tagFontSize)?.Value?.value || '' : '';
  const titleFontSize = params.titleFontSize
    ? JSON.parse(params.titleFontSize)?.Value?.value || ''
    : '';
  const descriptionFontSize = params.descriptionFontSize
    ? JSON.parse(params.descriptionFontSize)?.Value?.value || ''
    : '';
  const subTitleFontSize = params.subTitleFontSize
    ? JSON.parse(params.subTitleFontSize)?.Value?.value || ''
    : '';

  return {
    tagClass: tagFontSize ? `p-${tagFontSize}` : '',
    titleClass: titleFontSize ? `h-${titleFontSize}` : '',
    descriptionClass: descriptionFontSize ? `p-${descriptionFontSize}` : '',
    subTitleClass: subTitleFontSize ? `h-${subTitleFontSize}` : '',
  };
};

const getFontSizeClass = (field: string, params?: ComponentParams): string => {
  if (!params || !params[field]) return '';
  try {
    return JSON.parse(params[field])?.Value?.value || '';
  } catch {
    return '';
  }
};

export const getHeadingFontSize = (field: string, params?: ComponentParams): string => {
  const fontSize = getFontSizeClass(field, params);
  return fontSize !== '' ? `h-${fontSize}` : '';
};

export const getBodyTextFontSize = (field: string, params?: ComponentParams): string => {
  const fontSize = getFontSizeClass(field, params);
  return fontSize !== '' ? `p-${fontSize}` : '';
};
