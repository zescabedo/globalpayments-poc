import React, { useCallback, useEffect } from 'react';
import { useModal } from './ModalProvider';
import { GeolocationConstants } from '@/constants/appConstants';
import { FooterProps } from '@/components/common/Footer/Footer.types';
import localDebug from '@/lib/_platform/logging/debug-log';

const RegionSelectorModal: React.FC<FooterProps> = (props) => {
  const propsFieldData = props?.rendering?.fields?.data?.item;
  const {
    showRegionSelectorModalCookieName,
    defaultRegionSelectorModalTheme,
    geoRedirectCookieName,
  } = GeolocationConstants;
  const regionSelectorPath = propsFieldData?.regionSelectorModal?.jsonValue?.value?.href;
  const modalTheme =
    propsFieldData?.regionSelectorModalTheme?.targetItem?.value?.jsonValue?.value ||
    defaultRegionSelectorModalTheme;
  const { openModal, closeModal } = useModal();

  const handleModalClose = useCallback(() => {
    document.cookie = `${showRegionSelectorModalCookieName}=; path=/; max-age=0`;
    document.cookie = `${geoRedirectCookieName}=; path=/; max-age=0`;
    localDebug.gpn(
      `[RegionSelectorModal] Closing modal and clearing cookies: ${showRegionSelectorModalCookieName}, ${geoRedirectCookieName}`
    );
    closeModal();
  }, [closeModal]);

  useEffect(() => {
    // Attach click event to .btn-close elements
    const handleClick = (e: Event) => {
      if ((e.target as HTMLElement).classList.contains('btn-close')) {
        handleModalClose();
      }
    };
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [handleModalClose]);
  useEffect(() => {
    const showRegionSelectorModal =
      document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${showRegionSelectorModalCookieName}=`))
        ?.split('=')[1] === 'true';

    if (!showRegionSelectorModal) return;

    if (regionSelectorPath) {
      openModal(regionSelectorPath, modalTheme);
    }
  }, [openModal, regionSelectorPath, modalTheme, handleModalClose, closeModal]);

  return null;
};

export default RegionSelectorModal;
