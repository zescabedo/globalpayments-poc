import { LinkFieldValue } from '@sitecore-jss/sitecore-jss-dev-tools';
import { LinkField, useSitecoreContext, Link as JssLink } from '@sitecore-jss/sitecore-jss-nextjs';
import Link from 'next/link';
import { useMemo } from 'react';
import { constructUrlWithQuerystring } from '@/utils/urlUtils';
import useApplySitecoreTrackingProps from '@/utils/useApplySitecoreTrackingProps';

interface LinkFieldValueWithLinkType extends LinkFieldValue {
  linktype: string;
  url?: string;
}

interface EditableLinkField extends LinkField {
  editable?: string;
}

interface LinkProps {
  field?: EditableLinkField;
  value?: LinkFieldValue;
  className?: string;
  icon?: React.ReactNode;
  overrideStyle?: boolean;
  role?: string;
  'aria-label'?: string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  tabIndex?: number;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  openInModal?: boolean;
  'data-sc-goal'?: string;
  'data-sc-camp'?: string;
}

const LinkItem = ({
  field,
  value,
  className,
  icon,
  role,
  'aria-label': ariaLabel,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHaspopup,
  tabIndex,
  onClick,
  openInModal,
  'data-sc-goal': goalId,
  'data-sc-camp': campaignId,
}: LinkProps) => {
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext && sitecoreContext?.pageEditing;

  const trackingProps = useApplySitecoreTrackingProps(goalId, campaignId);

  const linkValues = useMemo(() => {
    const {
      href,
      url,
      text,
      title,
      target,
      class: assignedClass,
      linktype,
      querystring,
    } = value as LinkFieldValueWithLinkType;

    // Use href if available, fallback to url field
    const baseHref = (href || url || '').replace(/\?$/, '');

    // Properly append querystring if it exists
    const resolvedHref = constructUrlWithQuerystring(baseHref, querystring);

    return {
      href: resolvedHref,
      text,
      title,
      target,
      assignedClass,
      linktype,
    };
  }, [value]);

  if (isEditing && field) {
    // Get the text we want to display
    const displayText =
      linkValues?.text || linkValues?.title || field?.value?.text || field?.value?.title;

    // Extract the editable HTML
    let editableHtml = field.editable;

    // Replace the text content between the anchor tags
    if (editableHtml) {
      // Find the anchor tags and replace the text between them
      editableHtml = editableHtml.replace(/(<a [^>]*>)([^<]*)(<\/a>)/, `$1${displayText}$3`);

      // Render the modified HTML directly
      return (
        <div>
          {icon && icon}
          <span
            dangerouslySetInnerHTML={{ __html: editableHtml }}
            className={className ? className : linkValues.assignedClass}
          />
        </div>
      );
    }

    // Fallback if we can't find the HTML pattern we expect
    return (
      <div>
        {icon && icon}
        <JssLink
          field={field}
          className={className ? className : linkValues.assignedClass}
          role={role}
          aria-label={ariaLabel}
          aria-expanded={ariaExpanded}
          aria-haspopup={ariaHaspopup}
          tabIndex={tabIndex}
          {...trackingProps}
        />
      </div>
    );
  }

  if (value && value.href) {
    return (
      <Link
        onClick={(e) => {
          if (openInModal) {
            e.preventDefault();
            onClick && onClick(e);
          }
        }}
        href={linkValues.href}
        className={className ? className : linkValues.assignedClass}
        target={linkValues.target || (linkValues.linktype === 'external' ? '_blank' : '_self')}
        role={role}
        aria-label={ariaLabel}
        aria-expanded={ariaExpanded}
        aria-haspopup={ariaHaspopup}
        tabIndex={tabIndex}
        {...trackingProps}
      >
        {icon && icon}
        <span className='link-inner' dangerouslySetInnerHTML={{ __html: linkValues.text || linkValues.title || '' }} />
      </Link>
    );
  }

  return <></>;
};

export default LinkItem;
