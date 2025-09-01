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
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    // Check if category belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: { id, userId: dbUser.id }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        icon: icon || 'Tag'
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
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

    // Check if category belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: { id, userId: dbUser.id }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if category has transactions
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id }
    })

    if (transactionCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete category with existing transactions' 
      }, { status: 400 })
    }

    // Delete category
    await prisma.category.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}