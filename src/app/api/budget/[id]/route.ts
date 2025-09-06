import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stackServerApp } from '@/stack';
import { hasAccountAccess, getUserByStackId } from '@/lib/services/database';
import { prisma } from '@/lib/db';

const UpdateBudgetSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  amount: z.number().positive("Amount must be positive").optional(),
  period: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
});

// PUT /api/budget/[id] - Update a budget item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const validatedData = UpdateBudgetSchema.parse(body);

    // Get the budget first to check ownership
    const existingBudget = await prisma.budget.findUnique({
      where: { id: resolvedParams.id },
      include: {
        user: true
      }
    });

    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // Check if user owns the budget or has access to the account
    if (existingBudget.user.stackUserId !== user.id) {
      const currentUser = await getUserByStackId(user.id);
      if (!currentUser) {
        return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
      }
      
      const hasAccess = await hasAccountAccess(currentUser.id, existingBudget.user.id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const budget = await prisma.budget.update({
      where: { id: resolvedParams.id },
      data: validatedData
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/budget/[id] - Delete a budget item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    
    // Get the budget first to check ownership
    const existingBudget = await prisma.budget.findUnique({
      where: { id: resolvedParams.id },
      include: {
        user: true
      }
    });

    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // Only allow deletion if user owns the budget (no subaccount deletion access)
    if (existingBudget.user.stackUserId !== user.id) {
      return NextResponse.json({ error: 'Only account owners can delete budget items' }, { status: 403 });
    }

    await prisma.budget.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}