import { dbClient } from '@choco/db'

const clearQuery = `
-- Generate the TRUNCATE TABLE statements for each table
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Disable triggers to avoid errors during truncation
    EXECUTE 'SET session_replication_role = replica;';

    -- Loop through each table in the schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE;';
    END LOOP;

    -- Enable triggers back
    EXECUTE 'SET session_replication_role = DEFAULT;';
END $$;`

export async function clearDB() {
  await dbClient.$queryRawUnsafe(clearQuery)
}

export async function prepareDB() {
  await dbClient.$connect()
  await clearDB()
}
