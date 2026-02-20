// @ts-nocheck
// Type instantiation depth issues with Convex useMutation API
// This file compiles correctly at runtime but TypeScript cannot fully verify it

import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@convex/api';
import { Id } from '@convex/dataModel';
import { User, UserRole } from '@shared/types';
import { toaster } from '../components/ui/toaster';

// Create dialog form data
interface CreateFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Edit dialog form data
interface EditFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
}

// Create dialog state
interface CreateDialogState {
  isOpen: boolean;
  formData: CreateFormData;
  error: string | null;
  isSubmitting: boolean;
}

// Edit dialog state
interface EditDialogState {
  isOpen: boolean;
  userId: string | null;
  formData: EditFormData;
  error: string | null;
  isSubmitting: boolean;
}

// Delete dialog state
interface DeleteDialogState {
  isOpen: boolean;
  userId: string | null;
  isSubmitting: boolean;
}

export interface UseUserDialogsReturn {
  create: {
    isOpen: boolean;
    formData: CreateFormData;
    error: string | null;
    isSubmitting: boolean;
    open: () => void;
    close: () => void;
    setField: <K extends keyof CreateFormData>(field: K, value: CreateFormData[K]) => void;
    reset: () => void;
    submit: () => Promise<void>;
  };
  edit: {
    isOpen: boolean;
    userId: string | null;
    formData: EditFormData;
    error: string | null;
    isSubmitting: boolean;
    open: (user: User) => void;
    close: () => void;
    setField: <K extends keyof EditFormData>(field: K, value: EditFormData[K]) => void;
    reset: () => void;
    submit: () => Promise<void>;
  };
  delete: {
    isOpen: boolean;
    userId: string | null;
    isSubmitting: boolean;
    open: (userId: string) => void;
    close: () => void;
    confirm: () => Promise<void>;
  };
}

// Helper to validate Convex ID format
const isValidConvexId = (id: string, tableName: string): boolean => {
  return typeof id === 'string' && id.startsWith(`${tableName}:`) && id.length > tableName.length + 10;
};

// Helper to safely cast Convex ID
const asUserId = (id: string): Id<'users'> | null => {
  return isValidConvexId(id, 'users') ? (id as Id<'users'>) : null;
};

const DEFAULT_CREATE_FORM: CreateFormData = {
  name: '',
  email: '',
  password: '',
  role: 'viewer' as UserRole,
};

const DEFAULT_EDIT_FORM: EditFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  role: 'viewer' as UserRole,
};

