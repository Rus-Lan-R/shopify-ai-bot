import { authenticate } from "app/shopify.server";

export type GraphqlRequest = <T>(query: string, variables?: {}) => Promise<T>;

export const createGraphqlRequest = async (
  request: Request,
): Promise<GraphqlRequest> => {
  const { admin } = await authenticate.admin(request);
  return async <T>(query: string, variables?: {}) => {
    const response = await admin.graphql(query, { variables });
    const data = (await response.json()) as T;

    return data;
  };
};
