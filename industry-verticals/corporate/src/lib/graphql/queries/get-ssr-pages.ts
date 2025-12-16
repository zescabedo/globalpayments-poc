export const GET_SSR_PAGES_QUERY = `query GetSSRPagesList($siteName: String!, $language: String!, $after: String) {
  search(
    where: {
      AND: [
        {
          name: "_templates"
          value: "4715171126ca434e8132d3e0b7d26683"
          operator: CONTAINS
        }
        {
          name: "site_sm"
          value: $siteName
          operator: EQ
        }
        { name: "_language", operator: EQ, value: $language }
        { name: "isdynamicpage", operator: EQ, value: "true" }
      ]
    }
    first: 100
    after: $after
  ) {
    results {
      url {
        path
      }
    }
    pageInfo {
      hasNext
      endCursor
    }
    total
  }
}`;
