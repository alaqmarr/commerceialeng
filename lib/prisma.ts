import { PrismaClient } from '../prisma/generated/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Prevent multiple PrismaClient instances during hot reloads in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  isNormalized?: boolean
}

const dbPath = process.env.DATABASE_URL || 'file:./dev.db'

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaLibSql({ url: dbPath }),
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  })

// Attach client to globalThis in non-production environments
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export const TIMESTAMP_NORMALIZATION_STATEMENTS = [
  `UPDATE "enquiries" SET "createdAt" = strftime('%Y-%m-%dT%H:%M:%fZ', "createdAt" / 1000.0, 'unixepoch') WHERE typeof("createdAt") = 'integer';`,
  `UPDATE "enquiries" SET "updatedAt" = strftime('%Y-%m-%dT%H:%M:%fZ', "updatedAt" / 1000.0, 'unixepoch') WHERE typeof("updatedAt") = 'integer';`,
  `UPDATE "categories" SET "createdAt" = strftime('%Y-%m-%dT%H:%M:%fZ', "createdAt" / 1000.0, 'unixepoch') WHERE typeof("createdAt") = 'integer';`,
  `UPDATE "categories" SET "updatedAt" = strftime('%Y-%m-%dT%H:%M:%fZ', "updatedAt" / 1000.0, 'unixepoch') WHERE typeof("updatedAt") = 'integer';`,
  `UPDATE "use_cases" SET "createdAt" = strftime('%Y-%m-%dT%H:%M:%fZ', "createdAt" / 1000.0, 'unixepoch') WHERE typeof("createdAt") = 'integer';`,
  `UPDATE "use_cases" SET "updatedAt" = strftime('%Y-%m-%dT%H:%M:%fZ', "updatedAt" / 1000.0, 'unixepoch') WHERE typeof("updatedAt") = 'integer';`,
  `UPDATE "products" SET "createdAt" = strftime('%Y-%m-%dT%H:%M:%fZ', "createdAt" / 1000.0, 'unixepoch') WHERE typeof("createdAt") = 'integer';`,
  `UPDATE "products" SET "updatedAt" = strftime('%Y-%m-%dT%H:%M:%fZ', "updatedAt" / 1000.0, 'unixepoch') WHERE typeof("updatedAt") = 'integer';`,
  `UPDATE "hero_images" SET "createdAt" = strftime('%Y-%m-%dT%H:%M:%fZ', "createdAt" / 1000.0, 'unixepoch') WHERE typeof("createdAt") = 'integer';`,
  `UPDATE "hero_images" SET "updatedAt" = strftime('%Y-%m-%dT%H:%M:%fZ', "updatedAt" / 1000.0, 'unixepoch') WHERE typeof("updatedAt") = 'integer';`,
  `UPDATE "settings" SET "updatedAt" = strftime('%Y-%m-%dT%H:%M:%fZ', "updatedAt" / 1000.0, 'unixepoch') WHERE typeof("updatedAt") = 'integer';`,
  `UPDATE "admin_users" SET "createdAt" = strftime('%Y-%m-%dT%H:%M:%fZ', "createdAt" / 1000.0, 'unixepoch') WHERE typeof("createdAt") = 'integer';`,
  `UPDATE "admin_users" SET "updatedAt" = strftime('%Y-%m-%dT%H:%M:%fZ', "updatedAt" / 1000.0, 'unixepoch') WHERE typeof("updatedAt") = 'integer';`,
]

export const normalizeSqliteTimestamps = async (client: PrismaClient = prisma): Promise<number> => {
  if (globalForPrisma.isNormalized) return 0
  let totalAffected = 0
  try {
    for (const sql of TIMESTAMP_NORMALIZATION_STATEMENTS) {
      const affected = await client.$executeRawUnsafe(sql)
      totalAffected += affected
    }
    globalForPrisma.isNormalized = true
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Prisma SQLite] Notice: Timestamp normalization deferred:', error)
    }
  }
  return totalAffected
}

// Enforce SQLite WAL mode and concurrency pragmas on startup
const configureSqlitePragmas = async () => {
  try {
    // 1. Enable Write-Ahead Logging (WAL) mode for concurrency
    await prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
    // 2. Set busy timeout to 5000ms to avoid instant SQLITE_BUSY errors
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 5000;')
    // 3. Set synchronous mode to NORMAL for high-throughput ACID compliance
    await prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;')
    // 4. Ensure foreign key constraints and cascades are enforced
    await prisma.$queryRawUnsafe('PRAGMA foreign_keys = ON;')
    // 5. Normalize integer timestamps to ISO-8601 strings
    await normalizeSqliteTimestamps(prisma)
  } catch (error) {
    // Gracefully warn during build-time schema generation or if DB file is being provisioned
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Prisma SQLite] Notice: PRAGMA initialization deferred:', error)
    }
  }
}

// Execute configuration asynchronously
configureSqlitePragmas()

export default prisma
