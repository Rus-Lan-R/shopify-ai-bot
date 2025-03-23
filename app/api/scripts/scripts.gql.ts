export const GET_SCRIPT_TAGS = `#graphql
    query getScriptTags($src: URL) {
        scriptTags(first: 1, src: $src) {
            nodes {
                id
                createdAt
                src
            }
        }
    }
`;

export const CREATE_SCRIPT = `#graphql
    mutation scriptTagCreate($input: ScriptTagInput!) {
        scriptTagCreate(input: $input) {
        scriptTag {
            id
            src
            displayScope
        }
        userErrors {
            field
            message
        }
    }
}`;
