export function getUptickSuggestionQuery() {
  return `query UptickSuggestions($term: String!,$language: String!) {
  search(
    where: {
      AND: [
        { 
          name: "_path",
          value: "{38CDA13E-B419-4B7E-BC47-AC3923F4EEFC}"
          operator: EQ 
        }
        { 
          name: "headlesscontent"
          value: $term 
          operator: CONTAINS }
        {
          name: "_language"
          value: $language
          operator: EQ
        }
        {
          name: "_templates"
          value: "{2DA8DDA8-49F4-40C1-83FE-C465CA56B588}"
          operator: EQ
        }
      
      ]
    }
    first:5
    orderBy: { name: "contentPublishedDate", direction: DESC }
  ) {
    results {
      id
      url {
        path
      }
      ... on _UptickContent {
        contentTitle {
          jsonValue
        }
      }
    }
  }
}`;
}

export function getUptickSuggestionSlugQuery() {
  return `query EditorialPageHeroQuery($datasource: String!, $language: String!) {
  item(path: $datasource, language: $language) {
    slug: field(name: "Slug") {
      jsonValue
    }
  }
}`;
}

export function getUptickSearchQuery() {
  return `
    query ContentListingcase1($pageSize: Int, $language: String, $term: String!) {
      search(
        where: {
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
            { name: "_language", value: $language, operator: EQ }
            { name: "headlesscontent", value: $term, operator: CONTAINS }
          ]
        }
        first: $pageSize
        orderBy: { name: "contentPublishedDate", direction: DESC }
      ) {
        total
        pageInfo {
          endCursor
          hasNext
        }
        results {
          url {
            path
          }
          ... on _UptickContent {
            topics {
              jsonValue
            }
            industries {
              jsonValue
            }
            products {
              jsonValue
            }
          }
        }
      }
    }
  `;
}
