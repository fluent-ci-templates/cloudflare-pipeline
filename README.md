# Cloudflare Pipeline

[![fluentci pipeline](https://img.shields.io/badge/dynamic/json?label=pkg.fluentci.io&labelColor=%23000&color=%23460cf1&url=https%3A%2F%2Fapi.fluentci.io%2Fv1%2Fpipeline%2Fcloudflare_pipeline&query=%24.version)](https://pkg.fluentci.io/cloudflare_pipeline)
[![deno module](https://shield.deno.dev/x/cloudflare_pipeline)](https://deno.land/x/cloudflare_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.34)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/cloudflare-pipeline)](https://codecov.io/gh/fluent-ci-templates/cloudflare-pipeline)
[![dagger-min-version](https://img.shields.io/badge/dagger-v0.10.0-blue?color=3D66FF&labelColor=000000)](https://dagger.io)

A ready-to-use CI/CD Pipeline for deploying your Cloudflare Workers to [Cloudflare](https://cloudflare.com).

## 🚀 Usage

Run the following command:

```bash
fluentci run cloudflare_pipeline
```

## Dagger Module

Use as a [Dagger](https://dagger.io) Module:

```bash
dagger install github.com/fluent-ci-templates/cloudflare-pipeline@main
```

Call functions from the module:

```bash
# Deploy to Cloudflare Workers
dagger call deploy --src . \
  --api-token CF_API_TOKEN \
  --account-id $CF_ACCOUNT_ID \
  --project-name $PROJECT_NAME

# Deploy to Cloudflare Pages
dagger call pages-deploy --src . \
  --api-token CF_API_TOKEN \
  --account-id $CF_ACCOUNT_ID \
  --directory dist \
  --project-name $PROJECT_NAME
```

## Environment Variables

| Variable      | Description                                                  |
|---------------|--------------------------------------------------------------|
| CF_API_TOKEN  | Your Cloudflare API Token.                                   |
| CF_ACCOUNT_ID | Your Cloudflare Account ID.                                  |
| DIRECTORY     | The directory to deploy to Cloudflare Pages. Defaults to `.` |
| PROJECT_NAME  | The name of your project.                                    |

## Jobs

| Job         | Description                                                |
|-------------|------------------------------------------------------------|
| deploy      | Deploys your Worker to Cloudflare.                         |
| pagesDeploy | Deploy a directory of static assets as a Pages deployment. |

```typescript
pagesDeploy(
  src: string | Directory,
  apiToken: string | Secret,
  accountId: string,
  directory: string,
  projectName: string,
): Promise<string>

deploy(
  src: string | Directory,
  apiToken: string | Secret,
  accountId: string
): Promise<string>
```

## Programmatic usage

You can also use this pipeline programmatically:

```typescript
import { deploy } from "https://pkg.fluentci.io/cloudflare_pipeline@v0.7.5/mod.ts";

await deploy(
  ".", 
  Deno.env.get("CF_API_TOKEN")!, 
  Deno.env.get("CF_ACCOUNT_ID")!
);
```
