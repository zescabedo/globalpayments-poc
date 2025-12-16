import clearFilterIconDisable from '@/assets/icons/close-gray.svg';
import clearFilterIconEnable from '@/assets/icons/close-white.svg';
import plusIcon from '@/assets/icons/plus-base.svg';
import Heading from '@/components/ui/Heading/Heading';
import { Tag } from '@/components/Uptick/TaxonomyTags/TaxonomyTags';
import { SearchTagResultsConstant } from '@/constants/appConstants';
import { useSearchTags } from '@/hooks/useContentListing';
import { useFilterState } from '@/hooks/useFilterState';
import { Text } from '@sitecore-jss/sitecore-jss-nextjs';
import Image from 'next/image';
import { useMemo } from 'react';
import { Container } from 'react-bootstrap';
import type {
  ContentListing,
  FilterKeys,
  FilterTag,
  FilterTags,
  SearchConditionInput,
  SearchTagResult,
  SelectedFilters,
} from './SearchTagResults.type';
import { useI18n } from 'next-localization';

interface FilterBaseProps {
  isOpen: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  tags: FilterTag[];
  selectedValues: Map<string, FilterTag>;
  onTagClick: (tag: FilterTag) => void;
  disabledValues?: Map<string, FilterTag>;
  className?: string;
  filterKey?: FilterKeys;
}

interface FilterContentProps extends FilterBaseProps {
  isLoading?: boolean;
}

interface FilterDropdownProps extends FilterBaseProps {
  field?: JsonValue;
  onToggle: () => void;
  isLoading?: boolean;
}

interface FiltersProps extends SearchTagResult {
  language: string;
  filterTags: FilterTags | null;
  selected: SelectedFilters;
  audienceBlock?: SearchConditionInput[];
  onChange: (next: SelectedFilters) => void;
  content?: ContentListing;
  hasInvalidFilters: boolean;
}

interface FilterClearButtonProps {
  className?: string;
  clearButtonText?: JsonValue;
  hasActiveFilters: boolean;
  onReset: () => void;
}

const createFilterClassName = (
  baseClass: string,
  isFirst?: boolean,
  isLast?: boolean,
  additionalClass?: string
): string => {
  const classes = [baseClass];
  if (isFirst) classes.push('first-active');
  if (isLast) classes.push('last-active');
  if (additionalClass) classes.push(additionalClass);
  return classes.join(' ');
};

const countDisabledTags = (tags: FilterTag[], disabledValues?: Map<string, FilterTag>): number => {
  if (!disabledValues) return 0;
  return tags.reduce((acc, tag) => (disabledValues.has(tag.value) ? acc : acc + 1), 0);
};

const FilterContent = ({
  isOpen,
  isFirst,
  isLast,
  tags,
  selectedValues,
  onTagClick,
  disabledValues,
  className,
  isLoading,
  filterKey,
}: FilterContentProps) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  const filterClassName = createFilterClassName('filter-content', isFirst, isLast, className);

  if (isLoading) {
    return (
      <div className={filterClassName}>
        <p>{t('loading')}</p>
      </div>
    );
  }

  const disabledCount = countDisabledTags(tags, disabledValues);

  return (
    <div className={filterClassName}>
      <ul className="filter-tags">
        {tags.map((tag) => {
          const isActive = selectedValues.has(tag.value);
          const isDisabled = disabledValues ? !disabledValues.has(tag.value) : false;
          const shouldDisable = isDisabled && !isActive;

          return (
            <li key={tag.value} className="filter-tag">
              <Tag
                size="lg"
                name={tag.name}
                useButton={true}
                disabled={shouldDisable}
                variant={filterKey === 'contentTypes' ? 'featured' : 'default'}
                className={isActive ? 'selected' : ''}
                onClick={() => !shouldDisable && onTagClick(tag)}
              />
            </li>
          );
        })}
      </ul>
      {disabledCount > 0 && <p className="note">{t('someFiltersNotAvailable')}</p>}
    </div>
  );
};

const FilterDropdown = ({
  field,
  isOpen,
  isFirst,
  isLast,
  tags,
  selectedValues,
  onToggle,
  onTagClick,
  disabledValues,
  isLoading,
  filterKey,
}: FilterDropdownProps) => {
  const selectedCount = selectedValues.size;
  return (
    <li className="filter-dropdown">
      {selectedCount > 0 && <div className="filter-indicator">{selectedCount}</div>}
      <button onClick={onToggle} className={`filter-trigger ${isOpen ? 'active' : ''}`}>
        <Text tag="span" field={field?.jsonValue} />
        <Image width={16} height={16} alt="open dropdown" src={plusIcon} className="plus-icon" />
      </button>
      <FilterContent
        isOpen={isOpen}
        isFirst={isFirst}
        isLast={isLast}
        tags={tags}
        selectedValues={selectedValues}
        onTagClick={onTagClick}
        disabledValues={disabledValues}
        className="mobile-only"
        isLoading={isLoading}
        filterKey={filterKey}
      />
    </li>
  );
};

