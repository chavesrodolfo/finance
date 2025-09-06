import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { initializeUserData, isSubaccount } from '@/lib/services/database'
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

    // Check if user is trying to delete data for a different account
    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type')
    const targetUserId = searchParams.get('targetUserId')

    let effectiveUserId = dbUser.id
    
    if (targetUserId && targetUserId !== dbUser.id) {
      // Check if user is a subaccount of the target account
      const isUserSubaccount = await isSubaccount(dbUser.id, targetUserId)
      if (isUserSubaccount) {
        return NextResponse.json({ error: 'Subaccounts cannot delete user data' }, { status: 403 })
      }
      effectiveUserId = targetUserId
    }

    if (!dataType) {
      return NextResponse.json({ error: 'Data type is required' }, { status: 400 })
    }

    let deletedCount = 0

    switch (dataType) {
      case 'transactions':
        const transactionResult = await prisma.transaction.deleteMany({
          where: { userId: effectiveUserId }
        })
        deletedCount = transactionResult.count
        break

      case 'categories':
        // First delete all transactions that reference these categories
        await prisma.transaction.deleteMany({
          where: { 
            category: {
              userId: effectiveUserId
            }
          }
        })
        // Then delete categories
        const categoryResult = await prisma.category.deleteMany({
          where: { userId: effectiveUserId }
        })
        deletedCount = categoryResult.count
        break

      case 'budgets':
        const budgetResult = await prisma.budget.deleteMany({
          where: { userId: effectiveUserId }
        })
        deletedCount = budgetResult.count
        break

      case 'descriptions':
        const descriptionResult = await prisma.description.deleteMany({
          where: { userId: effectiveUserId }
        })
        deletedCount = descriptionResult.count
        break

      case 'investment-accounts':
        const investmentAccountResult = await prisma.investmentAccount.deleteMany({
          where: { userId: effectiveUserId }
        })
        deletedCount = investmentAccountResult.count
        break

      case 'all':
        // Delete in order to avoid foreign key constraints
        await prisma.transaction.deleteMany({
          where: { userId: effectiveUserId }
        })
        await prisma.budget.deleteMany({
          where: { userId: effectiveUserId }
        })
        await prisma.category.deleteMany({
          where: { userId: effectiveUserId }
        })
        await prisma.description.deleteMany({
          where: { userId: effectiveUserId }
        })
        await prisma.investmentAccount.deleteMany({
          where: { userId: effectiveUserId }
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
