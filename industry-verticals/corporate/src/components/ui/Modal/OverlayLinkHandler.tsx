import React, { useEffect } from 'react';
import { useModal } from './ModalProvider';

const OverlayLinkHandler: React.FC = () => {
  const { openModal } = useModal();

  useEffect(() => {
    const handleOverlayClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a.overlay-source, .overlay-source a');

      if (link) {
        e.preventDefault();
        const overlayTarget = link.getAttribute('data-overlay-target');
        const href = link.getAttribute('href');
        const targetUrl = overlayTarget || href;

        if (targetUrl) {
          const urlParams = new URLSearchParams(targetUrl.split('?')[1] || '');
          const theme = urlParams.get('theme') || '';
          openModal(targetUrl, theme);
        }
      }
    };

    document.addEventListener('click', handleOverlayClick);
    return () => {
      document.removeEventListener('click', handleOverlayClick);
    };
  }, [openModal]);

  return null; // This component doesn't render anything
};

export default OverlayLinkHandler;
