'use client'

import { useAccountContext } from '@/hooks/useAccountContext'
import { useCallback } from 'react'

export function useAccountAwareApi() {
  const { currentAccountId } = useAccountContext()

  const buildApiUrl = useCallback((baseUrl: string, additionalParams?: Record<string, string>) => {
    const url = new URL(baseUrl, window.location.origin)
    
    // Add target user ID if we're viewing another account
    if (currentAccountId) {
      url.searchParams.set('targetUserId', currentAccountId)
    }
    
    // Add any additional parameters
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }
    
    return url.toString()
  }, [currentAccountId])

  const apiFetch = useCallback(async (baseUrl: string, options?: RequestInit, additionalParams?: Record<string, string>) => {
    const url = buildApiUrl(baseUrl, additionalParams)
    return fetch(url, options)
  }, [buildApiUrl])

  const apiPost = useCallback(async (baseUrl: string, body: unknown, additionalParams?: Record<string, string>) => {
    const url = buildApiUrl(baseUrl, additionalParams)
    
    // For POST requests, add targetUserId to the body if needed
    let requestBody = body
    if (currentAccountId && typeof body === 'object') {
      requestBody = {
        ...body,
        targetUserId: currentAccountId
      }
    }
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
  }, [buildApiUrl, currentAccountId])

  return {
    buildApiUrl,
    apiFetch,
    apiPost,
    currentAccountId,
  }
}