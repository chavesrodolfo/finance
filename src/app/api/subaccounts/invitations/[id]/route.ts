import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { initializeUserData, respondToInvitation } from '@/lib/services/database'
import { z } from 'zod'

const responseSchema = z.object({
  response: z.enum(['ACCEPTED', 'DECLINED'])
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { response } = responseSchema.parse(body)

    const updatedInvitation = await respondToInvitation(id, dbUser.id, response)

    return NextResponse.json({ 
      message: `Invitation ${response.toLowerCase()} successfully`,
      invitation: {
        id: updatedInvitation.id,
        status: updatedInvitation.status
      }
    })

  } catch (error: unknown) {
    console.error('Error responding to invitation:', error)
    
    if (error instanceof Error && error.message === 'Invitation not found or not pending') {
      return NextResponse.json({ error: 'Invitation not found or not pending' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}