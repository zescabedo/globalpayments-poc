import { ImageField } from '@sitecore-content-sdk/nextjs';

/**
 * Transforms global-payments.dev image URLs to use the actual XM Cloud instance
 */
export function transformImageField(field: ImageField): ImageField {
  if (!field?.value?.src) {
    return field;
  }

  // Replace global-payments.dev with actual XM Cloud instance
  const transformedSrc = field.value.src.replace(
    'https://global-payments.dev',
    'https://xmc-globalpayme583f-globalpayme5281-globalpayme1d82.sitecorecloud.io'
  );

  return {
    ...field,
    value: {
      ...field.value,
      src: transformedSrc,
    },
  };
}




