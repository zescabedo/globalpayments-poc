import React, { JSX } from 'react';
import { ComponentProps } from 'lib/component-props';

function formatBreadcrumb(text: string) {
  text = decodeURIComponent(text);
  return text;
}

type contextItem = {
  url: { path: string };
  name: string;
  pageTitle: { value: string };
  displayName: string;
  title: { value: string };
  ancestors: contextItem[];
};

type BreadcrumbProps = ComponentProps & {
  fields: {
    data: {
      item: contextItem;
      ancestors: contextItem[];
    };
  };
};

function getBreadcrumbTitle(propItem: contextItem) {
  let name = propItem.pageTitle?.value;
  if (!name) {
    name = propItem.name;
  }
  if (!name) {
    name = propItem.displayName;
  }
  if (!name) {
    name = propItem.title.value;
  }
  return formatBreadcrumb(name);
}

function getBreadcrumbUrl(propItem: contextItem) {
  return propItem?.url?.path;
}

const Breadcrumb = (props: BreadcrumbProps): JSX.Element => {
  if (props?.fields?.data?.item === null) {
    return <div></div>;
  }

  const propItemAncestors = props.fields.data.item.ancestors;
  const sxaStyles = `${props.params?.styles || ''}`;

  // Get the first ancestor (immediate parent) for the "Back to" link
  const previousPage = propItemAncestors && propItemAncestors.length > 0 
    ? propItemAncestors[propItemAncestors.length - 1] 
    : null;

  // If there's no previous page, don't render anything
  if (!previousPage) {
    return <div></div>;
  }

  const previousPageTitle = getBreadcrumbTitle(previousPage);
  const previousPageUrl = getBreadcrumbUrl(previousPage);

  return (
    <nav className={`breadcrumb ${sxaStyles}`} aria-label="breadcrumbs">
      <a href={previousPageUrl} className="breadcrumb-back">
        Back to {previousPageTitle}
      </a>
    </nav>
  );
};

export const Default = Breadcrumb;
