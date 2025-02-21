const { ApolloServer, gql } = require('apollo-server');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const typeDefs = gql`
  type Item {
    id: Int
    name: String
    manufacturer: String
    amount: Int
  }

  type Query {
    items(limit: Int, offset: Int, search: String): [Item]
  }

  type Mutation {
    createItem(name: String, manufacturer: String, amount: Int): Item
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
    createItem: async (_, { name, manufacturer, amount }) => {
      const existingItem = await prisma.item.findFirst({
        where: {
        name,
        manufacturer
        },
      });

      if (existingItem) {
        return prisma.item.update({
          where: {
          id: existingItem.id,
          name,
          manufacturer
          },
          data: {
            amount: existingItem.amount + amount,
          },
        });
      } else {
        const lastItem = await prisma.item.findFirst({
          orderBy: { id: 'desc' },
        });
        const nextId = lastItem ? lastItem.id + 1 : 1;
        return prisma.item.create({
          data: {
            id: nextId,
            name,
            manufacturer,
            amount,
          },
        });
      }
    },
    deleteItems: async (_, { ids }) => {
      const deleteResult = await prisma.item.deleteMany({
        where: {
          id: { in: ids },
        },
      });

      const items = await prisma.item.findMany({
        orderBy: { id: 'asc' },
      });

      // Reassign IDs
      await Promise.all(
        items.map((item, index) => {
          return prisma.item.update({
            where: { id: item.id },
            data: { id: index + 1 },
          });
        })
      );
      return { count: deleteResult.count };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server is ready at ${url}`);
});
