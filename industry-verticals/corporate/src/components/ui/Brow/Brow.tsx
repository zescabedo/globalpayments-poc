import { RichText as JssRichText, RichTextField } from '@sitecore-jss/sitecore-jss-nextjs';

export const Brow = ({
  text,
  className,
  richText = false,
  field,
  tag,
}: {
  text?: string;
  className?: string;
  richText?: boolean;
  field?: RichTextField;
  tag?: string;
}): JSX.Element | null => {
  if (!richText && !text) return null;
  return richText && field ? (
    <JssRichText tag={tag} className={className || 'brow'} field={field} />
  ) : (
    <blockquote className={className || 'brow'}>{text}</blockquote>
  );
};
