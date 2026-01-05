/**
 * Custom Next.js Image Loader
 * Automatically transforms global-payments.dev URLs to the correct XM Cloud instance
 * This runs globally for ALL images in the application
 * 
 * Sitecore images already have optimization parameters in the URL, so we return them as-is
 * after URL transformation. For other images, we could add Next.js optimization, but
 * since most images come from Sitecore, we just return the transformed URL.
 */
import { ImageLoaderProps } from 'next/image';

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // Transform global-payments.dev to actual XM Cloud hostname
  const transformedSrc = src.replace(
    'https://global-payments.dev',
    'https://xmc-sitecoresaafe06-globalpaymec222-prod8b6b.sitecorecloud.io'
  );

  // If the URL already has query parameters (Sitecore optimized images), return as-is
  // Sitecore already handles image optimization with its own query parameters
  if (transformedSrc.includes('?')) {
    return transformedSrc;
  }

  // For images without query parameters, add Next.js optimization parameters
  // This allows Next.js to optimize images that don't come from Sitecore
  const params = [`w=${width}`];
  if (quality) {
    params.push(`q=${quality}`);
  }

  return `${transformedSrc}?${params.join('&')}`;
}




