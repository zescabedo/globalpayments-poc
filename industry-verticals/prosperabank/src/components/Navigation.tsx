import React, { useCallback, useRef, useState, JSX } from 'react';
import { Link, LinkField, Text, TextField, useSitecore } from '@sitecore-content-sdk/nextjs';
import PreviewSearchWidget, { ArticleModel } from './Search/PreviewSearch/PreviewSearch';
import { isSearchSDKEnabled } from 'src/services/SearchSDKService';
import PreviewSearchIcon from './Search/PreviewSearch/PreviewSearchIcon';
import ClickOutside from '../hooks/ClickOutside';
import { useRouter } from 'next/router';

interface Fields {
  Id: string;
  DisplayName: string;
  Title: TextField;
  NavigationTitle: TextField;
  Href: string;
  Querystring: string;
  Children: Array<Fields>;
  Styles: string[];
  NavigationFilter?: unknown;
}

type NavigationProps = {
  params?: { [key: string]: string };
  fields: Fields;
  handleClick: (event?: React.MouseEvent<HTMLElement>) => void;
  relativeLevel: number;
};

const getNavigationText = function (props: NavigationProps): JSX.Element | string {
  let text;

  if (props.fields.NavigationTitle) {
    text = <Text field={props.fields.NavigationTitle} />;
  } else if (props.fields.Title) {
    text = <Text field={props.fields.Title} />;
  } else {
    text = props.fields.DisplayName;
  }

  return text;
};

const getLinkField = (props: NavigationProps): LinkField => ({
  value: {
    href: props.fields.Href,
    title: getLinkTitle(props),
    querystring: props.fields.Querystring,
  },
});

// NavigationFilter GUID that indicates item should be hidden
const NAVIGATION_FILTER_GUID = 'D063E9D1-C7B5-4B1E-B31E-69886C9C59F5';

/**
 * Checks if NavigationFilter field is set to the filter GUID, indicating the item should be hidden
 */
const isNavigationFiltered = (item: Fields | Record<string, unknown>): boolean => {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const navigationFilter = (item as Record<string, unknown>).NavigationFilter;
  if (!navigationFilter) {
    return false;
  }

  // Handle various formats: direct GUID, object with value, object with jsonValue, string
  let filterValue: unknown = navigationFilter;
  
  if (typeof navigationFilter === 'object' && navigationFilter !== null) {
    const filterObj = navigationFilter as Record<string, unknown>;
    if ('jsonValue' in filterObj && filterObj.jsonValue && typeof filterObj.jsonValue === 'object') {
      filterValue = (filterObj.jsonValue as Record<string, unknown>).value;
    } else if ('value' in filterObj) {
      filterValue = filterObj.value;
    }
  }

  // Check if the value matches the filter GUID (with or without braces, case insensitive)
  const filterString = String(filterValue || '').toUpperCase().replace(/[{}]/g, '');
  return filterString === NAVIGATION_FILTER_GUID.toUpperCase();
};

