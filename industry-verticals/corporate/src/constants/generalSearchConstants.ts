export const PaginationConstants = {
  firstPage: 1,
  pageGapThreshold: 3,
  pageGapThresholdLarge: 4,
  visiblePageWindow: 5,
};

export const searchKeyQueryName = 's_q';

export const SearchApiConstants = {
  defaultString: '',
  defaultPageNo: 1,
  defaultPageSize: 10,
  defaultLanguage: 'en-US',
};

export const defaultTitleHeadingLevel = '5';

export const MAX_KEYWORDS = 2;

export const KEYBOARD_KEYS = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  TAB: 'Tab',
} as const;
