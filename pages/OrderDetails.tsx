import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation } from '../services/api';
import { OrderStatus } from '../types';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  SimpleGrid,
  Table,
  Image,
  Flex,
  Select,
  Portal,
  createListCollection,
  Separator,
} from '@chakra-ui/react';
import { LoadingState, Breadcrumbs, StatusBadge, orderStatusConfig } from '../components/shared';

// Helper to format date in Hebrew locale
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatShortDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('he-IL');
};

const formatCurrency = (amount: number) => {
  return `₪${amount.toFixed(2)}`;
};

const orderStatusOptions = createListCollection({
  items: [
    { label: 'ממתין', value: OrderStatus.PENDING },
    { label: 'בטיפול', value: OrderStatus.PROCESSING },
    { label: 'הושלם', value: OrderStatus.COMPLETED },
    { label: 'בוטל', value: OrderStatus.CANCELLED },
  ],
});

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useGetOrderByIdQuery(id || '');
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  if (isLoading) {
    return <LoadingState message="טוען פרטי הזמנה..." />;
  }

  if (error || !order) {
    return (
      <VStack gap="4" py="20" align="center">
        <Text as="span" className="material-symbols-outlined" fontSize="48px" color="fg.subtle">
          error
        </Text>
        <Text fontSize="lg" color="fg.muted">
          הזמנה לא נמצאה
        </Text>
        <Button variant="outline" onClick={() => navigate('/orders')}>
          חזרה להזמנות
        </Button>
      </VStack>
    );
  }

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await updateStatus({ id: order.$id, status: newStatus }).unwrap();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    console.log('Download receipt');
  };

  // Get customer initials for avatar fallback
  const getInitials = (name: string) => {
    return name.charAt(0);
  };

  return (
    <VStack gap="6" align="stretch">
      <Breadcrumbs
        items={[
          { label: 'בית', href: '#/' },
          { label: 'הזמנות', href: '#/orders' },
          { label: 'פרטי הזמנה' },
        ]}
      />

      {/* Page Header */}
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'start', sm: 'center' }}
        gap="4"
        py="6"
      >
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="fg" letterSpacing="tight">
            הזמנה #{order.$id}
          </Text>
          <HStack gap="2" fontSize="sm" color="fg.muted" mt="1">
            <Text>נוצרה ב-{formatDate(order.createdAt)}</Text>
            <Text>•</Text>
            <Text dir="ltr">{formatTime(order.createdAt)}</Text>
          </HStack>
        </Box>
        <Button
          variant="outline"
          size="md"
          onClick={handlePrint}
          borderColor="border"
          bg="bg.panel"
          _hover={{ bg: 'bg.subtle' }}
        >
          <Text as="span" className="material-symbols-outlined" fontSize="20px">
            print
          </Text>
          <Text as="span">הדפס חשבונית</Text>
        </Button>
      </Flex>

      {/* Order Summary Stats */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} gap="4">
        {/* Order Date */}
        <Card.Root>
          <Card.Body p="6">
            <Text fontSize="sm" fontWeight="medium" color="fg.muted" mb="1">
              תאריך הזמנה
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="fg" dir="ltr">
              {formatShortDate(order.createdAt)}
            </Text>
          </Card.Body>
        </Card.Root>

        {/* Status (Editable) */}
        <Card.Root>
          <Card.Body p="6">
            <Text fontSize="sm" fontWeight="medium" color="fg.muted" mb="2">
              סטטוס
            </Text>
            <Select.Root
              collection={orderStatusOptions}
              size="sm"
              value={[order.status]}
              onValueChange={(e) => handleStatusChange(e.value[0] as OrderStatus)}
              disabled={isUpdating}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger
                  bg="bg.subtle"
                  borderColor="border"
                  fontWeight="medium"
                >
                  <Select.ValueText placeholder="בחר סטטוס" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {orderStatusOptions.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Card.Body>
        </Card.Root>

        {/* Total */}
        <Card.Root>
          <Card.Body p="6">
            <Text fontSize="sm" fontWeight="medium" color="fg.muted" mb="1">
              סה״כ לתשלום
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="blue.500">
              {formatCurrency(order.total)}
            </Text>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Customer & Shipping Row */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="6" alignItems="stretch">
        {/* Customer Details Card */}
        <Card.Root overflow="hidden" h="full">
          <Box
            p="4"
            borderBottomWidth="1px"
            borderColor="border"
            bg="bg.subtle"
          >
            <HStack gap="2">
              <Text as="span" className="material-symbols-outlined" fontSize="20px" color="fg.muted">
                person
              </Text>
              <Text fontWeight="semibold" color="fg">
                פרטי לקוח
              </Text>
            </HStack>
          </Box>
          <Card.Body p="5">
            <VStack gap="4" align="stretch">
              <HStack gap="4">
                {order.customerAvatar ? (
                  <Image
                    src={order.customerAvatar}
                    alt={order.customerName}
                    boxSize="12"
                    rounded="full"
                    objectFit="cover"
                  />
                ) : (
                  <Flex
                    boxSize="12"
                    rounded="full"
                    bg="bg.muted"
                    align="center"
                    justify="center"
                    fontSize="xl"
                    fontWeight="bold"
                    color="fg.muted"
                  >
                    {getInitials(order.customerName)}
                  </Flex>
                )}
                <Box>
                  <Text fontWeight="bold" color="fg">
                    {order.customerName}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    לקוח רשום
                  </Text>
                </Box>
              </HStack>

              <VStack gap="3" align="stretch" pt="2">
                <HStack gap="3" fontSize="sm">
                  <Text as="span" className="material-symbols-outlined" fontSize="20px" color="fg.muted">
                    mail
                  </Text>
                  <Text
                    as="a"
                    href={`mailto:${order.customerEmail}`}
                    color="fg"
                    _hover={{ color: 'blue.500' }}
                    dir="ltr"
                    truncate
                  >
                    {order.customerEmail}
                  </Text>
                </HStack>
                {order.customerPhone && (
                  <HStack gap="3" fontSize="sm">
                    <Text as="span" className="material-symbols-outlined" fontSize="20px" color="fg.muted">
                      call
                    </Text>
                    <Text
                      as="a"
                      href={`tel:${order.customerPhone}`}
                      color="fg"
                      _hover={{ color: 'blue.500' }}
                      dir="ltr"
                    >
                      {order.customerPhone}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Shipping Address Card */}
        <Card.Root overflow="hidden" h="full">
          <Box
            p="4"
            borderBottomWidth="1px"
            borderColor="border"
            bg="bg.subtle"
          >
            <HStack gap="2">
              <Text as="span" className="material-symbols-outlined" fontSize="20px" color="fg.muted">
                local_shipping
              </Text>
              <Text fontWeight="semibold" color="fg">
                כתובת למשלוח
              </Text>
            </HStack>
          </Box>
          <Card.Body p="5">
            <HStack gap="3" align="start">
              <Text as="span" className="material-symbols-outlined" fontSize="20px" color="fg.muted" mt="0.5">
                location_on
              </Text>
              <Box fontSize="sm" color="fg" lineHeight="relaxed">
                <Text>{order.shippingAddress.street}</Text>
                {order.shippingAddress.apartment && (
                  <Text>{order.shippingAddress.apartment}</Text>
                )}
                <Text>
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </Text>
                <Text>{order.shippingAddress.country}</Text>
              </Box>
            </HStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Order Items Card - Full Width */}
      <Card.Root overflow="hidden">
        <Box
          p="4"
          borderBottomWidth="1px"
          borderColor="border"
          bg="bg.subtle"
        >
          <HStack justify="space-between">
            <HStack gap="2">
              <Text as="span" className="material-symbols-outlined" fontSize="20px" color="fg.muted">
                list_alt
              </Text>
              <Text fontWeight="semibold" color="fg">
                פריטים בהזמנה
              </Text>
            </HStack>
            <Text
              bg="bg.muted"
              color="fg.muted"
              fontSize="xs"
              fontWeight="bold"
              px="2"
              py="0.5"
              rounded="full"
            >
              {order.items.length} פריטים
            </Text>
          </HStack>
        </Box>
        <Box overflowX="auto">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row bg="bg.subtle">
                <Table.ColumnHeader px="6" py="3" fontWeight="medium" color="fg.muted" w="50%">
                  מוצר
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="3" fontWeight="medium" color="fg.muted" textAlign="center">
                  כמות
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="3" fontWeight="medium" color="fg.muted" textAlign="start">
                  מחיר
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="3" fontWeight="medium" color="fg.muted" textAlign="start">
                  סה״כ
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {order.items.map((item) => (
                <Table.Row key={item.$id} _hover={{ bg: 'bg.subtle' }} transition="background 0.2s">
                  <Table.Cell px="6" py="4">
                    <HStack gap="4">
                      <Box
                        boxSize="16"
                        rounded="lg"
                        borderWidth="1px"
                        borderColor="border"
                        overflow="hidden"
                        flexShrink={0}
                        bg="white"
                      >
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            w="full"
                            h="full"
                            objectFit="cover"
                          />
                        ) : (
                          <Flex w="full" h="full" align="center" justify="center" bg="bg.muted">
                            <Text as="span" className="material-symbols-outlined" color="fg.muted">
                              image
                            </Text>
                          </Flex>
                        )}
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="fg">
                          {item.productName}
                        </Text>
                        {item.variant && (
                          <Text fontSize="xs" color="fg.muted" mt="1">
                            {item.variant}
                          </Text>
                        )}
                      </Box>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell px="6" py="4" textAlign="center" color="fg.muted">
                    {item.quantity}
                  </Table.Cell>
                  <Table.Cell px="6" py="4" textAlign="start" color="fg.muted">
                    {formatCurrency(item.price)}
                  </Table.Cell>
                  <Table.Cell px="6" py="4" textAlign="start" fontWeight="medium" color="fg">
                    {formatCurrency(item.total)}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Root>

      {/* Bottom Section: Payment Method & Summary */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
        {/* Payment Method */}
        <Card.Root overflow="hidden" h="full">
          <Box
            p="4"
            borderBottomWidth="1px"
            borderColor="border"
            bg="bg.subtle"
          >
            <HStack gap="2">
              <Text as="span" className="material-symbols-outlined" fontSize="20px" color="fg.muted">
                credit_card
              </Text>
              <Text fontWeight="semibold" color="fg">
                שיטת תשלום
              </Text>
            </HStack>
          </Box>
          <Card.Body p="6" display="flex" flexDirection="column" gap="4" flex="1" justifyContent="center">
            <HStack
              gap="4"
              p="4"
              borderWidth="1px"
              borderColor="border"
              rounded="lg"
              bg="bg.subtle"
            >
              <Flex
                w="12"
                h="8"
                bg="white"
                rounded="md"
                borderWidth="1px"
                borderColor="border"
                align="center"
                justify="center"
              >
                <Text fontWeight="bold" color="blue.800" fontStyle="italic" fontSize="xs">
                  VISA
                </Text>
              </Flex>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  {order.payment.method}
                </Text>
                {order.payment.cardExpiry && (
                  <Text fontSize="xs" color="fg.muted">
                    תוקף: {order.payment.cardExpiry}
                  </Text>
                )}
              </Box>
            </HStack>
            <HStack justify="space-between" fontSize="sm" color="fg.muted">
              <Text>מזהה תשלום:</Text>
              <Text fontFamily="mono" dir="ltr">{order.payment.transactionId}</Text>
            </HStack>
            <HStack justify="space-between" fontSize="sm" color="fg.muted">
              <Text>תאריך חיוב:</Text>
              <Text dir="ltr">{order.payment.chargeDate}</Text>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Payment Summary */}
        <Card.Root overflow="hidden">
          <Box
            p="4"
            borderBottomWidth="1px"
            borderColor="border"
            bg="bg.subtle"
          >
            <HStack gap="2">
              <Text as="span" className="material-symbols-outlined" fontSize="20px" color="fg.muted">
                receipt_long
              </Text>
              <Text fontWeight="semibold" color="fg">
                סיכום תשלום
              </Text>
            </HStack>
          </Box>
          <Card.Body p="5">
            <VStack gap="3" align="stretch">
              <HStack justify="space-between" fontSize="sm" color="fg.muted">
                <Text>סכום ביניים</Text>
                <Text>{formatCurrency(order.subtotal)}</Text>
              </HStack>
              <HStack justify="space-between" fontSize="sm" color="fg.muted">
                <Text>משלוח</Text>
                <Text>{formatCurrency(order.shippingCost)}</Text>
              </HStack>
              <HStack justify="space-between" fontSize="sm" color="fg.muted">
                <Text>מס (כלול)</Text>
                <Text>{formatCurrency(order.tax)}</Text>
              </HStack>
              <Separator />
              <HStack justify="space-between" fontWeight="bold" color="fg">
                <Text>סה״כ לתשלום</Text>
                <Text fontSize="lg">{formatCurrency(order.total)}</Text>
              </HStack>
              <Button
                variant="outline"
                size="sm"
                w="full"
                mt="2"
                borderColor="border"
                _hover={{ bg: 'bg.subtle' }}
                onClick={handleDownloadReceipt}
              >
                הורד קבלה
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </VStack>
  );
}
