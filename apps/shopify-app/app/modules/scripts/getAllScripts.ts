import { GraphqlRequest } from "app/api/graphql";
import { GET_SCRIPT_TAGS } from "app/api/scripts/scripts.gql";
import {
  GetScriptTagsQuery,
  GetScriptTagsQueryVariables,
} from "app/types/admin.generated";

export const getAllConnectedAppScripts = async ({
  graphqlRequest,
}: {
  graphqlRequest: GraphqlRequest;
}) => {
  const {
    data: { scriptTags },
  } = await graphqlRequest<
    { data: GetScriptTagsQuery },
    GetScriptTagsQueryVariables
  >(GET_SCRIPT_TAGS, {
    src: `${process.env.SHOPIFY_APP_URL}/chat.js`,
  });
  return { scriptTags: scriptTags.nodes };
};
