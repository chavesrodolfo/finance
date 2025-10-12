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

export async function resendInvitation(inviterEmail: string, inviteeEmail: string) {
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
    // If invitation exists and is DECLINED, update it to PENDING
    if (existingInvitation.status === 'DECLINED') {
      return await prisma.subaccountInvitation.update({
        where: { id: existingInvitation.id },
        data: {
          status: 'PENDING',
          updatedAt: new Date()
        },
        include: {
          inviter: true,
          invitee: true
        }
      })
    } else {
      // If invitation exists but is not DECLINED, throw error
      throw new Error('Invitation already exists')
    }
  }

  // If no existing invitation, create new one (same as inviteSubaccount)
  const inviter = await prisma.user.findUnique({
    where: { email: inviterEmail }
  })
  const invitee = await prisma.user.findUnique({
    where: { email: inviteeEmail }
  })

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
  // Get the current user's email
  const currentUser = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  if (!currentUser) {
    throw new Error('User not found')
  }

  // Verify the invitation belongs to this user (by email or userId)
  const invitation = await prisma.subaccountInvitation.findFirst({
    where: {
      id: invitationId,
      OR: [
        { inviteeId: userId },
        { inviteeEmail: currentUser.email }
      ],
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

  // Update invitation status and set inviteeId if it wasn't set
  const updatedInvitation = await prisma.subaccountInvitation.update({
    where: { id: invitationId },
    data: { 
      status: response,
      inviteeId: userId // Ensure inviteeId is set
    }
  })

  // If accepted, create subaccount access
  if (response === 'ACCEPTED' && invitation.inviter) {
    // Check if access already exists to avoid duplicates
    const existingAccess = await prisma.subaccountAccess.findFirst({
      where: {
        ownerId: invitation.inviter.id,
        subaccountId: userId
      }
    })
    
    if (!existingAccess) {
      await prisma.subaccountAccess.create({
        data: {
          ownerId: invitation.inviter.id,
          subaccountId: userId
        }
      })
    }
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

export async function leaveAccount(subaccountId: string, ownerId: string) {
  // Find the access record - the subaccount wants to leave the owner's account
  const access = await prisma.subaccountAccess.findFirst({
    where: {
      ownerId,
      subaccountId
    }
  })
  
  if (!access) {
    throw new Error('Access not found')
  }
  
  // Delete the access record
  await prisma.subaccountAccess.delete({
    where: { id: access.id }
  })
}

export async function revokeInvitation(invitationId: string, userId: string) {
  // Get the current user's email to verify ownership
  const currentUser = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  if (!currentUser) {
    throw new Error('User not found')
  }

  // Find the invitation and verify it belongs to this user as the inviter
  const invitation = await prisma.subaccountInvitation.findFirst({
    where: {
      id: invitationId,
      OR: [
        { inviterId: userId },
        { inviterEmail: currentUser.email }
      ],
      status: 'PENDING' // Can only revoke pending invitations
    }
  })

  if (!invitation) {
    throw new Error('Invitation not found, already processed, or you are not authorized to revoke it')
  }

  // Delete the invitation
  await prisma.subaccountInvitation.delete({
    where: { id: invitationId }
  })

  return invitation
}

export async function removeAcceptedInvitation(invitationId: string, userId: string) {
  // Get the current user's email to verify ownership
  const currentUser = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  if (!currentUser) {
    throw new Error('User not found')
  }

  // Find the invitation and verify it belongs to this user as the inviter
  const invitation = await prisma.subaccountInvitation.findFirst({
    where: {
      id: invitationId,
      OR: [
        { inviterId: userId },
        { inviterEmail: currentUser.email }
      ],
      status: 'ACCEPTED' // Only remove accepted invitations
    },
    include: {
      invitee: true
    }
  })

  if (!invitation) {
    throw new Error('Accepted invitation not found or you are not authorized to remove it')
  }

  // Remove the SubaccountAccess record if it exists
  if (invitation.invitee) {
    const existingAccess = await prisma.subaccountAccess.findFirst({
      where: {
        ownerId: userId,
        subaccountId: invitation.invitee.id
      }
    })

    if (existingAccess) {
      await prisma.subaccountAccess.delete({
        where: { id: existingAccess.id }
      })
    }
  }

  // Delete the invitation record
  await prisma.subaccountInvitation.delete({
    where: { id: invitationId }
  })

  return {
    invitation,
    message: 'Invitation removed and access revoked successfully'
  }
}

export async function requestAccessAgain(requesterUserId: string, ownerEmail: string) {
  // Get the current user (requester)
  const requester = await prisma.user.findUnique({
    where: { id: requesterUserId },
    select: { email: true, name: true }
  })

  if (!requester) {
    throw new Error('Requester not found')
  }

  // Find the owner by email
  const owner = await prisma.user.findUnique({
    where: { email: ownerEmail },
    select: { id: true, email: true }
  })

  if (!owner) {
    throw new Error('Account owner not found')
  }

  // Check if there's already any invitation between these users
  const existingInvitation = await prisma.subaccountInvitation.findFirst({
    where: {
      inviterEmail: ownerEmail,
      inviteeEmail: requester.email
    }
  })

  if (existingInvitation) {
    if (existingInvitation.status === 'PENDING') {
      throw new Error('Access request already pending')
    }

    // Update existing invitation to PENDING status (for ACCEPTED, DECLINED, or EXPIRED)
    const invitation = await prisma.subaccountInvitation.update({
      where: { id: existingInvitation.id },
      data: {
        status: 'PENDING',
        updatedAt: new Date()
      }
    })

    return {
      invitation,
      message: 'Access request sent successfully'
    }
  }

  // Create a new invitation request if none exists
  const invitation = await prisma.subaccountInvitation.create({
    data: {
      inviterEmail: ownerEmail,
      inviterId: owner.id,
      inviteeEmail: requester.email,
      status: 'PENDING'
    }
  })

  return {
    invitation,
    message: 'Access request sent successfully'
  }
}

// Asset Allocation functions
export async function getUserAssetAllocations(userId: string, targetUserId?: string) {
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

  return await prisma.assetAllocation.findMany({
    where: { userId: effectiveUserId },
    orderBy: {
      assetName: 'asc'
    }
  })
}

export async function createAssetAllocation(data: {
  assetName: string
  idealAllocationPercent: number
  currentAllocationAmount: number
  userId: string
}) {
  return await prisma.assetAllocation.create({
    data
  })
}

export async function updateAssetAllocation(
  allocationId: string,
  userId: string,
  data: {
    assetName?: string
    idealAllocationPercent?: number
    currentAllocationAmount?: number
  }
) {
  // First verify the allocation belongs to the user
  const existingAllocation = await prisma.assetAllocation.findFirst({
    where: {
      id: allocationId,
      userId: userId
    }
  })

  if (!existingAllocation) {
    return null
  }

  return await prisma.assetAllocation.update({
    where: { id: allocationId },
    data
  })
}

export async function deleteAssetAllocation(allocationId: string, userId: string) {
  // First verify the allocation belongs to the user
  const existingAllocation = await prisma.assetAllocation.findFirst({
    where: {
      id: allocationId,
      userId: userId
    }
  })

  if (!existingAllocation) {
    return false
  }

  await prisma.assetAllocation.delete({
    where: { id: allocationId }
  })

  return true
}


