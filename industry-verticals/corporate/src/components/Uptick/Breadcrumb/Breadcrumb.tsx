import { useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { BreadcrumbProps, Industry } from './Breadcrumb.types';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  generateAllContentUrl,
  generateContentUrl,
  generateHomeUrl,
  generateIndustryUrl,
  generateAuthorsListingUrl,
} from '@/utils/uptick/linkResolver';
import { debounce } from 'lodash';
import { useUptickSuggestions } from '@/hooks/useSecondaryNav';
import { ListGroup } from 'react-bootstrap';
import { useRouter } from 'next/router';
import LinkItem from '@/components/ui/Link/Link';
import { MAX_KEYWORDS } from '@/constants/generalSearchConstants';
import { handleKeydownForSearch } from '@/utils/handleKeydownForSearch';
import getFieldValue from '@/utils/getFieldValue';
const Breadcrumb = (props: BreadcrumbProps) => {
  const router = useRouter();
  const { sitecoreContext } = useSitecoreContext();
  const searchPlaceholder = props?.fields?.data?.item?.searchPlaceholder?.jsonValue?.value;
  const rootPath = props?.fields?.data?.item?.uptickRootNode?.targetItem?.url?.path ?? '/';
  const rootTitle = props?.fields?.data?.item?.rootTitle?.jsonValue?.value;
  const titleField =
    sitecoreContext?.route?.fields?.ContentTitle ||
    sitecoreContext?.route?.fields?.Title ||
    sitecoreContext?.route?.name;
  const industries = sitecoreContext?.route?.fields?.Industries as unknown as Industry[];
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const pathname = usePathname();
  const allContentLabel = props?.fields?.data?.item?.allContentLabel?.jsonValue?.value;
  const allContentOverrideLabel = (sitecoreContext as any)?.uptickConfiguration
    ?.breadcrumbOverrideLabelField;
  const allContentUrl = generateAllContentUrl(sitecoreContext);
  const isAllContentPage =
    pathname == (sitecoreContext as any)?.uptickConfiguration?.allContentPage;

  // FIX: Safely access industries array to prevent undefined errors
  const firstIndustry = industries && industries.length > 0 ? industries[0] : null;
  const breadcrumbLabel = firstIndustry?.BreadcrumbLabel;
  const firstLevelCategory = breadcrumbLabel || firstIndustry?.Title;
  const slug = firstIndustry?.Slug;
  const industry = (sitecoreContext as any).IndustryPageDetail?.isIndustryPage;
  const industryTitle = (sitecoreContext as any).IndustryPageDetail?.industryLandingPageTitle;
  const isAuthors = sitecoreContext?.IsAuthorPage;
  const isAuthorLandingPage =
    pathname == (sitecoreContext as any)?.uptickConfiguration?.authorsListingPage;
  const authorLabel = props?.fields?.data?.item?.authorsLabel?.jsonValue?.value;
  const { data: suggestionsData } = useUptickSuggestions({
    language: sitecoreContext?.language || 'en-US',
    term: debouncedSearchTerm.length >= MAX_KEYWORDS ? debouncedSearchTerm : '',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedSetSearchTerm = useMemo(
    () =>
      debounce((term: string) => {
        setDebouncedSearchTerm(term);
      }, 200),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  // hide dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const handleRouteChange = () => {
      setShowDropdown(false);
      setDebouncedSearchTerm('');
      setSelectedIndex(-1);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchValue(value);
    setSelectedIndex(-1);

    if (value.length >= MAX_KEYWORDS) {
      setShowDropdown(true);
      debouncedSetSearchTerm(value);
    } else {
      setShowDropdown(false);
      setDebouncedSearchTerm('');
    }
  };

  const handleMouseEnter = (index: number): void => {
    setSelectedIndex(index);
  };

  const handleSearch = async (): Promise<void> => {
    if (!searchValue.trim()) return;
    const homeUrl = generateHomeUrl(sitecoreContext);
    router.push(`${homeUrl}/search?term=${searchValue.trim()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    handleKeydownForSearch({
      e,
      showDropdown,
      suggestionsData,
      setStateAction: setSelectedIndex,
      setShowDropdown,
      selectedIndex,
      handleSearch,
      sitecoreContext,
      router,
    });
  };

  return (
    <div className="uptick-breadcrumb">
      <div className="container">
        <nav aria-label="Breadcrumb">
          {/* Search Input  */}
          <div className="breadcrumb-search" ref={containerRef}>
            <input
              type="text"
              placeholder={searchPlaceholder}
              aria-label="Search"
              value={searchValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <span className="card-icon" onClick={handleSearch}></span>
            {showDropdown && (
              <div className="search-dropdown" role="listbox" aria-label="Search suggestions">
                {suggestionsData && suggestionsData.length > 0 && (
                  <ListGroup variant="flush">
                    {suggestionsData.map((result, index) => (
                      <ListGroup.Item
                        key={index}
                        id={`search-option-${index}`}
                        action
                        onMouseEnter={() => handleMouseEnter(index)}
                        className={`search-dropdown-item ${
                          selectedIndex === index ? 'selected' : ''
                        }`}
                        role="option"
                        aria-selected={selectedIndex === index}
                      >
                        <LinkItem
                          className="btn-cta-tertiary"
                          value={{
                            text: result?.contentTitle?.jsonValue?.value ?? '',
                            href: `${generateContentUrl(
                              result?.slug ? result?.slug?.jsonValue?.value : '/',
                              sitecoreContext
                            )}`,
                          }}
                        />
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}

                {suggestionsData &&
                  suggestionsData.length === 0 &&
                  debouncedSearchTerm.length >= MAX_KEYWORDS && (
                    <div className="search-no-results">
                      <p>{`No articles found for ${debouncedSearchTerm}`}</p>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Breadcrumb Links  */}
          <ol className="breadcrumb-list">
            <li className="breadcrumb-item">
              <Link className="link-item" href={rootPath} aria-label={rootTitle} title={rootTitle}>
                <span>{rootTitle}</span>
              </Link>
            </li>
            {!isAuthorLandingPage && !isAllContentPage && (
              <li className="breadcrumb-item level-two">
                <Link
                  className="link-item"
                  href={isAuthors ? generateAuthorsListingUrl(sitecoreContext) : allContentUrl}
                >
                  {isAuthors ? authorLabel : allContentOverrideLabel || allContentLabel}
                </Link>
              </li>
            )}
            {(industry || firstLevelCategory) && (
              <li className="breadcrumb-item level-three">
                {industry ? (
                  <span className="link-text">{industryTitle}</span>
                ) : (
                  <Link className="link-item" href={generateIndustryUrl(slug, sitecoreContext)}>
                    {firstLevelCategory}
                  </Link>
                )}
              </li>
            )}
            {getFieldValue(titleField as any) && (
              <li className="breadcrumb-item" aria-current="page">
                <span className="pagenode">{getFieldValue(titleField as any)}</span>
              </li>
            )}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
