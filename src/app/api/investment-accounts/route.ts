import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stackServerApp } from '@/stack'
import { initializeUserData, getUserInvestmentAccounts, createInvestmentAccount, hasAccountAccess, getUserByStackId } from '@/lib/services/database'

const createInvestmentAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  accountType: z.string().min(1, 'Account type is required'),
  currentValue: z.number().min(0, 'Current value must be positive'),
  currency: z.string().optional(),
  monthlyReturnPercent: z.number().optional(),
  annualReturnPercent: z.number().optional(),
  targetUserId: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await initializeUserData(user.id, user.primaryEmail!, user.displayName || undefined)

    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('targetUserId')

    const investmentAccounts = await getUserInvestmentAccounts(dbUser.id, targetUserId || undefined)

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

    await initializeUserData(user.id, user.primaryEmail!, user.displayName || undefined)

    const body = await request.json()
    const { targetUserId, ...investmentData } = body
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validatedData = createInvestmentAccountSchema.parse(body)

    let targetStackUserId = user.id
    
    // If targetUserId is provided, check if the user has access to that account
    if (targetUserId) {
      const currentUser = await getUserByStackId(user.id)
      if (!currentUser) {
        return NextResponse.json({ error: 'Current user not found' }, { status: 404 })
      }
      
      const targetUser = await getUserByStackId(targetUserId)
      if (!targetUser) {
        return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
      }
      
      const hasAccess = await hasAccountAccess(currentUser.id, targetUser.id)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
      
      targetStackUserId = targetUserId
    }

    const dbUser = await getUserByStackId(targetStackUserId)
    if (!dbUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    const investmentAccount = await createInvestmentAccount({
      ...investmentData,
      userId: dbUser.id
    })

    return NextResponse.json(investmentAccount, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error creating investment account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}