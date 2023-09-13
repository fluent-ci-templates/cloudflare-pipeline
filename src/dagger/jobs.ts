import Client from "@fluentci.io/dagger";

export enum Job {
  deploy = "deploy",
  pagesDeploy = "pages-deploy",
}

export const exclude = [".git", ".devbox", "node_modules", ".fluentci"];

export const deploy = async (client: Client, src = ".") => {
  const context = client.host().directory(src);
  const ctr = client
    .pipeline(Job.deploy)
    .container()
    .from("ghcr.io/fluent-ci-templates/bun:latest")
    .withMountedCache(
      "/root/.bun/install/cache",
      client.cacheVolume("bun-cache")
    )
    .withMountedCache("/app/node_modules", client.cacheVolume("node_modules"))
    .withEnvVariable("NIX_INSTALLER_NO_CHANNEL_ADD", "1")
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withEnvVariable("CLOUDFLARE_API_TOKEN", Deno.env.get("CF_API_TOKEN") || "")
    .withEnvVariable(
      "CLOUDFLARE_ACCOUNT_ID",
      Deno.env.get("CF_ACCOUNT_ID") || ""
    )
    .withExec(["sh", "-c", 'eval "$(devbox global shellenv)" && yarn install'])
    .withExec([
      "sh",
      "-c",
      'eval "$(devbox global shellenv)" && bun x wrangler deploy',
    ]);

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
  const ctr = client
    .pipeline(Job.pagesDeploy)
    .container()
    .from("ghcr.io/fluent-ci-templates/bun:latest")
    .withMountedCache(
      "/root/.bun/install/cache",
      client.cacheVolume("bun-cache")
    )
    .withMountedCache("/app/node_modules", client.cacheVolume("node_modules"))
    .withMountedCache("/app/build", client.cacheVolume("build-dir"))
    .withEnvVariable("NIX_INSTALLER_NO_CHANNEL_ADD", "1")
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withEnvVariable("CLOUDFLARE_API_TOKEN", Deno.env.get("CF_API_TOKEN") || "")
    .withEnvVariable(
      "CLOUDFLARE_ACCOUNT_ID",
      Deno.env.get("CF_ACCOUNT_ID") || ""
    )
    .withExec([
      "sh",
      "-c",
      `eval "$(devbox global shellenv)" && bun x wrangler pages deploy ${DIRECTORY} --project-name ${PROJECT_NAME}`,
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
