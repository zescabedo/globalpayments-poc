import React, { JSX } from 'react';
import { Link, LinkField } from '@sitecore-content-sdk/nextjs';
import { ButtonVariant } from 'lib/design-system/tokens';

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
  // Map to Storybook button classes (matching design system)
  // Storybook classes: .btn .btn-sm/.btn-md/.btn-lg .btn-base/.btn-outline/etc.
  const baseClasses = 'btn';
  
  // Map variant to Storybook button classes
  const variantMap: { [key: string]: string } = {
    'primary': 'btn-base',
    'secondary': 'btn-outline',
    'tertiary': 'btn-cta-tertiary',
    'outline': 'btn-outline',
    'ghost': 'btn-cta-tertiary',
    'link': 'btn-link',
  };
  
  const variantClass = variantMap[variant] || 'btn-base';
  
  // Map size to Storybook button classes
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : 'btn-md';
  const widthClass = fullWidth ? 'w-100' : '';
  const disabledClass = disabled ? 'disabled' : '';
  
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

