import { ComponentParams } from '@sitecore-jss/sitecore-jss-nextjs';

export const getPaddingValue = (params?: ComponentParams) => {
  if (!params) {
    return { paddingTop: undefined, paddingBottom: undefined };
  }

  const paddingTop = (params?.paddingTop && JSON.parse(params?.paddingTop)?.Value?.value) || '';

  const paddingBottom =
    (params?.paddingBottom && JSON.parse(params?.paddingBottom)?.Value?.value) || '';

  return {
    paddingTop: paddingTop || undefined,
    paddingBottom: paddingBottom || undefined,
  };
};
