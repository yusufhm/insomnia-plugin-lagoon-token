const HOME = require('os').homedir();

const DEFAULT_GRAPHQL_URL = "https://api.lagoon.amazeeio.cloud/graphql";
const DEFAULT_SSH_HOST = "ssh.lagoon.amazeeio.cloud";
const DEFAULT_SSH_PORT = 32222;
const DEFAULT_SSH_PRIVATE_KEYS = [
    `${HOME}/.ssh/id_ed25519`,
    `${HOME}/.ssh/id_rsa`,
];

function readParamsFromEnv(context) {
    const fs = require('fs')

    const params = {
        graphqlUrl: context.request.getEnvironmentVariable("lagoon_graphql_url") || DEFAULT_GRAPHQL_URL,
        // A manually provided token. If this is provided, there's no need to
        // fetch new tokens, therefore no need to provide the ssh details.
        graphqlToken: context.request.getEnvironmentVariable("lagoon_graphql_token"),
        sshHost: context.request.getEnvironmentVariable("lagoon_ssh_host") || DEFAULT_SSH_HOST,
        sshPort: context.request.getEnvironmentVariable("lagoon_ssh_port") || DEFAULT_SSH_PORT,
        sshPrivateKey: context.request.getEnvironmentVariable("lagoon_ssh_private_key"),
        sshPassphrase: context.request.getEnvironmentVariable('lagoon_ssh_passphrase'),
    };

    // Use the first-found default key.
    if (!params.graphqlToken && !params.sshPrivateKey) {
        for (const key of DEFAULT_SSH_PRIVATE_KEYS) {
            if (!fs.existsSync(key)) {
                continue;
            }
            params.sshPrivateKey = key;
            break;
        }
    }
    return params;
}

/**
 * Request hook that fetches a Lagoon token and adds it to the request header.
 */
module.exports.requestHooks = [
    async context => {
        lagoonGraphqlUrl = context.request.getEnvironmentVariable("lagoon_graphql_url");
        if (lagoonGraphqlUrl == null) {
            return;
        }
        params = readParamsFromEnv(context);
        if (!context.request.getUrl() == params.graphqlUrl) {
            return;
        }
        context.request.setAuthenticationParameter("token", await getToken(context));
        context.request.setHeader('Content-Type', 'application/json');
    }
];

async function getToken(context) {
    const hash = require('object-hash');
    const params = readParamsFromEnv(context);
    const tokenKey = `${hash(params)}-token`;

    let token;

    if (await context.store.hasItem(tokenKey)) {
        token = await context.store.getItem(tokenKey)
        if (tokenIsValid(token)) {
            console.log("Token is still valid, will use.")
            return token
        }
    }

    // No need to fetch new token if one provided.
    if (params.graphqlToken) {
        return params.graphqlToken;
    }

    console.log("Fetching new token.")
    token = await fetchTokenFromSsh(params.sshPrivateKey, params.sshHost, params.sshPort, params.sshPassphrase);
    await context.store.setItem(tokenKey, token);
    return token
}

async function fetchTokenFromSsh(privateKey, host, port, passphrase) {
    const {NodeSSH} = require('node-ssh')
    const ssh = new NodeSSH()
    await ssh.connect({
        username: 'lagoon',
        privateKey,
        host,
        port,
        passphrase,
    })
    return await ssh.exec("token", []);
}

function tokenIsValid(token) {
    const jwt_decode = require("jwt-decode");
    const decoded = jwt_decode(token);
    const now = Math.floor(Date.now() / 1000)
    return now <= decoded.exp
}
