import {
  FilterKeys,
  FilterTags,
  SelectedFilters,
} from '@/components/layout/SearchTagResults/SearchTagResults.type';
import { useEffect, useMemo, useRef, useState } from 'react';

const createEnabledTagsState = (
  filterTags: FilterTags,
  selected: SelectedFilters,
  hasOtherFilters: boolean
): SelectedFilters => {
  return {
    // Medium: empty map when only medium selected (no disabled logic)
    contentTypes: hasOtherFilters
      ? new Map((filterTags.contentTypes || []).map((t) => [t.value, t]))
      : new Map(),
    products: new Map((filterTags.products || []).map((t) => [t.value, t])),
    topics: new Map((filterTags.topics || []).map((t) => [t.value, t])),
  };
};

const hasActiveFilters = (selected: SelectedFilters): boolean => {
  return selected.contentTypes.size > 0 || selected.products.size > 0 || selected.topics.size > 0;
};

const hasOtherFiltersActive = (selected: SelectedFilters): boolean => {
  return selected.products.size > 0 || selected.topics.size > 0;
};

export const useFilterState = (
  initialTags: FilterTags | null | undefined,
  filterTags: FilterTags | null,
  selected: SelectedFilters
) => {
  const prevOpenFilter = useRef<FilterKeys | null>(null);
  const prevFilterTags = useRef<FilterTags | null>(null);
  const hasUserInteracted = useRef(false);
  const [openFilter, setOpenFilter] = useState<FilterKeys | null>(null);

  const filtersAreActive = useMemo(() => hasActiveFilters(selected), [selected]);
  const otherFiltersActive = useMemo(() => hasOtherFiltersActive(selected), [selected]);

  const [enabledTagsState, setEnabledTagsState] = useState<SelectedFilters | null>(null);

  useEffect(() => {
    if (!initialTags || !filterTags) return;

    if (!filtersAreActive) {
      setEnabledTagsState(null);
      return;
    }

    const isClosingOrSwitching =
      prevOpenFilter.current !== null && prevOpenFilter.current !== openFilter;
    const filtersChangedWhileClosed = prevFilterTags.current !== filterTags && openFilter === null;

    if (prevOpenFilter.current === null && openFilter !== null) {
      hasUserInteracted.current = true;
    }

    // Only update disabled state when:
    // 1. User has interacted
    // 2. Dropdown is closing or switching
    // 3. For medium dropdown specifically - only if other filters are active
    const shouldUpdateDisabledState =
      hasUserInteracted.current && (isClosingOrSwitching || filtersChangedWhileClosed);

    if (shouldUpdateDisabledState) {
      setEnabledTagsState(createEnabledTagsState(filterTags, selected, otherFiltersActive));
    }

    prevOpenFilter.current = openFilter;
    prevFilterTags.current = filterTags;
  }, [openFilter, filterTags, initialTags, filtersAreActive, selected, otherFiltersActive]);

  return { openFilter, setOpenFilter, enabledTagsState, filtersAreActive, otherFiltersActive };
};
