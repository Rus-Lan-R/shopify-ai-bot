import {
  IntegrationStatus,
  IPlatform,
  ISession,
  Platforms,
} from "@internal/database";
import { AiClient, ChatService } from "@internal/services";

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
  const openAi = new AiClient();
  let platform = await Platforms.findOne<IPlatform>({
    name: "Website",
    sessionId: shopSession._id,
    integrationStatus: IntegrationStatus.ACTIVE,
  });

  if (!platform) {
    platform = await Platforms.create<IPlatform>({
      name: "Website",
      sessionId: shopSession._id,
      integrationStatus: IntegrationStatus.ACTIVE,
    });
  }
  const chatService = new ChatService(platform!, shopSession);

  const vs = await openAi.aiClient.vectorStores.create({
    name: shopSession._id,
  });

  const assistant = await openAi.aiClient.beta.assistants.create({
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

  const thread = await openAi.createThread();
  await chatService.createChat();

  return {
    assistantId: assistant.id,
    vectorStoreId: vs.id,
    mainChatId: thread.id,
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
  const openAi = new AiClient();
  await openAi.aiClient.beta.assistants.update(assistantId, {
    name: assistantName,
    instructions: assistantPrompt + " /n " + devPromopt,
  });
};
