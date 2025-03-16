import { GraphqlRequest } from "app/api/graphql";

export const getAllProducts = ({
  graphqlRequest,
}: {
  graphqlRequest: GraphqlRequest;
}) => {
  const allProducts = graphqlRequest(``, {});
  return {};
};
