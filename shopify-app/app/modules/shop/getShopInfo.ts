import { GraphqlRequest } from "app/api/graphql";
import { GET_SHOP } from "app/api/shop/shop.gql";
import { GetShopQuery } from "app/types/admin.generated";

export const getShopInfo = async ({
  graphqlRequest,
}: {
  graphqlRequest: GraphqlRequest;
}) => {
  const shop = await graphqlRequest<{ data: GetShopQuery }>(GET_SHOP, {
    first: 100,
  });

  return { shopInfo: shop.data };
};
