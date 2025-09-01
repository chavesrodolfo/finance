import { NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { initializeUserData } from '@/lib/services/database'
import { prisma } from '@/lib/db'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
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

    // Check if description belongs to user
    const existingDescription = await prisma.description.findFirst({
      where: { id, userId: dbUser.id }
    })

    if (!existingDescription) {
      return NextResponse.json({ error: 'Description not found' }, { status: 404 })
    }

    // Update description
    const description = await prisma.description.update({
      where: { id },
      data: {
        name: name.trim(),
        icon: icon || 'Tag'
      }
    })

    return NextResponse.json(description)
  } catch (error) {
    console.error('Error updating description:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
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

    // Check if description belongs to user
    const existingDescription = await prisma.description.findFirst({
      where: { id, userId: dbUser.id }
    })

    if (!existingDescription) {
      return NextResponse.json({ error: 'Description not found' }, { status: 404 })
    }

    // Delete description
    await prisma.description.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting description:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}