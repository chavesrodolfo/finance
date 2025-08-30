import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { createTransaction, getUserCategories, initializeUserData } from '@/lib/services/database'

interface Category {
  id: string
  name: string
  color?: string
  userId: string
}

export async function POST(request: NextRequest) {
  try {
    const stackUser = await stackServerApp.getUser()
    
    if (!stackUser) {
      console.error('Bulk API: Unauthorized access')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { transactions } = await request.json()
    console.log('Bulk API: Received transactions:', JSON.stringify(transactions, null, 2))

    if (!transactions || !Array.isArray(transactions)) {
      console.error('Bulk API: Invalid transactions data:', transactions)
      return NextResponse.json({ error: 'Invalid transactions data' }, { status: 400 })
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
    const categoryMap = new Map<string, Category>(userCategories.map((cat: Category) => [cat.name.toLowerCase(), cat]))

    const createdTransactions = []
    let skippedCount = 0

    console.log('Bulk API: Processing', transactions.length, 'transactions')

    for (const transactionData of transactions) {
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

        // Validate transaction type
        const validTypes = ['EXPENSE', 'INCOME', 'EXPENSE_SAVINGS', 'RETURN'];
        const type = validTypes.includes(transactionData.type) ? transactionData.type : 'EXPENSE';
        console.log('Bulk API: Transaction type:', transactionData.type, '-> mapped to:', type);

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
    }

    console.log('Bulk API: Final result - Created:', createdTransactions.length, 'Skipped:', skippedCount)

    return NextResponse.json({
      success: true,
      count: createdTransactions.length,
      skipped: skippedCount,
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
