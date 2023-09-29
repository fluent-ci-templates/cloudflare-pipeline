import Client, { connect } from "https://sdk.fluentci.io/v0.1.9/mod.ts";
import { deploy } from "https://pkg.fluentci.io/cloudflare_pipeline@v0.5.3/mod.ts";

function pipeline(src = ".") {
  connect(async (client: Client) => {
    await deploy(client, src);
  });
}

pipeline();
