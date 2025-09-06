import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { createTransaction, getUserTransactions, getUserCategories, initializeUserData } from '@/lib/services/database'
import { z } from 'zod'

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  notes: z.string().optional(),
  date: z.string().transform(str => new Date(str)),
  type: z.enum(['EXPENSE', 'INCOME', 'EXPENSE_SAVINGS', 'RETURN']),
  categoryId: z.string().min(1),
  targetUserId: z.string().optional(),
})

export async function POST(request: NextRequest) {
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
    const validatedData = createTransactionSchema.parse(body)
    const { targetUserId, ...transactionData } = validatedData

    // Verify category belongs to target user (or current user if no target)
    const userCategories = await getUserCategories(dbUser.id, targetUserId)
    const categoryExists = userCategories.some(cat => cat.id === validatedData.categoryId)
    
    if (!categoryExists) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Create transaction
    const transaction = await createTransaction({
      ...transactionData,
      userId: dbUser.id
    }, dbUser.id, targetUserId)

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const targetUserId = searchParams.get('targetUserId') || undefined

    // Get user transactions
    const transactions = await getUserTransactions(dbUser.id, limit, targetUserId)

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
