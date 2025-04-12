import { GraphqlRequest } from "app/api/graphql";
import { LOCATIONS } from "app/api/locations/locatinos.gql";
import {
  GetLocationsQuery,
  GetLocationsQueryVariables,
} from "app/types/admin.generated";

export const getAllLocations = async ({
  graphqlRequest,
}: {
  graphqlRequest: GraphqlRequest;
}) => {
  const allProducts = await graphqlRequest<
    { data: GetLocationsQuery },
    GetLocationsQueryVariables
  >(LOCATIONS, {
    first: 100,
  });

  return { locations: allProducts.data.locations.nodes };
};
