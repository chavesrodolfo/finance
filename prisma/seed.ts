import { PrismaClient } from '@prisma/client'
import { DEFAULT_CATEGORIES, DEFAULT_DESCRIPTIONS } from '../src/lib/constants'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')
  
  // Clean up existing data (since we want real data, not mock data)
  console.log('🧹 Cleaning up existing data...')
  await prisma.transaction.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('✅ Database is now clean and ready for real data!')
  console.log('ℹ️  Default categories and descriptions are available for new users.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
