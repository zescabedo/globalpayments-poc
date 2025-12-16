export const getLinkPath = (path?: string): string => {
  if (!path) return '#';
  return path.toLowerCase().startsWith('/sitecore')
    ? path.replace(/^\/sitecore/, '').toLowerCase()
    : path.toLowerCase();
};
