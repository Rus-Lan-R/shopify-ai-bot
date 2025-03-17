/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type GetOrdersQueryVariables = AdminTypes.Exact<{
  first?: AdminTypes.InputMaybe<AdminTypes.Scalars['Int']['input']>;
  last?: AdminTypes.InputMaybe<AdminTypes.Scalars['Int']['input']>;
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  sortKey?: AdminTypes.InputMaybe<AdminTypes.OrderSortKeys>;
  reverse?: AdminTypes.InputMaybe<AdminTypes.Scalars['Boolean']['input']>;
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  before?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type GetOrdersQuery = { orders: { nodes: Array<(
      Pick<AdminTypes.Order, 'id' | 'name' | 'createdAt' | 'displayFulfillmentStatus' | 'displayFinancialStatus' | 'tags'>
      & { customer?: AdminTypes.Maybe<Pick<AdminTypes.Customer, 'email' | 'firstName' | 'lastName'>>, channelInformation?: AdminTypes.Maybe<(
        Pick<AdminTypes.ChannelInformation, 'channelId' | 'id'>
        & { channelDefinition?: AdminTypes.Maybe<Pick<AdminTypes.ChannelDefinition, 'handle' | 'channelName'>> }
      )>, app?: AdminTypes.Maybe<Pick<AdminTypes.OrderApp, 'name' | 'id'>>, totalPriceSet: { shopMoney: Pick<AdminTypes.MoneyV2, 'amount'> }, lineItems: { nodes: Array<(
          Pick<AdminTypes.LineItem, 'id' | 'name' | 'quantity' | 'title'>
          & { product?: AdminTypes.Maybe<Pick<AdminTypes.Product, 'title'>>, variant?: AdminTypes.Maybe<Pick<AdminTypes.ProductVariant, 'id' | 'title'>>, customAttributes: Array<Pick<AdminTypes.Attribute, 'key' | 'value'>>, discountAllocations: Array<{ allocatedAmount: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> }>, discountedUnitPriceAfterAllDiscountsSet: { shopMoney: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> }, originalUnitPriceSet: { shopMoney: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> } }
        )> }, fulfillments: Array<Pick<AdminTypes.Fulfillment, 'status' | 'createdAt'>>, shippingLines: { nodes: Array<(
          Pick<AdminTypes.ShippingLine, 'title'>
          & { discountedPriceSet: { shopMoney: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> }, originalPriceSet: { shopMoney: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> } }
        )> } }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'hasPreviousPage' | 'endCursor' | 'startCursor'> } };

export type GetProductsQueryVariables = AdminTypes.Exact<{
  first?: AdminTypes.InputMaybe<AdminTypes.Scalars['Int']['input']>;
  last?: AdminTypes.InputMaybe<AdminTypes.Scalars['Int']['input']>;
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  sortKey?: AdminTypes.InputMaybe<AdminTypes.ProductSortKeys>;
  reverse?: AdminTypes.InputMaybe<AdminTypes.Scalars['Boolean']['input']>;
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  before?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type GetProductsQuery = { products: { nodes: Array<(
      Pick<AdminTypes.Product, 'id' | 'title' | 'description'>
      & { seo: Pick<AdminTypes.Seo, 'description' | 'title'>, variants: { nodes: Array<Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'price' | 'compareAtPrice'>> } }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'hasPreviousPage' | 'endCursor' | 'startCursor'> } };

export type GetShopQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type GetShopQuery = { shop: (
    Pick<AdminTypes.Shop, 'name' | 'description' | 'contactEmail' | 'currencyCode' | 'shipsToCountries'>
    & { primaryDomain: Pick<AdminTypes.Domain, 'url'> }
  ) };

export type PopulateProductMutationVariables = AdminTypes.Exact<{
  product: AdminTypes.ProductCreateInput;
}>;


export type PopulateProductMutation = { productCreate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<(
      Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'status'>
      & { variants: { edges: Array<{ node: Pick<AdminTypes.ProductVariant, 'id' | 'price' | 'barcode' | 'createdAt'> }> } }
    )> }> };

export type ShopifyRemixTemplateUpdateVariantMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars['ID']['input'];
  variants: Array<AdminTypes.ProductVariantsBulkInput> | AdminTypes.ProductVariantsBulkInput;
}>;


export type ShopifyRemixTemplateUpdateVariantMutation = { productVariantsBulkUpdate?: AdminTypes.Maybe<{ productVariants?: AdminTypes.Maybe<Array<Pick<AdminTypes.ProductVariant, 'id' | 'price' | 'barcode' | 'createdAt'>>> }> };

interface GeneratedQueryTypes {
  "#graphql\nquery getOrders($first: Int, $last: Int, $query: String, $sortKey: OrderSortKeys, $reverse: Boolean, $after: String, $before: String) {\n  orders(first: $first, last: $last, query: $query, sortKey: $sortKey, reverse: $reverse, after: $after, before: $before) {\n    nodes {\n      id\n      name\n      createdAt\n      displayFulfillmentStatus\n      displayFinancialStatus\n      customer {\n        email\n        firstName\n        lastName\n      }\n      channelInformation {\n        channelId\n        id\n        channelDefinition{\n          handle\n          channelName\n        }\n      }\n\n      app {\n        name\n        id\n      }\n      tags\n      totalPriceSet { \n        shopMoney {\n          amount\n        }\n      }\n\n      lineItems(first:250) {\n        nodes {\n          id\n          name\n          product {\n            title\n          }\n          variant {\n            id\n            title\n          }\n          customAttributes {\n            key\n            value\n          }\n          discountAllocations {\n            allocatedAmount {\n              amount\n              currencyCode\n            }\n          }\n          discountedUnitPriceAfterAllDiscountsSet {\n            shopMoney {\n              amount\n              currencyCode\n            }\n          }\n          originalUnitPriceSet {\n            shopMoney {\n              amount\n              currencyCode\n            }\n          }\n          quantity\n          title\n        }\n      }\n      fulfillments(first:250) {\n        status\n        createdAt\n      }\n      shippingLines(first: 250){\n        nodes {\n          title\n          discountedPriceSet {\n            shopMoney {\n              amount\n              currencyCode\n            }\n          }\n          originalPriceSet {\n            shopMoney {\n              amount\n              currencyCode\n            }\n          }\n        }\n      }\n    }\n    pageInfo {\n      hasNextPage\n      hasPreviousPage\n      endCursor\n      startCursor\n    }\n  }\n}": {return: GetOrdersQuery, variables: GetOrdersQueryVariables},
  "#graphql\nquery getProducts($first: Int, $last: Int, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean, $after: String, $before: String) {\n    products(first: $first, last: $last, query: $query, sortKey: $sortKey, reverse: $reverse, after: $after, before: $before) {\n        nodes {\n            id\n            title\n            description\n            seo {\n                description\n                title\n            }\n            variants(first: 100) {\n                nodes{\n                    id\n                    title\n                    price\n                    compareAtPrice\n                }\n            }\n        }\n            pageInfo {\n            hasNextPage\n            hasPreviousPage\n            endCursor\n            startCursor\n        }\n    }\n}": {return: GetProductsQuery, variables: GetProductsQueryVariables},
  "#graphql\n  query getShop {\n    shop {\n        name\n        description\n        contactEmail\n        currencyCode\n        primaryDomain {\n            url\n        }\n        shipsToCountries\n    }\n  }": {return: GetShopQuery, variables: GetShopQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n        mutation populateProduct($product: ProductCreateInput!) {\n          productCreate(product: $product) {\n            product {\n              id\n              title\n              handle\n              status\n              variants(first: 10) {\n                edges {\n                  node {\n                    id\n                    price\n                    barcode\n                    createdAt\n                  }\n                }\n              }\n            }\n          }\n        }": {return: PopulateProductMutation, variables: PopulateProductMutationVariables},
  "#graphql\n      mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {\n        productVariantsBulkUpdate(productId: $productId, variants: $variants) {\n          productVariants {\n            id\n            price\n            barcode\n            createdAt\n          }\n        }\n      }": {return: ShopifyRemixTemplateUpdateVariantMutation, variables: ShopifyRemixTemplateUpdateVariantMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
