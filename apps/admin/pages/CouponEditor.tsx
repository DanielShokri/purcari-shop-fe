import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';
import { Id } from '@convex/dataModel';
import { Coupon, CouponStatus, CouponDiscountType } from '@shared/types';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  Card,
  SimpleGrid,
  Switch,
  Select,
  Portal,
  createListCollection,
} from '@chakra-ui/react';
import { LoadingState, Breadcrumbs, DeleteConfirmationDialog } from '../components/shared';
import { EditorFooter } from '../components/post-editor';

// Discount type options
const discountTypeOptions = createListCollection({
  items: [
    { label: 'אחוז הנחה (%)', value: CouponDiscountType.PERCENTAGE },
    { label: 'סכום קבוע (₪)', value: CouponDiscountType.FIXED_AMOUNT },
    { label: 'משלוח חינם', value: CouponDiscountType.FREE_SHIPPING },
    { label: 'מוצר חינם / מתנה', value: CouponDiscountType.FREE_PRODUCT },
    { label: 'קנה X קבל Y', value: CouponDiscountType.BUY_X_GET_Y },
  ],
});

// Status options
const statusOptions = createListCollection({
  items: [
    { label: 'פעיל', value: CouponStatus.ACTIVE },
    { label: 'מושהה', value: CouponStatus.PAUSED },
    { label: 'פג תוקף', value: CouponStatus.EXPIRED },
    { label: 'מתוזמן', value: CouponStatus.SCHEDULED },
  ],
});

