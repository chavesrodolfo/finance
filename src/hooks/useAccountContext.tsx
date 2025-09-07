'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useUser } from "@stackframe/stack"

type Account = {
  id: string
  email: string
  name?: string | null
  isOwn: boolean
}

type AccountContextType = {
  currentAccount: Account | null
  availableAccounts: Account[]
  switchAccount: (accountId: string) => void
  clearStoredAccount: () => void
  isLoading: boolean
  isSubaccount: boolean
  currentAccountId: string | null
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function AccountProvider({ children }: { children: ReactNode }) {
  const user = useUser()
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null)
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const STORAGE_KEY = 'finance-app-selected-account'

  // Function to save account to localStorage
  const saveAccountToStorage = (account: Account) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        id: account.id,
        email: account.email,
        name: account.name,
        isOwn: account.isOwn
      }))
    } catch (error) {
      console.warn('Failed to save selected account to localStorage:', error)
    }
  }

  // Function to load account from localStorage
  const loadAccountFromStorage = (): Account | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored) as Account
      }
    } catch (error) {
      console.warn('Failed to load selected account from localStorage:', error)
    }
    return null
  }

  const fetchAccessibleAccounts = useCallback(async () => {
    try {
      const response = await fetch('/api/subaccounts/accessible')
      if (response.ok) {
        const data = await response.json()
        setAvailableAccounts(data.accessibleAccounts)
        
        // Try to restore previously selected account
        const savedAccount = loadAccountFromStorage()
        let accountToSelect: Account | null = null

        if (savedAccount) {
          // Check if the saved account is still available
          accountToSelect = data.accessibleAccounts.find((acc: Account) => 
            acc.id === savedAccount.id && acc.email === savedAccount.email
          )
        }

        // If saved account is not available, fall back to own account
        if (!accountToSelect) {
          accountToSelect = data.accessibleAccounts.find((acc: Account) => acc.isOwn)
        }

        if (accountToSelect) {
          // Only set the account if it's different from the current one to prevent unnecessary re-renders
          setCurrentAccount(prevAccount => {
            if (!prevAccount || prevAccount.id !== accountToSelect!.id) {
              // Update localStorage with the current selection (in case it was a fallback)
              saveAccountToStorage(accountToSelect!)
              return accountToSelect
            }
            return prevAccount
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch accessible accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }, []);

  useEffect(() => {
    if (user?.primaryEmail) {
      fetchAccessibleAccounts()
    }
  }, [user?.primaryEmail, fetchAccessibleAccounts])

  const switchAccount = (accountId: string) => {
    const account = availableAccounts.find(acc => acc.id === accountId)
    if (account) {
      setCurrentAccount(account)
      saveAccountToStorage(account)
    }
  }

  const clearStoredAccount = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear stored account from localStorage:', error)
    }
  }

  // Clear stored account when user logs out
  useEffect(() => {
    if (!user) {
      clearStoredAccount()
      setCurrentAccount(null)
      setAvailableAccounts([])
    }
  }, [user])

  const isSubaccount = !currentAccount?.isOwn
  const currentAccountId = currentAccount?.isOwn ? null : (currentAccount?.id || null)

  return (
    <AccountContext.Provider 
      value={{
        currentAccount,
        availableAccounts,
        switchAccount,
        clearStoredAccount,
        isLoading,
        isSubaccount,
        currentAccountId
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccountContext() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error('useAccountContext must be used within an AccountProvider')
  }
  return context
}