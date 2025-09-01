import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stackServerApp } from '@/stack'
import { initializeUserData, getUserInvestmentAccounts, createInvestmentAccount } from '@/lib/services/database'

const createInvestmentAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  accountType: z.string().min(1, 'Account type is required'),
  currentValue: z.number().min(0, 'Current value must be positive'),
  currency: z.string().optional(),
  monthlyReturnPercent: z.number().optional(),
  annualReturnPercent: z.number().optional()
})

export async function GET() {
  try {
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await initializeUserData(user.id, user.primaryEmail!, user.displayName!)
    const investmentAccounts = await getUserInvestmentAccounts(dbUser.id)

    return NextResponse.json(investmentAccounts)
  } catch (error) {
    console.error('Error fetching investment accounts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createInvestmentAccountSchema.parse(body)

    const dbUser = await initializeUserData(user.id, user.primaryEmail!, user.displayName!)

    const investmentAccount = await createInvestmentAccount({
      ...validatedData,
      userId: dbUser.id
    })

    return NextResponse.json(investmentAccount, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating investment account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}