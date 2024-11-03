import { gql } from "@apollo/client";

// Query to get logged-in user's info
export const GET_ME = gql`
  query me {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;

// Query to search books using your GraphQL API
export const SEARCH_BOOKS = gql`
  query searchBooks($query: String!) {
    searchBooks(query: $query) {
      bookId
      authors
      title
      description
      image
    }
  }
`;