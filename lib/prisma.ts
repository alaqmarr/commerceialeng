import { PrismaClient } from '../prisma/generated/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

import Database from 'better-sqlite3'

// Prevent multiple PrismaClient instances during hot reloads in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db'
const db = new Database(dbPath)
const adapter = new PrismaBetterSqlite3(db)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  })

// Attach client to globalThis in non-production environments
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
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
