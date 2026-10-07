import { PrismaClient } from '../prisma/generated/client'

const prisma = new PrismaClient()

async function verifyDatabase() {
  console.log('🔍 [DB Verification] Inspecting SQLite WAL and Table Integrity...')

  // Query SQLite journal mode
  const journalResult = await prisma.$queryRawUnsafe<Array<{ journal_mode: string }>>(
    'PRAGMA journal_mode;'
  )
  const currentJournalMode = journalResult[0]?.journal_mode?.toLowerCase()
  console.log(`📊 PRAGMA journal_mode: ${currentJournalMode}`)

  if (currentJournalMode !== 'wal') {
    console.warn(`⚠️ Warning: journal_mode is "${currentJournalMode}", enforcing WAL now...`)
    await prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
    const recheck = await prisma.$queryRawUnsafe<Array<{ journal_mode: string }>>(
      'PRAGMA journal_mode;'
    )
    console.log(`📊 Re-verified journal_mode: ${recheck[0]?.journal_mode}`)
  }

  // Check busy timeout
  const timeoutResult = await prisma.$queryRawUnsafe<Array<{ timeout: number }>>(
    'PRAGMA busy_timeout;'
  )
  console.log(`⏱️  PRAGMA busy_timeout: ${timeoutResult[0]?.timeout ?? 'default'} ms`)

  // Inspect entity counts
  const [
    adminCount,
    categoryCount,
    useCaseCount,
    productCount,
    productUseCaseCount,
    heroCount,
    settingsCount,
    enquiryCount,
  ] = await Promise.all([
    prisma.adminUser.count(),
    prisma.category.count(),
    prisma.useCase.count(),
    prisma.product.count(),
    prisma.productUseCase.count(),
    prisma.heroImage.count(),
    prisma.setting.count(),
    prisma.enquiry.count(),
  ])

  console.log('----------------------------------------------------')
  console.log(`👤 Admin Users:        ${adminCount} (Should be 0 prior to /setup)`)
  console.log(`📁 Categories:         ${categoryCount}`)
  console.log(`🏭 Use Cases:          ${useCaseCount}`)
  console.log(`📦 Products:           ${productCount}`)
  console.log(`🔗 Product-UseCases:   ${productUseCaseCount}`)
  console.log(`🖼️  Hero Images:        ${heroCount}`)
  console.log(`⚙️  Settings:           ${settingsCount}`)
  console.log(`📬 Enquiries:          ${enquiryCount}`)
  console.log('----------------------------------------------------')

  const finalCheck = await prisma.$queryRawUnsafe<Array<{ journal_mode: string }>>(
    'PRAGMA journal_mode;'
  )
  if (finalCheck[0]?.journal_mode?.toLowerCase() !== 'wal') {
    throw new Error(`Database is not in WAL mode: ${finalCheck[0]?.journal_mode}`)
  }

  console.log('✅ SQLite Database WAL and Model Integrity Verified!')
}

verifyDatabase()
  .catch((err) => {
    console.error('❌ Verification failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
