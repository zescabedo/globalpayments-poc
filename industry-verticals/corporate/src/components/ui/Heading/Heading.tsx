import {
  Field,
  RichTextField,
  Text,
  RichText as JssRichText,
} from '@sitecore-jss/sitecore-jss-nextjs';

export interface HeadingElementProps {
  text?: Field<string>;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  richText?: boolean;
  field?: RichTextField;
  tag?: string;
}

export default function Heading(props: HeadingElementProps) {
  const { text, level, className, richText, field, tag } = props;
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  if (!richText && !text) return null;

  return richText && field ? (
    <JssRichText
      tag={tag ? tag : level ? `h${level}` : 'span'}
      className={className}
      field={field}
    />
  ) : (
    <Tag className={className}>
      <Text field={text} />
    </Tag>
  );
}

/**
 * How it is supposed to be used
  <Heading
  level={2}
  text={Title}
  className=''
  richtext={true} // if you want to make it editable in experience editor
  field={RichTextField} // Only if richtext=true
  tag={h2} // if you are getting heading size as h2 instead of 2
  />
 */
