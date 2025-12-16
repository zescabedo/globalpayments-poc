// Cursor-based search (works with your tested structure)
export const GQL_LIST_BASE = /* GraphQL */ `
  query UptickList($language: String!, $after: String, $first: Int!) {
    search(
      where: {
        AND: [
          { name: "_path", value: "{38CDA13E-B419-4B7E-BC47-AC3923F4EEFC}", operator: CONTAINS }
          { name: "_templates", value: "{2DA8DDA8-49F4-40C1-83FE-C465CA56B588}", operator: EQ }
          #{ name: "site_sm", value: $siteName, operator: EQ }
          { name: "_language", value: $language, operator: EQ }
          # === dynamic filters (insertion point) ===
          #__DYNAMIC_FILTERS__
          # === end dynamic filters ===
        ]
      }
      first: $first
      after: $after
      orderBy: { name: "contentPublishedDate", direction: DESC }
    ) {
      total
      pageInfo {
        hasNext
        endCursor
      }
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
        ... on UptickText {
          readTime {
            jsonValue
          }
        }
        ... on _UptickContent {
          contentTitle {
            jsonValue
          }
          contentSummary {
            jsonValue
          }
          contentPublishedDate {
            jsonValue
          }
          contentCardImage {
            jsonValue
            ... on ImageField {
              src
              alt
              extension
            }
          }
          contentMainImage {
            jsonValue
            ... on ImageField {
              src
              alt
              extension
            }
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
          products {
            jsonValue
          }
          showIn {
            value
            targetItems {
              name
            }
          }
          author {
            jsonValue
          }
          primaryCTA {
            jsonValue
          }
        }
      }
    }
  }
`;

// Single by slug (assuming you store "slug" in a field; if not, adapt to name/url.path)
export const GQL_GET_BY_SLUG = /* GraphQL */ `
  query UptickBySlug($language: String!, $slug: String!) {
    search(
      where: {
        AND: [
          { name: "_path", value: "{38CDA13E-B419-4B7E-BC47-AC3923F4EEFC}", operator: CONTAINS }
          { name: "_templates", value: "{2DA8DDA8-49F4-40C1-83FE-C465CA56B588}", operator: EQ }
          #{ name: "site_sm", value: $siteName, operator: EQ }
          { name: "_language", value: $language, operator: EQ }
          { name: "Slug", value: $slug, operator: EQ } # adjust to your slug field name/index key
          # { name: "showIn", value: $showInId, operator: CONTAINS }  # optional
        ]
      }
      first: 1
    ) {
      total
      pageInfo {
        hasNext
        endCursor
      }
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
        ... on UptickText {
          readTime {
            jsonValue
          }
        }
        ... on _UptickContent {
          contentTitle {
            jsonValue
          }
          contentSummary {
            jsonValue
          }
          contentPublishedDate {
            jsonValue
          }
          contentCardImage {
            jsonValue
            ... on ImageField {
              src
              alt
              extension
            }
          }
          contentMainImage {
            jsonValue
            ... on ImageField {
              src
              alt
              extension
            }
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
          products {
            jsonValue
          }
          showIn {
            value
            targetItems {
              name
            }
          }
          author {
            jsonValue
          }
          primaryCTA {
            jsonValue
          }
        }
      }
    }
  }
`;

// Authors list
export const GQL_AUTHORS_LIST = /* GraphQL */ `
  query AuthorsList($language: String!, $after: String, $first: Int!) {
    search(
      where: {
        AND: [
          { name: "_path", value: "{404D4136-6AA0-4D1C-AD5E-7E4E1D1A892A}", operator: CONTAINS }
          { name: "_templates", value: "{D3BC4A10-33D0-4B85-A170-5D61FBD5F44D}", operator: EQ }
          { name: "_language", value: $language, operator: EQ }
          # === dynamic filters (insertion point) ===
          #__DYNAMIC_FILTERS__
          # === end dynamic filters ===
        ]
      }
      first: $first
      after: $after
      orderBy: { name: "_name", direction: ASC }
    ) {
      total
      pageInfo {
        hasNext
        endCursor
      }
      results {
        id
        url {
          path
        }
        ... on UptickAuthor {
          name
          name
          givenName: field(name: "Given name") {
            jsonValue
          }
          surname {
            jsonValue
          }
          isSME {
            jsonValue
          }
          biography {
            jsonValue
          }
          photo {
            src
            jsonValue
          }
          areaOfExpertise: field(name: "Area Of Expertise") {
            ... on ItemField {
              jsonValue
            }
          }
          # === dynamic fetch (insertion point) ===
          #__DYNAMIC_FETCH__
          # === end dynamic fetch ===
        }
      }
    }
  }
`;

