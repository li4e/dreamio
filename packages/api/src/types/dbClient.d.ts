import { dbClient } from '@choco/db'

type DBClient = typeof dbClient

export type DbClientTransaction = Omit<
  DBClient<DBClient.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>
