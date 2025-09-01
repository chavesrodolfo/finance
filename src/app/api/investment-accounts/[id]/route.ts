import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stackServerApp } from '@/stack'
import { initializeUserData, updateInvestmentAccount, deleteInvestmentAccount } from '@/lib/services/database'

const updateInvestmentAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  accountType: z.string().min(1, 'Account type is required').optional(),
  currentValue: z.number().min(0, 'Current value must be positive').optional(),
  currency: z.string().optional(),
  monthlyReturnPercent: z.number().optional(),
  annualReturnPercent: z.number().optional()
})

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateInvestmentAccountSchema.parse(body)

    const dbUser = await initializeUserData(user.id, user.primaryEmail!, user.displayName!)

    const updatedAccount = await updateInvestmentAccount(params.id, dbUser.id, validatedData)

    if (!updatedAccount) {
      return NextResponse.json({ error: 'Investment account not found' }, { status: 404 })
    }

    return NextResponse.json(updatedAccount)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating investment account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await initializeUserData(user.id, user.primaryEmail!, user.displayName!)

    const deleted = await deleteInvestmentAccount(params.id, dbUser.id)

    if (!deleted) {
      return NextResponse.json({ error: 'Investment account not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting investment account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}