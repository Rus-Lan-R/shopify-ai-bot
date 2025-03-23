export const ORDERS = `#graphql
query getOrders($first: Int, $last: Int, $query: String, $sortKey: OrderSortKeys, $reverse: Boolean, $after: String, $before: String) {
  orders(first: $first, last: $last, query: $query, sortKey: $sortKey, reverse: $reverse, after: $after, before: $before) {
    nodes {
      id
      name
      createdAt
      displayFulfillmentStatus
      displayFinancialStatus
      customer {
        email
        firstName
        lastName
      }
      channelInformation {
        channelId
        id
        channelDefinition{
          handle
          channelName
        }
      }

      app {
        name
        id
      }
      tags
      totalPriceSet { 
        shopMoney {
          amount
        }
      }

      lineItems(first:250) {
        nodes {
          id
          name
          product {
            title
          }
          variant {
            id
            title
          }
          customAttributes {
            key
            value
          }
          discountAllocations {
            allocatedAmount {
              amount
              currencyCode
            }
          }
          discountedUnitPriceAfterAllDiscountsSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          originalUnitPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          quantity
          title
        }
      }
      fulfillments(first:250) {
        status
        createdAt
      }
      shippingLines(first: 250){
        nodes {
          title
          discountedPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          originalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      endCursor
      startCursor
    }
  }
}`;
