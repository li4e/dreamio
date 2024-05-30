import { PrismaClient } from '../generated/client'

export * from '../generated/models'

export const dbClient = new PrismaClient()
