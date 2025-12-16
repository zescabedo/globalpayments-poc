import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import ModalComponent from './Modal';
import { checkImage } from '@/utils/ModalHelpers';
import { ModalConstants } from '@/constants/appConstants';

interface ModalContextType {
  openModal: (url: string, theme?: string, height?: string, width?: string) => void; // Add height/width
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

// URL validation functions
const checkInternal = (url: string): boolean => {
  try {
    // Handle relative URLs by prepending origin
    const absoluteUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url;

    const urlHostname = new URL(absoluteUrl).hostname;
    return urlHostname === location.hostname;
  } catch (error) {
    return false;
  }
};

const isAcceptedExternalSite = (url: string): boolean => {
  try {
    // Handle relative URLs by prepending origin
    const absoluteUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url;

    // Hardcoded list of accepted external sites for security
    const acceptedSites = ['gpnprodsxavideo.azureedge.net', 'videos.globalpayments.com'];
    const hostname = new URL(absoluteUrl).hostname;
    return acceptedSites.includes(hostname);
  } catch (error) {
    return false;
  }
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState('');
  const [modalTheme, setModalTheme] = useState('');
  const [modalHeight, setModalHeight] = useState('');
  const [modalWidth, setModalWidth] = useState('');

  // Initialize overlay links on mount
  useEffect(() => {
    const handleOverlayClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a.overlay-source, .overlay-source a');

      if (link) {
        e.preventDefault();
        e.stopPropagation();

        const overlayTarget = link.getAttribute('data-overlay-target');
        const href = link.getAttribute('href');
        const targetUrl = overlayTarget || href;

        if (targetUrl) {
          // Extract theme, height, width from data attributes or URL parameters
          const urlParams = new URLSearchParams(targetUrl.split('?')[1] || '');
          const theme = link.getAttribute('data-modal-theme') || urlParams.get('theme') || '';
          const height = link.getAttribute('data-modal-height') || urlParams.get('height') || '';
          const width = link.getAttribute('data-modal-width') || urlParams.get('width') || '';

          openModal(targetUrl, theme, height, width);
        }
      }
    };

    document.addEventListener('click', handleOverlayClick);
    return () => {
      document.removeEventListener('click', handleOverlayClick);
    };
  }, []);

  const openModal = (
    url: string,
    theme = '',
    height = ModalConstants.defaultModalHeight,
    width = ModalConstants.defaultModalWidth
  ) => {
    // Validate URL before opening modal
    if (!url) return;

    // Handle relative URLs
    const targetUrl = url.startsWith('/') ? new URL(url, window.location.origin).href : url;

    // Check if URL is internal or from accepted external sites
    const isInternal = checkInternal(targetUrl);
    const isAcceptedExternal = isAcceptedExternalSite(targetUrl);
    const isImageContent = checkImage(targetUrl);

    if (!isInternal && !isAcceptedExternal && !isImageContent) return;

    setModalUrl(targetUrl);
    setModalTheme(theme);
    setModalHeight(height);
    setModalWidth(width);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalUrl('');
    setModalTheme('');
    setModalHeight('');
    setModalWidth('');
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <ModalComponent
        isOpen={isOpen}
        url={modalUrl}
        modalTheme={modalTheme}
        modalHeight={modalHeight}
        modalWidth={modalWidth}
        onClose={closeModal}
      />
    </ModalContext.Provider>
  );
};
