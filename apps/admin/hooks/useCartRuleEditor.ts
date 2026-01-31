import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';
import { Id } from '@convex/dataModel';

import { CartRuleType, CartRuleStatus } from '@shared/types';

interface CartRuleForm {
  name: string;
  description: string;
  status: CartRuleStatus;
  ruleType: 'buy_x_get_y' | 'bulk_discount';
  type: CartRuleType;
  config: any;
}

interface UseCartRuleEditorProps {
  id?: string;
}

export function useCartRuleEditor({ id }: UseCartRuleEditorProps) {
  const navigate = useNavigate();
  const isEditMode = !!id;

  // API queries and mutations
  const cartRule = useQuery(api.cartRules.getById, id ? { id: id as Id<'cartRules'> } : 'skip');
  const isLoadingCartRule = id ? cartRule === undefined : false;
  
  const createCartRule = useMutation(api.cartRules.create);
  const updateCartRule = useMutation(api.cartRules.update);
  const deleteCartRuleMutation = useMutation(api.cartRules.remove);

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const existingCartRule = isEditMode ? cartRule : null;

  // Form setup
  const form = useForm<CartRuleForm>({
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
      ruleType: 'buy_x_get_y',
      config: {},
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
        status: existingCartRule.status,
        ruleType: existingCartRule.ruleType,
        config: existingCartRule.config || {},
      });
      setHasLoadedData(true);
    }
  }, [existingCartRule, hasLoadedData, reset]);

  // Submit handler
  const onSubmit = async (data: CartRuleForm) => {
    try {
      if (isEditMode && id) {
        setIsUpdating(true);
        await updateCartRule({
          id: id as Id<'cartRules'>,
          name: data.name,
          description: data.description,
          status: data.status,
          ruleType: data.ruleType,
          config: data.config,
        });
      } else {
        setIsCreating(true);
        await createCartRule({
          name: data.name,
          description: data.description,
          status: data.status,
          ruleType: data.ruleType,
          config: data.config,
        });
      }
      navigate('/cart-rules');
    } catch (err) {
      console.error('Error saving cart rule:', err);
    } finally {
      setIsUpdating(false);
      setIsCreating(false);
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
      setIsDeleting(true);
      await deleteCartRuleMutation({ id: id as Id<'cartRules'> });
      navigate('/cart-rules');
    } catch (err) {
      console.error('Error deleting cart rule:', err);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
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

