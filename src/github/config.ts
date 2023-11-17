import { JobSpec, Workflow } from "fluent_github_actions";

export function generateYaml(): Workflow {
  const workflow = new Workflow("Deploy");

  const push = {
    branches: ["main"],
  };

  const deploy: JobSpec = {
    "runs-on": "ubuntu-latest",
    steps: [
      {
        uses: "actions/checkout@v2",
      },
      {
        name: "Setup Fluent CI",
        uses: "fluentci-io/setup-fluentci@v2",
      },
      {
        name: "Run Dagger Pipelines",
        run: "fluentci run cloudflare_pipeline",
        env: {
          CF_API_TOKEN: "${{ secrets.CF_API_TOKEN }}",
          CF_ACCOUNT_ID: "${{ secrets.CF_ACCOUNT_ID }}",
        },
      },
    ],
  };

  workflow.on({ push }).jobs({ deploy });

  return workflow;
}
