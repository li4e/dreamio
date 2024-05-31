import { execSync } from 'child_process'
import pg from 'pg'

const connectionString = process.env.POSTGRESS_CONNECTION_URL!

// Function to parse the connection string and extract the base connection string and database name
function parseConnectionString(connectionString: string) {
  const match = connectionString.match(/^(.*\/)([^/]+)$/)
  if (!match) {
    throw new Error('Invalid connection string format')
  }
  return {
    baseConnectionString: match[1],
    dbName: match[2],
  }
}

async function setupTestDb() {
  const { baseConnectionString, dbName } =
    parseConnectionString(connectionString)
  const client = new pg.Client({
    connectionString: baseConnectionString,
  })

  try {
    console.log('Setting up test database...')
    await client.connect()

    // Drop the existing test database if it exists
    await client.query(`DROP DATABASE IF EXISTS ${dbName};`)

    // Create a new test database
    await client.query(`CREATE DATABASE ${dbName};`)

    // Close the connection and connect to the new test database
    await client.end()

    // Apply Prisma migrations to the new test database
    execSync(`npx nx run db:prisma:migrate`, {
      env: {
        ...process.env, // Pass existing environment variables
        DATABASE_URL: `${baseConnectionString}${dbName}`, // Pass the new test database URL
      },
    })

    console.log('Test database setup complete.')
    process.exit(0)
  } catch (error) {
    console.error('Error setting up test database:', error)
    process.exit(1)
  }
}

setupTestDb()
