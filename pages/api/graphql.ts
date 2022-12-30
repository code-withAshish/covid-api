import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageProductionDefault } from "@apollo/server/plugin/landingPage/default"
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { schema } from "../../graphql/schema"
import { resolvers } from "../../graphql/resolvers"


const server = new ApolloServer({
    resolvers,
    typeDefs: schema,
    introspection: true,
    //@ts-ignore
    plugins: [ApolloServerPluginLandingPageProductionDefault({ embed: true })]
});

export default startServerAndCreateNextHandler(server);