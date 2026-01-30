import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  useGetCartRuleByIdQuery,
  useCreateCartRuleMutation,
  useUpdateCartRuleMutation,
  useDeleteCartRuleMutation,
} from '../services/api';
import { CartRule, CartRuleStatus, CartRuleType } from '../types';

interface UseCartRuleEditorProps {
  id?: string;
}

export function useCartRuleEditor({ id }: UseCartRuleEditorProps) {
  const navigate = useNavigate();
  const isEditMode = !!id;

  // API queries and mutations
  const { data: cartRule, isLoading: isLoadingCartRule } = useGetCartRuleByIdQuery(id || '', { skip: !id });
  const [createCartRule, { isLoading: isCreating }] = useCreateCartRuleMutation();
  const [updateCartRule, { isLoading: isUpdating }] = useUpdateCartRuleMutation();
  const [deleteCartRule, { isLoading: isDeleting }] = useDeleteCartRuleMutation();

  const existingCartRule = isEditMode ? cartRule : null;

  // Form setup
  const form = useForm<Partial<CartRule>>({
    defaultValues: {
      name: '',
      description: '',
      type: CartRuleType.SHIPPING,
      priority: 10,
      status: CartRuleStatus.ACTIVE,
      value: undefined,
    },
  });

  const { handleSubmit, reset } = form;

  // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Reset form when cart rule data loads (only once)
  useEffect(() => {
    if (existingCartRule && !hasLoadedData) {
      reset({
        name: existingCartRule.name,
        description: existingCartRule.description || '',
        type: existingCartRule.type,
        priority: existingCartRule.priority,
        status: existingCartRule.status,
        value: existingCartRule.value ?? undefined,
      });
      setHasLoadedData(true);
    }
  }, [existingCartRule, hasLoadedData, reset]);

  // Submit handler
  const onSubmit = async (data: Partial<CartRule>) => {
    try {
      // Handle NaN values from valueAsNumber
      const priority = typeof data.priority === 'number' && !isNaN(data.priority) ? data.priority : 10;
      const value = typeof data.value === 'number' && !isNaN(data.value) ? data.value : null;

      const cartRuleData = {
        name: data.name || '',
        description: data.description || null,
        type: data.type || CartRuleType.SHIPPING,
        priority,
        status: data.status || CartRuleStatus.ACTIVE,
        value,
      };

      if (isEditMode && id) {
        await updateCartRule({ id, ...cartRuleData }).unwrap();
      } else {
        await createCartRule(cartRuleData).unwrap();
      }
      navigate('/cart-rules');
    } catch {
      // Error handled by RTK Query
    }
  };

  // Action handlers
  const handleSave = () => {
    handleSubmit(onSubmit)();
  };

  const handleCancel = () => {
    navigate('/cart-rules');
  };

  const handleDelete = () => {
    if (!id) return;
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    try {
      await deleteCartRule(id).unwrap();
      navigate('/cart-rules');
    } catch {
      setDeleteDialogOpen(false);
    }
  };

  return {
    form,
    state: {
      isEditMode,
      isLoadingCartRule,
      isCreating,
      isUpdating,
      isDeleting,
      deleteDialogOpen,
      cartRuleNotFound: isEditMode && !isLoadingCartRule && !cartRule,
    },
    handlers: {
      handleSave,
      handleCancel,
      handleDelete,
      handleConfirmDelete,
      setDeleteDialogOpen,
    },
  };
}
