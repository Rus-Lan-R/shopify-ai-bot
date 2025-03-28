export const PRODUCTS = `#graphql
query getProducts($first: Int, $last: Int, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean, $after: String, $before: String) {
    products(first: $first, last: $last, query: $query, sortKey: $sortKey, reverse: $reverse, after: $after, before: $before) {
        nodes {
            id
            title
            description
            onlineStoreUrl
            isGiftCard
            productType
            status
            totalInventory
            seo {
                description
                title
            }
            variants(first: 100) {
                nodes{
                    id
                    title
                    price
                    compareAtPrice
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
