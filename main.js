const DEFAULT_GRAPHQL_URL = "https://api.lagoon.amazeeio.cloud/graphql";
const DEFAULT_SSH_HOST = "ssh.lagoon.amazeeio.cloud";
const DEFAULT_SSH_PORT = 32222;

function readParamsFromEnv(context) {
    const params = {
        graphqlUrl: context.request.getEnvironmentVariable("lagoon_graphql_url") || DEFAULT_GRAPHQL_URL,
        // A manually provided token. If this is provided, there's no need to
        // fetch new tokens, therefore no need to provide the ssh details.
        graphqlToken: context.request.getEnvironmentVariable("lagoon_graphql_token"),
        sshHost: context.request.getEnvironmentVariable("lagoon_ssh_host") || DEFAULT_SSH_HOST,
        sshPort: context.request.getEnvironmentVariable("lagoon_ssh_port") || DEFAULT_SSH_PORT,
        sshPrivateKey: context.request.getEnvironmentVariable("lagoon_ssh_private_key"),
        sshAuthSock: context.request.getEnvironmentVariable("lagoon_ssh_auth_sock"),
    };

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
    token = await fetchTokenFromSsh(params);
    await context.store.setItem(tokenKey, token);
    return token
}

async function fetchTokenFromSsh(params) {
    const { execSync } = require("child_process");
    let cmd = `ssh -o "UserKnownHostsFile=/dev/null" -o "StrictHostKeyChecking=no" -q `;
    if (params.sshPrivateKey) {
        cmd += `-i ${params.sshPrivateKey} `;
    }
    if (params.sshAuthSock) {
        cmd += `-o "IdentityAgent='${params.sshAuthSock}'" `;
    }
    cmd += `lagoon@${params.sshHost} -p ${params.sshPort} token`;
    let token
    try {
        const buf = execSync(cmd);
        token = buf.toString().trim()
    } catch (error) {
        console.error(error);
    }
    return token;
}

function tokenIsValid(token) {
    if (!token || typeof token === 'undefined' || token == 'undefined') {
        return false
    }
    const jwt_decode = require("jwt-decode");
    const decoded = jwt_decode(token);
    const now = Math.floor(Date.now() / 1000)
    return now <= decoded.exp
}
