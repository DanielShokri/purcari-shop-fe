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
  ruleType: 'buy_x_get_y' | 'bulk_discount' | 'shipping';
  value?: number;
  getQuantity?: number;
  priority?: number;
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
      value: undefined,
      getQuantity: 1,
      priority: 10,
      config: {},
    },
  });

  const { handleSubmit, reset } = form;

  // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Extract value from config for edit mode
  const extractValueFromConfig = (config: any, ruleType: string): { value?: number; getQuantity?: number } => {
    if (!config) return { value: undefined, getQuantity: undefined };
    if (ruleType === 'shipping') return { value: config.minOrderAmount };
    if (ruleType === 'bulk_discount') return { value: config.discountPercentage };
    if (ruleType === 'buy_x_get_y') return { value: config.buyQuantity, getQuantity: config.getQuantity };
    return { value: undefined, getQuantity: undefined };
  };

  // Reset form when cart rule data loads (only once)
  useEffect(() => {
    if (existingCartRule && !hasLoadedData) {
      const extracted = extractValueFromConfig(existingCartRule.config, existingCartRule.ruleType);
      reset({
        name: existingCartRule.name,
        description: existingCartRule.description || '',
        status: existingCartRule.status,
        ruleType: existingCartRule.ruleType,
        priority: existingCartRule.priority,
        value: extracted.value,
        getQuantity: extracted.getQuantity,
        config: existingCartRule.config || {},
      });
      setHasLoadedData(true);
    }
  }, [existingCartRule, hasLoadedData, reset]);

  // Submit handler
  const onSubmit = async (data: CartRuleForm) => {
    try {
      const config = buildConfig(data.ruleType, data.value, data.getQuantity);
      const priorityValue = data.priority ? Number(data.priority) : 10;

      if (isEditMode && id) {
        setIsUpdating(true);
        await updateCartRule({
          id: id as Id<'cartRules'>,
          name: data.name,
          description: data.description,
          status: data.status,
          ruleType: data.ruleType,
          config,
          priority: priorityValue,
        });
      } else {
        setIsCreating(true);
        await createCartRule({
          name: data.name,
          description: data.description,
          status: data.status,
          ruleType: data.ruleType,
          config,
          priority: priorityValue,
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

  const buildConfig = (ruleType: string, value: number | undefined, getQuantity: number | undefined) => {
    if (ruleType === 'buy_x_get_y') {
      return {
        type: 'buy_x_get_y' as const,
        buyQuantity: Math.floor(value || 1),
        getQuantity: Math.floor(getQuantity || 1),
      };
    }
    if (ruleType === 'shipping') {
      return {
        type: 'shipping' as const,
        minOrderAmount: value || 0,
      };
    }
    return {
      type: 'bulk_discount' as const,
      minQuantity: Math.floor(value || 1),
      discountPercentage: value || 0,
    };
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

