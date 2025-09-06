import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { initializeUserData, inviteSubaccount } from '@/lib/services/database'
import { z } from 'zod'

const inviteSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    const stackUser = await stackServerApp.getUser()
    
    if (!stackUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize/get user in database
    await initializeUserData(
      stackUser.id,
      stackUser.primaryEmail || '',
      stackUser.displayName || undefined
    )

    const body = await request.json()
    const { email } = inviteSchema.parse(body)

    // Prevent self-invitation
    if (email === stackUser.primaryEmail) {
      return NextResponse.json({ error: 'Cannot invite yourself' }, { status: 400 })
    }

    const invitation = await inviteSubaccount(stackUser.primaryEmail || '', email)

    return NextResponse.json({ 
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        inviteeEmail: invitation.inviteeEmail,
        status: invitation.status,
        createdAt: invitation.createdAt
      }
    })

  } catch (error: unknown) {
    console.error('Error sending invitation:', error)
    
    if (error instanceof Error && error.message === 'Invitation already exists') {
      return NextResponse.json({ error: 'Invitation already exists for this email' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}