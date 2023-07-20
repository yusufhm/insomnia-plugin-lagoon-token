# Lagoon token
A plugin for [Insomnia](https://insomnia.rest/) which automatically fetches a token from the Lagoon GraphQL API, in the [manner described in the docs](https://docs.lagoon.sh/using-lagoon-advanced/graphql/#connect-to-graphql-api).

## Install

Either:
- Use this in a browser `insomnia://plugins/install?name=insomnia-plugin-lagoon-token`
- Open Insomnia, Click on the Cog Top Right, Click Plugins and use `insomnia-plugin-lagoon-token` as the Package to install
- Find this plugin on the [Insomnia Plugins list](https://insomnia.rest/plugins/insomnia-plugin-lagoon-token) instead!

In case there's an error when installing as above, go into the [plugins directory](https://docs.insomnia.rest/insomnia/introduction-to-plugins#plugin-file-location) and run `npm install insomnia-plugin-lagoon-token` manually.

## Usage

1. Create an environment and set the Lagoon GraphQL API endpoint:
    ```json
    {
        "lagoon_graphql_url": "https://api.lagoon.amazeeio.cloud/graphql"
    }
    ```

2. If you have already set up your `~/.ssh/id_ed25519` or `~/.ssh/id_rsa` to talk to Lagoon, skip to step 4.

3. Create an Environment using the following template:
    ```json
    {
        "lagoon_graphql_url": "https://api.lagoon.amazeeio.cloud/graphql",
        "lagoon_graphql_token": "[your-token]", # Not required nor recommended.
        "lagoon_ssh_host": "ssh.lagoon.amazeeio.cloud",
        "lagoon_ssh_port": 32222,
        "lagoon_ssh_private_key": "/your/user/home/.ssh/id_ed25519"
    }
    ```

    You can also specify an SSH agent:
    ```json
    {
      "lagoon_ssh_auth_sock": "/your/custom/agent.sock"
    }
    ```

4. Create a request with url `{{ _.lagoon_graphql_url }}` and set the environment created in step 1. Make sure to check **Enabled** in the Bearer tab, but leave the TOKEN empty.

    The plugin will fetch the token (**when `lagoon_graphql_token` is not provided**) and add it as a bearer token to the header. The `Content-Type` header is also set to `application/json` automatically.

5. Profit.

## Configuration

The plugin expects the following variables in the environment:

- lagoon_graphql_url:
  - Description: The GraphQL endpoint for the Lagoon instance.
  - Required: Yes
  - Default[^1]: `https://api.lagoon.amazeeio.cloud/graphql`
- lagoon_graphql_token
  - Description: A manually provided token. If this is provided, tokens won't be fetched nor renewed, and it overrides the SSH options.
  - Required: No
  - Default: -
  - Note: *We highly recommend **not using this option** as the token will either be short-lived and you will have to manually update it yourself when it expires, or long-lived for a service account, which might pose a security risk. Use the SSH options instead (which is the default).*
- lagoon_ssh_host
  - Description: The Lagoon SSH host for fetching the token.
  - Required: No
  - Default[^1]: `ssh.lagoon.amazeeio.cloud`
- lagoon_ssh_port
  - Description: The Lagoon SSH port.
  - Required: No
  - Default[^1]: `32222`
- lagoon_ssh_private_key
  - Description: The private key to use for SSH; this should have already been added to your user in the Lagoon UI[^2].
  - Required: No
  - Default: -
- lagoon_ssh_auth_sock
  - Description: The SSH agent socket to use (overriding $SSH_AUTH_SOCK).
  - Required: No
  - Default: -

[^1]: Defaults are taken from the [Lagoon GraphQL documentation](https://docs.lagoon.sh/using-lagoon-advanced/graphql/).
[^2]: Adding an SSH key to your Lagoon user: https://docs.lagoon.sh/using-lagoon-advanced/ssh/


