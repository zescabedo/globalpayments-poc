import ImageItem from '@/components/ui/Image/ImageItem';
import { HeaderProps, MenuObject, Language } from './Header.types';
import { Container, Nav, Navbar, NavDropdown, Offcanvas, Row } from 'react-bootstrap';
import React, { useCallback, useEffect, useState } from 'react';
import LinkItem from '@/components/ui/Link/Link';
import { LinkFieldValue } from '@sitecore-jss/sitecore-jss-dev-tools';
import {
  RichText as JssRichText,
  LinkField,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-react';
import { debounce } from 'lodash';
import { headerConstants, urlPatterns } from '@/constants/appConstants';
import SearchInput from '@/components/GeneralSearch/SearchInput';
import { useSitecoreContext } from '@sitecore-jss/sitecore-jss-react';
import { useRouter } from 'next/router';
import { parseDate } from '@/utils/DateUtils';
import Ctas from '@/components/ui/CTA/CTA';
import Cookies from 'js-cookie';
import QuickLinkList from './QuickLinkList';
import { useModal } from '@/components/ui/Modal/ModalProvider';
import { normalizeUrl, resolveWildcardUrl } from '@/utils/urlUtils';

interface ChildMenuProps {
  title: RichTextField;
  children: MenuObject[];
}

export const Default = (props: HeaderProps): JSX.Element => {
  const { openModal } = useModal();
  const { sitecoreContext } = useSitecoreContext();
  const router = useRouter();
  const currentLanguages = JSON.parse(
    typeof sitecoreContext?.contextLanguages === 'string' ? sitecoreContext?.contextLanguages : '[]'
  );

  const currentLocale = router.locale || sitecoreContext?.language || '';

  // Constants for URL patterns and wildcards
  const { localePrefix, wildcardPlaceholder, basePathMatcher } = urlPatterns;

  const handleLanguageChange = (selectedLanguage: string | null) => {
    if (!selectedLanguage) return;

    const selectedLangObj = currentLanguages.find(
      (lang: Language) => lang.languageTag?.toLowerCase() === selectedLanguage.toLowerCase()
    );

    if (!selectedLangObj?.languageUrl) return;

    let languageUrl = normalizeUrl(selectedLangObj.languageUrl);

    // Handle wildcard pages with ,-w-, pattern
    if (languageUrl.includes(wildcardPlaceholder)) {
      languageUrl = resolveWildcardUrl(
        languageUrl,
        router.asPath,
        wildcardPlaceholder,
        localePrefix,
        basePathMatcher
      );
    }

    // Force a full page reload to ensure middleware processes the locale change
    window.location.href = languageUrl;
  };

  const { headerDebounceTime, defaultHeaderCtaModalTheme } = headerConstants;
  const isLandingPageHeader = props?.params?.FieldNames === 'LandingPageHeader';
  const propsFieldsData = props?.fields?.data?.item || {};
  const normalLogo = propsFieldsData?.normalLogo;
  const mobileLogo = propsFieldsData?.mobileLogo?.src ? propsFieldsData?.mobileLogo : normalLogo;
  const stickyLogo = propsFieldsData?.stickyLogo?.src ? propsFieldsData?.stickyLogo : normalLogo;
  const mobileStickyLogo = propsFieldsData?.mobileStickyLogo?.src
    ? propsFieldsData?.mobileStickyLogo
    : stickyLogo;
  const mainMenu = propsFieldsData?.mainMenu?.targetItem?.children?.results || [];
  const ctaItem = propsFieldsData?.cta;
  const showPrimaryCTA = propsFieldsData?.showPrimaryCTA?.jsonValue?.value || false;
  const openHeaderCtaInModal = propsFieldsData?.openHeaderCtaInModal?.jsonValue?.value;
  const headerCtaModalTheme =
    propsFieldsData?.headerCtaModalTheme?.targetItem?.value?.jsonValue?.value ||
    defaultHeaderCtaModalTheme;
  const utilityMenu = propsFieldsData?.utilityLinks?.targetItem?.children?.results || [];
  const showUtilityNav = propsFieldsData?.showUtilityNav?.jsonValue?.value || false;
  const secondarymenu = propsFieldsData?.secondaryMenu?.targetItem?.children?.results || [];
  const logoPlacement = propsFieldsData?.logoPlacement?.jsonValue?.fields?.Value?.value || '';
  const homePageLink = propsFieldsData?.homePageLink?.jsonValue?.value?.href || '/';
  const searchPageUrl = propsFieldsData?.searchPageUrl?.jsonValue?.value?.href || '';
  const popularSearchTitle = propsFieldsData?.popularSearches?.targetItem?.title?.jsonValue || '';
  const popularSearchesList = propsFieldsData?.popularSearches?.targetItem?.children?.results || [];
  const quickLinksTitle = propsFieldsData?.quickLinks?.targetItem?.title?.jsonValue || '';
  const quickLinksList = propsFieldsData?.quickLinks?.targetItem?.children?.results || [];
  const showLanguageSwitcher = propsFieldsData?.showLanguageSwitcher?.jsonValue?.value || false;
  const languageSwitcherType =
    propsFieldsData?.languageSwitcherType?.jsonValue?.fields?.Value?.value;
  const showSearchFunctionality =
    propsFieldsData?.showSearchFunctionality?.jsonValue?.value || false;
  const alertText = propsFieldsData?.alertBanner?.targetItem?.alertText?.jsonValue;
  const bannerStartDateTime =
    propsFieldsData?.alertBanner?.targetItem?.bannerStartDateTime?.jsonValue?.value;
  const bannerEndDateTime =
    propsFieldsData?.alertBanner?.targetItem?.bannerEndDateTime?.jsonValue?.value;
  const alertCta = propsFieldsData?.alertBanner?.targetItem?.ctaLink;
  const isBannerEnabled = propsFieldsData?.isBannerEnabled?.jsonValue?.value;
  const leftAlertImage = propsFieldsData?.alertBanner?.targetItem?.leftAlertImage;
  const rightAlertImage = propsFieldsData?.alertBanner?.targetItem?.rightAlertImage;
  const mobileAlertImage = propsFieldsData?.alertBanner?.targetItem?.mobileAlertImage;
  const isSecondaryVariant = propsFieldsData?.alertBanner?.targetItem?.isSecondaryVariant;
  const timeToResetBanner = propsFieldsData?.alertBanner?.targetItem?.timeToResetBanner;
  const alertBannerBackgroundTheme =
    propsFieldsData?.alertBanner?.targetItem?.backgroundTheme?.targetItem?.value?.jsonValue?.value;
  const alertBannerTargetItem = propsFieldsData?.alertBanner?.targetItem;
  const id = propsFieldsData?.alertBanner?.targetItem?.id;
  const signupModal = sitecoreContext?.route?.fields?.signupModal as LinkField;
  const modalUrl = signupModal?.value?.href || ctaItem?.jsonValue?.value?.href;

  const [showParentMenu, setShowParentMenu] = useState<boolean>(false);
  const [showChildMenu, setShowChildMenu] = useState<boolean>(false);
  const [showLandingPageMenu, setShowLandingPageMenu] = useState<boolean>(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState<boolean>(false);
  const [childMenuTitle, setChildMenuTitle] = useState<RichTextField>();
  const [childMenuData, setChildMenuData] = useState<MenuObject[]>([]);
  const [headerState, setHeaderState] = useState({
    isSticky: false,
    isVisible: true,
    lastScrollY: 0,
    isPrevSticky: false,
  });
  const [lastScrollDirection, setLastScrollDirection] = useState<'up' | 'down' | null>(null);
  const resetTimeInDays = parseInt(timeToResetBanner?.jsonValue?.value, 10) || 0;

  const [isAlertBannerVisible, setIsAlertBannerVisible] = useState(false);

  const [openSearchpopup, setOpenSearchpopup] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

  const handleClickOnSearchpopup = () => {
    setOpenSearchpopup(!openSearchpopup);
  };

  const handleSearch = () => {
    setOpenSearchpopup(false);
    setShowParentMenu(false);
  };

  const handleChildCanvasMenu = (data: ChildMenuProps) => {
    setShowChildMenu(true);
    setChildMenuTitle(data?.title);
    setChildMenuData(data?.children);
  };

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - headerState.lastScrollY;
    const isScrollingDown = scrollDelta > 0;
    const isScrolling = Math.abs(scrollDelta) > 0;

    if (isScrolling) {
      setLastScrollDirection(isScrollingDown ? 'down' : 'up');
    }

    setHeaderState((prevState) => {
      if (currentScrollY < 100) {
        return {
          isSticky: false,
          isVisible: true,
          isPrevSticky: false,
          lastScrollY: currentScrollY,
        };
      }

      if (isScrollingDown && prevState.isVisible && prevState.isSticky) {
        return {
          isSticky: true,
          isVisible: false,
          isPrevSticky: true,
          lastScrollY: currentScrollY,
        };
      }

      if (isScrollingDown && prevState.isVisible) {
        return {
          isSticky: true,
          isVisible: false,
          isPrevSticky: false,
          lastScrollY: currentScrollY,
        };
      }

      if (!isScrollingDown && !prevState.isVisible) {
        return {
          isPrevSticky: false,
          isSticky: true,
          isVisible: true,
          lastScrollY: currentScrollY,
        };
      }

      return {
        ...prevState,
        lastScrollY: currentScrollY,
      };
    });
  }, [headerState.lastScrollY, lastScrollDirection]);

  const checkAndUpdateBannerVisibility = () => {
    const now = new Date();
    const startTime = bannerStartDateTime ? parseDate(bannerStartDateTime) : null;
    const endTime = bannerEndDateTime ? parseDate(bannerEndDateTime) : null;

    const afterStartDate = startTime ? now >= startTime : false;
    const beforeEndDate = endTime ? now <= endTime : true;
    const isWithinTimeRange = afterStartDate && beforeEndDate;

    const dismissedBannerId = Cookies.get('alertBannerDismissed');
    if (isBannerEnabled && isWithinTimeRange && id && id !== dismissedBannerId) {
      setIsAlertBannerVisible(true);
    } else {
      setIsAlertBannerVisible(false);
    }
  };

  useEffect(() => {
    const debouncedHandler = debounce(handleScroll, headerDebounceTime);

    checkAndUpdateBannerVisibility();

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', debouncedHandler);
    }

    return () => {
      window.removeEventListener('scroll', debouncedHandler);
      debouncedHandler.cancel();
    };
  }, [id, handleScroll]);

  const handleClose = () => {
    Cookies.set('alertBannerDismissed', id || '', { expires: resetTimeInDays });
    setIsAlertBannerVisible(false);
  };

  const headerClasses = `header-container ${headerState.isSticky ? 'sticky' : ''} ${
    headerState.isVisible ? 'visible' : 'hidden'
  } ${
    (headerState.isSticky && lastScrollDirection === 'up') || headerState.isPrevSticky
      ? 'sticky-animate'
      : ''
  }  ${isLandingPageHeader ? 'landing-page-header' : ''}`.trim();

  // Add handler for dropdown clicks
  const handleSearchDropdownClick = () => {
    if (openSearchpopup) {
      setOpenSearchpopup(false);
    }
  };

  const alertBannerBackgroundThemeClass = ` bg-${alertBannerBackgroundTheme}`;
  const countryCode = currentLocale?.split('-')[1]?.toUpperCase();
  const filteredRegions = currentLanguages.filter((lang: Language) => {
    const parts = lang?.languageTag?.toLowerCase().split('-');
    return parts[1] === countryCode?.toLowerCase();
  });

  const landingPageContactNumberValue =
    propsFieldsData?.landingPageContactNumber?.jsonValue?.value || '';
  const landingPageImage = propsFieldsData?.landingPageImage;

  const handleMobileLinkClick = () => {
    setShowParentMenu(false);
    setShowChildMenu(false);
    setShowLanguageMenu(false);
    setShowLandingPageMenu(false);
  };

  const handleDesktopLinkClick = () => {
    setOpenDropdownIndex(null); // Close any open dropdown
    if (openSearchpopup) {
      setOpenSearchpopup(false);
    }
  };

  return (
    <>
      {/* Desktop Menu */}
      <div className={headerClasses} aria-label="Site header">
        {!headerState.isSticky && isAlertBannerVisible && (
          <div className={`alert-banner ${alertBannerBackgroundThemeClass}`}>
            {leftAlertImage?.src && (
              <div
                className="left-image"
                style={
                  {
                    '--bg-image': `url(${leftAlertImage.src})`,
                  } as React.CSSProperties
                }
              ></div>
            )}
            <div className="alert-content">
              {alertText?.value && <JssRichText field={alertText} tag="p" />}
              {alertCta?.jsonValue?.value?.href && (
                <div className="cta" onClick={handleClose}>
                  <Ctas {...alertBannerTargetItem} />
                </div>
              )}
            </div>

            {rightAlertImage?.src && (
              <div
                className={`right-image ${isSecondaryVariant ? 'secondary' : ''}`}
                style={
                  {
                    '--bg-image': `url(${rightAlertImage?.src})`,
                    '--bg-image-mobile': `url(${mobileAlertImage?.src || rightAlertImage?.src})`,
                  } as React.CSSProperties
                }
              ></div>
            )}
            <div className="close-btn" onClick={handleClose}></div>
          </div>
        )}
        <Container>
          <Navbar expand="lg" aria-label="Primary navigation">
            <div className={`logo-container ${logoPlacement}`}>
              <Navbar.Brand href={homePageLink} aria-label="Home">
                <ImageItem
                  field={normalLogo?.jsonValue}
                  nextImageSrc={normalLogo?.jsonValue?.value?.src}
                  className="primary-logo"
                  aria-hidden="false"
                />
                <ImageItem
                  field={stickyLogo?.jsonValue}
                  nextImageSrc={stickyLogo?.jsonValue?.value?.src}
                  className="sticky-logo"
                  aria-hidden="true"
                />
                <ImageItem
                  field={mobileStickyLogo?.jsonValue}
                  nextImageSrc={mobileStickyLogo?.jsonValue?.value?.src}
                  className="mobile-sticky-logo"
                  aria-hidden="true"
                />
              </Navbar.Brand>
              {isLandingPageHeader && landingPageImage?.src && (
                <ImageItem
                  className="landing-page-image"
                  field={landingPageImage?.jsonValue}
                  nextImageSrc={landingPageImage?.src}
                />
              )}
            </div>
            {!isLandingPageHeader && (
              <div className="mainmenu-container" role="navigation" aria-label="Main menu">
                <Nav navbarScroll role="menubar" aria-label="Main menu items">
                  {mainMenu?.map((menuItem, index) => {
                    if (menuItem?.children?.results?.length) {
                      return (
                        <NavDropdown
                          key={index}
                          title={
                            <JssRichText
                              tag="span"
                              field={menuItem?.menuTitle?.jsonValue as RichTextField}
                            />
                          }
                          id={`nav-dropdown-${index}`}
                          role="menuitem"
                          aria-haspopup="true"
                          onClick={handleSearchDropdownClick}
                          show={openDropdownIndex === index}
                          onToggle={(isOpen) => setOpenDropdownIndex(isOpen ? index : null)}
                        >
                          <div
                            className="dropdown-columns"
                            role="menu"
                            aria-label={`${menuItem?.menuTitle?.jsonValue?.value || ''} submenu`}
                          >
                            {menuItem?.children?.results?.map((columnData, colIndex) => {
                              return (
                                <div className="dropdown-column" key={colIndex}>
                                  <div onClick={handleDesktopLinkClick}>
                                    {columnData?.menuLink?.jsonValue?.value?.href ? (
                                      <LinkItem
                                        className="dropdown-header"
                                        field={columnData?.menuLink?.jsonValue}
                                        value={
                                          columnData?.menuLink?.jsonValue?.value as LinkFieldValue
                                        }
                                        role="menuitem"
                                        tabIndex={0}
                                      />
                                    ) : (
                                      columnData?.menuTitle?.jsonValue?.value && (
                                        <JssRichText
                                          className="dropdown-header"
                                          field={columnData?.menuTitle?.jsonValue as RichTextField}
                                          role="menuitem"
                                          tabIndex={0}
                                        />
                                      )
                                    )}
                                  </div>
                                  {columnData?.children?.results?.map((childItem, childIndex) => {
                                    const childTitle = childItem?.menuTitle?.jsonValue?.value;
                                    if (childTitle) {
                                      childItem.menuLink.jsonValue.value.text = childTitle;
                                    }
                                    return (
                                      childItem?.menuLink?.jsonValue?.value?.href && (
                                        <div className="dropdown-item" key={childIndex}>
                                          <LinkItem
                                            className="dropdown-item-title"
                                            field={childItem?.menuLink?.jsonValue}
                                            value={
                                              childItem?.menuLink?.jsonValue
                                                ?.value as LinkFieldValue
                                            }
                                            aria-label={`${
                                              childItem?.menuLink?.jsonValue?.value?.text || ''
                                            } ${childItem?.menuSummary?.jsonValue?.value || ''}`}
                                            onClick={handleDesktopLinkClick}
                                          />
                                          {childItem?.menuSummary?.jsonValue?.value && (
                                            <JssRichText
                                              className="dropdown-item-summary"
                                              field={
                                                childItem?.menuSummary?.jsonValue as RichTextField
                                              }
                                              aria-hidden="true"
                                            />
                                          )}
                                        </div>
                                      )
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </NavDropdown>
                      );
                    }
                    if (menuItem?.menuLink?.jsonValue?.value?.href) {
                      return (
                        <LinkItem
                          key={index}
                          className="nav-link"
                          field={menuItem?.menuLink?.jsonValue}
                          value={menuItem?.menuLink?.jsonValue?.value as LinkFieldValue}
                          role="menuitem"
                          tabIndex={0}
                          aria-label={menuItem?.menuLink?.jsonValue?.value?.text || ''}
                        />
                      );
                    }
                    return <></>;
                  })}
                </Nav>
              </div>
            )}
            <div
              className="secondarymenu-container"
              role="navigation"
              aria-label="Secondary navigation"
            >
              {!isLandingPageHeader && secondarymenu?.length > 0 && (
                <Navbar className="secondary-menu">
                  <Nav role="menubar" aria-label="Secondary menu items">
                    {secondarymenu?.map((secondaryMenuItem, secondaryMenuIndex) => (
                      <LinkItem
                        className="nav-link"
                        key={secondaryMenuIndex}
                        field={secondaryMenuItem?.link?.jsonValue}
                        value={secondaryMenuItem?.link?.jsonValue?.value as LinkFieldValue}
                        role="menuitem"
                        tabIndex={0}
                        aria-label={secondaryMenuItem?.link?.jsonValue?.value?.text || ''}
                      />
                    ))}
                  </Nav>
                </Navbar>
              )}

              {openSearchpopup && (
                <>
                  <div className="search-popup">
                    <div className="submenu">
                      <div className="search-popup-container">
                        <SearchInput
                          handleSearch={handleSearch}
                          searchPageUrl={searchPageUrl}
                          useShallowRouting={false}
                        />
                      </div>
                      {popularSearchesList.length || quickLinksList.length ? (
                        <Container className="search-prompts">
                          <Row>
                            <QuickLinkList title={popularSearchTitle} items={popularSearchesList} />
                            <QuickLinkList title={quickLinksTitle} items={quickLinksList} />
                          </Row>
                        </Container>
                      ) : null}
                    </div>
                  </div>
                </>
              )}

              {!isLandingPageHeader && showSearchFunctionality && (
                <div className={`search-toggle ${openSearchpopup ? 'active' : ''}`} role="search">
                  <div
                    className="search-toggle-icon"
                    role="button"
                    aria-label="Toggle search"
                    aria-expanded="false"
                    tabIndex={0}
                    onClick={handleClickOnSearchpopup}
                  ></div>
                </div>
              )}
              {isLandingPageHeader && landingPageImage?.src && (
                <ImageItem
                  className="landing-page-image"
                  field={landingPageImage?.jsonValue}
                  nextImageSrc={landingPageImage?.src}
                />
              )}
              {isLandingPageHeader && landingPageContactNumberValue && (
                <a className="landing-page-contact" href={`tel:${landingPageContactNumberValue}`}>
                  <JssRichText field={propsFieldsData?.landingPageContactNumber?.jsonValue} />
                </a>
              )}
              {showPrimaryCTA && modalUrl && (
                <div className="cta-box" aria-label="Call to action">
                  <LinkItem
                    className="btn btn-cta-secondary btn-sm"
                    onClick={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      const eaLink = target.getAttribute('data-ea-link') || '';
                      const href = modalUrl || '';

                      sessionStorage.setItem('lastCtaEaLink', eaLink);
                      sessionStorage.setItem('lastCtaHref', href);

                      openModal(modalUrl as string, headerCtaModalTheme);
                    }}
                    openInModal={openHeaderCtaInModal}
                    field={ctaItem?.jsonValue}
                    value={ctaItem?.jsonValue?.value as LinkFieldValue}
                    role="button"
                    tabIndex={0}
                    aria-label={ctaItem?.jsonValue?.value?.text || 'Call to action'}
                  />
                </div>
              )}
            </div>
            {!isLandingPageHeader && showUtilityNav && utilityMenu?.length > 0 && (
              <div
                className="utilitymenu-container"
                role="navigation"
                aria-label="Utility navigation"
              >
                <ul className="utility-nav-list" role="menubar">
                  {utilityMenu?.map((utilityItem, index) => (
                    <li key={index} role="none">
                      <div
                        className="utility-nav-link"
                        role="menuitem"
                        aria-label={utilityItem?.link?.jsonValue?.value?.text || 'Utility link'}
                      >
                        <LinkItem
                          field={utilityItem?.link?.jsonValue}
                          value={utilityItem?.link?.jsonValue?.value as LinkFieldValue}
                          tabIndex={0}
                        />
                      </div>
                    </li>
                  ))}
                  {showLanguageSwitcher &&
                    currentLanguages?.length > 0 &&
                    (() => {
                      const currentLang = currentLanguages.find(
                        (lang: Language) =>
                          lang?.languageTag?.toLowerCase() === currentLocale?.toLowerCase()
                      );

                      return (
                        <>
                          {languageSwitcherType === 'languageselector' && (
                            <NavDropdown
                              title={currentLang?.languageName}
                              className="language-switcher"
                              onSelect={handleLanguageChange}
                              role="menuitem"
                            >
                              {currentLanguages?.map((lang: Language, index: number) => (
                                <NavDropdown.Item
                                  key={index}
                                  eventKey={lang?.languageTag}
                                  active={
                                    lang?.languageTag?.toLowerCase() ===
                                    currentLocale?.toLowerCase()
                                  }
                                >
                                  {lang?.languageIcon?.url && (
                                    <img src={lang.languageIcon.url} alt={lang.languageTag} />
                                  )}
                                  {lang?.languageName}
                                </NavDropdown.Item>
                              ))}
                            </NavDropdown>
                          )}

                          {languageSwitcherType === 'regionselector' &&
                            filteredRegions.length > 1 && (
                              <NavDropdown
                                title={currentLang?.languageName}
                                className="region-switcher"
                                onSelect={handleLanguageChange}
                              >
                                {filteredRegions.map((lang: Language, index: number) => (
                                  <NavDropdown.Item
                                    key={index}
                                    eventKey={lang?.languageTag}
                                    active={
                                      lang?.languageTag?.toLowerCase() ===
                                      currentLocale?.toLowerCase()
                                    }
                                  >
                                    {lang?.languageName}
                                  </NavDropdown.Item>
                                ))}
                              </NavDropdown>
                            )}
                        </>
                      );
                    })()}
                </ul>
              </div>
            )}
            <div className="mobilemenu-container">
              {isLandingPageHeader && landingPageImage?.src && (
                <ImageItem
                  className="landing-page-image"
                  field={landingPageImage?.jsonValue}
                  nextImageSrc={landingPageImage?.src}
                />
              )}
              {isLandingPageHeader && landingPageContactNumberValue && (
                <div className="landing-page-contact-box">
                  <a href={`tel:${landingPageContactNumberValue}`} aria-label="Call us"></a>
                </div>
              )}
              {showPrimaryCTA && modalUrl && (
                <div className="cta-box" aria-label="Mobile call to action">
                  <LinkItem
                    className="btn btn-cta-secondary btn-sm"
                    field={ctaItem?.jsonValue}
                    value={ctaItem?.jsonValue?.value as LinkFieldValue}
                    onClick={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      const eaLink = target.getAttribute('data-ea-link') || '';
                      const href = modalUrl || '';

                      sessionStorage.setItem('lastCtaEaLink', eaLink);
                      sessionStorage.setItem('lastCtaHref', href);

                      openModal(modalUrl as string, headerCtaModalTheme);
                    }}
                    openInModal={openHeaderCtaInModal}
                    role="button"
                    tabIndex={0}
                    aria-label={ctaItem?.jsonValue?.value?.text || 'Call to action'}
                  />
                </div>
              )}
              {isLandingPageHeader ? (
                <Navbar.Toggle
                  onClick={() => setShowLandingPageMenu(true)}
                  aria-label="Toggle landing page mobile menu"
                  aria-expanded={showLandingPageMenu}
                  aria-controls="landing-page-menu"
                />
              ) : (
                <Navbar.Toggle
                  onClick={() => setShowParentMenu(true)}
                  aria-label="Toggle mobile menu"
                  aria-expanded={showParentMenu}
                  aria-controls="mobile-menu"
                />
              )}
            </div>
          </Navbar>
        </Container>
      </div>

      {/* Parent Offcanvas */}
      <Offcanvas
        show={showParentMenu}
        onHide={() => setShowParentMenu(false)}
        placement="end"
        id="mobile-menu"
        aria-label="Mobile navigation"
        role="dialog"
        aria-modal="true"
      >
        <Offcanvas.Header closeButton={true} aria-label="Menu header">
          <div className="logo-container">
            <Navbar.Brand href="/">
              <ImageItem
                field={mobileLogo?.jsonValue}
                nextImageSrc={mobileLogo?.jsonValue?.value?.src}
                aria-label="Site logo"
              />
            </Navbar.Brand>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {mainMenu?.map((menuItem, index) => {
            if (menuItem?.children?.results?.length) {
              return (
                <div
                  key={index}
                  className="navigation-title has-children chevron-base-next-sm"
                  onClick={() =>
                    handleChildCanvasMenu({
                      title: menuItem?.menuTitle?.jsonValue,
                      children: menuItem?.children?.results,
                    })
                  }
                  role="button"
                  aria-haspopup="true"
                  aria-expanded={showChildMenu}
                  tabIndex={0}
                >
                  <JssRichText
                    tag="span"
                    field={menuItem?.menuTitle?.jsonValue as RichTextField}
                    aria-label={`${menuItem?.menuTitle?.jsonValue?.value || ''} submenu`}
                  />
                </div>
              );
            }
            if (menuItem?.menuLink?.jsonValue?.value?.href) {
              return (
                <div
                  key={index}
                  className="navigation-title"
                  role="menuitem"
                  onClick={() => handleMobileLinkClick()}
                >
                  <LinkItem
                    className="nav-link"
                    field={menuItem?.menuLink?.jsonValue}
                    value={menuItem?.menuLink?.jsonValue?.value as LinkFieldValue}
                    tabIndex={0}
                    aria-label={menuItem?.menuLink?.jsonValue?.value?.text || ''}
                  />
                </div>
              );
            }
            return <></>;
          })}
          {secondarymenu?.map(
            (secondaryMenuItem, secondaryMenuIndex) =>
              secondaryMenuItem?.link?.jsonValue?.value?.href && (
                <div
                  key={secondaryMenuIndex}
                  className="navigation-title"
                  role="menuitem"
                  onClick={() => handleMobileLinkClick()}
                >
                  <LinkItem
                    className="nav-link"
                    field={secondaryMenuItem?.link?.jsonValue}
                    value={secondaryMenuItem?.link?.jsonValue?.value as LinkFieldValue}
                    tabIndex={0}
                    aria-label={secondaryMenuItem?.link?.jsonValue?.value?.text || ''}
                  />
                </div>
              )
          )}
          {showSearchFunctionality && (
            <SearchInput
              handleSearch={handleSearch}
              isMobile={true}
              searchPageUrl={searchPageUrl}
            />
          )}
          {showUtilityNav && utilityMenu?.length > 0 && (
            <ul className="utility-nav-list" role="menu" aria-label="Utility navigation">
              {utilityMenu?.map(
                (utilityItem, index) =>
                  utilityItem?.link?.jsonValue?.value?.href && (
                    <li key={index} role="none">
                      <div
                        className="utility-nav-link"
                        role="menuitem"
                        onClick={() => handleMobileLinkClick()}
                      >
                        <LinkItem
                          field={utilityItem?.link?.jsonValue}
                          value={utilityItem?.link?.jsonValue?.value as LinkFieldValue}
                          tabIndex={0}
                          aria-label={utilityItem?.link?.jsonValue?.value?.text || ''}
                        />
                      </div>
                    </li>
                  )
              )}
            </ul>
          )}
          {showLanguageSwitcher &&
            currentLanguages?.length > 1 &&
            (() => {
              const currentLang = currentLanguages.find(
                (lang: Language) =>
                  lang?.languageTag?.toLowerCase() === currentLocale?.toLowerCase()
              );

              return (
                <>
                  {languageSwitcherType === 'languageselector' && (
                    <div
                      className="language-switcher mobile navigation-title"
                      role="menuitem"
                      onClick={() => setShowLanguageMenu(true)}
                      tabIndex={0}
                      aria-haspopup="true"
                      aria-expanded={showChildMenu}
                    >
                      <div className="language-switcher-header">
                        {currentLang?.languageIcon?.url && (
                          <img src={currentLang.languageIcon.url} alt={currentLang.languageTag} />
                        )}
                        <div>{currentLang?.languageName}</div>
                      </div>
                    </div>
                  )}
                  {languageSwitcherType === 'regionselector' && filteredRegions.length > 1 && (
                    <div
                      className="region-switcher mobile navigation-title"
                      role="menuitem"
                      onClick={() => setShowLanguageMenu(true)}
                      tabIndex={0}
                      aria-haspopup="true"
                      aria-expanded={showChildMenu}
                    >
                      <div className="region-switcher-header">
                        {currentLang?.languageIcon?.url && (
                          <img src={currentLang.languageIcon.url} alt={currentLang.languageTag} />
                        )}
                        <div>{currentLang?.languageName}</div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

          {showPrimaryCTA && modalUrl && (
            <div
              className="mobile-cta-box"
              aria-label="Call to action"
              onClick={() => handleMobileLinkClick()}
            >
              <LinkItem
                className="btn btn-cta-secondary btn-sm"
                field={ctaItem?.jsonValue}
                value={ctaItem?.jsonValue?.value as LinkFieldValue}
                onClick={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  const eaLink = target.getAttribute('data-ea-link') || '';
                  const href = modalUrl || '';

                  sessionStorage.setItem('lastCtaEaLink', eaLink);
                  sessionStorage.setItem('lastCtaHref', href);

                  openModal(modalUrl as string, headerCtaModalTheme);
                }}
                openInModal={openHeaderCtaInModal}
                role="button"
                tabIndex={0}
                aria-label={ctaItem?.jsonValue?.value?.text || 'Call to action'}
              />
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Children Offcanvas */}
      <Offcanvas
        show={showChildMenu}
        onHide={() => setShowChildMenu(false)}
        placement="end"
        aria-label="Submenu navigation"
        role="dialog"
        aria-modal="true"
      >
        <Offcanvas.Header className="child-offcanvas-header" closeButton={false}>
          <div
            className="chevron-base-previous-sm back-arrow"
            onClick={() => setShowChildMenu(false)}
            role="button"
            aria-label="Return to main menu"
            tabIndex={0}
          />
          <div className="subnav-title" role="heading" aria-level={2}>
            <JssRichText tag="span" field={childMenuTitle as RichTextField} />
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ul className="child-nav-list" role="menu" aria-label="Submenu items">
            {childMenuData.map((submenuItem, index) => (
              <li
                className="rel-level2"
                key={index}
                role="none"
                onClick={() => handleMobileLinkClick()}
              >
                {submenuItem?.menuLink?.jsonValue?.value?.href ? (
                  <LinkItem
                    className="navigation-title"
                    field={submenuItem?.menuLink?.jsonValue}
                    value={submenuItem?.menuLink?.jsonValue?.value as LinkFieldValue}
                    role="menuitem"
                    tabIndex={0}
                  />
                ) : (
                  submenuItem?.menuTitle?.jsonValue?.value && (
                    <JssRichText
                      className="navigation-title"
                      field={submenuItem?.menuTitle?.jsonValue as RichTextField}
                      aria-current="page"
                    />
                  )
                )}
                {submenuItem?.children?.results?.map((childItem, childIndex) => {
                  const childTitle = childItem?.menuTitle?.jsonValue?.value;
                  if (childTitle) {
                    childItem.menuLink.jsonValue.value.text = childTitle;
                  }
                  return (
                    childItem?.menuLink?.jsonValue?.value?.href && (
                      <div className="dropdown-item" key={childIndex}>
                        <LinkItem
                          className="dropdown-item-title"
                          field={childItem?.menuLink?.jsonValue}
                          value={childItem?.menuLink?.jsonValue?.value as LinkFieldValue}
                          aria-label={`${childItem?.menuLink?.jsonValue?.value?.text || ''} ${
                            childItem?.menuSummary?.jsonValue?.value || ''
                          }`}
                          onClick={() => handleMobileLinkClick()}
                        />
                        {childItem?.menuSummary?.jsonValue?.value && (
                          <JssRichText
                            className="dropdown-item-summary"
                            field={childItem?.menuSummary?.jsonValue as RichTextField}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    )
                  );
                })}
              </li>
            ))}
          </ul>
        </Offcanvas.Body>
      </Offcanvas>

      {openSearchpopup && (
        <div className="fade offcanvas-backdrop show" onClick={handleClickOnSearchpopup}></div>
      )}

      {/* Language Selector Offcanvas */}
      <Offcanvas
        show={showLanguageMenu}
        onHide={() => setShowLanguageMenu(false)}
        placement="end"
        aria-label="Language selector navigation"
        role="dialog"
        aria-modal="true"
      >
        <Offcanvas.Header className="language-offcanvas-header" closeButton={false}>
          <div
            className="chevron-base-previous-sm back-arrow"
            onClick={() => setShowLanguageMenu(false)}
            role="button"
            aria-label="Return to main menu"
            tabIndex={0}
          />
          <div className="subnav-title" aria-level={2}></div>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ul className="language-nav-list" role="menu" aria-label="Language options">
            {languageSwitcherType === 'languageselector' &&
              currentLanguages.map((lang: Language, index: number) => (
                <li key={index}>
                  <div
                    className={`language-option ${
                      lang.languageTag?.toLowerCase() === currentLocale?.toLowerCase()
                        ? 'active'
                        : ''
                    }`}
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => {
                      if (lang.languageTag?.toLowerCase() !== currentLocale?.toLowerCase()) {
                        handleLanguageChange?.(lang.languageTag);
                      }
                    }}
                  >
                    {lang.languageIcon?.url && (
                      <img
                        src={lang.languageIcon.url}
                        alt={lang.languageTag}
                        className="language-icon"
                      />
                    )}
                    <span>{lang.languageName}</span>
                  </div>
                </li>
              ))}

            {languageSwitcherType === 'regionselector' &&
              filteredRegions.map((lang: Language, index: number) => (
                <li key={index}>
                  <div
                    className={`language-option ${
                      lang.languageTag?.toLowerCase() === currentLocale?.toLowerCase()
                        ? 'active'
                        : ''
                    }`}
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => {
                      if (lang.languageTag?.toLowerCase() !== currentLocale?.toLowerCase()) {
                        handleLanguageChange?.(lang.languageTag);
                      }
                    }}
                  >
                    {lang.languageIcon?.url && (
                      <img
                        src={lang.languageIcon.url}
                        alt={lang.languageTag}
                        className="language-icon"
                      />
                    )}
                    <span>{lang.languageName}</span>
                  </div>
                </li>
              ))}
          </ul>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Landing Page Offcanvas */}
      <Offcanvas
        show={showLandingPageMenu}
        onHide={() => setShowLandingPageMenu(false)}
        placement="end"
        id="landing-page-menu"
        aria-label="landing page navigation"
        role="dialog"
        aria-modal="true"
      >
        <Offcanvas.Header closeButton={true} aria-label="Menu header">
          <div className="logo-container">
            <Navbar.Brand href={homePageLink}>
              <ImageItem
                field={mobileLogo?.jsonValue}
                nextImageSrc={mobileLogo?.jsonValue?.value?.src}
                aria-label="Site logo"
              />
            </Navbar.Brand>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body className="landing-page-offcanvas-body">
          {landingPageContactNumberValue && (
            <a className="navigation-title" href={`tel:${landingPageContactNumberValue}`}>
              <JssRichText field={propsFieldsData?.landingPageContactNumber?.jsonValue} />
            </a>
          )}
          {showPrimaryCTA && modalUrl && (
            <div
              className="mobile-cta-box"
              aria-label="Call to action"
              onClick={() => handleMobileLinkClick()}
            >
              <LinkItem
                className="btn btn-cta-secondary btn-sm"
                field={ctaItem?.jsonValue}
                value={ctaItem?.jsonValue?.value as LinkFieldValue}
                onClick={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  const eaLink = target.getAttribute('data-ea-link') || '';
                  const href = modalUrl || '';

                  sessionStorage.setItem('lastCtaEaLink', eaLink);
                  sessionStorage.setItem('lastCtaHref', href);

                  openModal(modalUrl as string, headerCtaModalTheme);
                }}
                openInModal={openHeaderCtaInModal}
                role="button"
                tabIndex={0}
                aria-label={ctaItem?.jsonValue?.value?.text || 'Call to action'}
              />
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export const PrimaryHeader = (props: HeaderProps): JSX.Element => {
  return <Default {...props} />;
};

export const StickyHeader = (props: HeaderProps): JSX.Element => {
  return <Default {...props} />;
};

export const LandingPageHeader = (props: HeaderProps): JSX.Element => {
  return <Default {...props} />;
};
