import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { initializeUserData } from '@/lib/services/database'
import { prisma } from '@/lib/db'

export async function DELETE(request: NextRequest) {
  try {
    const stackUser = await stackServerApp.getUser()
    
    if (!stackUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize/get user in database
    const dbUser = await initializeUserData(
      stackUser.id,
      stackUser.primaryEmail || '',
      stackUser.displayName || undefined
    )

    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type')

    if (!dataType) {
      return NextResponse.json({ error: 'Data type is required' }, { status: 400 })
    }

    let deletedCount = 0

    switch (dataType) {
      case 'transactions':
        const transactionResult = await prisma.transaction.deleteMany({
          where: { userId: dbUser.id }
        })
        deletedCount = transactionResult.count
        break

      case 'categories':
        // First delete all transactions that reference these categories
        await prisma.transaction.deleteMany({
          where: { 
            category: {
              userId: dbUser.id
            }
          }
        })
        // Then delete categories
        const categoryResult = await prisma.category.deleteMany({
          where: { userId: dbUser.id }
        })
        deletedCount = categoryResult.count
        break

      case 'budgets':
        const budgetResult = await prisma.budget.deleteMany({
          where: { userId: dbUser.id }
        })
        deletedCount = budgetResult.count
        break

      case 'descriptions':
        const descriptionResult = await prisma.description.deleteMany({
          where: { userId: dbUser.id }
        })
        deletedCount = descriptionResult.count
        break

      case 'all':
        // Delete in order to avoid foreign key constraints
        await prisma.transaction.deleteMany({
          where: { userId: dbUser.id }
        })
        await prisma.budget.deleteMany({
          where: { userId: dbUser.id }
        })
        await prisma.category.deleteMany({
          where: { userId: dbUser.id }
        })
        await prisma.description.deleteMany({
          where: { userId: dbUser.id }
        })
        // Don't delete the user record itself, just their data
        deletedCount = 1 // Indicate success
        break

      default:
        return NextResponse.json({ error: 'Invalid data type' }, { status: 400 })
    }

    return NextResponse.json({ 
      message: `Successfully deleted ${dataType} data`,
      deletedCount 
    })

  } catch (error) {
    console.error('Error deleting user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
