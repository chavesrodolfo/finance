import { prisma } from '@/lib/db'
import { DEFAULT_CATEGORIES, DEFAULT_DESCRIPTIONS } from '@/lib/constants'
import { getCategoryIcon, getDescriptionIcon } from '@/lib/category-icons'

export async function initializeUserData(stackUserId: string, email: string, name?: string) {
  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { stackUserId },
    include: { categories: true, descriptions: true }
  })

  // Create user if doesn't exist
  if (!user) {
    user = await prisma.user.create({
      data: {
        stackUserId,
        email,
        name,
      },
      include: { categories: true, descriptions: true }
    })
  }

  // Create default categories if user has none
  if (user && user.categories.length === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map(category => ({
        ...category,
        icon: getCategoryIcon(category.name),
        userId: user!.id
      }))
    })

    // Fetch user with categories
    const userWithCategories = await prisma.user.findUnique({
      where: { id: user!.id },
      include: { categories: true, descriptions: true }
    })
    
    if (!userWithCategories) {
      throw new Error('Failed to fetch user after creating categories')
    }
    
    user = userWithCategories
  }

  // Create default descriptions if user has none
  if (user && user.descriptions.length === 0) {
    await prisma.description.createMany({
      data: DEFAULT_DESCRIPTIONS.map(description => ({
        name: description,
        icon: getDescriptionIcon(description),
        userId: user!.id
      }))
    })

    // Fetch user with descriptions
    const userWithDescriptions = await prisma.user.findUnique({
      where: { id: user!.id },
      include: { categories: true, descriptions: true }
    })
    
    if (!userWithDescriptions) {
      throw new Error('Failed to fetch user after creating descriptions')
    }
    
    user = userWithDescriptions
  }

  return user
}

export async function getUserTransactions(userId: string, limit?: number) {
  return await prisma.transaction.findMany({
    where: { userId },
    include: {
      category: true
    },
    orderBy: {
      date: 'desc'
    },
    take: limit
  })
}

export async function createTransaction(data: {
  amount: number
  description: string
  notes?: string
  date: Date
  type: 'EXPENSE' | 'INCOME' | 'EXPENSE_SAVINGS' | 'RETURN'
  userId: string
  categoryId: string
}) {
  return await prisma.transaction.create({
    data,
    include: {
      category: true
    }
  })
}

export async function updateTransaction(
  transactionId: string,
  userId: string,
  data: {
    amount?: number
    description?: string
    notes?: string
    date?: Date
    type?: 'EXPENSE' | 'INCOME' | 'EXPENSE_SAVINGS' | 'RETURN'
    categoryId?: string
  }
) {
  // First verify the transaction belongs to the user
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId: userId
    }
  })

  if (!existingTransaction) {
    return null
  }

  return await prisma.transaction.update({
    where: { id: transactionId },
    data,
    include: {
      category: true
    }
  })
}

export async function deleteTransaction(transactionId: string, userId: string) {
  // First verify the transaction belongs to the user
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId: userId
    }
  })

  if (!existingTransaction) {
    return false
  }

  await prisma.transaction.delete({
    where: { id: transactionId }
  })

  return true
}

export async function getUserCategories(userId: string) {
  return await prisma.category.findMany({
    where: { userId },
    orderBy: {
      name: 'asc'
    }
  })
}

export async function getUserBudgets(userId: string) {
  return await prisma.budget.findMany({
    where: { userId },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getUserDescriptions(userId: string) {
  return await prisma.description.findMany({
    where: { userId },
    orderBy: {
      name: 'asc'
    }
  })
}

export async function getUserInvestmentAccounts(userId: string) {
  return await prisma.investmentAccount.findMany({
    where: { userId },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function createInvestmentAccount(data: {
  name: string
  accountType: string
  currentValue: number
  currency?: string
  monthlyReturnPercent?: number
  annualReturnPercent?: number
  userId: string
}) {
  return await prisma.investmentAccount.create({
    data: {
      ...data,
      currency: data.currency || 'CAD',
      monthlyReturnPercent: data.monthlyReturnPercent || 0,
      annualReturnPercent: data.annualReturnPercent || 0
    }
  })
}

export async function updateInvestmentAccount(
  accountId: string,
  userId: string,
  data: {
    name?: string
    accountType?: string
    currentValue?: number
    currency?: string
    monthlyReturnPercent?: number
    annualReturnPercent?: number
  }
) {
  // First verify the account belongs to the user
  const existingAccount = await prisma.investmentAccount.findFirst({
    where: {
      id: accountId,
      userId: userId
    }
  })

  if (!existingAccount) {
    return null
  }

  return await prisma.investmentAccount.update({
    where: { id: accountId },
    data
  })
}

export async function deleteInvestmentAccount(accountId: string, userId: string) {
  // First verify the account belongs to the user
  const existingAccount = await prisma.investmentAccount.findFirst({
    where: {
      id: accountId,
      userId: userId
    }
  })

  if (!existingAccount) {
    return false
  }

  await prisma.investmentAccount.delete({
    where: { id: accountId }
  })

  return true
}


