import { NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { initializeUserData, getUserInvitations } from '@/lib/services/database'

export async function GET() {
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

    const invitations = await getUserInvitations(stackUser.primaryEmail || '')

    // Separate sent and received invitations
    const sentInvitations = invitations
      .filter(inv => inv.inviterEmail === stackUser.primaryEmail)
      .map(inv => ({
        id: inv.id,
        inviteeEmail: inv.inviteeEmail,
        status: inv.status,
        createdAt: inv.createdAt,
        invitee: inv.invitee ? {
          email: inv.invitee.email,
          name: inv.invitee.name
        } : null
      }))

    const receivedInvitations = invitations
      .filter(inv => inv.inviteeEmail === stackUser.primaryEmail)
      .map(inv => ({
        id: inv.id,
        inviterEmail: inv.inviterEmail,
        status: inv.status,
        createdAt: inv.createdAt,
        inviter: inv.inviter ? {
          email: inv.inviter.email,
          name: inv.inviter.name
        } : null
      }))

    return NextResponse.json({ 
      sentInvitations,
      receivedInvitations 
    })

  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}