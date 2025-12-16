import SearchBase from '@/assets/icons/search-base.svg';
import SearchBlack from '@/assets/icons/search-black.svg';
import SearchWhite from '@/assets/icons/search-white.svg';
import ImageItem from '@/components/ui/Image/ImageItem';
import LinkItem from '@/components/ui/Link/Link';
import { BREAKPOINTS } from '@/constants/appConstants';
import { MAX_KEYWORDS } from '@/constants/generalSearchConstants';
import { useUptickSuggestions } from '@/hooks/useSecondaryNav';
import { generateContentUrl, generateHomeUrl } from '@/utils/uptick/linkResolver';
import { handleKeydownForSearch } from '@/utils/handleKeydownForSearch';
import { useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { debounce } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ListGroup } from 'react-bootstrap';

type EditorialPageSearchProps = {
  searchPlaceholder?: JsonValue;
};

const EditorialPageSearch = ({ searchPlaceholder }: EditorialPageSearchProps) => {
  const { sitecoreContext } = useSitecoreContext();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= BREAKPOINTS.lg; // Tablet breakpoint
      setIsMobile(mobile);
      setIsExpanded(mobile); // Always expanded on mobile/tablet
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const { data: suggestionsData } = useUptickSuggestions({
    language: sitecoreContext?.language || 'en-US',
    term: debouncedSearchTerm.length >= MAX_KEYWORDS ? debouncedSearchTerm : '',
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedSetSearchTerm = useMemo(
    () =>
      debounce((term: string) => {
        setDebouncedSearchTerm(term);
      }, 200),
    []
  );

  const handleExpand = (): void => {
    setIsExpanded(true);
  };

  const handleSearch = async (): Promise<void> => {
    if (!searchValue.trim()) return;
    const homeUrl = generateHomeUrl(sitecoreContext);
    router.push(`${homeUrl}/search?term=${searchValue.trim()}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.length >= MAX_KEYWORDS) {
      setShowDropdown(true);
      debouncedSetSearchTerm(value);
    } else {
      setShowDropdown(false);
      setDebouncedSearchTerm('');
    }
  };

  const handleClickOutside = (e: MouseEvent): void => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      if (!isMobile) {
        setIsExpanded(false); // Only collapse on desktop
      }
      setSearchValue('');
      setShowDropdown(false);
      setDebouncedSearchTerm('');
      setIsHovering(false);
    }
  };

  useEffect(() => {
    if (isExpanded && inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [isExpanded, isMobile]);

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, isMobile]);

  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

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
    <div className="search-container" ref={containerRef}>
      {!isExpanded && (
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="search-icon-wrapper"
          onClick={handleExpand}
          role="button"
          tabIndex={0}
          aria-label="Open search"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleExpand();
            }
          }}
        >
          <ImageItem
            field={{
              value: {
                src: isHovering ? SearchWhite.src : SearchBase.src,
                alt: 'Search Icon',
              },
            }}
            nextImageSrc={isHovering ? SearchWhite.src : SearchBase.src}
            className="search-icon"
          />
        </div>
      )}

      <div className={`search-expanded ${isExpanded ? 'open' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          placeholder={searchPlaceholder?.jsonValue?.value}
          className="search-input"
          onKeyDown={handleKeyDown}
        />
        <div
          className="search-icon-wrapper search-icon-expanded"
          onClick={handleSearch}
          role="button"
          tabIndex={0}
          aria-label="Search"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSearch();
            }
          }}
        >
          <ImageItem
            field={{
              value: {
                src: isMobile ? SearchBlack?.src : isExpanded ? SearchWhite.src : SearchBase.src,
                alt: 'Search Icon',
              },
            }}
            nextImageSrc={
              isMobile ? SearchBlack?.src : isExpanded ? SearchWhite.src : SearchBase.src
            }
            className="search-icon search-icon-white"
          />
        </div>
      </div>

      {showDropdown && (
        <div className="search-dropdown" role="listbox" aria-label="Search suggestions">
          {suggestionsData && suggestionsData.length > 0 && (
            <ListGroup variant="flush">
              {suggestionsData.map((result, index) => (
                <ListGroup.Item
                  key={index}
                  id={`search-option-${index}`}
                  action
                  className={`search-dropdown-item ${selectedIndex === index ? 'selected' : ''}`}
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
  );
};

export default EditorialPageSearch;
