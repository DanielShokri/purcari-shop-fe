// @ts-nocheck
// Type instantiation depth issues with Convex useQuery API
// This file compiles correctly at runtime but TypeScript cannot fully verify it

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';
import { Id } from '@convex/dataModel';
import { Coupon, CouponStatus, CouponDiscountType } from '@shared/types';

export interface UseCouponEditorReturn {
  // Form
  register: any;
  handleSubmit: any;
  formState: any;
  setValue: any;
  watch: any;
  control: any;
  
  // Data
  existingCoupon: Coupon | null;
  categoriesList: any;
  productsList: any;
  isEditMode: boolean;
  id: string | undefined;
  
  // State
  selectedCategoryIds: string[];
  setSelectedCategoryIds: (ids: string[]) => void;
  selectedProductIds: string[];
  setSelectedProductIds: (ids: string[]) => void;
  categoryInput: string;
  setCategoryInput: (value: string) => void;
  productInput: string;
  setProductInput: (value: string) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  isLoading: boolean;
  
  // Validation
  getDiscountValueValidation: () => any;
  validateEndDate: (value: string | undefined) => string | boolean;
  validateBuyQuantity: (value: number | undefined) => string | boolean;
  validateGetQuantity: (value: number | undefined) => string | boolean;
  validateCodeUniqueness: (value: string) => string | boolean;
  
  // Handlers
  onSubmit: (data: Partial<Coupon>) => Promise<void>;
  handleSave: () => void;
  handleCancel: () => void;
  handleDelete: () => void;
  handleConfirmDelete: () => Promise<void>;
  handleGenerateCode: () => void;
  handleAddCategory: () => void;
  handleRemoveCategory: (categoryId: string) => void;
  handleAddProduct: () => void;
  handleRemoveProduct: (productId: string) => void;
  
  // Watched values
  discountType: CouponDiscountType;
  startDate: string | undefined;
}

