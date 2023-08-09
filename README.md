# Cloudflare Pipeline

[![deno module](https://shield.deno.dev/x/cloudflare_pipeline)](https://deno.land/x/cloudflare_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.34)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/cloudflare-pipeline)](https://codecov.io/gh/fluent-ci-templates/cloudflare-pipeline)

A ready-to-use CI/CD Pipeline for deploying your Cloudflare Workers to [Cloudflare](https://cloudflare.com).

## 🚀 Usage

Run the following command:

```bash
dagger run fluentci cloudflare_pipeline
```

## Environment Variables

| Variable      | Description                |
|---------------|----------------------------|
| CF_API_TOKEN  | Your Cloudflare API Token. |
| CF_ACCOUNT_ID | Your Cloudflare Account ID |

## Jobs

| Job     | Description                      |
|---------|----------------------------------|
| deploy  | Deploys your Worker to Cloudflare. |

## Programmatic usage

You can also use this pipeline programmatically:

```typescript
import { Client, connect } from "@dagger.io/dagger";
import { Dagger } from "https://deno.land/x/cloudflare_pipeline/mod.ts";

const { deploy } = Dagger;

function pipeline(src = ".") {
  connect(async (client: Client) => {
    await deploy(client, src);
  });
}

pipeline();

```