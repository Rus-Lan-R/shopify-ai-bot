import { GraphqlRequest } from "app/api/graphql";
import { PRODUCTS } from "app/api/products/products.gql";
import {
  GetProductsQuery,
  GetProductsQueryVariables,
} from "app/types/admin.generated";

export const getAllProducts = async ({
  graphqlRequest,
}: {
  graphqlRequest: GraphqlRequest;
}) => {
  const allProducts = await graphqlRequest<
    { data: GetProductsQuery },
    GetProductsQueryVariables
  >(PRODUCTS, {
    first: 100,
  });

  return { products: allProducts.data.products.nodes };
};
