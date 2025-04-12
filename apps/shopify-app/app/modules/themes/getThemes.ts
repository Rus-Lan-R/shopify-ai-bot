import { GraphqlRequest } from "app/api/graphql";
import { GET_THEMES } from "app/api/themes/themes.gql";
import {
  GetThemesQuery,
  GetThemesQueryVariables,
} from "app/types/admin.generated";

export const getMainTheme = async ({
  graphqlRequest,
}: {
  graphqlRequest: GraphqlRequest;
}) => {
  const allThemes = await graphqlRequest<
    { data: GetThemesQuery },
    GetThemesQueryVariables
  >(GET_THEMES, {
    first: 1,
    roles: ["MAIN"],
  });

  return { mainTheme: allThemes.data.themes?.nodes?.[0] };
};
