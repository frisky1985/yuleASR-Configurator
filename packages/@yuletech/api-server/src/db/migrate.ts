import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { config } from '../config.js'

const migrationClient = postgres(config.databaseUrl, { max: 1 })
const migrationDb = drizzle(migrationClient)

console.log('⏳ Running migrations...')
await migrate(migrationDb, { migrationsFolder: './src/db/migrations' })
console.log('✅ Migrations complete')

await migrationClient.end()
