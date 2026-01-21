import React, { useState } from 'react';
import { useGetUsersQuery, useDeleteUserMutation, useCreateUserMutation, useUpdateUserMutation } from '../services/api';
import { UserRole } from '../types';
import { 
  VStack, 
  Dialog, 
  Portal, 
  Button, 
  CloseButton, 
  Field, 
  Input, 
  Stack,
  Select,
  createListCollection,
} from '@chakra-ui/react';
import { LoadingState, PageHeader, Breadcrumbs, DeleteConfirmationDialog } from '../components/shared';
import { UsersFilterToolbar, UsersTable } from '../components/users';

const roleOptions = createListCollection({
  items: [
    { label: 'צופה', value: UserRole.VIEWER },
    { label: 'עורך', value: UserRole.EDITOR },
    { label: 'מנהל', value: UserRole.ADMIN },
  ],
});

export default function Users() {
  const { data: users, isLoading } = useGetUsersQuery(undefined);
  const [deleteUser] = useDeleteUserMutation();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Create User Dialog State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.VIEWER);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit User Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserAddress, setEditUserAddress] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserRole>(UserRole.VIEWER);
  const [editError, setEditError] = useState<string | null>(null);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const resetCreateForm = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole(UserRole.VIEWER);
    setCreateError(null);
  };

  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail || !newUserPassword) {
      setCreateError('נא למלא את כל השדות');
      return;
    }
    
    if (newUserPassword.length < 8) {
      setCreateError('הסיסמה חייבת להכיל לפחות 8 תווים');
      return;
    }

    try {
      await createUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      }).unwrap();
      
      setIsCreateDialogOpen(false);
      resetCreateForm();
    } catch (error: any) {
      setCreateError(error || 'שגיאה ביצירת משתמש');
    }
  };

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

  const handleDelete = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
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
    const user = users?.find(u => u.$id === userId);
    if (user) {
      setEditingUser(userId);
      setEditUserName(user.name);
      setEditUserEmail(user.email);
      setEditUserPhone(user.phone || '');
      setEditUserAddress(user.address || '');
      setEditUserRole(user.role);
      setEditError(null);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editUserName || !editUserEmail) {
      setEditError('נא למלא שדות חובה');
      return;
    }

    try {
      await updateUser({
        id: editingUser,
        name: editUserName,
        email: editUserEmail,
        phone: editUserPhone,
        address: editUserAddress,
        role: editUserRole,
      }).unwrap();
      
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      setEditError(error || 'שגיאה בעדכון משתמש');
    }
  };

  return (
    <VStack gap="0" align="stretch" h="full">
      <Breadcrumbs items={[{ label: 'בית', href: '#' }, { label: 'משתמשים' }]} />

      <PageHeader
        title="ניהול משתמשים"
        subtitle="צפייה וניהול של כל המשתמשים במערכת"
        actionLabel="הוסף משתמש"
        actionIcon="add"
        onAction={() => {
          resetCreateForm();
          setIsCreateDialogOpen(true);
        }}
      />

      {/* Create User Dialog */}
      <Dialog.Root 
        lazyMount 
        open={isCreateDialogOpen} 
        onOpenChange={(e) => setIsCreateDialogOpen(e.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>הוספת משתמש חדש</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pb="4">
                <Stack gap="4">
                  <Field.Root required>
                    <Field.Label>שם מלא</Field.Label>
                    <Input 
                      placeholder="הזן שם מלא" 
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>אימייל</Field.Label>
                    <Input 
                      type="email"
                      dir="ltr"
                      placeholder="user@example.com" 
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>סיסמה</Field.Label>
                    <Input 
                      type="password"
                      dir="ltr"
                      placeholder="לפחות 8 תווים" 
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>תפקיד</Field.Label>
                    <Select.Root
                      collection={roleOptions}
                      value={[newUserRole]}
                      onValueChange={(e) => setNewUserRole(e.value[0] as UserRole)}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="בחר תפקיד" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
                          {roleOptions.items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>
                  </Field.Root>
                  {createError && (
                    <Field.Root invalid>
                      <Field.ErrorText>{createError}</Field.ErrorText>
                    </Field.Root>
                  )}
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">ביטול</Button>
                </Dialog.ActionTrigger>
                <Button 
                  colorPalette="blue" 
                  onClick={handleCreateUser}
                  loading={isCreating}
                >
                  צור משתמש
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Edit User Dialog */}
      <Dialog.Root 
        lazyMount 
        open={isEditDialogOpen} 
        onOpenChange={(e) => setIsEditDialogOpen(e.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>עריכת משתמש</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pb="4">
                <Stack gap="4">
                  <Field.Root required>
                    <Field.Label>שם מלא</Field.Label>
                    <Input 
                      placeholder="הזן שם מלא" 
                      value={editUserName}
                      onChange={(e) => setEditUserName(e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>אימייל</Field.Label>
                    <Input 
                      type="email"
                      dir="ltr"
                      placeholder="user@example.com" 
                      value={editUserEmail}
                      onChange={(e) => setEditUserEmail(e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>טלפון</Field.Label>
                    <Input 
                      type="tel"
                      dir="ltr"
                      placeholder="הזן מספר טלפון" 
                      value={editUserPhone}
                      onChange={(e) => setEditUserPhone(e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>כתובת</Field.Label>
                    <Input 
                      placeholder="הזן כתובת מלאה" 
                      value={editUserAddress}
                      onChange={(e) => setEditUserAddress(e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>תפקיד</Field.Label>
                    <Select.Root
                      collection={roleOptions}
                      value={[editUserRole]}
                      onValueChange={(e) => setEditUserRole(e.value[0] as UserRole)}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="בחר תפקיד" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
                          {roleOptions.items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>
                  </Field.Root>
                  {editError && (
                    <Field.Root invalid>
                      <Field.ErrorText>{editError}</Field.ErrorText>
                    </Field.Root>
                  )}
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">ביטול</Button>
                </Dialog.ActionTrigger>
                <Button 
                  colorPalette="blue" 
                  onClick={handleUpdateUser}
                  loading={isUpdating}
                >
                  שמור שינויים
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

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

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="מחיקת משתמש"
        message="האם אתה בטוח שברצונך למחוק משתמש זה? פעולה זו לא ניתנת לביטול."
      />
    </VStack>
  );
}
