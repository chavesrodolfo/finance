import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { initializeUserData, requestAccessAgain } from '@/lib/services/database'
import { z } from 'zod'

const requestAccessSchema = z.object({
  ownerEmail: z.string().email()
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
    const { ownerEmail } = requestAccessSchema.parse(body)

    const result = await requestAccessAgain(dbUser.id, ownerEmail)

    return NextResponse.json(result)

  } catch (error: unknown) {
    console.error('Error requesting access again:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Account owner not found') {
        return NextResponse.json({ error: 'Account owner not found' }, { status: 404 })
      }
      if (error.message === 'Access request already pending') {
        return NextResponse.json({ error: 'Access request already pending' }, { status: 409 })
      }
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}