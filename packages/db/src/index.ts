import { PrismaClient, Prisma as PrismaNative } from '../__generated/client'

export * from '../__generated/models'

export const dbClient = new PrismaClient()

export const Prisma = PrismaNative
