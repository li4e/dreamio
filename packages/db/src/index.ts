import { PrismaClient, Prisma as PrismaNative } from '../generated/client'

export * from '../generated/models'

export const dbClient = new PrismaClient()

export const Prisma = PrismaNative