export function useCouponEditor(): UseCouponEditorReturn {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const couponsData = useQuery(api.coupons.list, {});
  const couponData = useQuery(api.coupons.get, id ? { id: id as Id<"coupons"> } : "skip");
  const categoriesList = useQuery(api.categories.list, { includeInactive: true });
  const productsList = useQuery(api.products.list, {});
  
  const createMutation = useMutation(api.coupons.create);
  const updateMutation = useMutation(api.coupons.update);
  const deleteMutation = useMutation(api.coupons.remove);

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const existingCoupon = useMemo(() => {
    if (!isEditMode || !couponData) return null;
    return {
      ...couponData,
      $id: couponData._id,
      discountValue: Number(couponData.discountValue),
      usageCount: Number(couponData.usageCount),
      buyQuantity: couponData.buyQuantity ? Number(couponData.buyQuantity) : undefined,
      getQuantity: couponData.getQuantity ? Number(couponData.getQuantity) : undefined,
      usageLimit: couponData.usageLimit ? Number(couponData.usageLimit) : undefined,
      usageLimitPerUser: couponData.usageLimitPerUser ? Number(couponData.usageLimitPerUser) : undefined,
      minimumOrder: couponData.minimumOrder ? Number(couponData.minimumOrder) : undefined,
      maximumDiscount: couponData.maximumDiscount ? Number(couponData.maximumDiscount) : undefined,
    } as unknown as Coupon;
  }, [isEditMode, couponData]);

  // Check for duplicate coupon code
  const validateCodeUniqueness = useCallback((value: string) => {
    if (!couponsData || !value) return true;
    const normalizedValue = value.toUpperCase().trim();
    const existing = couponsData.find(c => 
      c.code.toUpperCase().trim() === normalizedValue && 
      (!isEditMode || c._id !== id)
    );
    return !existing || 'קוד קופון זה כבר קיים במערכת';
  }, [couponsData, isEditMode, id]);

  const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm<Partial<Coupon>>({
    defaultValues: existingCoupon || {
      code: '',
      description: '',
      discountType: CouponDiscountType.PERCENTAGE,
      discountValue: 0,
      status: CouponStatus.ACTIVE,
      usageCount: 0,
      startDate: new Date().toISOString().split('T')[0],
      firstPurchaseOnly: false,
      excludeOtherCoupons: false,
    },
  });

  const discountType = watch('discountType');
  const startDate = watch('startDate');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Validation helper
  const getDiscountValueValidation = useCallback(() => {
    const base = { 
      required: 'שדה חובה',
      valueAsNumber: true,
      min: { value: 0, message: 'ערך חיובי בלבד' }
    };
    
    if (discountType === CouponDiscountType.PERCENTAGE) {
      return {
        ...base,
        min: { value: 1, message: 'אחוז הנחה חייב להיות לפחות 1%' },
        max: { value: 100, message: 'אחוז לא יכול לעבור 100%' }
      };
    }
    
    if (discountType === CouponDiscountType.FIXED_AMOUNT) {
      return {
        ...base,
        min: { value: 0.01, message: 'סכום ההנחה חייב להיות גדול מ-0' }
      };
    }
    
    return base;
  }, [discountType]);

  const validateEndDate = useCallback((value: string | undefined) => {
    if (!value) return 'תאריך סיום הוא שדה חובה';
    if (!startDate) return true;
    return new Date(value) > new Date(startDate) || 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה';
  }, [startDate]);

  const validateBuyQuantity = useCallback((value: number | undefined) => {
    if (discountType !== CouponDiscountType.BUY_X_GET_Y) return true;
    return (value && value > 0) || 'חובה להזין כמות לקנייה';
  }, [discountType]);

  const validateGetQuantity = useCallback((value: number | undefined) => {
    if (discountType !== CouponDiscountType.BUY_X_GET_Y) return true;
    return (value && value > 0) || 'חובה להזין כמות לקבלה';
  }, [discountType]);

  useEffect(() => {
    if (existingCoupon?.categoryIds) {
      setSelectedCategoryIds(existingCoupon.categoryIds);
    }
    if (existingCoupon?.productIds) {
      setSelectedProductIds(existingCoupon.productIds);
    }
  }, [existingCoupon]);

  const [categoryInput, setCategoryInput] = useState('');
  const [productInput, setProductInput] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Update form when existingCoupon changes
  useEffect(() => {
    if (existingCoupon) {
      setValue('code', existingCoupon.code);
      setValue('description', existingCoupon.description || '');
      setValue('discountType', existingCoupon.discountType);
      setValue('discountValue', existingCoupon.discountValue);
      setValue('buyQuantity', existingCoupon.buyQuantity);
      setValue('getQuantity', existingCoupon.getQuantity);
      setValue('startDate', existingCoupon.startDate.split('T')[0]);
      setValue('endDate', existingCoupon.endDate?.split('T')[0] || '');
      setValue('minimumOrder', existingCoupon.minimumOrder);
      setValue('maximumDiscount', existingCoupon.maximumDiscount);
      setValue('usageLimit', existingCoupon.usageLimit);
      setValue('usageLimitPerUser', existingCoupon.usageLimitPerUser);
      setValue('status', existingCoupon.status);
      setValue('firstPurchaseOnly', existingCoupon.firstPurchaseOnly || false);
      setValue('excludeOtherCoupons', existingCoupon.excludeOtherCoupons || false);
    }
  }, [existingCoupon, setValue]);

  const onSubmit = useCallback(async (data: Partial<Coupon>) => {
    try {
      if (isEditMode) setIsUpdating(true);
      else setIsCreating(true);

      const payload = {
        code: data.code || '',
        description: data.description || undefined,
        discountType: data.discountType || CouponDiscountType.PERCENTAGE,
        discountValue: Number(data.discountValue) || 0,
        buyQuantity: data.buyQuantity ? Number(data.buyQuantity) : undefined,
        getQuantity: data.getQuantity ? Number(data.getQuantity) : undefined,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        minimumOrder: data.minimumOrder ? Number(data.minimumOrder) : undefined,
        maximumDiscount: data.maximumDiscount ? Number(data.maximumDiscount) : undefined,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
        usageLimitPerUser: data.usageLimitPerUser ? Number(data.usageLimitPerUser) : undefined,
        categoryIds: selectedCategoryIds,
        productIds: selectedProductIds,
        firstPurchaseOnly: data.firstPurchaseOnly || false,
        excludeOtherCoupons: data.excludeOtherCoupons || false,
        status: (data.status as "active" | "paused" | "expired" | "scheduled") || "active",
      };
      
      if (isEditMode && id) {
        await updateMutation({ id: id as Id<"coupons">, ...payload });
      } else {
        await createMutation(payload);
      }
      navigate('/coupons');
    } catch (error) {
      console.error("Failed to save coupon:", error);
    } finally {
      setIsCreating(false);
      setIsUpdating(false);
    }
  }, [isEditMode, id, selectedCategoryIds, selectedProductIds, createMutation, updateMutation, navigate]);

  const handleSave = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleCancel = useCallback(() => {
    navigate('/coupons');
  }, [navigate]);

  const handleDelete = useCallback(() => {
    if (!id) return;
    setDeleteDialogOpen(true);
  }, [id]);

  const handleConfirmDelete = useCallback(async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await deleteMutation({ id: id as Id<"coupons"> });
      navigate('/coupons');
    } catch {
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }, [id, deleteMutation, navigate]);

  const handleGenerateCode = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('code', code);
  }, [setValue]);

  const handleAddCategory = useCallback(() => {
    if (categoryInput.trim() && !selectedCategoryIds.includes(categoryInput.trim())) {
      setSelectedCategoryIds([...selectedCategoryIds, categoryInput.trim()]);
      setCategoryInput('');
    }
  }, [categoryInput, selectedCategoryIds]);

  const handleRemoveCategory = useCallback((categoryId: string) => {
    setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== categoryId));
  }, [selectedCategoryIds]);

  const handleAddProduct = useCallback(() => {
    if (productInput.trim() && !selectedProductIds.includes(productInput.trim())) {
      setSelectedProductIds([...selectedProductIds, productInput.trim()]);
      setProductInput('');
    }
  }, [productInput, selectedProductIds]);

  const handleRemoveProduct = useCallback((productId: string) => {
    setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
  }, [selectedProductIds]);

  const isLoading = couponsData === undefined || (isEditMode && couponData === undefined);

  return {
    // Form
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    
    // Data
    existingCoupon,
    categoriesList,
    productsList,
    isEditMode,
    id,
    
    // State
    selectedCategoryIds,
    setSelectedCategoryIds,
    selectedProductIds,
    setSelectedProductIds,
    categoryInput,
    setCategoryInput,
    productInput,
    setProductInput,
    isCreating,
    isUpdating,
    isDeleting,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isLoading,
    
    // Validation
    getDiscountValueValidation,
    validateEndDate,
    validateBuyQuantity,
    validateGetQuantity,
    validateCodeUniqueness,
    
    // Handlers
    onSubmit,
    handleSave,
    handleCancel,
    handleDelete,
    handleConfirmDelete,
    handleGenerateCode,
    handleAddCategory,
    handleRemoveCategory,
    handleAddProduct,
    handleRemoveProduct,
    
    // Watched values
    discountType,
    startDate,
  };
}
