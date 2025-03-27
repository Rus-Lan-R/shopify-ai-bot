import { getAllProducts } from "../products/getAllProducts";
import { GraphqlRequest } from "app/api/graphql";
import { getShopInfo } from "../shop/getShopInfo";
import { FileTypes, VsFile } from "../openAi/openAi.interfaces";
import { populateVectorStoreInfo } from "../openAi/vectorStore";

const dataFunctionsMap = (
  type: FileTypes,
):
  | (({ graphqlRequest }: { graphqlRequest: GraphqlRequest }) => Promise<{}>)
  | undefined => {
  return {
    [FileTypes.PRODUCTS]: getAllProducts,
    [FileTypes.SHOP]: getShopInfo,
    [FileTypes.ORDES]: ({
      graphqlRequest,
    }: {
      graphqlRequest: GraphqlRequest;
    }) =>
      new Promise((res) =>
        res({
          orderNumber: "#EXAMPLE",
        }),
      ),
    [FileTypes.OTHER_INFO]: undefined,
  }[type];
};

export const dataSync = async ({
  vsId,
  type,
  shopId,
  vsFiles,
  graphqlRequest,
}: {
  type?: FileTypes;
  vsId: string;
  shopId: string;
  vsFiles: VsFile[];
  graphqlRequest: GraphqlRequest;
}) => {
  if (type) {
    const data = await dataFunctionsMap(type)?.({ graphqlRequest });
    if (data) {
      const { vsFiles: updatedVsFiles, newFile } =
        await populateVectorStoreInfo({
          shopId,
          vsId,
          vsFiles,
          type,
          dataObject: data,
        });
      return { updatedVsFiles, newFile };
    }
  }

  return { updatedVsFiles: undefined, newFile: undefined };
};
