import { ILimitation, Limitations, Sessions } from "@internal/database";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { createGraphqlRequest } from "app/api/graphql";
import { CREATE_SCRIPT, DELETE_SCRIPT } from "app/api/scripts/scripts.gql";
import { formDataToObject } from "app/helpers/utils";
import { assistantInit, assistantUpdate } from "app/modules/openAi/assistant";
import { FileTypes, VsFile } from "app/modules/openAi/openAi.interfaces";
import { ExtendedSession } from "app/modules/sessionStorage";
import { getShopInfo } from "app/modules/shop/getShopInfo";
import { getMainTheme } from "app/modules/themes/getThemes";
import { dataSync } from "app/modules/vectoreStoreSync";
import { authenticate } from "app/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;

  const graphqlRequest = await createGraphqlRequest(request);

  const shopSession = await Sessions.findById(session._id);

  const { mainTheme } = await getMainTheme({ graphqlRequest });
  return {
    files: shopSession?.assistantFiles as { type: FileTypes; fileId: string }[],
    mainTheme,
    assistant: {
      id: shopSession?.assistantId,
      assistantName: shopSession?.assistantName,
      welcomeMessage: shopSession?.welcomeMessage,
      assistantPrompt: shopSession?.assistantPrompt,
    },
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;
  const { admin } = authData;

  const formData = await request.formData();
  const { action, assistantPrompt, assistantName, welcomeMessage, fileType } =
    formDataToObject(formData);
  const graphqlRequest = await createGraphqlRequest(request);

  if (admin && session._id) {
    switch (action) {
      case "init":
        try {
          const { assistantId, vectorStoreId, mainChatId } =
            await assistantInit({
              shopSession: session,
              assistantName,
              assistantPrompt,
            });
          let initAssistantFiles = Object.values(FileTypes).map((item) => ({
            type: item,
            fileId: "",
          }));

          const files = await Promise.all(
            initAssistantFiles.map((item) => {
              const promiseData = dataSync({
                vsId: vectorStoreId,
                type: item.type,
                shopId: session._id,
                vsFiles: initAssistantFiles,
                graphqlRequest,
              });
              return promiseData;
            }),
          );

          const shopData = await getShopInfo({ graphqlRequest });
          const isDevStore = !!shopData.shopInfo.shop.plan.partnerDevelopment;
          const limitation = await Limitations.findOne<ILimitation>(
            isDevStore ? { slug: "dev" } : { slug: "base" },
          );
          console.log(limitation?._id);

          await Sessions.updateOne(
            { _id: session._id },
            {
              assistantName: assistantName || "",
              assistantPrompt: assistantPrompt || "",
              assistantVectorStoreId: vectorStoreId,
              welcomeMessage: welcomeMessage || "",
              assistantId,
              mainChatId,
              isDevStore: isDevStore,
              assistantFiles: initAssistantFiles.map((item) => {
                const uploadedFileId = files.find(
                  (fileItem) => fileItem.newFile?.type === item.type,
                );
                return { ...item, fileId: uploadedFileId?.newFile?.fileId };
              }),
              limitationId: limitation?._id,
            },
          );
        } catch (error) {
          console.log(error);
        }
        break;
      case "update":
        try {
          if (session._id && !!session?.assistantId) {
            const shopData = await getShopInfo({ graphqlRequest });

            const isDevStore = !!shopData.shopInfo.shop.plan.partnerDevelopment;
            const limitation = await Limitations.findOne<ILimitation>(
              isDevStore ? { slug: "dev" } : { slug: "base" },
            ).lean();
            console.log(limitation?._id);
            await assistantUpdate({
              assistantId: session.assistantId,
              assistantName,
              assistantPrompt,
            });

            await Sessions.updateOne(
              { _id: session._id },
              {
                isDevStore: !!shopData.shopInfo.shop.plan.partnerDevelopment,
                assistantName: assistantName || "",
                assistantPrompt: assistantPrompt || "",
                welcomeMessage: welcomeMessage || "",
                limitationId: limitation?._id,
              },
            );
          }
        } catch (error) {
          console.log(error);
        }
        break;

      case "sync": {
        if (fileType && session?.assistantVectorStoreId) {
          const { updatedVsFiles } = await dataSync({
            vsId: session?.assistantVectorStoreId,
            type: fileType as FileTypes,
            shopId: session._id,
            vsFiles: session.assistantFiles as VsFile[],
            graphqlRequest,
          });
          if (!!updatedVsFiles?.length) {
            await Sessions.updateOne(
              { _id: session._id },
              {
                assistantFiles: JSON.parse(JSON.stringify(updatedVsFiles)),
              },
            );
          }
        }

        break;
      }
      case "chat-init": {
        await graphqlRequest(CREATE_SCRIPT, {
          input: {
            displayScope: "ALL",
            src: `${process.env.SHOPIFY_APP_URL}/chat.js`,
          },
        });

        break;
      }
      case "delete-script": {
        const scriptId = formData.get("scriptId");
        await graphqlRequest(DELETE_SCRIPT, {
          id: scriptId,
        });
        break;
      }

      default:
        break;
    }

    return {};
  }
};
