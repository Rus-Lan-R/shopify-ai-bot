import OpenAI from "openai";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { Message } from "openai/resources/beta/threads/messages";
import { extractTextWithoutAnnotations } from "../helpers";
import { MessageRole } from "@internal/database";

export class AiClient {
  public aiClient: OpenAI;

  constructor(apiKey: string) {
    this.aiClient = new OpenAI({
      apiKey,
    });
  }

  async createThread() {
    const threadId = await this.aiClient.beta.threads.create();
    return threadId;
  }

  async getOpenAIResponse({
    userText,
    assistantId,
    threadId,
  }: {
    userText?: string;
    assistantId: string;
    threadId: string;
  }) {
    if (!userText) return "Your question";
    console.log("message", userText);

    // const run = await aiClient.beta.threads.createAndRunPoll({
    //   thread: {
    //     messages: [{ role: "user", content: userText }],
    //   },

    //   assistant_id: assistantId,
    // });

    await this.aiClient.beta.threads.messages.create(threadId, {
      role: MessageRole.USER,
      content: userText,
    });

    const run = await this.aiClient.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });

    const message = await this.handleRunStatus(run, threadId);
    console.dir(message?.content, { depth: 5 });
    if (
      message?.content[0].type === "text" &&
      message.content[0].text.annotations.length
    ) {
      console.log("RAG --->", message.content[0].text.annotations[0]);
    }
    const text = extractTextWithoutAnnotations(message?.content || []);

    return text;
  }

  private async handleRunStatus(
    run: Run,
    threadId: string
  ): Promise<Message | undefined> {
    // Check if the run is completed
    if (run.status === "completed") {
      let messages = await this.aiClient.beta.threads.messages.list(threadId, {
        limit: 1,
      });
      return messages?.data?.[0];
    } else if (run.status === "requires_action") {
      console.log(run.status);
      return await this.handleRequiresAction(run, threadId);
    } else {
      console.error("Run did not complete:", run);
    }
  }

  private async handleRequiresAction(run: Run, threadId: string) {
    if (
      run.required_action &&
      run.required_action.submit_tool_outputs &&
      run.required_action.submit_tool_outputs.tool_calls
    ) {
      const toolOutputs =
        run.required_action.submit_tool_outputs.tool_calls.map((tool) => {
          if (tool.function.name === "get_date") {
            return {
              tool_call_id: tool.id,
              output: new Date().toISOString(),
            };
          }
        });

      // Submit all tool outputs at once after collecting them in a list
      if (toolOutputs?.length > 0 && toolOutputs) {
        run = await this.aiClient.beta.threads.runs.submitToolOutputsAndPoll(
          threadId,
          run.id,

          { tool_outputs: toolOutputs.filter((item) => !!item) }
        );
        console.log("Tool outputs submitted successfully.");
      } else {
        console.log("No tool outputs to submit.");
      }

      // Check status after submitting tool outputs
      return this.handleRunStatus(run, threadId);
    }
  }
}
