# Lagoon token
A plugin for Insomnia which automatically fetches a token from the Lagoon GraphQL API, in the [manner described in the docs](https://docs.lagoon.sh/using-lagoon-advanced/graphql/#connect-to-graphql-api).

## Install

Either:
- Use this in a browser `insomnia://plugins/install?name=insomnia-plugin-lagoon-token`
- Open Insomnia, Click on the Cog Top Right, Click Plugins and use `insomnia-plugin-lagoon-token` as the Package to install
- Find this plugin on the [Insomnia Plugins list](https://insomnia.rest/plugins/insomnia-plugin-lagoon-token) instead!

## Configuration

The plugin expects the following variables in an environment:
| Name                   | Required | Default[^1]                                                        | Description                                                                                                                        |
| ---------------------- | :------: | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| lagoon_graphql_url     |    No    | `https://api.lagoon.amazeeio.cloud/graphql`                        | The GraphQL endpoint for the Lagoon instance.                                                                                      |
| lagoon_graphql_token   |    No    | -                                                                  | A manually provided token. If this is provided, there's no need to fetch new tokens, therefore no need to provide the ssh details. |
| lagoon_ssh_host        |    No    | `ssh.lagoon.amazeeio.cloud`                                        | The Lagoon SSH host for fetching the token.                                                                                        |
| lagoon_ssh_port        |    No    | 32222                                                              | The Lagoon SSH port.                                                                                                               |
| lagoon_ssh_private_key |    No    | `/your/user/home/.ssh/id_ed25519` or `/your/user/home/.ssh/id_rsa` | The private key to use for SSH; this should have already been added to your user in the Lagoon UI[^2].                             |

[^1]: Defaults are taken from the [Lagoon GraphQL documentation](https://docs.lagoon.sh/using-lagoon-advanced/graphql/).
[^2]: Added an SSH key to your Lagoon user: https://docs.lagoon.sh/using-lagoon-advanced/ssh/

### After installing the plugin

1. If you're connecting to the Lagoon public cloud and you have already set up your `~/.ssh/id_ed25519` or `~/.ssh/id_rsa` to talk to Lagoon, you should only have to enable the plugin, then you can start creating requests against `https://api.lagoon.amazeeio.cloud/graphql` and it should just work.

2. Create an Environment using the following template:
    ```json
    {
        "lagoon_graphql_url": "https://api.lagoon.amazeeio.cloud/graphql",
        "lagoon_graphql_token": "[your-token]", # Not required nor recommended.
        "lagoon_ssh_host": "ssh.lagoon.amazeeio.cloud",
        "lagoon_ssh_port": 32222,
        "lagoon_ssh_private_key": "/your/user/home/.ssh/id_ed25519"
    }
    ```

The plugin will now fetch the token (when `lagoon_graphql_token` is not provided) and adds it as a bearer token to the header. The `Content-Type` header is also set to `application/json` automatically.
