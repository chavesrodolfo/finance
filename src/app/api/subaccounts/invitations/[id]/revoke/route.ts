import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { initializeUserData, revokeInvitation } from '@/lib/services/database'

export async function DELETE(
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

    const revokedInvitation = await revokeInvitation(id, dbUser.id)

    return NextResponse.json({ 
      message: 'Invitation revoked successfully',
      invitation: {
        id: revokedInvitation.id,
        inviteeEmail: revokedInvitation.inviteeEmail
      }
    })

  } catch (error: unknown) {
    console.error('Error revoking invitation:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('not authorized')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}