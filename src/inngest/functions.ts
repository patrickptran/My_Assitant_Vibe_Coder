import { createAgent, openai } from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-first-test-02");
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: "code Agent",
      system:
        "You are an expert TypeScript programmer. You write readable, maintainable code. You write simple Next.js snippets. You only respond with code, no explanations.",
      model: openai({ model: "gpt-4o" }),
    });
    const { output } = await codeAgent.run(
      `Write the following snippets: ${event.data.value}`
    );
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox?.getHost(3000);
      return `https://${host}`;
    });
    return { output, sandboxUrl };
  }
);
