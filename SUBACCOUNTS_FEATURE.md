# Subaccounts Feature Implementation

## Overview
The subaccounts feature allows users to share access to their financial data with other users while maintaining control over what can be accessed. This is useful for financial advisors, family members, or business partners who need to view or manage someone else's financial information.

## Key Features

### 1. Invitation System
- **Send Invitations**: Users can invite others by email from Settings > Subaccounts
- **Accept/Decline**: Invited users can accept or decline invitations
- **Status Tracking**: All invitations are tracked with status (PENDING, ACCEPTED, DECLINED, EXPIRED)

### 2. Account Switching
- **Account Switcher**: Top-right corner of dashboard shows available accounts
- **Multiple Access**: One user can be a subaccount for multiple account owners
- **Multiple Subaccounts**: One account owner can have multiple subaccounts

### 3. Data Access & Permissions
- **Full Read/Write Access**: Subaccounts can view and manage all financial data (transactions, budgets, investments, etc.)
- **Restricted Deletion**: Subaccounts CANNOT delete user data (enforced at API level)
- **Context-Aware**: All data operations are scoped to the currently selected account

### 4. Security
- **Permission Verification**: All API calls verify access rights before returning data
- **Access Control**: Subaccounts can only access accounts they've been explicitly granted access to
- **Audit Trail**: All subaccount activities are logged with proper user attribution

## Technical Implementation

### Database Schema
```sql
-- Tracks invitation status between users
SubaccountInvitation {
  id, inviterEmail, inviteeEmail, status, inviterId, inviteeId, createdAt, updatedAt
}

-- Manages actual access relationships
SubaccountAccess {
  id, ownerId, subaccountId, createdAt, updatedAt
}
```

### API Endpoints
- `/api/subaccounts/invite` - Send invitations
- `/api/subaccounts/invitations` - Manage invitations  
- `/api/subaccounts/accessible` - Get accessible accounts
- `/api/subaccounts/revoke` - Revoke access

### Account-Aware API System
- **useAccountAwareApi Hook**: Automatically adds target account context to API calls
- **Account Context Provider**: Manages current account state across the application
- **Dynamic Data Loading**: All pages automatically refresh when switching accounts

## User Workflow

### For Account Owners:
1. Go to Settings > Subaccounts
2. Enter email address to invite
3. Manage existing subaccounts and revoke access as needed
4. View sent/received invitations and their status

### For Subaccounts:
1. Receive invitation email notification (implementation pending)
2. Accept/decline invitation from Settings > Subaccounts  
3. Use account switcher to switch between own account and accessible accounts
4. View and manage data for the selected account
5. Cannot delete user data (enforced restriction)

## Pages Updated for Multi-Account Support
- ✅ Dashboard (`/dashboard`)
- ✅ Transactions (`/dashboard/transactions`)
- ✅ New Transaction (`/dashboard/transactions/new`)
- ✅ Budget (`/dashboard/budget`)
- ✅ Reports (`/dashboard/reports`)
- ✅ Investments (`/dashboard/investments`)
- ⚠️ Settings/Configuration (needs updating)

## Next Steps
1. Update remaining pages (Settings/Configuration)
2. Add email notification system for invitations
3. Add activity logging for subaccount actions
4. Add more granular permissions (view-only vs full access)
5. Add bulk operations for multiple subaccount management