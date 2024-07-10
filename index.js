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
    items(limit: Int, offset: Int, search: String): [Item]
  }

  type Mutation {
    createItem(name: String, manufacturer: String): Item
    deleteItems(ids: [Int!]!): BatchPayload
  }

  type BatchPayload {
    count: Int!
  }
`;

const resolvers = {
  Query: {
    items: async (_, { limit, offset, search }) => {
      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { manufacturer: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {};

      return await prisma.item.findMany({
        where,
        take: limit,
        skip: offset,
      });
    },
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
    deleteItems: async (_, { ids }) => {
      const deleteResult = await prisma.item.deleteMany({
        where: {
          id: { in: ids },
        },
      });
      return { count: deleteResult.count };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server is ready at ${url}`);
});