export default function CouponEditor() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const couponsData = useQuery(api.coupons.list);
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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

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

  if (couponsData === undefined || (isEditMode && couponData === undefined)) {
    return <LoadingState message="טוען..." />;
  }

  const onSubmit = async (data: Partial<Coupon>) => {
    try {
      if (isEditMode) setIsUpdating(true);
      else setIsCreating(true);

      const payload = {
        code: data.code || '',
        description: data.description || undefined,
        discountType: data.discountType || CouponDiscountType.PERCENTAGE,
        discountValue: Number(data.discountValue) || 0,
        buyQuantity: data.buyQuantity ? BigInt(data.buyQuantity) : undefined,
        getQuantity: data.getQuantity ? BigInt(data.getQuantity) : undefined,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        minimumOrder: data.minimumOrder ? Number(data.minimumOrder) : undefined,
        maximumDiscount: data.maximumDiscount ? Number(data.maximumDiscount) : undefined,
        usageLimit: data.usageLimit ? BigInt(data.usageLimit) : undefined,
        usageLimitPerUser: data.usageLimitPerUser ? BigInt(data.usageLimitPerUser) : undefined,
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
  };

  const handleSave = () => {
    handleSubmit(onSubmit)();
  };

  const handleCancel = () => {
    navigate('/coupons');
  };

  const handleDelete = () => {
    if (!id) return;
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
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
  };

  const handleGenerateCode = async () => {
    // Generate a random 8-character code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('code', code);
  };

  const handleAddCategory = () => {
    if (categoryInput.trim() && !selectedCategoryIds.includes(categoryInput.trim())) {
      setSelectedCategoryIds([...selectedCategoryIds, categoryInput.trim()]);
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== categoryId));
  };

  const handleAddProduct = () => {
    if (productInput.trim() && !selectedProductIds.includes(productInput.trim())) {
      setSelectedProductIds([...selectedProductIds, productInput.trim()]);
      setProductInput('');
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
  };

  return (
    <Box h="full" display="flex" flexDirection="column">
      <Box flex="1" overflowY="auto" css={{ scrollBehavior: 'smooth' }}>
        <Box maxW="1200px" mx="auto" w="full" pb="24">
          <Breadcrumbs 
            items={[
              { label: 'ראשי', href: '#/' },
              { label: 'קופונים', href: '#/coupons' },
              { label: isEditMode ? 'עריכת קופון' : 'יצירת קופון' }
            ]} 
          />

          {/* Header */}
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between"
            align={{ base: 'start', sm: 'center' }}
            gap="4"
            mb="8"
          >
            <Box>
              <Heading size="2xl" color="fg" mb="1" letterSpacing="tight">
                {isEditMode ? 'עריכת קופון' : 'יצירת קופון'}
              </Heading>
              <Text color="fg.muted" fontSize="sm">
                {isEditMode ? 'ערוך את פרטי הקופון והמגבלות' : 'צור קופון חדש עם הגדרות ומגבלות'}
              </Text>
            </Box>
          </Flex>

          <form id="coupon-form" onSubmit={handleSubmit(onSubmit)}>
            <SimpleGrid columns={{ base: 1 }} gap="6">
              {/* Basic Info Card */}
              <Card.Root>
                <Card.Header
                  px="6"
                  py="4"
                  borderBottomWidth="1px"
                  borderColor="border"
                  bg="bg.subtle"
                >
                  <Flex justify="space-between" alignItems="center">
                    <HStack gap="2">
                      <Text as="span" className="material-symbols-outlined" fontSize="lg" color="blue.500">
                        info
                      </Text>
                      <Heading size="md" color="fg">
                        פרטים בסיסיים
                      </Heading>
                    </HStack>
                    <Flex alignItems="center" gap="3">
                      <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                        סטטוס פעיל
                      </Text>
                      <Switch.Root
                        size="sm"
                        checked={watch('status') === CouponStatus.ACTIVE}
                        onCheckedChange={(e) => setValue('status', e.checked ? CouponStatus.ACTIVE : CouponStatus.PAUSED)}
                      >
                        <Switch.HiddenInput />
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Root>
                    </Flex>
                  </Flex>
                </Card.Header>
                <Card.Body p="6">
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="5">
                    <VStack align="start" gap="1.5">
                      <Text fontSize="sm" fontWeight="semibold" color="fg">
                        קוד קופון
                      </Text>
                      <Flex gap="2" w="full">
                        <Input
                          {...register('code', { required: 'שדה חובה' })}
                          flex="1"
                          placeholder="לדוגמה: SALE2024"
                          bg="bg.subtle"
                          borderColor="border"
                          _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGenerateCode}
                          bg="bg.subtle"
                          borderColor="border"
                        >
                          ייצור אוטומטי
                        </Button>
                      </Flex>
                      {errors.code && (
                        <Text fontSize="xs" color="red.500">{errors.code.message}</Text>
                      )}
                    </VStack>
                    <VStack align="start" gap="1.5">
                      <Text fontSize="sm" fontWeight="semibold" color="fg">
                        תיאור פנימי
                      </Text>
                      <Input
                        {...register('description')}
                        placeholder="לשימוש מנהלים בלבד"
                        bg="bg.subtle"
                        borderColor="border"
                        _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                      />
                    </VStack>
                  </SimpleGrid>
                </Card.Body>
              </Card.Root>

              {/* Discount Configuration */}
              <Card.Root>
                <Card.Header
                  px="6"
                  py="4"
                  borderBottomWidth="1px"
                  borderColor="border"
                  bg="bg.subtle"
                >
                  <HStack gap="2">
                    <Text as="span" className="material-symbols-outlined" fontSize="lg" color="blue.500">
                      percent
                    </Text>
                    <Heading size="md" color="fg">
                      הגדרות הנחה
                    </Heading>
                  </HStack>
                </Card.Header>
                <Card.Body p="6">
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="5">
                    <VStack align="start" gap="1.5">
                      <Text fontSize="sm" fontWeight="semibold" color="fg">
                        סוג הנחה
                      </Text>
                      <Select.Root
                        collection={discountTypeOptions}
                        value={discountType ? [discountType] : []}
                        onValueChange={(e) => setValue('discountType', e.value[0] as CouponDiscountType)}
                      >
                        <Select.HiddenSelect />
                        <Select.Control
                          bg="bg.subtle"
                          borderColor="border"
                          _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                        >
                          <Select.Trigger>
                            <Select.ValueText placeholder="בחר סוג הנחה" />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Text as="span" className="material-symbols-outlined" fontSize="xl" color="fg.muted">
                              expand_more
                            </Text>
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                          <Select.Positioner>
                            <Select.Content>
                              {discountTypeOptions.items.map((item) => (
                                <Select.Item item={item} key={item.value}>
                                  {item.label}
                                  <Select.ItemIndicator />
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Positioner>
                        </Portal>
                      </Select.Root>
                    </VStack>
                    <VStack align="start" gap="1.5">
                      <Text fontSize="sm" fontWeight="semibold" color="fg">
                        ערך ההנחה
                      </Text>
                      <Box position="relative" w="full">
                        <Input
                          {...register('discountValue', { 
                            required: 'שדה חובה',
                            valueAsNumber: true,
                            min: { value: 0, message: 'ערך חיובי בלבד' }
                          })}
                          type="number"
                          placeholder="0"
                          bg="bg.subtle"
                          borderColor="border"
                          pr={discountType === CouponDiscountType.PERCENTAGE ? '10' : '4'}
                          _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                        />
                        {discountType === CouponDiscountType.PERCENTAGE && (
                          <Text
                            position="absolute"
                            top="50%"
                            right="3"
                            transform="translateY(-50%)"
                            color="fg.muted"
                            fontSize="sm"
                            pointerEvents="none"
                          >
                            %
                          </Text>
                        )}
                      </Box>
                      {errors.discountValue && (
                        <Text fontSize="xs" color="red.500">{errors.discountValue.message}</Text>
                      )}
                      {discountType === CouponDiscountType.BUY_X_GET_Y && (
                        <SimpleGrid columns={2} gap="3" w="full" mt="2">
                          <VStack align="start" gap="1">
                            <Text fontSize="xs" color="fg.muted">קנה X</Text>
                            <Input
                              {...register('buyQuantity', { valueAsNumber: true })}
                              type="number"
                              size="sm"
                              bg="bg.subtle"
                              borderColor="border"
                            />
                          </VStack>
                          <VStack align="start" gap="1">
                            <Text fontSize="xs" color="fg.muted">קבל Y</Text>
                            <Input
                              {...register('getQuantity', { valueAsNumber: true })}
                              type="number"
                              size="sm"
                              bg="bg.subtle"
                              borderColor="border"
                            />
                          </VStack>
                        </SimpleGrid>
                      )}
                    </VStack>
                  </SimpleGrid>
                </Card.Body>
              </Card.Root>

              {/* Rules & Limits + Validity */}
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
                {/* Rules */}
                <Card.Root>
                  <Card.Header
                    px="6"
                    py="4"
                    borderBottomWidth="1px"
                    borderColor="border"
                    bg="bg.subtle"
                  >
                    <HStack gap="2">
                      <Text as="span" className="material-symbols-outlined" fontSize="lg" color="blue.500">
                        gavel
                      </Text>
                      <Heading size="md" color="fg">
                        חוקים ומגבלות
                      </Heading>
                    </HStack>
                  </Card.Header>
                  <Card.Body p="6">
                    <SimpleGrid columns={2} gap="4">
                      <VStack align="start" gap="1.5">
                        <Text fontSize="xs" fontWeight="semibold" color="fg.muted">
                          מינימום הזמנה (₪)
                        </Text>
                        <Input
                          {...register('minimumOrder', { valueAsNumber: true })}
                          type="number"
                          size="sm"
                          bg="bg.subtle"
                          borderColor="border"
                        />
                      </VStack>
                      <VStack align="start" gap="1.5">
                        <Text fontSize="xs" fontWeight="semibold" color="fg.muted">
                          מקסימום הנחה (₪)
                        </Text>
                        <Input
                          {...register('maximumDiscount', { valueAsNumber: true })}
                          type="number"
                          size="sm"
                          placeholder="ללא"
                          bg="bg.subtle"
                          borderColor="border"
                        />
                      </VStack>
                      <VStack align="start" gap="1.5">
                        <Text fontSize="xs" fontWeight="semibold" color="fg.muted">
                          הגבלת שימושים כללית
                        </Text>
                        <Input
                          {...register('usageLimit', { valueAsNumber: true })}
                          type="number"
                          size="sm"
                          bg="bg.subtle"
                          borderColor="border"
                        />
                      </VStack>
                      <VStack align="start" gap="1.5">
                        <Text fontSize="xs" fontWeight="semibold" color="fg.muted">
                          הגבלה למשתמש
                        </Text>
                        <Input
                          {...register('usageLimitPerUser', { valueAsNumber: true })}
                          type="number"
                          size="sm"
                          bg="bg.subtle"
                          borderColor="border"
                        />
                      </VStack>
                    </SimpleGrid>
                  </Card.Body>
                </Card.Root>

                {/* Validity */}
                <Card.Root>
                  <Card.Header
                    px="6"
                    py="4"
                    borderBottomWidth="1px"
                    borderColor="border"
                    bg="bg.subtle"
                  >
                    <HStack gap="2">
                      <Text as="span" className="material-symbols-outlined" fontSize="lg" color="blue.500">
                        calendar_month
                      </Text>
                      <Heading size="md" color="fg">
                        תוקף הקופון
                      </Heading>
                    </HStack>
                  </Card.Header>
                  <Card.Body p="6">
                    <VStack gap="4" align="stretch">
                      <VStack align="start" gap="1.5">
                        <Text fontSize="sm" fontWeight="semibold" color="fg">
                          תאריך התחלה
                        </Text>
                        <Input
                          {...register('startDate', { required: 'שדה חובה' })}
                          type="date"
                          bg="bg.subtle"
                          borderColor="border"
                          _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                        />
                        {errors.startDate && (
                          <Text fontSize="xs" color="red.500">{errors.startDate.message}</Text>
                        )}
                      </VStack>
                      <VStack align="start" gap="1.5">
                        <Text fontSize="sm" fontWeight="semibold" color="fg">
                          תאריך סיום
                        </Text>
                        <Input
                          {...register('endDate')}
                          type="date"
                          bg="bg.subtle"
                          borderColor="border"
                          _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                        />
                      </VStack>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </SimpleGrid>

              {/* Restrictions */}
              <Card.Root>
                <Card.Header
                  px="6"
                  py="4"
                  borderBottomWidth="1px"
                  borderColor="border"
                  bg="bg.subtle"
                >
                  <HStack gap="2">
                    <Text as="span" className="material-symbols-outlined" fontSize="lg" color="blue.500">
                      block
                    </Text>
                    <Heading size="md" color="fg">
                      הגבלות מתקדמות
                    </Heading>
                  </HStack>
                </Card.Header>
                <Card.Body p="6">
                  <VStack gap="5" align="stretch">
                    <VStack align="start" gap="1.5">
                      <Text fontSize="sm" fontWeight="semibold" color="fg">
                        החל על קטגוריות / מוצרים ספציפיים
                      </Text>
                      <Box
                        w="full"
                        bg="bg.subtle"
                        borderWidth="1px"
                        borderColor="border"
                        rounded="lg"
                        minH="48px"
                        p="2"
                        display="flex"
                        flexWrap="wrap"
                        gap="2"
                        alignItems="center"
                      >
                        {selectedCategoryIds.map((catId) => {
                          const category = categoriesList?.find(c => c._id === catId);
                          return (
                            <Box
                              key={catId}
                              bg="bg.panel"
                              borderWidth="1px"
                              borderColor="border"
                              rounded="md"
                              px="2"
                              py="1"
                              fontSize="xs"
                              fontWeight="medium"
                              display="flex"
                              alignItems="center"
                              gap="1"
                            >
                              <Text>{category?.name || catId}</Text>
                              <Text
                                as="span"
                                className="material-symbols-outlined"
                                fontSize="14px"
                                cursor="pointer"
                                _hover={{ color: 'red.500' }}
                                onClick={() => handleRemoveCategory(catId)}
                              >
                                close
                              </Text>
                            </Box>
                          );
                        })}
                        {selectedProductIds.map((prodId) => {
                          const product = productsList?.find(p => p._id === prodId);
                          return (
                            <Box
                              key={prodId}
                              bg="bg.panel"
                              borderWidth="1px"
                              borderColor="border"
                              rounded="md"
                              px="2"
                              py="1"
                              fontSize="xs"
                              fontWeight="medium"
                              display="flex"
                              alignItems="center"
                              gap="1"
                            >
                              <Text>{product?.productName || prodId}</Text>
                              <Text
                                as="span"
                                className="material-symbols-outlined"
                                fontSize="14px"
                                cursor="pointer"
                                _hover={{ color: 'red.500' }}
                                onClick={() => handleRemoveProduct(prodId)}
                              >
                                close
                              </Text>
                            </Box>
                          );
                        })}
                        <Input
                          placeholder="+ הוסף קטגוריה"
                          value={categoryInput}
                          onChange={(e) => setCategoryInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCategory();
                            }
                          }}
                          bg="transparent"
                          border="none"
                          fontSize="sm"
                          h="8"
                          minW="120px"
                          _focus={{ ring: 0 }}
                        />
                      </Box>
                      <Text fontSize="xs" color="fg.muted">
                        השאר ריק כדי להחיל על כל החנות
                      </Text>
                    </VStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap="8">
                      <Flex alignItems="center" gap="3">
                        <Switch.Root
                          size="sm"
                          checked={watch('firstPurchaseOnly') || false}
                          onCheckedChange={(e) => setValue('firstPurchaseOnly', e.checked)}
                        >
                          <Switch.HiddenInput />
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                        </Switch.Root>
                        <Text fontSize="sm" fontWeight="medium" color="fg">
                          תקף לרכישה ראשונה בלבד
                        </Text>
                      </Flex>
                      <Flex alignItems="center" gap="3">
                        <Switch.Root
                          size="sm"
                          checked={watch('excludeOtherCoupons') || false}
                          onCheckedChange={(e) => setValue('excludeOtherCoupons', e.checked)}
                        >
                          <Switch.HiddenInput />
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                        </Switch.Root>
                        <Text fontSize="sm" fontWeight="medium" color="fg">
                          לא ניתן לשילוב עם קופונים אחרים
                        </Text>
                      </Flex>
                    </SimpleGrid>
                  </VStack>
                </Card.Body>
              </Card.Root>
            </SimpleGrid>
          </form>
        </Box>
      </Box>

      <EditorFooter
        isEditMode={isEditMode}
        isCreating={isCreating}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="מחיקת קופון"
        message="האם אתה בטוח שברצונך למחוק קופון זה? פעולה זו לא ניתנת לביטול."
        isDeleting={isDeleting}
      />
    </Box>
  );
}
