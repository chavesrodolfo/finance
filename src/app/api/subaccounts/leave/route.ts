import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { initializeUserData, leaveAccount } from '@/lib/services/database'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const leaveSchema = z.object({
  ownerId: z.string()
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
    const { ownerId } = leaveSchema.parse(body)

    // Convert Stack User ID to Database User ID
    const ownerUser = await prisma.user.findUnique({
      where: { stackUserId: ownerId }
    })

    if (!ownerUser) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    await leaveAccount(dbUser.id, ownerUser.id)

    return NextResponse.json({ 
      message: 'Successfully left account'
    })

  } catch (error: unknown) {
    console.error('Error leaving account:', error)
    
    if (error instanceof Error && error.message === 'Access not found') {
      return NextResponse.json({ error: 'Access not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}