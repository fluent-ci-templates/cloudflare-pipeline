import * as jobs from "./jobs.ts";
import { env } from "../deps.ts";

const { deploy, runnableJobs } = jobs;

export default async function pipeline(src = ".", args: string[] = []) {
  if (args.length > 0) {
    await runSpecificJobs(src, args as jobs.Job[]);
    return;
  }

  await deploy(src, env.get("CF_API_TOKEN")!, env.get("CF_ACCOUNT_ID")!);
}

async function runSpecificJobs(src: string, args: jobs.Job[]) {
  for (const name of args) {
    const job = runnableJobs[name];
    if (!job) {
      throw new Error(`Job ${name} not found`);
    }
    await job(
      src,
      env.get("CF_API_TOKEN")!,
      env.get("CF_ACCOUNT_ID")!,
      env.get("PROJECT_NAME") || "",
      env.get("DIRECTORY") || "."
    );
  }
}
