/**
Additional Considerations
If you're working with other image formats as well, you might want to consider adding more extensions such as:
- 'webp' - Modern image format with superior compression
- 'avif' - Newer image format with even better compression
- 'tiff' or 'tif' - Used for high-quality images
- 'bmp' - Bitmap format
The complete function with all these formats would look like:
*/
export const checkImage = (url: string): boolean => {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
  return ['gif', 'png', 'jpg', 'jpeg', 'svg', 'webp', 'avif', 'tiff', 'tif', 'bmp'].includes(
    ext || ''
  );
};
