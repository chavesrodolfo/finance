import { NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { getUserCategories, initializeUserData } from '@/lib/services/database'

export async function GET() {
  try {
    // Get the authenticated user
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

    if (!dbUser) {
      return NextResponse.json({ error: 'Failed to initialize user' }, { status: 500 })
    }

    // Get user categories
    const categories = await getUserCategories(dbUser.id)

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
