import OpenAI from "openai";
import { createFileFromObject } from "app/helpers/createFileFromObject";
import {
  Message,
  MessageContent,
  Run,
} from "openai/src/resources/beta/threads/index.js";

export const aiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    instructions: assistantPrompt.trim(),
    temperature: 0.5,
    tool_resources: {},
    tools: [
      // { type: "file_search" },
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

export const populateStoreInfo = async ({
  shopId,
  vsId,
  productsObject,
  ordersObject,
}: {
  shopId: string;
  vsId: string;
  productsObject: {};
  ordersObject: {};
}) => {
  const productsFile = createFileFromObject({
    name: `${shopId}_products.json`,
    obj: productsObject,
  });
  const ordersFile = createFileFromObject({
    name: `${shopId}_orders.json`,
    obj: ordersObject,
  });

  await aiClient.vectorStores.fileBatches.uploadAndPoll(vsId, {
    files: [productsFile, ordersFile],
  });
};

export const getOpenAIResponse = async ({
  userText,
  assistantId,
  threadId,
}: {
  userText?: string;
  assistantId: string;
  threadId: string;
}) => {
  if (!userText) return "Your question";
  console.log("message", userText);

  await aiClient.beta.threads.messages.create(threadId, {
    role: "user",
    content: userText,
  });

  const run = await aiClient.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: assistantId,
  });

  const message = await handleRunStatus(run, threadId);
  console.log("message", message);
  if (
    message?.content[0].type === "text" &&
    message.content[0].text.annotations.length
  ) {
    console.log("RAG --->", message.content[0].text.annotations[0]);
  }
  const text = extractTextWithoutAnnotations(message?.content || []);

  return text;
};

const handleRequiresAction = async (run: Run, threadId: string) => {
  if (
    run.required_action &&
    run.required_action.submit_tool_outputs &&
    run.required_action.submit_tool_outputs.tool_calls
  ) {
    const toolOutputs = run.required_action.submit_tool_outputs.tool_calls.map(
      (tool) => {
        if (tool.function.name === "get_date") {
          return {
            tool_call_id: tool.id,
            output: new Date().toISOString(),
          };
        }
      },
    );

    // Submit all tool outputs at once after collecting them in a list
    if (toolOutputs?.length > 0 && toolOutputs) {
      run = await aiClient.beta.threads.runs.submitToolOutputsAndPoll(
        threadId,
        run.id,

        { tool_outputs: toolOutputs.filter((item) => !!item) },
      );
      console.log("Tool outputs submitted successfully.");
    } else {
      console.log("No tool outputs to submit.");
    }

    // Check status after submitting tool outputs
    return handleRunStatus(run, threadId);
  }
};

const handleRunStatus = async (
  run: Run,
  threadId: string,
): Promise<Message | undefined> => {
  // Check if the run is completed
  if (run.status === "completed") {
    let messages = await aiClient.beta.threads.messages.list(threadId, {
      limit: 1,
    });
    return messages?.data?.[0];
  } else if (run.status === "requires_action") {
    console.log(run.status);
    return await handleRequiresAction(run, threadId);
  } else {
    console.error("Run did not complete:", run);
  }
};

export const extractTextWithoutAnnotations = (data: MessageContent[]) => {
  return data
    .map((item) => {
      if (item.type === "text" && item.text && item.text.value) {
        let textValue = item.text.value;
        item.text.annotations.forEach((annotation) => {
          textValue = textValue.replace(annotation.text, "");
        });
        return textValue.trim();
      }
      return "";
    })
    .filter((value) => value !== "")
    .join("\n");
};
