"use client"

import React, { useEffect, useState } from 'react'
import { Badge } from './badge'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Bell, Check, X, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReceivedInvitation {
  id: string
  inviterEmail: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  createdAt: string
  inviter: {
    email: string
    name: string | null
  } | null
}

interface InvitationNotificationProps {
  className?: string
}

export function InvitationNotification({ className }: InvitationNotificationProps) {
  const [invitations, setInvitations] = useState<ReceivedInvitation[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/subaccounts/invitations')
      if (response.ok) {
        const data = await response.json()
        const pendingInvitations = data.receivedInvitations?.filter(
          (inv: ReceivedInvitation) => inv.status === 'PENDING'
        ) || []
        setInvitations(pendingInvitations)
        setIsVisible(pendingInvitations.length > 0)
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error)
    }
  }

  const handleInvitationResponse = async (invitationId: string, accept: boolean) => {
    try {
      const response = await fetch(`/api/subaccounts/invitations/${invitationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: accept ? 'ACCEPTED' : 'DECLINED'
        }),
      })

      if (response.ok) {
        // Remove the invitation from the list
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
        
        // Hide notification if no more pending invitations
        if (invitations.length === 1) {
          setIsVisible(false)
        }
      }
    } catch (error) {
      console.error('Failed to respond to invitation:', error)
    }
  }

  const dismissNotification = () => {
    setIsVisible(false)
  }

  useEffect(() => {
    fetchInvitations()
  }, [])

  if (!isVisible || invitations.length === 0) {
    return null
  }

  return (
    <div className={cn("fixed top-20 right-4 z-50 max-w-sm", className)}>
      <Card className="border-l-4 border-l-blue-500 shadow-lg animate-in slide-in-from-right-5 duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">
                {invitations.length === 1 ? 'New Invitation' : `${invitations.length} New Invitations`}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={dismissNotification}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {invitations.slice(0, 3).map((invitation) => (
              <div key={invitation.id} className="border rounded-lg p-3">
                <div className="flex items-start gap-2 mb-2">
                  <div className="bg-muted rounded-full p-1">
                    <User className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {invitation.inviter?.name || invitation.inviterEmail}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      wants to share their account
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleInvitationResponse(invitation.id, true)}
                    className="flex-1 h-7 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInvitationResponse(invitation.id, false)}
                    className="flex-1 h-7 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
            
            {invitations.length > 3 && (
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  +{invitations.length - 3} more
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}