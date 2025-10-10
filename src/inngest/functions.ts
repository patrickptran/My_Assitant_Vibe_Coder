import { createAgent, createTool, openai } from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";
import { z } from "zod";

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
      tools: [
        createTool({
          name: "terminal",
          description: "A sandbox environment for running code snippets",
          // @ts-expect-error the conflict between zod and inngest types
          parameters: z.object({
            command: z.string(),
          }),

          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox?.commands.run(command, {
                  // maybe we want to capture stdin in the future?
                  stdin: true,
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result?.stdout || "";
              } catch (error) {
                console.log(
                  `Error running command: ${error} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`
                );
                return `Error running command: ${error} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: " Create or update files in the sandbox",
          // @ts-expect-error the conflict between zod and inngest types
          parameters: z.object({
            files: z.array(z.object({ path: z.string(), content: z.string() })),
          }),
          handler: async ({ files }, { step, network }) => {
            /*
            / app/page.tsx --> "<div>Hello World</div>"
            / app/about/page.tsx --> "<div>About Us</div>"
            */
            const newFiles = await step?.run(
              "create-or-update-files",
              async () => {
                try {
                  const sandbox = await getSandbox(sandboxId);
                  const updatedFiles: string[] = network.state.data.files || [];
                  for (const file of files) {
                    await sandbox?.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                } catch (e) {
                  console.log("Error creating or updating files", e);
                }
              }
            );
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          // @ts-expect-error the conflict between zod and inngest types
          parameters: z.object({
            paths: z.array(z.string()),
          }),
        }),
      ],
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
