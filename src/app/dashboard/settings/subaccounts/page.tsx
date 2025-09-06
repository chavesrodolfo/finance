"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Mail, Clock, Check, X, UserPlus, Users } from "lucide-react";
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

  const handleInviteSubaccount = async () => {
    if (!newInviteeEmail.trim() || !user?.primaryEmail) return;

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
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation",
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
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address..."
                  value={newInviteeEmail}
                  onChange={(e) => setNewInviteeEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInviteSubaccount()}
                />
                <Button 
                  onClick={handleInviteSubaccount}
                  disabled={!newInviteeEmail.trim() || isInviting}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {isInviting ? 'Inviting...' : 'Invite'}
                </Button>
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
                      <Badge className={`flex items-center gap-1 ${getStatusColor(invitation.status)}`}>
                        {getStatusIcon(invitation.status)}
                        {invitation.status}
                      </Badge>
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
                          <Badge className={`flex items-center gap-1 ${getStatusColor(invitation.status)}`}>
                            {getStatusIcon(invitation.status)}
                            {invitation.status}
                          </Badge>
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
    </div>
  );
}