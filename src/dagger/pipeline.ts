import { uploadContext } from "../../deps.ts";
import * as jobs from "./jobs.ts";

const { deploy, runnableJobs, exclude } = jobs;

export default async function pipeline(src = ".", args: string[] = []) {
  if (Deno.env.has("FLUENTCI_SESSION_ID")) {
    await uploadContext(src, exclude);
  }
  if (args.length > 0) {
    await runSpecificJobs(src, args as jobs.Job[]);
    return;
  }

  await deploy(
    src,
    Deno.env.get("CF_API_TOKEN")!,
    Deno.env.get("CF_ACCOUNT_ID")!
  );
}

async function runSpecificJobs(src: string, args: jobs.Job[]) {
  for (const name of args) {
    const job = runnableJobs[name];
    if (!job) {
      throw new Error(`Job ${name} not found`);
    }
    await job(
      src,
      Deno.env.get("CF_API_TOKEN")!,
      Deno.env.get("CF_ACCOUNT_ID")!,
      Deno.env.get("PROJECT_NAME") || "",
      Deno.env.get("DIRECTORY") || "."
    );
  }
}
