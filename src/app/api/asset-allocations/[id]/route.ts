import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stackServerApp } from '@/stack'
import { initializeUserData, updateAssetAllocation, deleteAssetAllocation } from '@/lib/services/database'

const updateAssetAllocationSchema = z.object({
  assetName: z.string().min(1, 'Asset name is required').optional(),
  idealAllocationPercent: z.number().min(0).max(100, 'Ideal allocation must be between 0 and 100').optional(),
  currentAllocationAmount: z.number().min(0, 'Current allocation amount must be positive').optional(),
})

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await initializeUserData(user.id, user.primaryEmail!, user.displayName || undefined)

    const { id } = await context.params
    const body = await request.json()
    const validatedData = updateAssetAllocationSchema.parse(body)

    const assetAllocation = await updateAssetAllocation(id, dbUser.id, validatedData)

    if (!assetAllocation) {
      return NextResponse.json({ error: 'Asset allocation not found' }, { status: 404 })
    }

    return NextResponse.json(assetAllocation)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error updating asset allocation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await initializeUserData(user.id, user.primaryEmail!, user.displayName || undefined)

    const { id } = await context.params
    const deleted = await deleteAssetAllocation(id, dbUser.id)

    if (!deleted) {
      return NextResponse.json({ error: 'Asset allocation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting asset allocation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
