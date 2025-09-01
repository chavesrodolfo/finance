import { NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { getUserDescriptions, initializeUserData } from '@/lib/services/database'
import { prisma } from '@/lib/db'
import { getDescriptionIcon } from '@/lib/category-icons'

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

    // Get user descriptions
    const descriptions = await getUserDescriptions(dbUser.id)

    return NextResponse.json(descriptions)
  } catch (error) {
    console.error('Error fetching descriptions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    // Parse request body
    const { name, icon } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Description name is required' }, { status: 400 })
    }

    // Create description with icon (use provided icon or auto-assign based on name)
    const finalIcon = icon || getDescriptionIcon(name)

    const description = await prisma.description.create({
      data: {
        name: name.trim(),
        icon: finalIcon,
        userId: dbUser.id
      }
    })

    return NextResponse.json(description)
  } catch (error) {
    console.error('Error creating description:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}