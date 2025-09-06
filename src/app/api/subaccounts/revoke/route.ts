import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { initializeUserData, revokeSubaccountAccess } from '@/lib/services/database'
import { z } from 'zod'

const revokeSchema = z.object({
  subaccountId: z.string()
})

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { subaccountId } = revokeSchema.parse(body)

    await revokeSubaccountAccess(dbUser.id, subaccountId)

    return NextResponse.json({ 
      message: 'Subaccount access revoked successfully'
    })

  } catch (error: unknown) {
    console.error('Error revoking access:', error)
    
    if (error instanceof Error && error.message === 'Access not found') {
      return NextResponse.json({ error: 'Access not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}