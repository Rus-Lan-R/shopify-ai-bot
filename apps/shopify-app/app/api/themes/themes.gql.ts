export const GET_THEMES = `#graphql
  query getThemes($first: Int, $roles: [ThemeRole!]) {
    themes(first: $first, roles: $roles) {
      nodes {
        id
      }
    }
  }`;
