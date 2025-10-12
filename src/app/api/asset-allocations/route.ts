import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stackServerApp } from '@/stack'
import { initializeUserData, getUserAssetAllocations, createAssetAllocation, getUserByStackId, hasAccountAccess } from '@/lib/services/database'

const createAssetAllocationSchema = z.object({
  assetName: z.string().min(1, 'Asset name is required'),
  idealAllocationPercent: z.number().min(0).max(100, 'Ideal allocation must be between 0 and 100'),
  currentAllocationAmount: z.number().min(0, 'Current allocation amount must be positive'),
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

    const assetAllocations = await getUserAssetAllocations(dbUser.id, targetUserId || undefined)

    return NextResponse.json(assetAllocations)
  } catch (error) {
    console.error('Error fetching asset allocations:', error)
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
    const { targetUserId, ...allocationData } = body
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validatedData = createAssetAllocationSchema.parse(body)

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

    const assetAllocation = await createAssetAllocation({
      ...allocationData,
      userId: dbUser.id
    })

    return NextResponse.json(assetAllocation, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error creating asset allocation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
