export const GQL_LIST = /* GraphQL */ `
query ListUptick($site: String!, $lang: String!, $first: Int!, $skip: Int!, $filter: [SearchConditionInput!]) {
  search(
    language: $lang
    where: { AND: [{ name: "showIn", value: $site, operator: CONTAINS }, ...$filter] }
    first: $first
    after: $skip
  ) {
    total
    results {
      item {
        id
        name
        path
        url {
          path
        }
        fields {
          slug { value }
          title { value }
          summary { value }
          contentType { value }
          publishedDate { value }
          mainImage { url }
          cardImage { url }
          tags { targetItems { name } }
          topics { targetItems { name } }
          categories { targetItems { name } }
          industries { targetItems { name } }
          authors {
            targetItems {
              id
              name
              url { path }
              fields { slug { value } photo { url } }
            }
          }
        }
      }
    }
  }
}
`;

export const GQL_GET_BY_SLUG = `
  query GetUptickBySlug($slug: String!, $site: String!, $lang: String!) {
    search(
      language: $lang
      where: {
        AND: [
          { name: "slug", value: $slug, operator: EQ }
          { name: "showIn", value: $site, operator: CONTAINS }
        ]
      }
      first: 1
    ) {
      results {
        item {
          id
          name
          path
          url {
            path
          }
          fields {
            slug {
              value
            }
            title {
              value
            }
            summary {
              value
            }
            contentType {
              value
            }
            publishedDate {
              value
            }
            mainImage {
              url
            }
            cardImage {
              url
            }
            tags {
              targetItems {
                name
              }
            }
            topics {
              targetItems {
                name
              }
            }
            categories {
              targetItems {
                name
              }
            }
            industries {
              targetItems {
                name
              }
            }
            authors {
              targetItems {
                id
                name
                url {
                  path
                }
                fields {
                  slug {
                    value
                  }
                  photo {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_ARTICLES_BY_CONTENT_TYPE = /* GraphQL */ `
  query LatestFive($contentType: String!) {
    search(
      where: {
        AND: [
          { name: "_path", value: "{38CDA13E-B419-4B7E-BC47-AC3923F4EEFC}", operator: CONTAINS }
          { name: "contentType", value: $contentType, operator: CONTAINS }
          { name: "_templates", value: "{2DA8DDA8-49F4-40C1-83FE-C465CA56B588}", operator: EQ }
        ]
      }
      first: 10
      orderBy: { name: "contentPublishedDate", direction: DESC }
    ) {
      results {
        id
        url {
          path
        }
        parent {
          name
          url {
            path
          }
        }
        ... on _UptickContent {
          contentTitle {
            jsonValue
          }
          contentPublishedDate {
            jsonValue
          }
          contentCardImage {
            jsonValue
            src
          }
          contentMainImage {
            jsonValue
            src
          }
          contentSummary {
            jsonValue
          }
          contentReadTime {
            jsonValue
          }
          primaryCTA {
            jsonValue
          }
          author {
            jsonValue
          }
          contentType {
            jsonValue
          }
          topics {
            jsonValue
          }
          industries {
            jsonValue
          }
        }
      }
      pageInfo {
        hasNext
        endCursor
      }
      total
    }
  }
`;

export const GQL_LIST_MODIFIED = /* GraphQL */ `
  query {
    search(
      where: {
        AND: [
          { name: "_path", value: "{38CDA13E-B419-4B7E-BC47-AC3923F4EEFC}", operator: CONTAINS }
          {
            name: "contentType"
            value: "{29F6DA70-4AD0-46E5-ABBF-F9EA55D0B047}"
            operator: CONTAINS
          }
          { name: "showIn", value: "{C8B1C1AD-D715-4E7C-834F-88D1BE893BDF}", operator: CONTAINS }
          { name: "_templates", value: "{2DA8DDA8-49F4-40C1-83FE-C465CA56B588}", operator: EQ }
          { name: "site_sm", value: $siteName, operator: EQ }
          { name: "_language", operator: EQ, value: $language }
        ]
      }
      first: 5
      orderBy: { name: "contentPublishedDate", direction: DESC }
    ) {
      results {
        id
        url {
          path
        }
        parent {
          name
          url {
            path
          }
        }
        ... on _UptickContent {
          contentTitle {
            jsonValue
          }
          contentPublishedDate {
            jsonValue
          }
          contentCardImage {
            jsonValue
            src
          }
          contentMainImage {
            jsonValue
            src
          }
          contentSummary {
            jsonValue
          }
          contentReadTime {
            jsonValue
          }
          primaryCTA {
            jsonValue
          }
          author {
            jsonValue
          }
          contentType {
            jsonValue
          }
          topics {
            jsonValue
          }
          industries {
            jsonValue
          }
          showIn {
            value
            targetItems {
              name
            }
          }
        }
      }
    }
  }
`;
