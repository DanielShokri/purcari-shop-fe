import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  useGetCartRuleByIdQuery,
  useCreateCartRuleMutation, 
  useUpdateCartRuleMutation, 
  useDeleteCartRuleMutation,
} from '../services/api';
import { CartRule, CartRuleStatus, CartRuleType } from '../types';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Textarea,
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

// Cart Rule Type options
const typeOptions = createListCollection({
  items: [
    { label: 'משלוח', value: CartRuleType.SHIPPING, icon: 'local_shipping', color: 'purple' },
    { label: 'הנחה', value: CartRuleType.DISCOUNT, icon: 'percent', color: 'orange' },
    { label: 'הגבלות', value: CartRuleType.RESTRICTION, icon: 'block', color: 'red' },
    { label: 'הטבה', value: CartRuleType.BENEFIT, icon: 'card_giftcard', color: 'blue' },
  ],
});

// Status options
const statusOptions = createListCollection({
  items: [
    { label: 'פעיל', value: CartRuleStatus.ACTIVE },
    { label: 'מושהה', value: CartRuleStatus.PAUSED },
  ],
});

export default function CartRuleEditor() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const { data: cartRule, isLoading: isLoadingCartRule } = useGetCartRuleByIdQuery(id || '', { skip: !id });
  const [createCartRule, { isLoading: isCreating }] = useCreateCartRuleMutation();
  const [updateCartRule, { isLoading: isUpdating }] = useUpdateCartRuleMutation();
  const [deleteCartRule, { isLoading: isDeleting }] = useDeleteCartRuleMutation();

  const existingCartRule = isEditMode ? cartRule : null;

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Partial<CartRule>>({
    defaultValues: existingCartRule || {
      name: '',
      description: '',
      type: CartRuleType.SHIPPING,
      priority: 10,
      status: CartRuleStatus.ACTIVE,
      value: undefined,
    },
  });

  const ruleType = watch('type');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Update form when existingCartRule changes
  useEffect(() => {
    if (existingCartRule) {
      setValue('name', existingCartRule.name);
      setValue('description', existingCartRule.description || '');
      setValue('type', existingCartRule.type);
      setValue('priority', existingCartRule.priority);
      setValue('status', existingCartRule.status);
      setValue('value', existingCartRule.value);
    }
  }, [existingCartRule, setValue]);

  if (isEditMode && isLoadingCartRule) {
    return <LoadingState message="טוען..." />;
  }

  const onSubmit = async (data: Partial<CartRule>) => {
    try {
      const cartRuleData = {
        name: data.name || '',
        description: data.description || null,
        type: data.type || CartRuleType.SHIPPING,
        priority: data.priority ?? 10,
        status: data.status || CartRuleStatus.ACTIVE,
        value: data.value ?? null,
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

  // Get value label based on rule type
  const getValueLabel = (type: CartRuleType | undefined): string => {
    switch (type) {
      case CartRuleType.SHIPPING:
        return 'סכום מינימום למשלוח חינם (₪)';
      case CartRuleType.DISCOUNT:
        return 'אחוז הנחה (%)';
      case CartRuleType.RESTRICTION:
        return 'סכום מינימום להזמנה (₪)';
      case CartRuleType.BENEFIT:
        return 'סכום מינימום להטבה (₪)';
      default:
        return 'ערך';
    }
  };

  return (
    <Box h="full" display="flex" flexDirection="column">
      <Box flex="1" overflowY="auto" css={{ scrollBehavior: 'smooth' }}>
        <Box maxW="1200px" mx="auto" w="full" pb="24">
          <Breadcrumbs 
            items={[
              { label: 'ראשי', href: '#/' },
              { label: 'חוקי עגלה', href: '#/cart-rules' },
              { label: isEditMode ? 'עריכת חוק' : 'יצירת חוק' }
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
                {isEditMode ? 'עריכת חוק עגלה' : 'יצירת חוק עגלה'}
              </Heading>
              <Text color="fg.muted" fontSize="sm">
                {isEditMode ? 'ערוך את פרטי החוק והתנאים' : 'צור חוק חדש לעגלת הקניות'}
              </Text>
            </Box>
          </Flex>

          <form id="cart-rule-form" onSubmit={handleSubmit(onSubmit)}>
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
                        rule
                      </Text>
                      <Heading size="md" color="fg">
                        פרטי החוק
                      </Heading>
                    </HStack>
                    <Flex alignItems="center" gap="3">
                      <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                        סטטוס פעיל
                      </Text>
                      <Switch.Root
                        size="sm"
                        checked={watch('status') === CartRuleStatus.ACTIVE}
                        onCheckedChange={(e) => setValue('status', e.checked ? CartRuleStatus.ACTIVE : CartRuleStatus.PAUSED)}
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
                        שם החוק
                      </Text>
                      <Input
                        {...register('name', { required: 'שדה חובה' })}
                        placeholder="לדוגמה: משלוח חינם מעל 300₪"
                        bg="bg.subtle"
                        borderColor="border"
                        _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                      />
                      {errors.name && (
                        <Text fontSize="xs" color="red.500">{errors.name.message}</Text>
                      )}
                    </VStack>
                    <VStack align="start" gap="1.5">
                      <Text fontSize="sm" fontWeight="semibold" color="fg">
                        סוג החוק
                      </Text>
                      <Select.Root
                        collection={typeOptions}
                        value={ruleType ? [ruleType] : []}
                        onValueChange={(e) => setValue('type', e.value[0] as CartRuleType)}
                      >
                        <Select.HiddenSelect />
                        <Select.Control
                          bg="bg.subtle"
                          borderColor="border"
                          _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                        >
                          <Select.Trigger>
                            <Select.ValueText placeholder="בחר סוג חוק" />
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
                              {typeOptions.items.map((item) => (
                                <Select.Item item={item} key={item.value}>
                                  <HStack gap="2">
                                    <Text as="span" className="material-symbols-outlined" fontSize="18px" color={`${item.color}.500`}>
                                      {item.icon}
                                    </Text>
                                    <Text>{item.label}</Text>
                                  </HStack>
                                  <Select.ItemIndicator />
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Positioner>
                        </Portal>
                      </Select.Root>
                    </VStack>
                  </SimpleGrid>

                  <VStack align="start" gap="1.5" mt="5">
                    <Text fontSize="sm" fontWeight="semibold" color="fg">
                      תיאור / הערות
                    </Text>
                    <Textarea
                      {...register('description')}
                      placeholder="תיאור פנימי לשימוש מנהלים"
                      bg="bg.subtle"
                      borderColor="border"
                      rows={3}
                      _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                    />
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Configuration Card */}
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
                      tune
                    </Text>
                    <Heading size="md" color="fg">
                      הגדרות
                    </Heading>
                  </HStack>
                </Card.Header>
                <Card.Body p="6">
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="5">
                    <VStack align="start" gap="1.5">
                      <Text fontSize="sm" fontWeight="semibold" color="fg">
                        עדיפות
                      </Text>
                      <Input
                        {...register('priority', { 
                          required: 'שדה חובה',
                          valueAsNumber: true,
                          min: { value: 1, message: 'ערך מינימלי: 1' },
                          max: { value: 99, message: 'ערך מקסימלי: 99' }
                        })}
                        type="number"
                        placeholder="10"
                        bg="bg.subtle"
                        borderColor="border"
                        _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                      />
                      <Text fontSize="xs" color="fg.muted">
                        מספר נמוך יותר = עדיפות גבוהה יותר
                      </Text>
                      {errors.priority && (
                        <Text fontSize="xs" color="red.500">{errors.priority.message}</Text>
                      )}
                    </VStack>
                    <VStack align="start" gap="1.5">
                      <Text fontSize="sm" fontWeight="semibold" color="fg">
                        {getValueLabel(ruleType)}
                      </Text>
                      <Input
                        {...register('value', { 
                          valueAsNumber: true,
                          min: { value: 0, message: 'ערך חיובי בלבד' }
                        })}
                        type="number"
                        placeholder="0"
                        bg="bg.subtle"
                        borderColor="border"
                        _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                      />
                      {errors.value && (
                        <Text fontSize="xs" color="red.500">{errors.value.message}</Text>
                      )}
                    </VStack>
                  </SimpleGrid>
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
        title="מחיקת חוק עגלה"
        message="האם אתה בטוח שברצונך למחוק חוק זה? פעולה זו לא ניתנת לביטול."
        isDeleting={isDeleting}
      />
    </Box>
  );
}
