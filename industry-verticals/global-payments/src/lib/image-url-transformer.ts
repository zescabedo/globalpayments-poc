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
    'https://xmc-sitecoresaafe06-globalpaymec222-prod8b6b.sitecorecloud.io'
  );

  return {
    ...field,
    value: {
      ...field.value,
      src: transformedSrc,
    },
  };
}