export function useUserDialogs(): UseUserDialogsReturn {
  // Convex mutations
  const createUserMutation = useMutation(api.users.create);
  const updateUserMutation = useMutation(api.users.update);
  const deleteUserMutation = useMutation(api.users.remove);

  // Create dialog state
  const [createState, setCreateState] = useState<CreateDialogState>({
    isOpen: false,
    formData: { ...DEFAULT_CREATE_FORM },
    error: null,
    isSubmitting: false,
  });

  // Edit dialog state
  const [editState, setEditState] = useState<EditDialogState>({
    isOpen: false,
    userId: null,
    formData: { ...DEFAULT_EDIT_FORM },
    error: null,
    isSubmitting: false,
  });

  // Delete dialog state
  const [deleteState, setDeleteState] = useState<DeleteDialogState>({
    isOpen: false,
    userId: null,
    isSubmitting: false,
  });

  // Create dialog actions
  const openCreateDialog = useCallback(() => {
    setCreateState({
      isOpen: true,
      formData: { ...DEFAULT_CREATE_FORM },
      error: null,
      isSubmitting: false,
    });
  }, []);

  const closeCreateDialog = useCallback(() => {
    setCreateState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const setCreateFormField = useCallback(<K extends keyof CreateFormData>(field: K, value: CreateFormData[K]) => {
    setCreateState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }));
  }, []);

  const resetCreateForm = useCallback(() => {
    setCreateState((prev) => ({
      ...prev,
      formData: { ...DEFAULT_CREATE_FORM },
      error: null,
    }));
  }, []);

  const submitCreate = useCallback(async () => {
    // Note: User creation is typically handled by auth system
    // This shows an info message for now
    toaster.create({
      title: 'יצירת משתמש מוגבלת בשלב זה',
      description: 'יש להשתמש במערכת ההרשמה של האתר',
      type: 'info',
    });
    closeCreateDialog();
  }, [closeCreateDialog]);

  // Edit dialog actions
  const openEditDialog = useCallback((user: User) => {
    setEditState({
      isOpen: true,
      userId: user._id,
      formData: {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: '', // Address is in a separate table in Convex
        role: (user.role as UserRole) || 'viewer',
      },
      error: null,
      isSubmitting: false,
    });
  }, []);

  const closeEditDialog = useCallback(() => {
    setEditState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const setEditFormField = useCallback(<K extends keyof EditFormData>(field: K, value: EditFormData[K]) => {
    setEditState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }));
  }, []);

  const resetEditForm = useCallback(() => {
    setEditState((prev) => ({
      ...prev,
      formData: { ...DEFAULT_EDIT_FORM },
      error: null,
    }));
  }, []);

  const submitEdit = useCallback(async () => {
    if (!editState.userId || !editState.formData.name || !editState.formData.email) {
      setEditState((prev) => ({ ...prev, error: 'נא למלא שדות חובה' }));
      return;
    }

    setEditState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const validUserId = asUserId(editState.userId);
      if (!validUserId) throw new Error('Invalid user ID');

      await updateUserMutation({
        userId: validUserId,
        name: editState.formData.name,
        email: editState.formData.email,
        phone: editState.formData.phone,
        role: editState.formData.role,
      });

      toaster.create({
        title: 'משתמש עודכן בהצלחה',
        type: 'success',
      });

      closeEditDialog();
    } catch (error: any) {
      setEditState((prev) => ({
        ...prev,
        error: 'שגיאה בעדכון משתמש',
        isSubmitting: false,
      }));
    }
  }, [editState, updateUserMutation, closeEditDialog]);

  // Delete dialog actions
  const openDeleteDialog = useCallback((userId: string) => {
    setDeleteState({
      isOpen: true,
      userId,
      isSubmitting: false,
    });
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteState({ isOpen: false, userId: null, isSubmitting: false });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteState.userId) return;

    setDeleteState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const validUserId = asUserId(deleteState.userId);
      if (!validUserId) throw new Error('Invalid user ID');

      await deleteUserMutation({ userId: validUserId });

      toaster.create({
        title: 'משתמש נמחק בהצלחה',
        type: 'success',
      });

      closeDeleteDialog();
    } catch (error: any) {
      toaster.create({
        title: 'שגיאה במחיקת משתמש',
        type: 'error',
      });
      setDeleteState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [deleteState.userId, deleteUserMutation, closeDeleteDialog]);

  return {
    create: {
      isOpen: createState.isOpen,
      formData: createState.formData,
      error: createState.error,
      isSubmitting: createState.isSubmitting,
      open: openCreateDialog,
      close: closeCreateDialog,
      setField: setCreateFormField,
      reset: resetCreateForm,
      submit: submitCreate,
    },
    edit: {
      isOpen: editState.isOpen,
      userId: editState.userId,
      formData: editState.formData,
      error: editState.error,
      isSubmitting: editState.isSubmitting,
      open: openEditDialog,
      close: closeEditDialog,
      setField: setEditFormField,
      reset: resetEditForm,
      submit: submitEdit,
    },
    delete: {
      isOpen: deleteState.isOpen,
      userId: deleteState.userId,
      isSubmitting: deleteState.isSubmitting,
      open: openDeleteDialog,
      close: closeDeleteDialog,
      confirm: confirmDelete,
    },
  };
}
