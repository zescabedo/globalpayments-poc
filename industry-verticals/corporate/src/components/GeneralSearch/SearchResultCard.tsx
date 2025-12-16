import { RichText, Text } from '@sitecore-jss/sitecore-jss-nextjs';
import React from 'react';
import { SearchResultCardProps } from './GeneralSearch.types';
import { highlightKeyword } from '@/utils/highlightKeywords';
import Heading from '@/components/ui/Heading/Heading';

const SearchResultCard = ({ searchResult, searchTerm }: SearchResultCardProps) => {
  const { title = '', pageUrl = '', pageDescription = '', titleLevel } = searchResult || {};

  const highlightText = highlightKeyword(pageDescription, searchTerm);

  const linkedTitleHtml = `<a class="title-link" href="${pageUrl}">${title}</a>`;
  const richTextField = { value: linkedTitleHtml };

  return (
    <div className="result-item">
      <Heading richText={true} level={titleLevel} className="title" field={richTextField} />
      <Text tag="p" className="search-results-url" field={{ value: `${pageUrl}` }} />
      <RichText tag="p" className="search-results-description" field={{ value: highlightText }} />
    </div>
  );
};

export default SearchResultCard;
