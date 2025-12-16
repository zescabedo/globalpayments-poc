import React from 'react';

interface ButtonProps {
  type: string;
  onClick?: () => void;
  children: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
}

export const Button = ({
  type,
  onClick,
  children,
  href,
  target = '_self',
}: ButtonProps): JSX.Element => {
  const buttonClass = `btn btn-${type}`;

  const handleClick = () => {
    if (href) {
      window.open(href, target, `noopener noreferrer`);
    } else {
      onClick?.();
    }
  };

  return (
    <button className={buttonClass} onClick={handleClick} type="button">
      {children}
    </button>
  );
};
