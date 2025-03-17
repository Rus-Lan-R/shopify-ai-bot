import { aiClient } from "app/services/openAi.server";

const devPromopt = `vector storage files contain information about products`;
export const assistantInit = async ({
  shopId,
  assistantName,
  assistantPrompt,
}: {
  shopId: string;
  assistantName: string;
  assistantPrompt: string;
}) => {
  const vs = await aiClient.vectorStores.create({
    name: shopId,
  });

  const assistant = await aiClient.beta.assistants.create({
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

  const thread = await aiClient.beta.threads.create();

  return {
    assistantId: assistant.id,
    vectorStoreId: vs.id,
    mainThreadId: thread.id,
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
  await aiClient.beta.assistants.update(assistantId, {
    name: assistantName,
    instructions: assistantPrompt + " /n " + devPromopt,
  });
};
