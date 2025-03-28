import { GraphqlRequest } from "app/api/graphql";
import { LOCATIONS } from "app/api/locations/locatinos.gql";
import { GetLocationsQuery } from "app/types/admin.generated";

export const getAllLocations = async ({
  graphqlRequest,
}: {
  graphqlRequest: GraphqlRequest;
}) => {
  const allProducts = await graphqlRequest<{ data: GetLocationsQuery }>(
    LOCATIONS,
    {
      first: 100,
    },
  );

  return { products: allProducts.data.locations.nodes };
};
