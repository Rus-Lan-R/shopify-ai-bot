import { createFileFromObject } from "../../helpers/createFileFromObject";
import { FileTypes, VsFile } from "./openAi.interfaces";
import { AiClient } from "@internal/services";
const openAi = new AiClient();
export const populateVectorStoreInfo = async ({
  shopId,
  vsId,
  dataObject,
  type,
  vsFiles = [],
}: {
  shopId: string;
  vsId: string;
  type: FileTypes;
  dataObject: {};
  vsFiles?: VsFile[];
}) => {
  const ordersFile = createFileFromObject({
    name: `${shopId}_${type}.json`,
    obj: dataObject,
  });

  const storedFile = vsFiles.find((item) => item.type == type);
  if (storedFile?.fileId) {
    console.log(storedFile.fileId);
    try {
      await openAi.aiClient.vectorStores.files.del(vsId, storedFile?.fileId);
    } catch (error) {}
    try {
      await openAi.aiClient.files.del(storedFile?.fileId);
    } catch (error) {}
  }

  const uploadedFile = await openAi.aiClient.vectorStores.files.uploadAndPoll(
    vsId,
    ordersFile,
  );

  const newVsFile = storedFile
    ? vsFiles.map((item) => {
        if (item.type === type) {
          return { ...item, fileId: uploadedFile.id };
        }
        return item;
      })
    : [...vsFiles, { type, fileId: uploadedFile.id }];
  return {
    vsFiles: newVsFile,
    newFile: { type, fileId: uploadedFile.id },
  };
};
