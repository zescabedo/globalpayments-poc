import { SearchConditionInput } from '@/components/layout/SearchTagResults/SearchTagResults.type';
import { formatCondition } from '@/utils/searchUtils';

export function getContentTagsQuery(audienceBlock?: SearchConditionInput[]) {
  const staticBlocks = audienceBlock?.map(formatCondition).join('\n') || '';

  const whereBlock = `
    AND: [
      {
        name: "_path"
        value: "{38CDA13E-B419-4B7E-BC47-AC3923F4EEFC}"
        operator: CONTAINS
      }
      {
        name: "_templates"
        value: "{2DA8DDA8-49F4-40C1-83FE-C465CA56B588}"
        operator: EQ
      }  
      {
        name: "_language"
        value: $language
        operator: EQ
      }
      ${staticBlocks}
    ]
  `;

  return `
    query ContentTags($pageSize: Int, $language: String, $after: String) {
      search(
        where: { ${whereBlock} }
        first: $pageSize
        after: $after
        orderBy: { name: "contentPublishedDate", direction: DESC }
      ) {
        results {
          ... on _UptickContent {
            topics { jsonValue }
            industries { jsonValue }
            products { jsonValue }
            contentType { jsonValue }
          }
        }
      }
    }
  `;
}

export function getContentListingQuery(
  dynamicBlocks?: string,
  audienceBlock?: SearchConditionInput[]
) {
  const staticBlocks = audienceBlock?.map(formatCondition).join('\n') || '';

  const whereBlock = `
    AND: [
      {
        name: "_path"
        value: "{38CDA13E-B419-4B7E-BC47-AC3923F4EEFC}"
        operator: CONTAINS
      }
      {
        name: "_templates"
        value: "{2DA8DDA8-49F4-40C1-83FE-C465CA56B588}"
        operator: EQ
      }  
      {
        name: "_language"
        value: $language
        operator: EQ
      }
      ${staticBlocks}
      ${dynamicBlocks || ''}
    ]
  `;

  return `
    query ContentListing($pageSize: Int, $language: String, $after: String) {
      search(
        where: { ${whereBlock} }
        first: $pageSize
        after: $after
        orderBy: { name: "contentPublishedDate", direction: DESC }
      ) {
        total
        pageInfo {
          endCursor
          hasNext
        }
        results {
          url { path }
          ... on UptickText { readTime { jsonValue } }
          ... on _UptickContent {
            slug { jsonValue }
            contentTitle { jsonValue }
            contentPublishedDate { jsonValue }
            contentMainImage { jsonValue }
            contentCardImage { jsonValue }
            contentType { jsonValue }
            topics { jsonValue }
            industries { jsonValue }
            products { jsonValue }
          }
        }
      }
    }
  `;
}
