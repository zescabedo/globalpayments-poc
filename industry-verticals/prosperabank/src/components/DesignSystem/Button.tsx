import React, { JSX } from 'react';
import { Link, LinkField } from '@sitecore-content-sdk/nextjs';
import { buttonVariants, ButtonVariant } from 'lib/design-system/tokens';

export interface ButtonProps {
  /**
   * Button variant following Global Payments design system
   */
  variant?: ButtonVariant;
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether button is full width
   */
  fullWidth?: boolean;
  /**
   * Whether button is disabled
   */
  disabled?: boolean;
  /**
   * Button content
   */
  children: React.ReactNode;
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Link field for Sitecore ContentSDK integration
   */
  linkField?: LinkField;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Button type (for form buttons)
   */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Global Payments Button Component
 * 
 * Aligned with Global Payments design system and Sitecore ContentSDK
 * Reference: https://design.globalpayments.com/?path=/story/atoms-buttons--all-buttons
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  children,
  onClick,
  linkField,
  className = '',
  type = 'button',
}: ButtonProps): JSX.Element => {
  const baseClasses = 'gpn-button';
  const variantClass = `gpn-button--${variant}`;
  const sizeClass = `gpn-button--${size}`;
  const widthClass = fullWidth ? 'gpn-button--full-width' : '';
  const disabledClass = disabled ? 'gpn-button--disabled' : '';
  
  const buttonClasses = [
    baseClasses,
    variantClass,
    sizeClass,
    widthClass,
    disabledClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // If linkField is provided, render as Link component
  if (linkField && !disabled) {
    return (
      <Link field={linkField} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;

