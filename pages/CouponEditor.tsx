import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  useGetCouponsQuery, 
  useGetCouponByIdQuery,
  useCreateCouponMutation, 
  useUpdateCouponMutation, 
  useDeleteCouponMutation,
  useLazyGenerateCouponCodeQuery
} from '../services/api';
import { useGetCategoriesQuery } from '../services/api';
import { useGetProductsQuery } from '../services/api';
import { Coupon, CouponStatus, CouponDiscountType } from '../types';
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
  
  const { data: coupons, isLoading: isLoadingCoupons } = useGetCouponsQuery(undefined);
  const { data: coupon, isLoading: isLoadingCoupon } = useGetCouponByIdQuery(id || '', { skip: !id });
  const { data: categories } = useGetCategoriesQuery(undefined);
  const { data: products } = useGetProductsQuery(undefined);
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();
  const [generateCode] = useLazyGenerateCouponCodeQuery();

  const existingCoupon = isEditMode ? coupon : null;

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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(existingCoupon?.categoryIds || []);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(existingCoupon?.productIds || []);
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
      setSelectedCategoryIds(existingCoupon.categoryIds || []);
      setSelectedProductIds(existingCoupon.productIds || []);
    }
  }, [existingCoupon, setValue]);

  if (isLoadingCoupons || (isEditMode && isLoadingCoupon)) {
    return <LoadingState message="טוען..." />;
  }

  const onSubmit = async (data: Partial<Coupon>) => {
    try {
      const couponData = {
        code: data.code || '',
        description: data.description || null,
        discountType: data.discountType || CouponDiscountType.PERCENTAGE,
        discountValue: data.discountValue || 0,
        buyQuantity: data.buyQuantity || null,
        getQuantity: data.getQuantity || null,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        minimumOrder: data.minimumOrder || null,
        maximumDiscount: data.maximumDiscount || null,
        usageLimit: data.usageLimit || null,
        usageLimitPerUser: data.usageLimitPerUser || null,
        usageCount: existingCoupon?.usageCount || 0,
        categoryIds: selectedCategoryIds,
        productIds: selectedProductIds,
        userIds: existingCoupon?.userIds || [],
        firstPurchaseOnly: data.firstPurchaseOnly || false,
        excludeOtherCoupons: data.excludeOtherCoupons || false,
        status: data.status || CouponStatus.ACTIVE,
      };
      
      if (isEditMode && id) {
        await updateCoupon({ id, ...couponData }).unwrap();
      } else {
        await createCoupon(couponData).unwrap();
      }
      navigate('/coupons');
    } catch (error) {
      console.error('Error saving coupon:', error);
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
      await deleteCoupon(id).unwrap();
      navigate('/coupons');
    } catch (error) {
      console.error('Error deleting coupon:', error);
      setDeleteDialogOpen(false);
    }
  };

  const handleGenerateCode = async () => {
    try {
      const { data: code } = await generateCode();
      if (code) {
        setValue('code', code);
      }
    } catch (error) {
      console.error('Error generating code:', error);
    }
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
                          const category = categories?.find(c => c.$id === catId);
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
                          const product = products?.find(p => p.$id === prodId);
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
