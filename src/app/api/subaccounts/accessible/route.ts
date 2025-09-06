import { NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { initializeUserData, getUserAccessibleAccounts, getUserSubaccounts } from '@/lib/services/database'

export async function GET() {
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

    // Get accounts this user can access (as subaccount)
    const accessibleAccounts = await getUserAccessibleAccounts(dbUser.id)
    
    // Get subaccounts of this user (users who have access to this user's account)
    const subaccounts = await getUserSubaccounts(dbUser.id)

    // Include own account in accessible accounts
    const allAccessibleAccounts = [
      {
        id: dbUser.stackUserId,
        email: dbUser.email,
        name: dbUser.name,
        isOwn: true
      },
      ...accessibleAccounts.map(account => ({
        id: account.stackUserId,
        email: account.email,
        name: account.name,
        isOwn: false
      }))
    ]

    return NextResponse.json({ 
      accessibleAccounts: allAccessibleAccounts,
      subaccounts 
    })

  } catch (error) {
    console.error('Error fetching accessible accounts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}