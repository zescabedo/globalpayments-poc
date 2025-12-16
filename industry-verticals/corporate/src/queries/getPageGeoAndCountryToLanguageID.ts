export const GET_PAGE_GEO_AND_COUNTRY_TO_LANGUAGE_ID = (
  siteName: string,
  siteId: string,
  path: string,
  siteLanguage: string
) => `
query GetPageGeoAndCountryToLanguageID {
  layout(routePath: "${path}", language: "${siteLanguage}", site: "${siteName}") {
    item {
       EnableGeoDetection: field(name: "Enable Geo Detection") {
        jsonValue
      }
    }
  }
  search(
    where: {
      AND: [
        {
          name: "_templates"
          value: "{3CB6568D-6082-4F75-A93C-80998DB309BD}" # Country Template ID
          operator: EQ
        }
        {
          name: "_path"
          value: "${siteId}"
          operator: EQ
        }
      ]
    }
    first:1
  ) {
    results {
      id
      name
    }
  }
}`;
