/**
 * Template tag that fetches a Lagoon token.
 */

const homedir = require('os').homedir();

module.exports.templateTags = [{
    name: 'lagoonToken',
    displayName: 'Lagoon Token',
    description: 'Fetches a token from Lagoon using the SSH key provided.',
    args: [
        {
            displayName: 'Private key',
            description: 'Path to the private ssh key',
            type: 'string',
            defaultValue: `${homedir}/.ssh/id_ed25519`
        },
        {
            displayName: 'Host',
            description: 'The Lagoon SSH hostname',
            type: 'string',
            defaultValue: 'ssh.lagoon.amazeeio.cloud'
        },
        {
            displayName: 'Port',
            description: 'The Lagoon SSH port',
            type: 'number',
            defaultValue: 30831
        },
    ],
    async run (context, keyPath, host, port) {
        return getToken(context, keyPath, host, port);
    }
}];

async function getToken(context, privateKeyPath, host, port) {
    if (await context.store.hasItem("token")) {
        token = await context.store.getItem("token")
        if (tokenIsValid(token)) {
            console.log("Token is still valid, will use.")
            return token
        }
    }
    console.log("Fetching new token.")

    token = fetchTokenFromSsh(privateKeyPath, host, port);
    await context.store.setItem("token", token);

    return token
}

async function fetchTokenFromSsh(privateKeyPath, host, port) {
    const {NodeSSH} = require('node-ssh')
    const ssh = new NodeSSH()
    await ssh.connect({
        host: host,
        port: port,
        username: 'lagoon',
        privateKey: privateKeyPath,
    })
    return await ssh.exec("token", []);
}

function tokenIsValid(token) {
    const jwt_decode = require("jwt-decode");
    const decoded = jwt_decode(token);
    const now = Math.floor(Date.now() / 1000)
    return now <= decoded.exp
}
