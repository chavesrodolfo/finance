import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { createTransaction, getUserCategories, initializeUserData } from '@/lib/services/database'
import { prisma } from '@/lib/db'

type CategoryData = {
  id: string
  name: string
  description: string | null
  color: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Store progress in memory (in production, use Redis or database)
const progressStore = new Map<string, {
  total: number;
  processed: number;
  created: number;
  skipped: number;
  completed: boolean;
  error?: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const stackUser = await stackServerApp.getUser()
    
    if (!stackUser) {
      console.error('Bulk API: Unauthorized access')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { transactions, jobId } = await request.json()
    console.log('Bulk API: Received transactions:', transactions?.length, 'with jobId:', jobId)

    if (!transactions || !Array.isArray(transactions)) {
      console.error('Bulk API: Invalid transactions data:', transactions)
      return NextResponse.json({ error: 'Invalid transactions data' }, { status: 400 })
    }

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Initialize user data if needed
    const dbUser = await initializeUserData(
      stackUser.id,
      stackUser.primaryEmail || '',
      stackUser.displayName || undefined
    )

    // Get user categories for mapping
    const userCategories = await getUserCategories(stackUser.id)
    console.log('Bulk API: User categories:', userCategories)
    const categoryMap = new Map<string, CategoryData>(userCategories.map((cat: CategoryData) => [cat.name.toLowerCase(), cat]))

    // Initialize progress tracking
    progressStore.set(jobId, {
      total: transactions.length,
      processed: 0,
      created: 0,
      skipped: 0,
      completed: false
    });

    const createdTransactions = []
    let skippedCount = 0
    const BATCH_SIZE = 10; // Process in smaller batches

    console.log('Bulk API: Processing', transactions.length, 'transactions in batches of', BATCH_SIZE)

    // Process in batches to allow progress updates
    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      const batch = transactions.slice(i, i + BATCH_SIZE);
      
      for (const transactionData of batch) {
      try {
        console.log('Bulk API: Processing transaction:', transactionData);
        // Always assign a valid category, create if not found
        let categoryId;
        const categoryName = transactionData.categoryName ? transactionData.categoryName.trim() : 'Other';
        const categoryData = categoryMap.get(categoryName.toLowerCase());
        if (!categoryData) {
          // Check database for existing category (case-insensitive)
          const existingCategory = await prisma.category.findFirst({
            where: {
              userId: dbUser.id,
              name: { equals: categoryName, mode: 'insensitive' }
            }
          });
          if (existingCategory) {
            categoryId = existingCategory.id;
            categoryMap.set(categoryName.toLowerCase(), existingCategory);
          } else {
            // Create new category for user using dbUser.id
            const newCategory = await prisma.category.create({
              data: {
                name: categoryName,
                color: '#6b7280', // default gray
                userId: dbUser.id
              }
            });
            categoryId = newCategory.id;
            categoryMap.set(categoryName.toLowerCase(), newCategory);
          }
        } else {
          categoryId = categoryData.id;
        }

        // Only skip if amount is zero or missing
        if (transactionData.amount === 0) {
          console.log('Bulk API: Skipping transaction due to zero or missing amount:', transactionData);
          skippedCount++;
          continue;
        }

        // Validate and map transaction type
        const validTypes = ['EXPENSE', 'INCOME', 'EXPENSE_SAVINGS', 'RETURN'];
        let type = transactionData.type;
        
        if (!validTypes.includes(type)) {
          console.log('Bulk API: Invalid type received:', type, '-> defaulting to EXPENSE');
          type = 'EXPENSE';
        }
        
        console.log('Bulk API: Transaction type mapping:', transactionData.type, '->', type);

        // Parse date
        let date = new Date();
        if (transactionData.date) {
          const parsedDate = new Date(transactionData.date);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate;
          }
        }

        const transaction = await createTransaction({
          amount: transactionData.amount,
          description: transactionData.description || '',
          date: date,
          type: type as 'EXPENSE' | 'INCOME' | 'EXPENSE_SAVINGS' | 'RETURN',
          userId: dbUser.id,
          categoryId: categoryId,
          notes: transactionData.notes || undefined
        });

        console.log('Bulk API: Created transaction:', transaction);
        createdTransactions.push(transaction);
      } catch (error) {
        console.error('Bulk API: Error creating transaction:', error, 'Data:', transactionData);
        skippedCount++;
      }
      
      // Update progress after each transaction
      const currentProgress = progressStore.get(jobId);
      if (currentProgress) {
        currentProgress.processed++;
        currentProgress.created = createdTransactions.length;
        currentProgress.skipped = skippedCount;
      }
      }
      
      // Small delay between batches to prevent overwhelming the database
      if (i + BATCH_SIZE < transactions.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Mark as completed
    const finalProgress = progressStore.get(jobId);
    if (finalProgress) {
      finalProgress.completed = true;
    }

    console.log('Bulk API: Final result - Created:', createdTransactions.length, 'Skipped:', skippedCount)

    return NextResponse.json({
      success: true,
      count: createdTransactions.length,
      skipped: skippedCount,
      jobId,
      transactions: createdTransactions
    })
  } catch (error) {
    console.error('Error in bulk transaction creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/transactions/bulk?jobId=xxx - Get progress of bulk import
export async function GET(request: NextRequest) {
  try {
    const stackUser = await stackServerApp.getUser()
    
    if (!stackUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const jobId = url.searchParams.get("jobId")
    
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    const progress = progressStore.get(jobId)
    
    if (!progress) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Clean up completed jobs after 30 seconds
    if (progress.completed) {
      setTimeout(() => {
        progressStore.delete(jobId)
      }, 30000)
    }

    return NextResponse.json({
      jobId,
      total: progress.total,
      processed: progress.processed,
      created: progress.created,
      skipped: progress.skipped,
      completed: progress.completed,
      progress: progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0,
      error: progress.error
    })
  } catch (error) {
    console.error("Error getting bulk import progress:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
