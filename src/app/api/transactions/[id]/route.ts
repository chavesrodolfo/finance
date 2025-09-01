import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { updateTransaction, deleteTransaction, getUserCategories, initializeUserData } from '@/lib/services/database'
import { z } from 'zod'

const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  notes: z.string().optional(),
  date: z.string().transform(str => new Date(str)).optional(),
  type: z.enum(['EXPENSE', 'INCOME', 'EXPENSE_SAVINGS', 'RETURN']).optional(),
  categoryId: z.string().min(1).optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user
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

    // Parse request body
    const body = await request.json()
    const validatedData = updateTransactionSchema.parse(body)

    // Verify category belongs to user if categoryId is being updated
    if (validatedData.categoryId) {
      const userCategories = await getUserCategories(dbUser.id)
      const categoryExists = userCategories.some((cat: any) => cat.id === validatedData.categoryId)
      
      if (!categoryExists) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      }
    }

    // Update transaction
    const transaction = await updateTransaction(params.id, dbUser.id, validatedData)

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user
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

    // Delete transaction
    const success = await deleteTransaction(params.id, dbUser.id)

    if (!success) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
