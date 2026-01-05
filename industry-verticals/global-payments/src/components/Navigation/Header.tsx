import { ImageField, LinkField, Placeholder, Link } from '@sitecore-content-sdk/nextjs';
import { NextImage } from 'src/lib/image-components';
import { ComponentProps } from 'lib/component-props';
import React, { JSX } from 'react';

export type HeaderProps = ComponentProps & {
  fields?: {
    LogoImage?: ImageField;
    LogoLink?: LinkField;
    ButtonText?: { value?: string };
  };
};

/**
 * Default Header component
 * Supports:
 * - Logo via placeholder (drag and drop Image component)
 * - Logo via datasource field (LogoImage)
 * - Logo link via datasource field (LogoLink)
 * - Navigation via placeholder (drag and drop Navigation component)
 * - Button text via datasource field (ButtonText)
 */
export const Default = (props: HeaderProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = props.params?.styles?.trimEnd() || '';
  const containerWidth = props.params?.ContainerWidth?.toLowerCase() || 'container';

  // Check if logo is provided via datasource field
  const hasLogoField = props.fields?.LogoImage?.value?.src;
  const logoLink = props.fields?.LogoLink;
  const buttonText = props.fields?.ButtonText?.value;

  return (
    <div className={`component header ${styles}`} id={id ? id : undefined}>
      <div className={`container container-${containerWidth}-fluid`}>
        <div className="row align-items-center">
          {/* Logo Section */}
          <div className="col-auto">
            {hasLogoField && props.fields?.LogoImage ? (
              // Logo from datasource field - matching Global Payments sizing (235px x 36px)
              logoLink?.value?.href ? (
                <Link field={logoLink}>
                  <NextImage field={props.fields.LogoImage} width={235} height={36} />
                </Link>
              ) : (
                <NextImage field={props.fields.LogoImage} width={235} height={36} />
              )
            ) : (
              // Logo placeholder - allows drag and drop of Image component
              <Placeholder name="header-left" rendering={props.rendering} />
            )}
          </div>

          {/* Navigation Section */}
          <div className="col">
            <Placeholder name="header-right" rendering={props.rendering} />
          </div>

          {/* Button Section (if provided) */}
          {buttonText && (
            <div className="col-auto">
              <button className="btn btn-primary">{buttonText}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
