import { Client } from "@dagger.io/dagger";
import { withDevbox } from "https://deno.land/x/nix_installer_pipeline@v0.3.6/src/dagger/steps.ts";

export enum Job {
  deploy = "deploy",
  pagesDeploy = "pages-deploy",
}

const packages = ["nodejs@18.16.1", "bun@0.7.0"];

export const deploy = async (client: Client, src = ".") => {
  const context = client.host().directory(src);
  const ctr = withDevbox(
    client
      .pipeline(Job.deploy)
      .container()
      .from("alpine:latest")
      .withExec(["apk", "update"])
      .withExec(["apk", "add", "curl", "bash"])
      .withMountedCache("/nix", client.cacheVolume("nix"))
      .withMountedCache("/etc/nix", client.cacheVolume("nix-etc"))
  )
    .withMountedCache(
      "/root/.local/share/devbox/global",
      client.cacheVolume("devbox-global")
    )
    .withExec(["devbox", "global", "add", ...packages])
    .withMountedCache(
      "/root/.bun/install/cache",
      client.cacheVolume("bun-cache")
    )
    .withMountedCache("/app/node_modules", client.cacheVolume("node_modules"))
    .withEnvVariable("NIX_INSTALLER_NO_CHANNEL_ADD", "1")
    .withDirectory("/app", context, {
      exclude: [".git", ".devbox", "node_modules", ".fluentci"],
    })
    .withWorkdir("/app")
    .withEnvVariable("CF_API_TOKEN", Deno.env.get("CF_API_TOKEN") || "")
    .withEnvVariable("CF_ACCOUNT_ID", Deno.env.get("CF_ACCOUNT_ID") || "")
    .withExec(["sh", "-c", "devbox global run -- bun install"])
    .withExec(["sh", "-c", "devbox global run -- bun x wrangler deploy"]);

  const result = await ctr.stdout();

  console.log(result);
};

export const pagesDeploy = async (client: Client, src = ".") => {
  const DIRECTORY = Deno.env.get("DIRECTORY") || ".";
  const PROJECT_NAME = Deno.env.get("PROJECT_NAME");

  if (!PROJECT_NAME) {
    throw new Error("PROJECT_NAME environment variable is required");
  }

  const context = client.host().directory(src);
  const ctr = withDevbox(
    client
      .pipeline(Job.pagesDeploy)
      .container()
      .from("alpine:latest")
      .withExec(["apk", "update"])
      .withExec(["apk", "add", "curl", "bash"])
      .withMountedCache("/nix", client.cacheVolume("nix"))
      .withMountedCache("/etc/nix", client.cacheVolume("nix-etc"))
  )
    .withMountedCache(
      "/root/.local/share/devbox/global",
      client.cacheVolume("devbox-global")
    )
    .withExec(["devbox", "global", "add", ...packages])
    .withMountedCache(
      "/root/.bun/install/cache",
      client.cacheVolume("bun-cache")
    )
    .withMountedCache("/app/node_modules", client.cacheVolume("node_modules"))
    .withEnvVariable("NIX_INSTALLER_NO_CHANNEL_ADD", "1")
    .withDirectory("/app", context, {
      exclude: [".git", ".devbox", "node_modules", ".fluentci"],
    })
    .withWorkdir("/app")
    .withEnvVariable("CF_API_TOKEN", Deno.env.get("CF_API_TOKEN") || "")
    .withEnvVariable("CF_ACCOUNT_ID", Deno.env.get("CF_ACCOUNT_ID") || "")
    .withExec(["sh", "-c", "devbox global run -- bun install"])
    .withExec([
      "sh",
      "-c",
      `devbox global run -- bun x wrangler pages deploy ${DIRECTORY} --project-name ${PROJECT_NAME}`,
    ]);

  const result = await ctr.stdout();

  console.log(result);
};

export type JobExec = (
  client: Client,
  src?: string
) =>
  | Promise<void>
  | ((
      client: Client,
      src?: string,
      options?: {
        ignore: string[];
      }
    ) => Promise<void>);

export const runnableJobs: Record<Job, JobExec> = {
  [Job.deploy]: deploy,
  [Job.pagesDeploy]: pagesDeploy,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.deploy]: "Deploy your Worker to Cloudflare",
  [Job.pagesDeploy]:
    "Deploy a directory of static assets as a Pages deployment.",
};
