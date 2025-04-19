export const LOCATIONS = `#graphql
query getLocations($first: Int){
  locations(first: $first) {
    nodes{
      address {
        address1
        address2
        city
        country
        countryCode
        provinceCode
        phone
        province
        provinceCode
        zip
      }
      hasActiveInventory
      isActive
      addressVerified
    }
  }
}`;
