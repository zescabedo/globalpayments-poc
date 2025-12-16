import { RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { TitleBlockProps } from './TitleBlock.types';

export const TitleBlock = (props: TitleBlockProps): JSX.Element | null => {
  if (!props?.fields) {
    return null;
  }

  const components = props?.fields;
  const level = components?.['Heading Level']?.fields?.Value?.value?.toLowerCase() || 'h2';
  const HeadingTag = (
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(level) ? level : 'h2'
  ) as keyof JSX.IntrinsicElements;
  const isBrow = level.toLowerCase().includes('brow');
  const ishighlight = components?.Highlight?.value === true;

  return (
    <div className={`uptick-content-block title-item ${ishighlight ? 'block-highlight' : ''}`}>
      {isBrow ? (
        <RichText field={components.Title} className="field-title brow" />
      ) : (
        <HeadingTag className="field-title">
          <RichText field={components.Title} />
        </HeadingTag>
      )}
    </div>
  );
};
