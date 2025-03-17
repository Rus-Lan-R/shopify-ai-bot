import { aiClient } from "app/services/openAi.server";
import { Run } from "openai/resources/beta/threads/index.mjs";
import {
  Message,
  MessageContent,
} from "openai/resources/beta/threads/messages.mjs";

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

export const simpleRequest = async (text: string) => {
  const response = await aiClient.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "user",
        content: text,
      },
    ],
    response_format: { type: "json_object" },
  });

  return response.choices[0]?.message?.content;
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

  // const run = await aiClient.beta.threads.createAndRunPoll({
  //   thread: {
  //     messages: [{ role: "user", content: userText }],
  //   },

  //   assistant_id: assistantId,
  // });

  await aiClient.beta.threads.messages.create(threadId, {
    role: "user",
    content: userText,
  });

  const run = await aiClient.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: assistantId,
  });

  const message = await handleRunStatus(run, threadId);
  console.dir(message?.content, { depth: 5 });
  if (
    message?.content[0].type === "text" &&
    message.content[0].text.annotations.length
  ) {
    console.log("RAG --->", message.content[0].text.annotations[0]);
  }
  const text = extractTextWithoutAnnotations(message?.content || []);

  return text;
};
