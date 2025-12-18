/**
 * Custom Next.js Image Loader
 * Automatically transforms prosperabank.dev URLs to the correct XM Cloud instance
 * This runs globally for ALL images in the application
 */
import { ImageLoaderProps } from 'next/image';

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // Transform prosperabank.dev to actual XM Cloud hostname
  const transformedSrc = src.replace(
    'https://prosperabank.dev',
    'https://xmc-sitecoresaafe06-globalpaymec222-prod8b6b.sitecorecloud.io'
  );

  // If the URL already has query parameters, return as-is
  // (Sitecore already optimizes images with its own parameters)
  if (transformedSrc.includes('?')) {
    return transformedSrc;
  }

  // For other images, use Next.js optimization
  const params = [`w=${width}`];
  if (quality) {
    params.push(`q=${quality}`);
  }

  return `${transformedSrc}?${params.join('&')}`;
}
