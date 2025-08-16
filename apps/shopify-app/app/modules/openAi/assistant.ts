import { Platforms } from "@internal/database";
import { ChatService } from "@internal/services";
import { openAi, openAiKey } from "app/services/openAi.server";
import type { IPlatform, ISession } from "@internal/types";
import { PlatformName, IntegrationStatus } from "@internal/const";

const devPromopt = `vector storage files contain information about products`;

export const assistantInit = async ({
  shopSession,
  assistantName,
  assistantPrompt,
}: {
  shopSession: ISession;
  assistantName: string;
  assistantPrompt: string;
}) => {
  let platform = await Platforms.findOne<IPlatform>({
    name: PlatformName.WEBSITE,
    sessionId: shopSession._id,
    integrationStatus: IntegrationStatus.ACTIVE,
  });

  if (!platform) {
    platform = await Platforms.create<IPlatform>({
      name: PlatformName.WEBSITE,
      sessionId: shopSession._id,
      integrationStatus: IntegrationStatus.ACTIVE,
    });
  }
  const chatService = new ChatService(platform!, shopSession, openAiKey);

  const vs = await openAi.aiClient.vectorStores.create({
    name: shopSession._id,
  });

  const openAiAssistant = await openAi.aiClient.beta.assistants.create({
    model: "gpt-4o",
    name: assistantName,
    instructions: assistantPrompt + " /n " + devPromopt,
    temperature: 0.5,
    tool_resources: {
      file_search: { vector_store_ids: [vs.id] },
    },
    tools: [
      { type: "file_search" },
      {
        type: "function",
        function: {
          name: "get_date",
          description: "function get today date and time",
          parameters: {
            type: "object",
            properties: {
              today_date: {
                type: "string",
                description: "Today date and time",
              },
            },
            required: ["today_date"],
            additionalProperties: false,
          },
        },
      },
    ],
  });

  const { chat } = await chatService.createChat();

  return {
    assistantId: openAiAssistant.id,
    vectorStoreId: vs.id,
    mainChatId: chat._id,
  };
};

export const assistantUpdate = async ({
  assistantId,
  assistantName,
  assistantPrompt,
}: {
  assistantId: string;
  assistantName: string;
  assistantPrompt: string;
}) => {
  await openAi.aiClient.beta.assistants.update(assistantId, {
    name: assistantName,
    instructions: assistantPrompt + " /n " + devPromopt,
  });
};
