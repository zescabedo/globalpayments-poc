import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { checkImage } from '@/utils/ModalHelpers';
import Cookies from 'js-cookie';
import { GeolocationConstants, ModalConstants } from '@/constants/appConstants';
import localDebug from '@/lib/_platform/logging/debug-log';
import { Placeholder } from '@sitecore-jss/sitecore-jss-nextjs';

interface ModalComponentProps {
  url?: string;
  modalTheme?: string;
  modalHeight?: string;
  modalWidth?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const ModalComponent = ({
  url = '',
  modalTheme = '',
  modalHeight = '',
  modalWidth = '',
  isOpen = false,
  onClose,
}: ModalComponentProps) => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string | null>(null);
  const [modalSize, setModalSize] = useState<{ width?: string; height?: string }>({});
  const [modalClass, setModalClass] = useState('');
  const [modalName, setModalName] = useState('');
  const [pageData, setPageData] = useState(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const clickSourceRef = useRef<Element | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef(false);

  const { showRegionSelectorModalCookieName, geoRedirectCookieName } = GeolocationConstants;

  // Validate and sanitize dimension values
  const validateDimension = (value: string | undefined): string | undefined => {
    if (!value) return undefined;

    // Trim whitespace
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    // Check if it's already a valid CSS dimension with unit
    const validDimensionPattern = /^(\d+(?:\.\d+)?)(px|%|em|rem|vw|vh|lvw|lvh|svw|svh)$/i;
    if (validDimensionPattern.test(trimmed)) {
      return trimmed; // Return as-is if it's already valid
    }

    // Check if it's a numeric value without unit (should default to px)
    const numericPattern = /^\d+(\.\d+)?$/;
    if (numericPattern.test(trimmed)) {
      return `${trimmed}px`;
    }

    // Invalid format - return undefined
    return undefined;
  };

  // Process modal size from props and URL params with validation
  const getModalSize = (urlParams: Record<string, string>) => {
    const size: { width?: string; height?: string } = {};

    const validatedUrlWidth = validateDimension(urlParams.width);
    const validatedUrlHeight = validateDimension(urlParams.height);

    const validatedPropWidth = validateDimension(modalWidth);
    const validatedPropHeight = validateDimension(modalHeight);

    // Priority order: Validated URL params > Validated CTA props > defaults
    size.width = validatedUrlWidth || validatedPropWidth || `${ModalConstants.defaultModalWidth}px`;

    size.height =
      validatedUrlHeight || validatedPropHeight || `${ModalConstants.defaultModalHeight}px`;

    return size;
  };

  // Store the element that triggered the modal
  useEffect(() => {
    if (isOpen && document.activeElement) {
      clickSourceRef.current = document.activeElement;
    }
  }, [isOpen]);

  // Stable close handler using useCallback
  const handleClose = useCallback(() => {
    // Cancel any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    isLoadingRef.current = false;

    // Call parent onClose handler
    if (onClose) {
      onClose();
    }

    // Return focus to the element that opened the modal
    setTimeout(() => {
      if (clickSourceRef.current && 'focus' in clickSourceRef.current) {
        try {
          (clickSourceRef.current as HTMLElement).focus();
        } catch (e) {
          // Focus failed, ignore
        }
      }
    }, 100);
  }, [onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setContent(null);
      setLoading(true);
      setModalSize({});
      setModalClass('');
      setModalName('');
      clickSourceRef.current = null;
    }
  }, [isOpen]);

  const isIframe = (url: string): boolean => {
    try {
      const urlObj = new URL(url, window.location.origin);
      const overlayType = urlObj.searchParams.get('overlaytype');
      return overlayType !== null && overlayType.toLowerCase() === 'iframe';
    } catch (error) {
      return url.toLowerCase().includes('overlaytype=iframe');
    }
  };

  const getUrlParams = (url: string): Record<string, string> => {
    const params: Record<string, string> = {};
    try {
      const urlObj = new URL(url, window.location.origin);
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
    } catch (error) {
      localDebug.gpn('[Modal Rendering] Error parsing URL:', error);
    }
    return params;
  };