export const Default = (props: NavigationProps): JSX.Element => {
  const [isPreviewSearchOpen, setIsPreviewSearchOpen] = useState(false);
  const [isOpenMenu, openMenu] = useState(false);
  const { page } = useSitecore();
  const containerRef = useRef(null);
  const router = useRouter();

  const onSearchIconClick = useCallback(() => {
    setIsPreviewSearchOpen((isPreviewSearchOpen) => {
      return !isPreviewSearchOpen;
    });

    // Focus on element with ID search-input
    setTimeout(() => {
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }, 0);
  }, []);

  const onClose = useCallback(() => setIsPreviewSearchOpen(false), []);
  ClickOutside([containerRef], onClose);

  const onRedirect = useCallback(
    (article: ArticleModel) => {
      onClose();
      router.push(new URL(article.url, window.location.origin).pathname);
    },
    [onClose, router]
  );

  const styles =
    props.params != null
      ? `${props.params.GridParameters ?? ''} ${props.params.Styles ?? ''}`.trimEnd()
      : '';
  const id = props.params != null ? props.params.RenderingIdentifier : null;

  if (!Object.values(props.fields).length) {
    return (
      <div
        className={`component navigation col-12 position-right navigation-horizontal ${styles}`}
        id={id ? id : undefined}
      >
        <div className="component-content">[Navigation]</div>
      </div>
    );
  }

  const handleToggleMenu = (event?: React.MouseEvent<HTMLElement>, flag?: boolean): void => {
    if (event && page?.mode.isEditing) {
      event.preventDefault();
    }

    if (flag !== undefined) {
      return openMenu(flag);
    }

    openMenu(!isOpenMenu);
  };

  const list = Object.values(props.fields)
    .filter((element) => element && !isNavigationFiltered(element))
    .map((element: Fields, key: number) => (
      <NavigationList
        key={`${key}${element.Id}`}
        fields={element}
        handleClick={(event: React.MouseEvent<HTMLElement>) => handleToggleMenu(event, false)}
        relativeLevel={1}
      />
    ));

  if (isSearchSDKEnabled) {
    list.push(
      <li className="	d-none d-lg-block" key="search-icon">
        <PreviewSearchIcon
          className="search-play-icon"
          onClick={onSearchIconClick}
          keyphrase={''}
        />
      </li>
    );
  }

  return (
    <div
      className={`component navigation col-12 position-right navigation-horizontal ${styles}`}
      id={id ? id : undefined}
    >
      {!isPreviewSearchOpen && (
        <label className="menu-mobile-navigate-wrapper">
          <input
            type="checkbox"
            className="menu-mobile-navigate"
            checked={isOpenMenu}
            onChange={() => handleToggleMenu()}
          />
          {/* DEMO TEAM CUSTOMIZATION */}
          <div className="menu-humburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="component-content">
            <nav>
              {/* DEMO TEAM CUSTOMIZATION */}
              <ul>{list}</ul>
            </nav>
          </div>
        </label>
      )}
      {isSearchSDKEnabled && (
        <div ref={containerRef} className={`search-input-container ${!isPreviewSearchOpen ? 'search-input-container-hidden' : ''}`}>
          <PreviewSearchWidget rfkId="rfkid_6" itemRedirectionHandler={onRedirect} />
        </div>
      )}
    </div>
  );
};

const NavigationList = (props: NavigationProps) => {
  const { page } = useSitecore();
  const [active, setActive] = useState(false);
  const classNameList = `${props.fields.Styles.concat('rel-level' + props.relativeLevel).join(
    ' '
  )}`;

  let children: JSX.Element[] = [];
  if (props.fields.Children && props.fields.Children.length) {
    children = props.fields.Children
      .filter((element: Fields) => !isNavigationFiltered(element))
      .map((element: Fields, index: number) => (
        <NavigationList
          key={`${index}${element.Id}`}
          fields={element}
          handleClick={props.handleClick}
          relativeLevel={props.relativeLevel + 1}
        />
      ));
  }

  return (
    <li className={`${classNameList} ${active ? 'active' : ''}`} key={props.fields.Id} tabIndex={0}>
      <div
        className={`navigation-title ${children.length ? 'child' : ''}`}
        onClick={() => setActive(() => !active)}
      >
        <Link
          field={getLinkField(props)}
          editable={page.mode.isEditing}
          onClick={props.handleClick}
        >
          {getNavigationText(props)}
        </Link>
      </div>
      {children.length > 0 ? <ul className="clearfix">{children}</ul> : null}
    </li>
  );
};

const getLinkTitle = (props: NavigationProps): string | undefined => {
  let title;
  if (props.fields.NavigationTitle?.value) {
    title = props.fields.NavigationTitle.value.toString();
  } else if (props.fields.Title?.value) {
    title = props.fields.Title.value.toString();
  } else {
    title = props.fields.DisplayName;
  }

  return title;
};
