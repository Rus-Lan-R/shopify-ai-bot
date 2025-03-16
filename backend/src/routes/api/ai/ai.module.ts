import { assistantPrompt, introPrompt } from "../../../services/openAi/prompt";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { Message } from "openai/resources/beta/threads/messages";
import { aiClient } from "../../../services/openAi/openAi";

export const getStores = async () => {
  const list = await aiClient.vectorStores.list();
  console.log(list);
};

export const createThread = async () => {
  const thread = await aiClient.beta.threads.create();
  return thread;
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
  if (!userText) return "";
  console.log("message", userText);

  await aiClient.beta.threads.messages.create(threadId, {
    role: "user",
    content: userText,
  });

  const run = await aiClient.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: assistantId,
  });

  const message = await handleRunStatus(run, threadId);

  if (
    message?.content[0].type === "text" &&
    message.content[0].text.annotations.length
  ) {
    console.log("RAG --->", message.content[0].text.annotations[0]);
  }

  return message?.content;
};

export const simpleRequest = async (hiText: string) => {
  const response = await aiClient.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: assistantPrompt + introPrompt + `\n \n${hiText}`,
      },
    ],
  });

  return response.choices[0]?.message?.content;
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
      }
    );

    // Submit all tool outputs at once after collecting them in a list
    if (toolOutputs?.length > 0 && toolOutputs) {
      run = await aiClient.beta.threads.runs.submitToolOutputsAndPoll(
        threadId,
        run.id,

        { tool_outputs: toolOutputs.filter((item) => !!item) }
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
  threadId: string
): Promise<Message | undefined> => {
  // Check if the run is completed
  if (run.status === "completed") {
    let messages = await aiClient.beta.threads.messages.list(threadId);
    return messages?.data?.[0];
  } else if (run.status === "requires_action") {
    console.log(run.status);
    return await handleRequiresAction(run, threadId);
  } else {
    console.error("Run did not complete:", run);
  }
};