  // Load content when modal opens
  useEffect(() => {
    if (!isOpen || !url || isLoadingRef.current) {
      return;
    }

    const loadContent = async () => {
      // Prevent multiple simultaneous loads
      isLoadingRef.current = true;
      setLoading(true);

      // Cancel previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // Prepare URL with original URL parameter
        let targetUrl = url;
        try {
          const urlObj = new URL(url, window.location.origin);
          if (!urlObj.searchParams.has('originalUrl')) {
            urlObj.searchParams.append('originalUrl', window.location.href);
          }
          targetUrl = urlObj.toString();
        } catch (error) {
          localDebug.gpn('[Modal Rendering] Error modifying URL:', error);
          const separator = url.includes('?') ? '&' : '?';
          if (!url.includes('originalUrl=')) {
            targetUrl = `${url}${separator}originalUrl=${encodeURIComponent(window.location.href)}`;
          }
        }

        // Parse URL parameters
        const urlParams = getUrlParams(targetUrl);

        //  Set modal configuration with CTA props priority
        const size = getModalSize(urlParams);

        let themeClass = '';
        if (urlParams.theme) {
          themeClass = urlParams.theme;
        } else if (modalTheme) {
          themeClass = modalTheme;
        }

        let name = '';
        if (urlParams.modalName) {
          name = urlParams.modalName;
        }

        setModalSize(size);
        setModalClass(themeClass);
        setModalName(name);

        // Handle different content types
        if (checkImage(targetUrl)) {
          setContent(
            `<img src="${targetUrl}" alt="Modal content" style="max-width: 100%; height: auto;" />`
          );
        } else if (isIframe(targetUrl)) {
          setContent(
            `<iframe src="${targetUrl}" style="width: 100%; height: 100%; border: none;" title="Modal iframe content"></iframe>`
          );
        } else {
          // Fetch HTML content
          const response = await fetch(targetUrl, {
            signal: abortController.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const html = await response.text();

          // Check if content contains a Sitecore form
          if (html.includes('form class="sitecore-forms')) {
            const routeData = getPageData(html);
            if (routeData) {
              setPageData(routeData);
              setContent(null);
            } else {
              setPageData(null);
              setContent(html);
            }
          } else {
            setPageData(null);
            setContent(html);
          }
        }

        setLoading(false);
        isLoadingRef.current = false;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Request was cancelled, ignore
          return;
        }

        localDebug.gpn('[Modal Rendering] Error loading content:', error);
        setContent('<div class="error">Failed to load content</div>');
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadContent();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      isLoadingRef.current = false;
    };
  }, [isOpen, url, modalHeight, modalWidth]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  // Helper function to parse NEXT_DATA
  const getPageData = (html: string) => {
    const scriptMatch = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/
    );
    if (scriptMatch && scriptMatch[1]) {
      try {
        const data = JSON.parse(scriptMatch[1]);
        return data?.props?.pageProps?.layoutData?.sitecore?.route;
      } catch (e) {
        localDebug.gpn('[Modal Rendering] Error parsing __NEXT_DATA__:', e);
      }
    }
    return null;
  };

  // Setup interactivity
  useEffect(() => {
    if (!content || !contentRef.current || loading) return;

    const setupInteractivity = () => {
      if (!contentRef.current || !content) return;

      // Handle close links
      const closeLinks = contentRef.current.querySelectorAll('a[href="#close"]');
      closeLinks.forEach((link) => {
        const handleClick = (e: Event) => {
          e.preventDefault();
          handleClose();
        };
        link.addEventListener('click', handleClick);
      });

      // Handle region selector
      const regionLinks = contentRef.current.querySelectorAll('.location-list a');
      regionLinks.forEach((link) => {
        const anchorElement = link as HTMLAnchorElement;
        const handleClick = () => {
          try {
            const url = new URL(anchorElement.href);
            const localeMatch = url.pathname.match(/\/([a-z]{2}(?:-[a-z]{2,4})?)/i);
            const locale = localeMatch ? localeMatch[1] : null;

            if (locale && typeof Cookies !== 'undefined') {
              // Delete the showRegionSelectorModal cookie to prevent it from showing again
              Cookies.remove(showRegionSelectorModalCookieName, {
                path: '/',
              });
              Cookies.remove(geoRedirectCookieName, {
                path: '/',
              });

              localDebug.gpn(
                `[Modal Rendering] Removed showRegionSelectorModal and _geo_redirect_processed cookie`
              );
            }
          } catch (error) {
            localDebug.gpn(
              '[Modal Rendering] Error removing showRegionSelectorModal cookie:',
              error
            );
          }
        };
        anchorElement.addEventListener('click', handleClick);
      });

      // Handle other interactive elements
      const actionElements = contentRef.current.querySelectorAll('a[href]');
      actionElements.forEach((element) => {
        const handleClick = (e: Event) => {
          // Handle special actions or allow specific behaviors
          const href = element.getAttribute('href');
          if (href === '#close') {
            e.preventDefault();
            handleClose();
          }
        };
        element.addEventListener('click', handleClick);
      });

      // Dispatch custom event
      const event = new CustomEvent('gpn:overlayIsLoaded');
      contentRef.current.dispatchEvent(event);
    };

    const timeoutId = setTimeout(setupInteractivity, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [content, loading, handleClose]);

  return (
    <Modal
      show={isOpen}
      onHide={handleClose}
      centered
      size="lg"
      animation={false}
      className={`overlay-modal ${modalClass}`}
      data-modal-name={modalName}
      aria-label="Modal dialog"
      role="dialog"
      style={
        {
          '--modal-width': `${String(modalSize?.width)}`,
          '--modal-height': `${String(modalSize?.height)}`,
        } as React.CSSProperties
      }
    >
      <Modal.Header closeButton aria-label="Close dialog" />
      <Modal.Body>
        {loading ? (
          <div className="spinner-box">
            <Spinner animation="border" />
          </div>
        ) : pageData ? (
          // Render full page content using placeholders
          <div className="overlay-inner">
            <main>
              <div id="content">
                <Placeholder name="gpn-headless-main" rendering={pageData} />
              </div>
            </main>
          </div>
        ) : (
          // Render regular content
          <div
            ref={contentRef}
            className="overlay-inner"
            style={{
              display: loading ? 'none' : 'block',
              ...modalSize,
            }}
            dangerouslySetInnerHTML={{ __html: content || '' }}
            suppressHydrationWarning={true}
          />
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ModalComponent;
