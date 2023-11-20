import {
  queryType,
  makeSchema,
  dirname,
  join,
  resolve,
  stringArg,
  nonNull,
} from "../../deps.ts";

import { deploy, pagesDeploy } from "./jobs.ts";

const Query = queryType({
  definition(t) {
    t.string("deploy", {
      args: {
        src: stringArg(),
        apiToken: nonNull(stringArg()),
        accountId: nonNull(stringArg()),
      },
      resolve: async (_root, args, _ctx) =>
        await deploy(args.src, args.apiToken, args.accountId),
    });
    t.string("pagesDeploy", {
      args: {
        src: stringArg(),
        directory: stringArg(),
        projectName: nonNull(stringArg()),
        apiToken: nonNull(stringArg()),
        accountId: nonNull(stringArg()),
      },
      resolve: async (_root, args, _ctx) =>
        await pagesDeploy(
          args.src,
          args.directory,
          args.projectName,
          args.apiToken,
          args.accountId
        ),
    });
  },
});

const schema = makeSchema({
  types: [Query],
  outputs: {
    schema: resolve(join(dirname(".."), dirname(".."), "schema.graphql")),
    typegen: resolve(join(dirname(".."), dirname(".."), "gen", "nexus.ts")),
  },
});

schema.description = JSON.stringify({
  "deploy.src": "directory",
  "pagesDeploy.src": "directory",
});

export { schema };
