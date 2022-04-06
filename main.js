// For help writing plugins, visit the documentation to get started:
/**
 * Example template tag that generates a random number
 * between a user-provided MIN and MAX
 */
module.exports.templateTags = [{
    name: 'lagoonToken',
    displayName: 'Lagoon Token',
    description: 'Fetches a token from Lagoon using the SSH key provided.',
    async run (context) {
        return "foo";
    }
}];
