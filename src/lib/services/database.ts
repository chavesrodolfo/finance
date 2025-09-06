import { prisma } from '@/lib/db'
import { DEFAULT_CATEGORIES, DEFAULT_DESCRIPTIONS } from '@/lib/constants'
import { getCategoryIcon, getDescriptionIcon } from '@/lib/category-icons'

export async function getUserByStackId(stackUserId: string) {
  return await prisma.user.findUnique({
    where: { stackUserId }
  })
}

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

export async function getUserTransactions(userId: string, limit?: number, targetUserId?: string) {
  let effectiveUserId = userId
  
  // If targetUserId is provided, it's expected to be a Stack user ID, so convert to database user ID
  if (targetUserId) {
    const targetUser = await getUserByStackId(targetUserId)
    if (!targetUser) {
      throw new Error('Target user not found')
    }
    
    // Verify access if targetUserId is different from current user
    const hasAccess = await hasAccountAccess(userId, targetUser.id)
    if (!hasAccess) {
      throw new Error('Access denied to target account')
    }
    
    effectiveUserId = targetUser.id
  }
  
  return await prisma.transaction.findMany({
    where: { userId: effectiveUserId },
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
}, requestingUserId?: string, targetUserId?: string) {
  let effectiveUserId = data.userId
  
  // If targetUserId is provided, it's expected to be a Stack user ID, so convert to database user ID
  if (targetUserId && requestingUserId) {
    const targetUser = await getUserByStackId(targetUserId)
    if (!targetUser) {
      throw new Error('Target user not found')
    }
    
    // Verify access if targetUserId is different from current user
    const hasAccess = await hasAccountAccess(requestingUserId, targetUser.id)
    if (!hasAccess) {
      throw new Error('Access denied to target account')
    }
    
    effectiveUserId = targetUser.id
  }
  
  return await prisma.transaction.create({
    data: {
      ...data,
      userId: effectiveUserId
    },
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

export async function getUserCategories(userId: string, targetUserId?: string) {
  let effectiveUserId = userId
  
  // If targetUserId is provided, it's expected to be a Stack user ID, so convert to database user ID
  if (targetUserId) {
    const targetUser = await getUserByStackId(targetUserId)
    if (!targetUser) {
      throw new Error('Target user not found')
    }
    
    // Verify access if targetUserId is different from current user
    const hasAccess = await hasAccountAccess(userId, targetUser.id)
    if (!hasAccess) {
      throw new Error('Access denied to target account')
    }
    
    effectiveUserId = targetUser.id
  }
  
  return await prisma.category.findMany({
    where: { userId: effectiveUserId },
    orderBy: {
      name: 'asc'
    }
  })
}

export async function getUserBudgets(userId: string, targetUserId?: string) {
  let effectiveUserId = userId
  
  // If targetUserId is provided, it's expected to be a Stack user ID, so convert to database user ID
  if (targetUserId) {
    const targetUser = await getUserByStackId(targetUserId)
    if (!targetUser) {
      throw new Error('Target user not found')
    }
    
    // Verify access if targetUserId is different from current user
    const hasAccess = await hasAccountAccess(userId, targetUser.id)
    if (!hasAccess) {
      throw new Error('Access denied to target account')
    }
    
    effectiveUserId = targetUser.id
  }
  
  return await prisma.budget.findMany({
    where: { userId: effectiveUserId },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getUserDescriptions(userId: string, targetUserId?: string) {
  let effectiveUserId = userId
  
  // If targetUserId is provided, it's expected to be a Stack user ID, so convert to database user ID
  if (targetUserId) {
    const targetUser = await getUserByStackId(targetUserId)
    if (!targetUser) {
      throw new Error('Target user not found')
    }
    
    // Verify access if targetUserId is different from current user
    const hasAccess = await hasAccountAccess(userId, targetUser.id)
    if (!hasAccess) {
      throw new Error('Access denied to target account')
    }
    
    effectiveUserId = targetUser.id
  }
  
  return await prisma.description.findMany({
    where: { userId: effectiveUserId },
    orderBy: {
      name: 'asc'
    }
  })
}

export async function getUserInvestmentAccounts(userId: string, targetUserId?: string) {
  let effectiveUserId = userId
  
  // If targetUserId is provided, it's expected to be a Stack user ID, so convert to database user ID
  if (targetUserId) {
    const targetUser = await getUserByStackId(targetUserId)
    if (!targetUser) {
      throw new Error('Target user not found')
    }
    
    // Verify access if targetUserId is different from current user
    const hasAccess = await hasAccountAccess(userId, targetUser.id)
    if (!hasAccess) {
      throw new Error('Access denied to target account')
    }
    
    effectiveUserId = targetUser.id
  }
  
  return await prisma.investmentAccount.findMany({
    where: { userId: effectiveUserId },
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

export async function inviteSubaccount(inviterEmail: string, inviteeEmail: string) {
  // Check if invitation already exists
  const existingInvitation = await prisma.subaccountInvitation.findUnique({
    where: {
      inviterEmail_inviteeEmail: {
        inviterEmail,
        inviteeEmail
      }
    }
  })

  if (existingInvitation) {
    throw new Error('Invitation already exists')
  }

  // Find inviter and invitee users if they exist
  const inviter = await prisma.user.findUnique({
    where: { email: inviterEmail }
  })

  const invitee = await prisma.user.findUnique({
    where: { email: inviteeEmail }
  })

  // Create invitation
  return await prisma.subaccountInvitation.create({
    data: {
      inviterEmail,
      inviteeEmail,
      inviterId: inviter?.id,
      inviteeId: invitee?.id,
      status: 'PENDING'
    },
    include: {
      inviter: true,
      invitee: true
    }
  })
}

export async function getUserInvitations(userEmail: string) {
  return await prisma.subaccountInvitation.findMany({
    where: {
      OR: [
        { inviterEmail: userEmail },
        { inviteeEmail: userEmail }
      ]
    },
    include: {
      inviter: true,
      invitee: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function respondToInvitation(invitationId: string, userId: string, response: 'ACCEPTED' | 'DECLINED') {
  // Verify the invitation belongs to this user
  const invitation = await prisma.subaccountInvitation.findFirst({
    where: {
      id: invitationId,
      inviteeId: userId,
      status: 'PENDING'
    },
    include: {
      inviter: true,
      invitee: true
    }
  })

  if (!invitation) {
    throw new Error('Invitation not found or not pending')
  }

  // Update invitation status
  const updatedInvitation = await prisma.subaccountInvitation.update({
    where: { id: invitationId },
    data: { status: response }
  })

  // If accepted, create subaccount access
  if (response === 'ACCEPTED' && invitation.inviter) {
    await prisma.subaccountAccess.create({
      data: {
        ownerId: invitation.inviter.id,
        subaccountId: userId
      }
    })
  }

  return updatedInvitation
}

export async function getUserAccessibleAccounts(userId: string) {
  const subaccountAccess = await prisma.subaccountAccess.findMany({
    where: {
      subaccountId: userId
    },
    include: {
      owner: {
        select: {
          id: true,
          stackUserId: true,
          email: true,
          name: true
        }
      }
    }
  })

  return subaccountAccess.map(access => access.owner)
}

export async function getUserSubaccounts(userId: string) {
  const subaccounts = await prisma.subaccountAccess.findMany({
    where: {
      ownerId: userId
    },
    include: {
      subaccount: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  })

  return subaccounts.map(access => access.subaccount)
}

export async function revokeSubaccountAccess(ownerId: string, subaccountId: string) {
  const access = await prisma.subaccountAccess.findFirst({
    where: {
      ownerId,
      subaccountId
    }
  })

  if (!access) {
    throw new Error('Access not found')
  }

  await prisma.subaccountAccess.delete({
    where: { id: access.id }
  })

  return true
}

export async function hasAccountAccess(requestingUserId: string, targetUserId: string) {
  // Users always have access to their own data
  if (requestingUserId === targetUserId) {
    return true
  }

  // Check if requesting user is a subaccount of target user
  const access = await prisma.subaccountAccess.findFirst({
    where: {
      ownerId: targetUserId,
      subaccountId: requestingUserId
    }
  })

  return !!access
}

export async function isSubaccount(userId: string, targetUserId: string) {
  const access = await prisma.subaccountAccess.findFirst({
    where: {
      ownerId: targetUserId,
      subaccountId: userId
    }
  })

  return !!access
}


