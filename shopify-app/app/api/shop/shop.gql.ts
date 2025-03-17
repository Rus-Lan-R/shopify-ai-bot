export const GET_SHOP = `#graphql
  query getShop {
    shop {
        name
        description
        contactEmail
        currencyCode
        primaryDomain {
            url
        }
        shipsToCountries
    }
  }`;
