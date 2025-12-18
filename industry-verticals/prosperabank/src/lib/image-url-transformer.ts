import { ImageField } from '@sitecore-content-sdk/nextjs';

/**
 * Transforms prosperabank.dev image URLs to use the actual XM Cloud instance
 */
export function transformImageField(field: ImageField): ImageField {
  if (!field?.value?.src) {
    return field;
  }

  // Replace prosperabank.dev with actual XM Cloud instance
  const transformedSrc = field.value.src.replace(
    'https://prosperabank.dev',
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
