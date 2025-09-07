"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Mail, Clock, Check, X, UserPlus, Users, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@stackframe/stack";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface Invitation {
  id: string
  inviteeEmail?: string
  inviterEmail?: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  createdAt: string
  invitee?: { email: string; name?: string | null }
  inviter?: { email: string; name?: string | null }
}

interface Account {
  id: string
  email: string
  name?: string | null
  isOwn?: boolean
}

export default function SubaccountsPage() {
  const user = useUser();
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
  const [subaccounts, setSubaccounts] = useState<Account[]>([]);
  const [accessibleAccounts, setAccessibleAccounts] = useState<Account[]>([]);
  const [newInviteeEmail, setNewInviteeEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedSubaccountId, setSelectedSubaccountId] = useState<string | null>(null);
  const [leaveAccountDialogOpen, setLeaveAccountDialogOpen] = useState(false);
  const [selectedOwnerAccountId, setSelectedOwnerAccountId] = useState<string | null>(null);
  const [revokeInvitationDialogOpen, setRevokeInvitationDialogOpen] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [selectedInvitationEmail, setSelectedInvitationEmail] = useState<string | null>(null);
  const [isRevokingInvitation, setIsRevokingInvitation] = useState(false);
  const [removeAcceptedDialogOpen, setRemoveAcceptedDialogOpen] = useState(false);
  const [selectedAcceptedInvitationId, setSelectedAcceptedInvitationId] = useState<string | null>(null);
  const [selectedAcceptedInvitationEmail, setSelectedAcceptedInvitationEmail] = useState<string | null>(null);
  const [isRemovingAccepted, setIsRemovingAccepted] = useState(false);
  const [isResendingInvitation, setIsResendingInvitation] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch invitations
      const invitationsResponse = await fetch('/api/subaccounts/invitations');
      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json();
        setSentInvitations(invitationsData.sentInvitations || []);
        setReceivedInvitations(invitationsData.receivedInvitations || []);
      }

      // Fetch accessible accounts and subaccounts
      const accessibleResponse = await fetch('/api/subaccounts/accessible');
      if (accessibleResponse.ok) {
        const accessibleData = await accessibleResponse.json();
        setAccessibleAccounts(accessibleData.accessibleAccounts || []);
        setSubaccounts(accessibleData.subaccounts || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load subaccount data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingInvitation = (email: string) => {
    return sentInvitations.find(inv => 
      inv.inviteeEmail?.toLowerCase() === email.toLowerCase()
    );
  };

  const handleInviteSubaccount = async () => {
    if (!newInviteeEmail.trim() || !user?.primaryEmail) return;

    // Check for existing invitation before making API call
    const existingInvitation = checkExistingInvitation(newInviteeEmail.trim());
    if (existingInvitation) {
      toast({
        title: "Duplicate Invitation",
        description: `An invitation to ${newInviteeEmail.trim()} already exists with status: ${existingInvitation.status}. Please check the 'Sent Invitations' tab.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsInviting(true);
      const response = await fetch('/api/subaccounts/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newInviteeEmail.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Invitation sent successfully",
        });
        setNewInviteeEmail("");
        fetchData(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to send invitation');
      }
    } catch (error: unknown) {
      console.error('Error sending invitation:', error);
      
      let errorMessage = "Failed to send invitation";
      let errorTitle = "Error";
      
      if (error instanceof Error) {
        if (error.message === "Invitation already exists for this email") {
          errorTitle = "Duplicate Invitation";
          errorMessage = "An invitation has already been sent to this email address. Please check the 'Sent Invitations' tab to see its status.";
        } else if (error.message === "Cannot invite yourself") {
          errorTitle = "Invalid Invitation";
          errorMessage = "You cannot invite yourself as a subaccount.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRespondToInvitation = async (invitationId: string, response: 'ACCEPTED' | 'DECLINED') => {
    try {
      setIsResponding(true);
      const apiResponse = await fetch(`/api/subaccounts/invitations/${invitationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      });

      const data = await apiResponse.json();

      if (apiResponse.ok) {
        toast({
          title: "Success",
          description: `Invitation ${response.toLowerCase()} successfully`,
        });
        fetchData(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to respond to invitation');
      }
    } catch (error: unknown) {
      console.error('Error responding to invitation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to respond to invitation",
        variant: "destructive",
      });
    } finally {
      setIsResponding(false);
    }
  };

  const handleRevokeAccess = async (subaccountId: string) => {
    try {
      const response = await fetch('/api/subaccounts/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subaccountId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subaccount access revoked successfully",
        });
        setRevokeDialogOpen(false);
        setSelectedSubaccountId(null);
        fetchData(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to revoke access');
      }
    } catch (error: unknown) {
      console.error('Error revoking access:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke access",
        variant: "destructive",
      });
    }
  };

  const openRevokeDialog = (subaccountId: string) => {
    setSelectedSubaccountId(subaccountId);
    setRevokeDialogOpen(true);
  };

  const handleLeaveAccount = async (ownerId: string) => {
    try {
      const response = await fetch('/api/subaccounts/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ownerId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Successfully left the account",
        });
        setLeaveAccountDialogOpen(false);
        setSelectedOwnerAccountId(null);
        fetchData(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to leave account');
      }
    } catch (error: unknown) {
      console.error('Error leaving account:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to leave account",
        variant: "destructive",
      });
    }
  };

  const openLeaveAccountDialog = (ownerId: string) => {
    setSelectedOwnerAccountId(ownerId);
    setLeaveAccountDialogOpen(true);
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      setIsRevokingInvitation(true);
      const response = await fetch(`/api/subaccounts/invitations/${invitationId}/revoke`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Invitation cancelled successfully",
        });
        setRevokeInvitationDialogOpen(false);
        setSelectedInvitationId(null);
        setSelectedInvitationEmail(null);
        fetchData(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to revoke invitation');
      }
    } catch (error: unknown) {
      console.error('Error revoking invitation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke invitation",
        variant: "destructive",
      });
    } finally {
      setIsRevokingInvitation(false);
    }
  };

  const openRevokeInvitationDialog = (invitationId: string, inviteeEmail: string) => {
    setSelectedInvitationId(invitationId);
    setSelectedInvitationEmail(inviteeEmail);
    setRevokeInvitationDialogOpen(true);
  };

  const handleRemoveAcceptedInvitation = async (invitationId: string) => {
    try {
      setIsRemovingAccepted(true);
      const response = await fetch(`/api/subaccounts/invitations/${invitationId}/remove-accepted`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Accepted invitation removed and access revoked successfully",
        });
        setRemoveAcceptedDialogOpen(false);
        setSelectedAcceptedInvitationId(null);
        setSelectedAcceptedInvitationEmail(null);
        fetchData(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to remove accepted invitation');
      }
    } catch (error: unknown) {
      console.error('Error removing accepted invitation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove accepted invitation",
        variant: "destructive",
      });
    } finally {
      setIsRemovingAccepted(false);
    }
  };

  const openRemoveAcceptedDialog = (invitationId: string, inviteeEmail: string) => {
    setSelectedAcceptedInvitationId(invitationId);
    setSelectedAcceptedInvitationEmail(inviteeEmail);
    setRemoveAcceptedDialogOpen(true);
  };

  const handleRequestAccessAgain = async (inviterEmail: string) => {
    try {
      setIsResendingInvitation(true);
      
      const response = await fetch('/api/subaccounts/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerEmail: inviterEmail,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Access request sent successfully",
        });
        fetchData(); // Refresh data to show the new pending invitation
      } else {
        throw new Error(data.error || 'Failed to send access request');
      }
    } catch (error: unknown) {
      console.error('Error requesting access again:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send access request",
        variant: "destructive",
      });
    } finally {
      setIsResendingInvitation(false);
    }
  };

  const handleResendInvitation = async (email: string) => {
    try {
      setIsResendingInvitation(true);
      const response = await fetch('/api/subaccounts/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Invitation resent successfully",
        });
        fetchData(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to resend invitation');
      }
    } catch (error: unknown) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend invitation",
        variant: "destructive",
      });
    } finally {
      setIsResendingInvitation(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'ACCEPTED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'DECLINED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-3 w-3" />;
      case 'ACCEPTED': return <Check className="h-3 w-3" />;
      case 'DECLINED': return <X className="h-3 w-3" />;
      case 'EXPIRED': return <Clock className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subaccounts</h1>
          <p className="text-muted-foreground">Manage account access and invitations</p>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subaccounts</h1>
        <p className="text-muted-foreground">Manage account access and invitations</p>
      </div>

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Manage Access
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="accessible" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            My Access
          </TabsTrigger>
        </TabsList>

        {/* Manage Access Tab */}
        <TabsContent value="manage" className="space-y-4">
          {/* Invite New Subaccount */}
          <Card>
            <CardHeader>
              <CardTitle>Invite Subaccount</CardTitle>
              <CardDescription>
                Invite someone to access your financial data. They&apos;ll have full access except for deleting user data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Enter email address..."
                      value={newInviteeEmail}
                      onChange={(e) => setNewInviteeEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleInviteSubaccount()}
                      className={checkExistingInvitation(newInviteeEmail.trim()) ? "border-yellow-300 focus:border-yellow-500" : ""}
                    />
                  </div>
                  <Button 
                    onClick={handleInviteSubaccount}
                    disabled={!newInviteeEmail.trim() || isInviting || !!checkExistingInvitation(newInviteeEmail.trim())}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {isInviting ? 'Inviting...' : 'Invite'}
                  </Button>
                </div>
                {newInviteeEmail.trim() && checkExistingInvitation(newInviteeEmail.trim()) && (
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                    ⚠ Email already invited ({checkExistingInvitation(newInviteeEmail.trim())?.status})
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Subaccounts */}
          <Card>
            <CardHeader>
              <CardTitle>Current Subaccounts</CardTitle>
              <CardDescription>
                Users who currently have access to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subaccounts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No subaccounts yet. Invite someone to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  {subaccounts.map((subaccount) => (
                    <div key={subaccount.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{subaccount.name || subaccount.email}</p>
                        {subaccount.name && (
                          <p className="text-sm text-muted-foreground">{subaccount.email}</p>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openRevokeDialog(subaccount.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="space-y-4">
          {/* Sent Invitations */}
          <Card>
            <CardHeader>
              <CardTitle>Sent Invitations</CardTitle>
              <CardDescription>
                Invitations you&apos;ve sent to others
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentInvitations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No sent invitations yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {sentInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{invitation.inviteeEmail}</p>
                        <p className="text-sm text-muted-foreground">
                          Sent on {new Date(invitation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {invitation.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRevokeInvitationDialog(invitation.id, invitation.inviteeEmail || '')}
                            disabled={isRevokingInvitation}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        {invitation.status === 'ACCEPTED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRemoveAcceptedDialog(invitation.id, invitation.inviteeEmail || '')}
                            disabled={isRemovingAccepted}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        )}
                        {invitation.status === 'DECLINED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvitation(invitation.inviteeEmail || '')}
                            disabled={isResendingInvitation}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Resend
                          </Button>
                        )}
                        <Badge className={`flex items-center gap-1 ${getStatusColor(invitation.status)}`}>
                          {getStatusIcon(invitation.status)}
                          {invitation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Received Invitations */}
          <Card>
            <CardHeader>
              <CardTitle>Received Invitations</CardTitle>
              <CardDescription>
                Invitations you&apos;ve received from others
              </CardDescription>
            </CardHeader>
            <CardContent>
              {receivedInvitations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No received invitations.
                </p>
              ) : (
                <div className="space-y-2">
                  {receivedInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">From: {invitation.inviterEmail}</p>
                        <p className="text-sm text-muted-foreground">
                          Received on {new Date(invitation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {invitation.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRespondToInvitation(invitation.id, 'ACCEPTED')}
                              disabled={isResponding}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRespondToInvitation(invitation.id, 'DECLINED')}
                              disabled={isResponding}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <>
                            {invitation.status === 'ACCEPTED' && (() => {
                              // Check if user still has access to this account
                              const hasActiveAccess = accessibleAccounts.some(
                                account => account.email === invitation.inviterEmail && !account.isOwn
                              )
                              
                              if (!hasActiveAccess) {
                                // User no longer has access - show "Request Access Again" button
                                return (
                                  <Button
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleRequestAccessAgain(invitation.inviterEmail || '')}
                                    disabled={isResendingInvitation}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Request Access Again
                                  </Button>
                                )
                              }
                              return null
                            })()}
                            <Badge className={`flex items-center gap-1 ${getStatusColor(invitation.status)}`}>
                              {getStatusIcon(invitation.status)}
                              {invitation.status}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Access Tab */}
        <TabsContent value="accessible" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts I Can Access</CardTitle>
              <CardDescription>
                All accounts you have access to, including your own
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accessibleAccounts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No accessible accounts found.
                </p>
              ) : (
                <div className="space-y-2">
                  {accessibleAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{account.name || account.email}</p>
                        {account.name && (
                          <p className="text-sm text-muted-foreground">{account.email}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={account.isOwn ? "default" : "secondary"}>
                          {account.isOwn ? "Own Account" : "Subaccount"}
                        </Badge>
                        {!account.isOwn && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openLeaveAccountDialog(account.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Leave
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Revoke Access Confirmation Dialog */}
      <ConfirmationDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        title="Revoke Access"
        description={selectedSubaccountId ? `Are you sure you want to revoke this subaccount&apos;s access to your account?` : ''}
        onConfirm={() => selectedSubaccountId && handleRevokeAccess(selectedSubaccountId)}
        isDestructive
      />

      {/* Leave Account Confirmation Dialog */}
      <ConfirmationDialog
        open={leaveAccountDialogOpen}
        onOpenChange={setLeaveAccountDialogOpen}
        title="Leave Account"
        description={selectedOwnerAccountId ? `Are you sure you want to leave this account? You will lose access to all financial data and will need to be re-invited to regain access.` : ''}
        onConfirm={() => selectedOwnerAccountId && handleLeaveAccount(selectedOwnerAccountId)}
        isDestructive
      />

      {/* Cancel Invitation Confirmation Dialog */}
      <ConfirmationDialog
        open={revokeInvitationDialogOpen}
        onOpenChange={setRevokeInvitationDialogOpen}
        title="Cancel Invitation"
        description={selectedInvitationEmail ? `Are you sure you want to cancel the invitation sent to ${selectedInvitationEmail}? This action cannot be undone and they will not be able to accept the invitation.` : ''}
        onConfirm={() => selectedInvitationId && handleRevokeInvitation(selectedInvitationId)}
        isDestructive
      />

      {/* Revoke Accepted Invitation Confirmation Dialog */}
      <ConfirmationDialog
        open={removeAcceptedDialogOpen}
        onOpenChange={setRemoveAcceptedDialogOpen}
        title="Revoke Access"
        description={selectedAcceptedInvitationEmail ? `Are you sure you want to revoke access for ${selectedAcceptedInvitationEmail}? This will revoke their access to your account and remove the invitation record. This action cannot be undone.` : ''}
        onConfirm={() => selectedAcceptedInvitationId && handleRemoveAcceptedInvitation(selectedAcceptedInvitationId)}
        isDestructive
      />
    </div>
  );
}