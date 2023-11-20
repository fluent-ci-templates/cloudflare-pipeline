import { gql } from "../../deps.ts";

export const deploy = gql`
  query deploy($src: String, $apiToken: String!, $accountId: String!) {
    deploy(src: $src, apiToken: $apiToken, accountId: $accountId)
  }
`;

export const pagesDeploy = gql`
  query pagesDeploy(
    $src: String
    $directory: String
    $projectName: String!
    $apiToken: String!
    $accountId: String!
  ) {
    pagesDeploy(
      src: $src
      directory: $directory
      projectName: $projectName
      apiToken: $apiToken
      accountId: $accountId
    )
  }
`;
