import React, { useCallback, useRef, useState, useEffect, JSX } from 'react';
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

// Item IDs that have NavigationFilter set to the filter GUID
// This is a workaround until NavigationFilter is included in the serialized navigation data
// These IDs are extracted from the serialized content files
const FILTERED_ITEM_IDS = new Set([
  '312d7889-330c-49e6-9a8b-6c97a06268e0', // about-us
  '5d60619d-833b-44f3-aa73-ca51fe3a0f3c', // faqs
  '38e1734c-163e-47e3-b51f-a5ee2ab85ba6', // customer-support
  '09ae22cc-26e2-45a1-b588-c393c610749e', // Company
  '8c2d6765-91be-4bd8-a0b3-4f81256e75a6', // authors
  // Note: Add more IDs here as needed - extract from serialized content files
  // by searching for NavigationFilter field with value {D063E9D1-C7B5-4B1E-B31E-69886C9C59F5}
]);

/**
 * Checks if NavigationFilter field is set to the filter GUID, indicating the item should be hidden
 * @param item - The navigation item to check
 * @param getFilterFromPage - Optional function to get NavigationFilter from page context
 */
const isNavigationFiltered = (
  item: Fields | Record<string, unknown>,
  getFilterFromPage?: (itemId: string) => string | null
): boolean => {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const itemObj = item as Record<string, unknown>;
  
  // First, check if the item ID is in the filtered list (workaround)
  if (itemObj.Id && FILTERED_ITEM_IDS.has(String(itemObj.Id).toLowerCase())) {
    return true;
  }

  let navigationFilter: unknown = itemObj.NavigationFilter;

  // If NavigationFilter is not in the item, try to get it from page context
  if (!navigationFilter && getFilterFromPage && itemObj.Id) {
    const filterFromPage = getFilterFromPage(String(itemObj.Id));
    if (filterFromPage) {
      navigationFilter = filterFromPage;
    }
  }

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
  const [logoElement, setLogoElement] = useState<HTMLImageElement | null>(null);
  const { page } = useSitecore();
  const containerRef = useRef(null);
  const router = useRouter();

  // Clone logo from header when menu opens
  useEffect(() => {
    if (isOpenMenu && typeof window !== 'undefined') {
      const headerLogo = document.querySelector('.header .col-auto img, .header [class*="header-left"] img') as HTMLImageElement;
      if (headerLogo) {
        const logoClone = headerLogo.cloneNode(true) as HTMLImageElement;
        logoClone.style.width = '180px';
        logoClone.style.height = '28px';
        logoClone.style.maxWidth = '180px';
        logoClone.style.maxHeight = '28px';
        setLogoElement(logoClone);
      }
    } else {
      setLogoElement(null);
    }
  }, [isOpenMenu]);

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

  // Try to access NavigationFilter from page context
  // The NavigationFilter field is not in the serialized navigation data,
  // so we need to look it up from the page layout or use the Filter parameter
  const getNavigationFilterFromPage = (itemId: string): string | null => {
    try {
      // Check if page layout has the original item data
      if (page?.layout?.sitecore?.route) {
        // Try to find the item in the route's placeholders
        const findItemInPlaceholders = (placeholders: Record<string, unknown>): unknown => {
          for (const placeholder of Object.values(placeholders)) {
            if (Array.isArray(placeholder)) {
              for (const component of placeholder) {
                if (component && typeof component === 'object') {
                  const comp = component as Record<string, unknown>;
                  // Check if this component's fields contain the item
                  if (comp.fields && typeof comp.fields === 'object') {
                    const fields = comp.fields as Record<string, unknown>;
                    // Check if any field value has the matching ID
                    for (const fieldValue of Object.values(fields)) {
                      if (fieldValue && typeof fieldValue === 'object') {
                        const fv = fieldValue as Record<string, unknown>;
                        if (fv.Id === itemId && 'NavigationFilter' in fv) {
                          return fv.NavigationFilter;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          return null;
        };
        
        if (page.layout.sitecore.route.placeholders) {
          const filter = findItemInPlaceholders(page.layout.sitecore.route.placeholders as Record<string, unknown>);
          if (filter) return String(filter);
        }
      }
    } catch (error) {
      // Silently fail - this is a fallback approach
    }
    return null;
  };

  const list = Object.values(props.fields)
    .filter((element) => {
      if (!element) return false;
      const isFiltered = isNavigationFiltered(element, getNavigationFilterFromPage);
      if (process.env.NODE_ENV === 'development' && isFiltered) {
        console.log('Navigation: Filtered item', {
          displayName: (element as Fields).DisplayName,
          id: (element as Fields).Id,
          navigationFilter: (element as Record<string, unknown>).NavigationFilter,
        });
      }
      return !isFiltered;
    })
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
          <div 
            className="menu-humburger"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleToggleMenu();
            }}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="component-content">
            {/* Mobile menu header with logo and close button */}
            <div className="mobile-menu-header">
              {/* Logo - cloned from header */}
              <div className="mobile-menu-logo">
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggleMenu(undefined, false);
                    window.location.href = '/';
                  }}
                >
                  {logoElement && <img src={logoElement.src} alt={logoElement.alt || 'Logo'} />}
                </a>
              </div>
              {/* Close button */}
              <button
                className="mobile-menu-close"
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleMenu(undefined, false);
                }}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
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

// Chevron down SVG component
const ChevronDownIcon = () => (
  <svg
    width="14"
    height="8"
    viewBox="0 0 14 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="chevron-down-icon"
    style={{ marginLeft: '0.375rem', display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path
      d="M1 1L7.10286 7L13 1.13636"
      stroke="#262AFF"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NavigationList = (props: NavigationProps) => {
  const { page } = useSitecore();
  const [active, setActive] = useState(false);
  const classNameList = `${props.fields.Styles.concat('rel-level' + props.relativeLevel).join(
    ' '
  )}`;

  let children: JSX.Element[] = [];
  if (props.fields.Children && props.fields.Children.length) {
    // Note: getNavigationFilterFromPage is not available in NavigationList scope
    // NavigationFilter should be in the serialized data for children as well
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

  const hasChildren = children.length > 0;

  return (
    <li className={`${classNameList} ${active ? 'active' : ''}`} key={props.fields.Id} tabIndex={0}>
      <div
        className={`navigation-title ${hasChildren ? 'child' : ''}`}
        onClick={() => setActive(() => !active)}
      >
        <Link
          field={getLinkField(props)}
          editable={page.mode.isEditing}
          onClick={props.handleClick}
        >
          {getNavigationText(props)}
          {hasChildren && <ChevronDownIcon />}
        </Link>
      </div>
      {hasChildren ? <ul className="clearfix">{children}</ul> : null}
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
