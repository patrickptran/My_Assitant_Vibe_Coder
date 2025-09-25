import { createAgent, openai } from "@inngest/agent-kit";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event }) => {
    const codeAgent = createAgent({
      name: "code Agent",
      system:
        "You are an expert TypeScript programmer. You write readable, maintainable code. You write simple Next.js snippets. You only respond with code, no explanations.",
      model: openai({ model: "gpt-4o" }),
    });
    const { output } = await codeAgent.run(
      `Write the following snippets: ${event.data.value}`
    );
    return { output };
  }
);
