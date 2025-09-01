import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stackServerApp } from '@/stack';
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

    // Verify budget belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: resolvedParams.id,
        user: {
          stackUserId: user.id
        }
      }
    });

    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
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
    
    // Verify budget belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: resolvedParams.id,
        user: {
          stackUserId: user.id
        }
      }
    });

    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
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