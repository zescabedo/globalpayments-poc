export const GET_LOCALE_FROM_COUNTRY_CODE = `
  query GetPrimaryLanguage(
  $sitePath: String!
  $templatePath: String!
  $countryIsoCode: String!
  $language: String!
) {
  search(
    where: {
      AND: [
        { name: "_path", value: $sitePath }
        { name: "_templates", value: $templatePath }
        { name: "_language", value: $language }
        { name: "CountryIsoCode", value: $countryIsoCode }
      ]
    }
  ) {
    results {
      name
      CountryName: field(name: "CountryName") {
        value
      }
      CountryIsoCode: field(name: "CountryIsoCode") {
        value
      }
      PrimaryLanguage: field(name: "PrimaryLanguage") {
        jsonValue
      }
      children {
        results {
          RegionName: field(name: "RegionName") {
            value
          }
          RegionIsoCode: field(name: "RegionIsoCode") {
            value
          }
          PrimaryLanguage: field(name: "PrimaryLanguage") {
            jsonValue
          }
        }
      }
    }
  }
}
`;
