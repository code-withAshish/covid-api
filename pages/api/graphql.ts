import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { schema } from "../../graphql/schema"
import { resolvers } from "../../graphql/resolvers"


const server = new ApolloServer({
    resolvers,
    typeDefs: schema,
});

export default startServerAndCreateNextHandler(server);