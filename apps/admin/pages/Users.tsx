import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from '@convex/api';
import { UserRole, User } from '@shared/types';
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
import { toaster } from '../components/ui/toaster';

const roleOptions = createListCollection({
  items: [
    { label: 'צופה', value: 'viewer' },
    { label: 'עורך', value: 'editor' },
    { label: 'מנהל', value: 'admin' },
  ],
});

export default function Users() {
  const users = useQuery(api.users.listAll);
  const isLoading = users === undefined;
  
  const deleteUserMutation = useMutation(api.users.remove);
  // Note: For now, we don't have a direct "create" in api.users since it's usually handled by Auth
  // But for Admin UI we might want to add one. For now we skip implementing the 'create' part if it requires auth complexity
  // However, update is definitely needed.
  const updateUserMutation = useMutation(api.users.update);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Create User Dialog State (Disabled functionality for now as Convex Auth handles creation)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<string>('viewer');
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit User Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserAddress, setEditUserAddress] = useState('');
  const [editUserRole, setEditUserRole] = useState<string>('viewer');
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetCreateForm = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('viewer');
    setCreateError(null);
  };

  const handleCreateUser = async () => {
    toaster.create({
      title: "יצירת משתמש מוגבלת בשלב זה",
      description: "יש להשתמש במערכת ההרשמה של האתר",
      type: "info",
    });
  };

  if (isLoading) {
    return <LoadingState message="טוען משתמשים..." />;
  }

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'מנהל';
      case 'editor':
        return 'עורך';
      default:
        return 'צופה';
    }
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.name.includes(searchTerm) || 
      user.email.includes(searchTerm) ||
      getRoleLabel(user.role || '').includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
const paginatedUsers = filteredUsers.slice(
      (currentPage - 1) * usersPerPage,
      currentPage * usersPerPage
    ) as User[];

  const handleDelete = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      setIsDeleting(true);
      try {
        await deleteUserMutation({ userId: userToDelete as any });
        toaster.create({
          title: "משתמש נמחק בהצלחה",
          type: "success",
        });
      } catch (error) {
        toaster.create({
          title: "שגיאה במחיקת משתמש",
          type: "error",
        });
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map(u => u._id));
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
    const user = users?.find(u => u._id === userId);
    if (user) {
      setEditingUser(userId);
      setEditUserName(user.name);
      setEditUserEmail(user.email);
      setEditUserPhone(user.phone || '');
      setEditUserAddress(''); // Address is in a separate table in Convex
      setEditUserRole(user.role || 'viewer');
      setEditError(null);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editUserName || !editUserEmail) {
      setEditError('נא למלא שדות חובה');
      return;
    }

    setIsUpdating(true);
    try {
      await updateUserMutation({
        userId: editingUser as any,
        name: editUserName,
        email: editUserEmail,
        phone: editUserPhone,
        role: editUserRole as any,
      });
      
      toaster.create({
        title: "משתמש עודכן בהצלחה",
        type: "success",
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      setEditError('שגיאה בעדכון משתמש');
    } finally {
      setIsUpdating(false);
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
                    loading={false}
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
