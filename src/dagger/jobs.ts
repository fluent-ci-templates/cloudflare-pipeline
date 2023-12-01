import Client, { Directory, Secret } from "../../deps.ts";
import { connect } from "../../sdk/connect.ts";
import { getDirectory, getApiToken } from "./lib.ts";

export enum Job {
  deploy = "deploy",
  pagesDeploy = "pages-deploy",
}

export const exclude = [".git", ".devbox", "node_modules", ".fluentci"];

/**
 * @function
 * @description Deploy your Worker to Cloudflare
 * @param {string} src
 * @param {string} apiToken
 * @param {string} accountId
 * @returns {string}
 */
export async function deploy(
  src: string | Directory,
  apiToken: string | Secret,
  accountId: string
): Promise<string> {
  await connect(async (client: Client) => {
    const context = getDirectory(client, src);
    const secret = getApiToken(client, apiToken);
    if (!secret) {
      console.error("CF_API_TOKEN environment variable is required");
      Deno.exit(1);
    }
    const ctr = client
      .pipeline(Job.deploy)
      .container()
      .from("pkgxdev/pkgx:latest")
      .withExec(["apt-get", "update"])
      .withExec(["apt-get", "install", "-y", "ca-certificates"])
      .withExec(["pkgx", "install", "node", "bun", "classic.yarnpkg.com"])
      .withMountedCache(
        "/root/.bun/install/cache",
        client.cacheVolume("bun-cache")
      )
      .withMountedCache("/app/node_modules", client.cacheVolume("node_modules"))
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withSecretVariable("CLOUDFLARE_API_TOKEN", secret)
      .withEnvVariable(
        "CLOUDFLARE_ACCOUNT_ID",
        Deno.env.get("CF_ACCOUNT_ID") || accountId || ""
      )
      .withExec(["yarn", "install"])
      .withExec(["bunx", "wrangler", "deploy"]);

    const result = await ctr.stdout();

    console.log(result);
  });
  return "done";
}

/**
 * @function
 * @description Deploy a directory of static assets as a Pages deployment.
 * @param {string} src
 * @param {string} directory
 * @param {string} projectName
 * @param {string} apiToken
 * @param {string} accountId
 * @returns {string}
 */
export async function pagesDeploy(
  src: string | Directory,
  directory: string,
  projectName: string,
  apiToken: string | Secret,
  accountId: string
): Promise<string> {
  const DIRECTORY = Deno.env.get("DIRECTORY") || directory || ".";
  const PROJECT_NAME = Deno.env.get("PROJECT_NAME") || projectName;

  if (!PROJECT_NAME) {
    throw new Error("PROJECT_NAME environment variable is required");
  }

  await connect(async (client: Client) => {
    const context = getDirectory(client, src);
    const secret = getApiToken(client, apiToken);
    if (!secret) {
      console.error("CF_API_TOKEN environment variable is required");
      Deno.exit(1);
    }
    const ctr = client
      .pipeline(Job.pagesDeploy)
      .container()
      .from("pkgxdev/pkgx:latest")
      .withExec(["apt-get", "update"])
      .withExec(["apt-get", "install", "-y", "ca-certificates"])
      .withExec(["pkgx", "install", "node", "bun", "classic.yarnpkg.com"])
      .withMountedCache(
        "/root/.bun/install/cache",
        client.cacheVolume("bun-cache")
      )
      .withMountedCache("/app/node_modules", client.cacheVolume("node_modules"))
      .withMountedCache("/app/build", client.cacheVolume("build-dir"))
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withSecretVariable("CLOUDFLARE_API_TOKEN", secret)
      .withEnvVariable(
        "CLOUDFLARE_ACCOUNT_ID",
        Deno.env.get("CF_ACCOUNT_ID") || accountId || ""
      )
      .withExec([
        "bunx",
        "wrangler",
        "pages",
        "deploy",
        DIRECTORY,
        "--project-name",
        PROJECT_NAME,
      ]);

    const result = await ctr.stdout();

    console.log(result);
  });
  return "done";
}

export type JobExec =
  | ((
      src: string | Directory,
      apiToken: string | Secret,
      accountId: string
    ) => Promise<string>)
  | ((
      src: string | Directory,
      directory: string,
      projectName: string,
      apiToken: string | Secret,
      accountId: string
    ) => Promise<string>);

export const runnableJobs: Record<Job, JobExec> = {
  [Job.deploy]: deploy,
  [Job.pagesDeploy]: pagesDeploy,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.deploy]: "Deploy your Worker to Cloudflare",
  [Job.pagesDeploy]:
    "Deploy a directory of static assets as a Pages deployment.",
};
