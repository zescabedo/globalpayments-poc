import Link from 'next/link';

export const Tags = ({
  text,
  variant,
  link,
  onClick,
  disabled,
  className = '',
}: {
  text: string;
  link?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant: 'audience' | 'topic' | 'interactive';
}): JSX.Element => {
  const mergedClass = `uptick-tag-component tag-${variant} ${className}`.trim();

  if (variant === 'interactive') {
    return (
      <button className={mergedClass} onClick={onClick} disabled={disabled}>
        {text}
      </button>
    );
  }

  return (
    <Link href={link || ''} className={mergedClass}>
      {text}
    </Link>
  );
};
