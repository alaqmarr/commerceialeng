import React from 'react';
import { AdminUserManager } from '@/modules/users/components/admin-user-manager.component';

export const metadata = { title: 'User Management - Admin Console' };

export default function AdminUsersPage() {
  return <AdminUserManager />;
}
