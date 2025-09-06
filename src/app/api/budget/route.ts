import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stackServerApp } from '@/stack';
import { initializeUserData, hasAccountAccess, getUserByStackId } from '@/lib/services/database';
import { prisma } from '@/lib/db';

const CreateBudgetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  period: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).default('MONTHLY'),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)).optional(),
});

// GET /api/budget - Get all budget items for the user
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initializeUserData(user.id, user.primaryEmail!, user.displayName || undefined);

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('targetUserId');
    
    let queryUserId = user.id;
    
    // If targetUserId is provided, check if the user has access to that account
    if (targetUserId) {
      const currentUser = await getUserByStackId(user.id);
      if (!currentUser) {
        return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
      }
      
      const targetUser = await getUserByStackId(targetUserId);
      if (!targetUser) {
        return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
      }
      
      const hasAccess = await hasAccountAccess(currentUser.id, targetUser.id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      
      queryUserId = targetUserId;
    }

    const budgets = await prisma.budget.findMany({
      where: {
        user: {
          stackUserId: queryUserId
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/budget - Create a new budget item
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initializeUserData(user.id, user.primaryEmail!, user.displayName || undefined);

    const body = await request.json();
    const { targetUserId, ...budgetData } = body;
    const validatedData = CreateBudgetSchema.parse(budgetData);

    let targetStackUserId = user.id;
    
    // If targetUserId is provided, check if the user has access to that account
    if (targetUserId) {
      const currentUser = await getUserByStackId(user.id);
      if (!currentUser) {
        return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
      }
      
      const targetUser = await getUserByStackId(targetUserId);
      if (!targetUser) {
        return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
      }
      
      const hasAccess = await hasAccountAccess(currentUser.id, targetUser.id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      
      targetStackUserId = targetUserId;
    }

    const dbUser = await prisma.user.findUnique({
      where: { stackUserId: targetStackUserId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const budget = await prisma.budget.create({
      data: {
        ...validatedData,
        userId: dbUser.id
      }
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);

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