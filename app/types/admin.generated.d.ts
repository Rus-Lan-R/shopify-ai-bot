/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type GetLocationsQueryVariables = AdminTypes.Exact<{
  first?: AdminTypes.InputMaybe<AdminTypes.Scalars['Int']['input']>;
}>;


export type GetLocationsQuery = { locations: { nodes: Array<(
      Pick<AdminTypes.Location, 'hasActiveInventory' | 'isActive' | 'addressVerified'>
      & { address: Pick<AdminTypes.LocationAddress, 'address1' | 'address2' | 'city' | 'country' | 'countryCode' | 'provinceCode' | 'phone' | 'province' | 'zip'> }
    )> } };

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
      Pick<AdminTypes.Product, 'id' | 'title' | 'description' | 'onlineStoreUrl' | 'isGiftCard' | 'productType' | 'status' | 'totalInventory'>
      & { seo: Pick<AdminTypes.Seo, 'description' | 'title'>, variants: { nodes: Array<Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'price' | 'compareAtPrice'>> } }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'hasPreviousPage' | 'endCursor' | 'startCursor'> } };

export type GetScriptTagsQueryVariables = AdminTypes.Exact<{
  src?: AdminTypes.InputMaybe<AdminTypes.Scalars['URL']['input']>;
}>;


export type GetScriptTagsQuery = { scriptTags: { nodes: Array<Pick<AdminTypes.ScriptTag, 'id' | 'createdAt' | 'src'>> } };

export type ScriptTagCreateMutationVariables = AdminTypes.Exact<{
  input: AdminTypes.ScriptTagInput;
}>;


export type ScriptTagCreateMutation = { scriptTagCreate?: AdminTypes.Maybe<{ scriptTag?: AdminTypes.Maybe<Pick<AdminTypes.ScriptTag, 'id' | 'src' | 'displayScope'>>, userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>> }> };

export type ScriptTagDeleteMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type ScriptTagDeleteMutation = { scriptTagDelete?: AdminTypes.Maybe<(
    Pick<AdminTypes.ScriptTagDeletePayload, 'deletedScriptTagId'>
    & { userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>> }
  )> };

export type GetShopQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type GetShopQuery = { shop: (
    Pick<AdminTypes.Shop, 'name' | 'description' | 'contactEmail' | 'currencyCode' | 'ianaTimezone' | 'shipsToCountries'>
    & { primaryDomain: Pick<AdminTypes.Domain, 'url'> }
  ) };

interface GeneratedQueryTypes {
  "#graphql\nquery getLocations($first: Int){\n  locations(first: $first) {\n    nodes{\n      address {\n        address1\n        address2\n        city\n        country\n        countryCode\n        provinceCode\n        phone\n        province\n        provinceCode\n        zip\n      }\n      hasActiveInventory\n      isActive\n      addressVerified\n    }\n  }\n}": {return: GetLocationsQuery, variables: GetLocationsQueryVariables},
  "#graphql\nquery getOrders($first: Int, $last: Int, $query: String, $sortKey: OrderSortKeys, $reverse: Boolean, $after: String, $before: String) {\n  orders(first: $first, last: $last, query: $query, sortKey: $sortKey, reverse: $reverse, after: $after, before: $before) {\n    nodes {\n      id\n      name\n      createdAt\n      displayFulfillmentStatus\n      displayFinancialStatus\n      customer {\n        email\n        firstName\n        lastName\n      }\n      channelInformation {\n        channelId\n        id\n        channelDefinition{\n          handle\n          channelName\n        }\n      }\n\n      app {\n        name\n        id\n      }\n      tags\n      totalPriceSet { \n        shopMoney {\n          amount\n        }\n      }\n\n      lineItems(first:250) {\n        nodes {\n          id\n          name\n          product {\n            title\n          }\n          variant {\n            id\n            title\n          }\n          customAttributes {\n            key\n            value\n          }\n          discountAllocations {\n            allocatedAmount {\n              amount\n              currencyCode\n            }\n          }\n          discountedUnitPriceAfterAllDiscountsSet {\n            shopMoney {\n              amount\n              currencyCode\n            }\n          }\n          originalUnitPriceSet {\n            shopMoney {\n              amount\n              currencyCode\n            }\n          }\n          quantity\n          title\n        }\n      }\n      fulfillments(first:250) {\n        status\n        createdAt\n      }\n      shippingLines(first: 250){\n        nodes {\n          title\n          discountedPriceSet {\n            shopMoney {\n              amount\n              currencyCode\n            }\n          }\n          originalPriceSet {\n            shopMoney {\n              amount\n              currencyCode\n            }\n          }\n        }\n      }\n    }\n    pageInfo {\n      hasNextPage\n      hasPreviousPage\n      endCursor\n      startCursor\n    }\n  }\n}": {return: GetOrdersQuery, variables: GetOrdersQueryVariables},
  "#graphql\nquery getProducts($first: Int, $last: Int, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean, $after: String, $before: String) {\n    products(first: $first, last: $last, query: $query, sortKey: $sortKey, reverse: $reverse, after: $after, before: $before) {\n        nodes {\n            id\n            title\n            description\n            onlineStoreUrl\n            isGiftCard\n            productType\n            status\n            totalInventory\n            seo {\n                description\n                title\n            }\n            variants(first: 100) {\n                nodes{\n                    id\n                    title\n                    price\n                    compareAtPrice\n                }\n            }\n        }\n            pageInfo {\n            hasNextPage\n            hasPreviousPage\n            endCursor\n            startCursor\n        }\n    }\n}": {return: GetProductsQuery, variables: GetProductsQueryVariables},
  "#graphql\n    query getScriptTags($src: URL) {\n        scriptTags(first: 1, src: $src) {\n            nodes {\n                id\n                createdAt\n                src\n            }\n        }\n    }\n": {return: GetScriptTagsQuery, variables: GetScriptTagsQueryVariables},
  "#graphql\n  query getShop {\n    shop {\n        name\n        description\n        contactEmail\n        currencyCode\n        primaryDomain {\n            url\n        }\n        ianaTimezone\n        shipsToCountries\n    }\n  }": {return: GetShopQuery, variables: GetShopQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n    mutation scriptTagCreate($input: ScriptTagInput!) {\n        scriptTagCreate(input: $input) {\n        scriptTag {\n            id\n            src\n            displayScope\n        }\n        userErrors {\n            field\n            message\n        }\n    }\n}": {return: ScriptTagCreateMutation, variables: ScriptTagCreateMutationVariables},
  "#graphql\n  mutation ScriptTagDelete($id: ID!) {\n    scriptTagDelete(id: $id) {\n      deletedScriptTagId\n      userErrors {\n        field\n        message\n      }\n    }\n  }": {return: ScriptTagDeleteMutation, variables: ScriptTagDeleteMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
