import React, { useState } from 'react';
import { useGetUsersQuery, useDeleteUserMutation } from '../services/api';
import { UserRole } from '../types';
import { VStack } from '@chakra-ui/react';
import { LoadingState, PageHeader, Breadcrumbs } from '../components/shared';
import { UsersFilterToolbar, UsersTable } from '../components/users';

export default function Users() {
  const { data: users, isLoading } = useGetUsersQuery(undefined);
  const [deleteUser] = useDeleteUserMutation();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  if (isLoading) {
    return <LoadingState message="טוען משתמשים..." />;
  }

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return 'מנהל';
      case UserRole.EDITOR:
        return 'עורך';
      default:
        return 'צופה';
    }
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.name.includes(searchTerm) || 
      user.email.includes(searchTerm) ||
      getRoleLabel(user.role).includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) {
      await deleteUser(id);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map(u => u.$id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleEdit = (userId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit user:', userId);
  };

  return (
    <VStack gap="0" align="stretch" h="full">
      <Breadcrumbs items={[{ label: 'בית', href: '#' }, { label: 'משתמשים' }]} />

      <PageHeader
        title="ניהול משתמשים"
        subtitle="צפייה וניהול של כל המשתמשים במערכת"
        actionLabel="הוסף משתמש"
        actionIcon="add"
        onAction={() => console.log('Add user')}
      />

      <UsersFilterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <UsersTable
        users={paginatedUsers}
        selectedUsers={selectedUsers}
        onSelectAll={handleSelectAll}
        onSelectUser={handleSelectUser}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredUsers.length}
        itemsPerPage={usersPerPage}
        onPageChange={setCurrentPage}
      />
    </VStack>
  );
}
