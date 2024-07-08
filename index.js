const { ApolloServer, gql } = require('apollo-server');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const typeDefs = gql`
  type Item {
    id: Int
    name: String
    manufacturer: String
  }

  type Query {
    items: [Item]
  }

  type Mutation {
    createItem(name: String, manufacturer: String): Item
  }
`;

const resolvers = {
  Query: {
    items: async () => await prisma.item.findMany(),
  },
  Mutation: {
    createItem: async (_, { name, manufacturer }) => {
      return await prisma.item.create({
        data: {
          name,
          manufacturer,
        },
      });
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server is ready at ${url}`);
});
