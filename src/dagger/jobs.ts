/**
 * @module cloudflare
 * @description Deploy applications to Cloudflare Workers and Pages
 */

import { Directory, Secret, dag, exit, env } from "../../deps.ts";
import { getDirectory, getApiToken } from "./lib.ts";

export enum Job {
  deploy = "deploy",
  pagesDeploy = "pages-deploy",
}

export const exclude = [".git", ".devbox", "node_modules", ".fluentci"];

/**
 * Deploy your Worker to Cloudflare
 *
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
  const context = await getDirectory(src);
  const secret = await getApiToken(apiToken);
  if (!secret) {
    console.error("CF_API_TOKEN environment variable is required");
    exit(1);
    return "";
  }
  const ctr = dag
    .pipeline(Job.deploy)
    .container()
    .from("pkgxdev/pkgx:latest")
    .withExec(["apt-get", "update"])
    .withExec(["apt-get", "install", "-y", "ca-certificates"])
    .withExec(["pkgx", "install", "node", "bun", "classic.yarnpkg.com"])
    .withMountedCache("/root/.bun/install/cache", dag.cacheVolume("bun-cache"))
    .withMountedCache("/app/node_modules", dag.cacheVolume("node_modules"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withSecretVariable("CLOUDFLARE_API_TOKEN", secret)
    .withEnvVariable(
      "CLOUDFLARE_ACCOUNT_ID",
      env.get("CF_ACCOUNT_ID") || accountId || ""
    )
    .withExec(["yarn", "install"])
    .withExec(["bunx", "wrangler", "deploy"]);

  const result = await ctr.stdout();
  return result;
}

/**
 * Deploy a directory of static assets as a Pages deployment
 *
 * @function
 * @description Deploy a directory of static assets as a Pages deployment.
 * @param {string} src
 * @param {string} apiToken
 * @param {string} accountId
 * @param {string} directory
 * @param {string} projectName
 * @returns {string}
 */
export async function pagesDeploy(
  src: string | Directory,
  apiToken: string | Secret,
  accountId: string,
  directory: string,
  projectName: string
): Promise<string> {
  const DIRECTORY = env.get("DIRECTORY") || directory || ".";
  const PROJECT_NAME = env.get("PROJECT_NAME") || projectName;

  if (!PROJECT_NAME) {
    throw new Error("PROJECT_NAME environment variable is required");
  }

  const context = await getDirectory(src);
  const secret = await getApiToken(apiToken);
  if (!secret) {
    console.error("CF_API_TOKEN environment variable is required");
    exit(1);
    return "";
  }
  const ctr = dag
    .pipeline(Job.pagesDeploy)
    .container()
    .from("pkgxdev/pkgx:latest")
    .withExec(["apt-get", "update"])
    .withExec(["apt-get", "install", "-y", "ca-certificates"])
    .withExec(["pkgx", "install", "node", "bun", "classic.yarnpkg.com"])
    .withMountedCache("/root/.bun/install/cache", dag.cacheVolume("bun-cache"))
    .withMountedCache("/app/node_modules", dag.cacheVolume("node_modules"))
    .withMountedCache("/app/build", dag.cacheVolume("build-dir"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withSecretVariable("CLOUDFLARE_API_TOKEN", secret)
    .withEnvVariable(
      "CLOUDFLARE_ACCOUNT_ID",
      env.get("CF_ACCOUNT_ID") || accountId || ""
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
  return result;
}

export type JobExec =
  | ((
      src: string | Directory,
      apiToken: string | Secret,
      accountId: string
    ) => Promise<string>)
  | ((
      src: string | Directory,
      apiToken: string | Secret,
      accountId: string,
      directory: string,
      projectName: string
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
