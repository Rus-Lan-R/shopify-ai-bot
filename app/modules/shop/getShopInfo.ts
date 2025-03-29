import { GraphqlRequest } from "app/api/graphql";
import { GET_SHOP } from "app/api/shop/shop.gql";
import { GetShopQuery, GetShopQueryVariables } from "app/types/admin.generated";

export const getShopInfo = async ({
  graphqlRequest,
}: {
  graphqlRequest: GraphqlRequest;
}) => {
  const shop = await graphqlRequest<
    { data: GetShopQuery },
    GetShopQueryVariables
  >(GET_SHOP, {});

  return { shopInfo: shop.data };
};
