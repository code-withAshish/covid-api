import gql from "graphql-tag";

export const schema = gql`
  type ApiData {
    state: String!
    confirmed: Int!
    active: Int!
    discharged: Int!
    deaths: Int!
  }

  type Query {
    getAll: [ApiData!]
    getByState(state: String!): ApiData
  }
`;
