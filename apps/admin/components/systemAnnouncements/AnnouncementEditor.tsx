import React, { useEffect } from 'react';
import {
  Dialog,
  Portal,
  Button,
  Text,
  CloseButton,
  VStack,
  HStack,
  Input,
  Textarea,
  Select,
  Checkbox,
  Box,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { SystemAnnouncement, SystemAnnouncementType, SystemAnnouncementStatus } from '@shared/types';

interface AnnouncementFormData {
  title: string;
  message: string;
  type: SystemAnnouncementType;
  status: SystemAnnouncementStatus;
  startDate: string;
  endDate?: string;
  targetAudience: 'all' | 'customers' | 'admins';
  isDismissible: boolean;
}

interface AnnouncementEditorProps {
  isOpen: boolean;
  onClose: () => void;
  announcement?: SystemAnnouncement | null;
  onSave: (data: AnnouncementFormData) => void;
  isLoading?: boolean;
}

// Banner preview component
function BannerPreview({ type, message }: { type: SystemAnnouncementType; message: string }) {
  const getBannerStyles = () => {
    switch (type) {
      case 'info':
        return { bg: 'blue.50', borderColor: 'blue.500', textColor: 'blue.800' };
      case 'warning':
        return { bg: 'amber.50', borderColor: 'amber.500', textColor: 'amber.800' };
      case 'success':
        return { bg: 'green.50', borderColor: 'green.500', textColor: 'green.800' };
      case 'error':
        return { bg: 'red.50', borderColor: 'red.500', textColor: 'red.800' };
      case 'maintenance':
        return { bg: 'orange.50', borderColor: 'orange.500', textColor: 'orange.800' };
      default:
        return { bg: 'blue.50', borderColor: 'blue.500', textColor: 'blue.800' };
    }
  };

  const styles = getBannerStyles();

  return (
    <Box
      bg={styles.bg}
      borderWidth="1px"
      borderColor={styles.borderColor}
      borderRadius="md"
      px="4"
      py="3"
      dir="rtl"
    >
      <Text fontSize="sm" color={styles.textColor} fontWeight="medium">
        {message || 'תצוגה מקדימה של ההודעה...'}
      </Text>
    </Box>
  );
}

export default function AnnouncementEditor({
  isOpen,
  onClose,
  announcement,
  onSave,
  isLoading = false,
}: AnnouncementEditorProps) {
  const isEditMode = !!announcement;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    defaultValues: {
      title: '',
      message: '',
      type: 'info',
      status: 'draft',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      targetAudience: 'all',
      isDismissible: true,
    },
  });

  // Watch form values for live preview
  const watchedType = watch('type');
  const watchedMessage = watch('message');

  // Reset form when dialog opens with announcement data (edit mode)
  useEffect(() => {
    if (isOpen) {
      if (announcement) {
        reset({
          title: announcement.title,
          message: announcement.message,
          type: announcement.type as SystemAnnouncementType,
          status: announcement.status as SystemAnnouncementStatus,
          startDate: announcement.startDate.split('T')[0],
          endDate: announcement.endDate ? announcement.endDate.split('T')[0] : '',
          targetAudience: announcement.targetAudience,
          isDismissible: announcement.isDismissible,
        });
      } else {
        reset({
          title: '',
          message: '',
          type: 'info',
          status: 'draft',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          targetAudience: 'all',
          isDismissible: true,
        });
      }
    }
  }, [isOpen, announcement, reset]);

  const onSubmit = (data: AnnouncementFormData) => {
    onSave(data);
  };

  return (
    <Dialog.Root lazyMount open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="2xl" maxH="90vh" overflowY="auto">
            <Dialog.Header>
              <Dialog.Title>
                {isEditMode ? 'עריכת הודעת מערכת' : 'הודעת מערכת חדשה'}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <form id="announcement-form" onSubmit={handleSubmit(onSubmit)}>
                <VStack gap="5" align="stretch">
                  {/* Banner Preview */}
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="fg" mb="2">
                      תצוגה מקדימה
                    </Text>
                    <BannerPreview type={watchedType} message={watchedMessage} />
                  </Box>

                  {/* Title */}
                  <VStack align="start" gap="1.5">
                    <Text fontSize="sm" fontWeight="semibold" color="fg">
                      כותרת <Text as="span" color="red.500">*</Text>
                    </Text>
                    <Input
                      {...register('title', {
                        required: 'שדה חובה',
                        maxLength: { value: 100, message: 'הכותרת לא יכולה לעבור 100 תווים' },
                      })}
                      placeholder="הזן כותרת להודעה"
                      bg="bg.subtle"
                      borderColor={errors.title ? 'red.500' : 'border'}
                      _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                    />
                    {errors.title && (
                      <Text fontSize="xs" color="red.500">
                        {errors.title.message}
                      </Text>
                    )}
                  </VStack>

                  {/* Message */}
                  <VStack align="start" gap="1.5">
                    <Text fontSize="sm" fontWeight="semibold" color="fg">
                      הודעה <Text as="span" color="red.500">*</Text>
                    </Text>
                    <Textarea
                      {...register('message', {
                        required: 'שדה חובה',
                        maxLength: { value: 500, message: 'ההודעה לא יכולה לעבור 500 תווים' },
                      })}
                      placeholder="הזן את תוכן ההודעה"
                      bg="bg.subtle"
                      borderColor={errors.message ? 'red.500' : 'border'}
                      _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                      rows={3}
                    />
                    {errors.message && (
                      <Text fontSize="xs" color="red.500">
                        {errors.message.message}
                      </Text>
                    )}
                  </VStack>

                  {/* Type and Status */}
                  <HStack gap="4" align="start">
                    <VStack align="start" gap="1.5" flex="1">
                      <Text fontSize="sm" fontWeight="semibold" color="fg">
                        סוג הודעה
                      </Text>
                      <Select.Root
                        {...register('type')}
                        value={[watch('type')]}
                        onValueChange={(e) => {
                          const select = register('type');
                          select.onChange?.({ target: { name: 'type', value: e.value } } as any);
                        }}
                      >
                        <Select.Trigger w="full" bg="bg.subtle">
                          <Select.ValueText placeholder="בחר סוג" />
                        </Select.Trigger>
                        <Select.Portals>
                          <Select.Content>
                            <Select.Item item="info">
                              <Select.ItemText>מידע</Select.ItemText>
                            </Select.Item>
                            <Select.Item item="warning">
                              <Select.ItemText>אזהרה</Select.ItemText>
                            </Select.Item>
                            <Select.Item item="success">
                              <Select.ItemText>הצלחה</Select.ItemText>
                            </Select.Item>
                            <Select.Item item="error">
                              <Select.ItemText>שגיאה</Select.ItemText>
                            </Select.Item>
                            <Select.Item item="maintenance">
                              <Select.ItemText>תחזוקה</Select.ItemText>
                            </Select.Item>
                          </Select.Content>
                        </Select.Portals>
                      </Select.Root>
                    </VStack>

                    <VStack align="start" gap="1.5" flex="1">
                      <Text fontSize="sm" fontWeight="semibold" color="fg">
                        סטטוס
                      </Text>
                      <Select.Root
                        {...register('status')}
                        value={[watch('status')]}
                        onValueChange={(e) => {
                          const select = register('status');
                          select.onChange?.({ target: { name: 'status', value: e.value } } as any);
                        }}
                      >
                        <Select.Trigger w="full" bg="bg.subtle">
                          <Select.ValueText placeholder="בחר סטטוס" />
                        </Select.Trigger>
                        <Select.Portals>
                          <Select.Content>
                            <Select.Item item="active">
                              <Select.ItemText>פעיל</Select.ItemText>
                            </Select.Item>
                            <Select.Item item="scheduled">
                              <Select.ItemText>מתוזמן</Select.ItemText>
                            </Select.Item>
                            <Select.Item item="expired">
                              <Select.ItemText>פג תוקף</Select.ItemText>
                            </Select.Item>
                            <Select.Item item="draft">
                              <Select.ItemText>טיוטה</Select.ItemText>
                            </Select.Item>
                          </Select.Content>
                        </Select.Portals>
                      </Select.Root>
                    </VStack>
                  </HStack>

                  {/* Dates */}
                  <HStack gap="4" align="start">
                    <VStack align="start" gap="1.5" flex="1">
                      <Text fontSize="sm" fontWeight="semibold" color="fg">
                        תאריך התחלה <Text as="span" color="red.500">*</Text>
                      </Text>
                      <Input
                        {...register('startDate', { required: 'שדה חובה' })}
                        type="date"
                        bg="bg.subtle"
                        borderColor={errors.startDate ? 'red.500' : 'border'}
                        _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                        dir="ltr"
                      />
                      {errors.startDate && (
                        <Text fontSize="xs" color="red.500">
                          {errors.startDate.message}
                        </Text>
                      )}
                    </VStack>

                    <VStack align="start" gap="1.5" flex="1">
                      <Text fontSize="sm" fontWeight="semibold" color="fg">
                        תאריך סיום
                      </Text>
                      <Input
                        {...register('endDate')}
                        type="date"
                        bg="bg.subtle"
                        borderColor="border"
                        _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
                        dir="ltr"
                      />
                    </VStack>
                  </HStack>

                  {/* Target Audience */}
                  <VStack align="start" gap="1.5">
                    <Text fontSize="sm" fontWeight="semibold" color="fg">
                      קהל יעד
                    </Text>
                    <Select.Root
                      {...register('targetAudience')}
                      value={[watch('targetAudience')]}
                      onValueChange={(e) => {
                        const select = register('targetAudience');
                        select.onChange?.({ target: { name: 'targetAudience', value: e.value } } as any);
                      }}
                    >
                      <Select.Trigger w="full" bg="bg.subtle">
                        <Select.ValueText placeholder="בחר קהל יעד" />
                      </Select.Trigger>
                      <Select.Portals>
                        <Select.Content>
                          <Select.Item item="all">
                            <Select.ItemText>כל המשתמשים</Select.ItemText>
                          </Select.Item>
                          <Select.Item item="customers">
                            <Select.ItemText>לקוחות בלבד</Select.ItemText>
                          </Select.Item>
                          <Select.Item item="admins">
                            <Select.ItemText>מנהלים בלבד</Select.ItemText>
                          </Select.Item>
                        </Select.Content>
                      </Select.Portals>
                    </Select.Root>
                  </VStack>

                  {/* Dismissible */}
                  <Flex align="center" gap="3">
                    <Checkbox.Root
                      checked={watch('isDismissible')}
                      onCheckedChange={(e) => {
                        const checkbox = register('isDismissible');
                        checkbox.onChange?.({ target: { name: 'isDismissible', value: e.checked } } as any);
                      }}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label>ניתן לסגירה על ידי המשתמש</Checkbox.Label>
                    </Checkbox.Root>
                  </Flex>
                </VStack>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap="3" w="full" justify="flex-end">
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" onClick={onClose} disabled={isLoading}>
                    ביטול
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="blue"
                  type="submit"
                  form="announcement-form"
                  loading={isLoading}
                  loadingText="שומר..."
                >
                  {isEditMode ? 'שמור שינויים' : 'צור הודעה'}
                </Button>
              </HStack>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