const FilterClearButton = ({
  clearButtonText,
  hasActiveFilters,
  onReset,
  className = '',
}: FilterClearButtonProps) => (
  <button
    className={`filters-clear ${hasActiveFilters ? 'enabled' : 'disabled'} ${className}`}
    disabled={!hasActiveFilters}
    onClick={onReset}
  >
    <Image
      width={12}
      height={12}
      alt=""
      src={hasActiveFilters ? clearFilterIconEnable : clearFilterIconDisable}
      className="filters-clear-icon"
      aria-hidden="true"
    />
    <Text tag="span" field={clearButtonText?.jsonValue} />
  </button>
);

const Filters = ({
  filterTags,
  selected,
  onChange,
  language,
  audienceBlock,
  content,
  hasInvalidFilters,
  ...props
}: FiltersProps) => {
  const { data: initialTags, isLoading } = useSearchTags({
    language,
    audienceBlock,
    pageSize: content?.total,
  });

  const { openFilter, setOpenFilter, enabledTagsState, otherFiltersActive } = useFilterState(
    initialTags,
    filterTags,
    selected
  );

  const filterConfig = useMemo(
    () => [
      { key: 'products' as FilterKeys, field: props.chooseyourProduct },
      { key: 'topics' as FilterKeys, field: props.chooseyourTopic },
      { key: 'contentTypes' as FilterKeys, field: props.chooseyourMedium },
    ],
    [props.chooseyourMedium, props.chooseyourProduct, props.chooseyourTopic]
  );

  const queryFilters = useMemo(() => {
    return (Object.keys(selected) as FilterKeys[])
      .map((filterKey) => {
        const values = Array.from(selected[filterKey].values());
        if (!values.length) return null;

        return {
          OR: values.map((tag) => ({
            name: SearchTagResultsConstant.FILTER_KEY_TO_QUERY_NAME[filterKey],
            value: tag.value,
            operator: 'CONTAINS' as const,
          })),
        };
      })
      .filter(Boolean);
  }, [selected]);

  const hasActiveFilters = queryFilters.length > 0;

  // Event handlers
  const handleFilterToggle = (key: FilterKeys) => {
    setOpenFilter((prev) => (prev === key ? null : key));
  };

  const handleResetFilter = () => {
    onChange(SearchTagResultsConstant.EMPTY_FILTER_STATE);
    setOpenFilter(null);
  };

  const handleTagClick = (filter: FilterKeys, tag: FilterTag) => {
    const newMap = new Map(selected[filter]);

    if (newMap.has(tag.value)) {
      newMap.delete(tag.value);
    } else {
      newMap.set(tag.value, tag);
    }

    onChange({ ...selected, [filter]: newMap });
  };

  const getFilterData = (key: FilterKeys) => {
    const fallbackTags = { contentTypes: [], products: [], topics: [] };
    const initial = initialTags ?? fallbackTags;
    const items = initial[key] ?? [];
    let enabledValues = enabledTagsState?.[key];

    // Special handling for medium: don't apply disabled logic if only medium is selected
    if (key === 'contentTypes' && !otherFiltersActive && enabledValues?.size === 0) {
      enabledValues = undefined;
    }

    return { items, enabledValues };
  };

  return (
    <section className="filters">
      <Container>
        <header className="filters-header">
          <Heading richText level={2} className="filters-title" field={props.title?.jsonValue} />

          <FilterClearButton
            className="desktop-only"
            clearButtonText={props.clearFilterButtonText}
            hasActiveFilters={hasActiveFilters || hasInvalidFilters}
            onReset={handleResetFilter}
          />
        </header>

        {/* Mobile filter dropdowns */}
        <ul className="filters-list">
          {filterConfig.map(({ key, field }, index) => {
            const { items, enabledValues } = getFilterData(key);

            return (
              <FilterDropdown
                key={key}
                field={field}
                isOpen={openFilter === key}
                isFirst={index === 0}
                isLast={index === filterConfig.length - 1}
                tags={items}
                selectedValues={selected[key]}
                onToggle={() => handleFilterToggle(key)}
                onTagClick={(tag) => handleTagClick(key, tag)}
                disabledValues={enabledValues}
                isLoading={isLoading}
                filterKey={key}
              />
            );
          })}
        </ul>

        <FilterClearButton
          className="mobile-only"
          clearButtonText={props.clearFilterButtonText}
          hasActiveFilters={hasActiveFilters || hasInvalidFilters}
          onReset={handleResetFilter}
        />

        {/* Desktop filter content */}
        {filterConfig.map(({ key }, index) => {
          const { items, enabledValues } = getFilterData(key);

          return (
            <FilterContent
              key={`${key}-desktop`}
              tags={items}
              isOpen={openFilter === key}
              isFirst={index === 0}
              isLast={index === filterConfig.length - 1}
              selectedValues={selected[key]}
              onTagClick={(tag) => handleTagClick(key, tag)}
              disabledValues={enabledValues}
              className="desktop-only"
              isLoading={isLoading}
              filterKey={key}
            />
          );
        })}
      </Container>
    </section>
  );
};

export default Filters;
