export const isEmptyRichText = (value: string | undefined): boolean => {
  if (!value) return true;

  // Remove only whitespace and newlines, preserve HTML
  const stripped = value.replace(/\s+/g, ' ').trim();

  return stripped === '';
};
