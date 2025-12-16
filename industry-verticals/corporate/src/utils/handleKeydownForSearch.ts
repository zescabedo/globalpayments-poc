import { Result } from '@/components/layout/SearchTagResults/SearchTagResults.type';
import { SetStateAction, KeyboardEvent } from 'react';
import { generateContentUrl } from './uptick/linkResolver';
import { SitecoreContextValue } from '@sitecore-content-sdk/nextjs';
import { NextRouter } from 'next/router';
import { KEYBOARD_KEYS } from '@/constants/generalSearchConstants';

type HandleKeydownForSearchProps = {
  e: KeyboardEvent<HTMLInputElement>;
  showDropdown: boolean;
  suggestionsData: Result[] | undefined;
  setStateAction: (value: SetStateAction<number>) => void;
  setShowDropdown: (show: boolean) => void;
  selectedIndex: number;
  handleSearch: () => void;
  sitecoreContext: SitecoreContextValue;
  router: NextRouter;
};

export const handleKeydownForSearch = ({
  e,
  showDropdown,
  suggestionsData,
  setStateAction,
  setShowDropdown,
  selectedIndex,
  handleSearch,
  sitecoreContext,
  router,
}: HandleKeydownForSearchProps): void => {
  if (!showDropdown || !suggestionsData || suggestionsData.length === 0) return;

  switch (e.key) {
    case KEYBOARD_KEYS.ARROW_DOWN:
      e.preventDefault();
      setStateAction((prev) => (prev < suggestionsData.length - 1 ? prev + 1 : 0));
      break;
    case KEYBOARD_KEYS.ARROW_UP:
      e.preventDefault();
      setStateAction((prev) => (prev > 0 ? prev - 1 : suggestionsData.length - 1));
      break;
    case KEYBOARD_KEYS.ENTER:
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestionsData.length) {
        const selectedItem = suggestionsData[selectedIndex];
        const href = generateContentUrl(
          selectedItem?.slug ? selectedItem?.slug?.jsonValue?.value : '/',
          sitecoreContext
        );
        router.push(href);
        setShowDropdown(false);
        setStateAction(-1);
      } else {
        handleSearch();
      }
      break;
    case KEYBOARD_KEYS.ESCAPE:
      e.preventDefault();
      setShowDropdown(false);
      setStateAction(-1);
      break;

    case KEYBOARD_KEYS.TAB:
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestionsData.length) {
        // Tab should activate the selected suggestion (same as Enter)
        const selectedItem = suggestionsData[selectedIndex];
        const href = generateContentUrl(
          selectedItem?.slug ? selectedItem?.slug?.jsonValue?.value : '/',
          sitecoreContext
        );
        router.push(href);
        setShowDropdown(false);
        setStateAction(-1);
      } else {
        // If no suggestion selected, close dropdown and let Tab work naturally
        setShowDropdown(false);
        setStateAction(-1);
      }
      break;
  }
};