// Author by slug
export const GQL_AUTHOR_BY_SLUG = /* GraphQL */ `
  query AuthorBySlug($language: String!, $slug: String!) {
    search(
      where: {
        AND: [
          { name: "_parent", value: "{404D4136-6AA0-4D1C-AD5E-7E4E1D1A892A}", operator: CONTAINS }
          { name: "_templates", value: "{D3BC4A10-33D0-4B85-A170-5D61FBD5F44D}", operator: EQ }
          { name: "_language", value: $language, operator: EQ }
          { name: "_path", value: $slug, operator: CONTAINS }
        ]
      }
      first: 1
    ) {
      results {
        id
        url {
          path
        }
        ... on UptickAuthor {
          name
          givenName: field(name: "Given name") {
            jsonValue
          }
          surname {
            jsonValue
          }
          isSME {
            jsonValue
          }
          biography {
            jsonValue
          }
          photo {
            src
            jsonValue
          }
          longBiographyTitle {
            jsonValue
          }
          longBiographySubtitle {
            jsonValue
          }
          longBiographyContent {
            jsonValue
          }
          areaOfExpertise: field(name: "Area Of Expertise") {
            ... on ItemField {
              jsonValue
            }
          }
        }
      }
    }
  }
`;

export const GQL_SEARCH = /* GraphQL */ `
  query UptickList($language: String!, $after: String, $first: Int!) {
    search(
      where: {
        AND: [
          { name: "_path", value: "{38CDA13E-B419-4B7E-BC47-AC3923F4EEFC}", operator: CONTAINS }
          { name: "_templates", value: "{2DA8DDA8-49F4-40C1-83FE-C465CA56B588}", operator: EQ }
          #{ name: "site_sm", value: $siteName, operator: EQ }
          { name: "_language", value: $language, operator: EQ }
          # === dynamic filters (insertion point) ===
          #__DYNAMIC_FILTERS__
          # === end dynamic filters ===
        ]
      }
      first: $first
      after: $after
      orderBy: { name: "contentPublishedDate", direction: DESC }
    ) {
      total
      pageInfo {
        hasNext
        endCursor
      }
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
        ... on UptickText {
          readTime {
            jsonValue
          }
        }
        ... on _UptickContent {
          contentTitle {
            jsonValue
          }
          contentSummary {
            jsonValue
          }
          contentPublishedDate {
            jsonValue
          }
          contentCardImage {
            jsonValue
            ... on ImageField {
              src
              alt
              extension
            }
          }
          contentMainImage {
            jsonValue
            ... on ImageField {
              src
              alt
              extension
            }
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
          products {
            jsonValue
          }
          showIn {
            value
            targetItems {
              name
            }
          }
          author {
            jsonValue
          }
          primaryCTA {
            jsonValue
          }
        }
      }
    }
  }
`;

export const GQL_SEARCH_CONTENT = /* GraphQL */ `
  query UptickList($language: String!, $after: String, $first: Int!) {
    search(
      where: {
        AND: [
          { name: "_path", value: "{38CDA13E-B419-4B7E-BC47-AC3923F4EEFC}", operator: CONTAINS }
          { name: "_templates", value: "{2DA8DDA8-49F4-40C1-83FE-C465CA56B588}", operator: EQ }
          #{ name: "site_sm", value: $siteName, operator: EQ }
          { name: "_language", value: $language, operator: EQ }
          # === dynamic filters (insertion point) ===
          #__DYNAMIC_FILTERS__
          # === end dynamic filters ===
        ]
      }
      first: $first
      after: $after
      orderBy: { name: "contentPublishedDate", direction: DESC }
    ) {
      total
      pageInfo {
        hasNext
        endCursor
      }
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
        ... on UptickText {
          readTime {
            jsonValue
          }
        }
        ... on _UptickContent {
          contentTitle {
            jsonValue
          }
          contentSummary {
            jsonValue
          }
          contentPublishedDate {
            jsonValue
          }
          contentCardImage {
            jsonValue
            ... on ImageField {
              src
              alt
              extension
            }
          }
          contentMainImage {
            jsonValue
            ... on ImageField {
              src
              alt
              extension
            }
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
          products {
            jsonValue
          }
          showIn {
            value
            targetItems {
              name
            }
          }
          author {
            jsonValue
          }
          primaryCTA {
            jsonValue
          }
        }
      }
    }
  }
`;
