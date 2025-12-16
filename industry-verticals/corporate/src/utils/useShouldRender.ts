import { useSitecoreContext } from '@sitecore-content-sdk/nextjs';

export function useShouldRender() {
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext?.pageState === 'edit';

  return (value: unknown) => isEditing || !!value;
}
