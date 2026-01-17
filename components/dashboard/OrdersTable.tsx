import React from 'react';
import { Box, Flex, HStack, Heading, Text, Card, Table, Button, IconButton } from '@chakra-ui/react';
import StatusBadge, { orderStatusConfig } from '../shared/StatusBadge';

export interface Order {
  id: string;
  customer: string;
  initials: string;
  color: string;
  date: string;
  amount: string;
  status: string;
}

interface OrdersTableProps {
  orders: Order[];
  title?: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
}

const getAvatarColor = (color: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'blue.500/20', text: 'blue.500' },
    purple: { bg: 'purple.500/20', text: 'purple.500' },
    orange: { bg: 'orange.500/20', text: 'orange.500' },
  };
  return colors[color] || colors.blue;
};

export default function OrdersTable({ 
  orders, 
  title = 'הזמנות אחרונות',
  viewAllLabel = 'הצג הכל',
  onViewAll
}: OrdersTableProps) {
  return (
    <Card.Root bg="bg.panel" borderWidth="1px" borderColor="border" overflow="hidden">
      <Flex p="6" borderBottomWidth="1px" borderColor="border" justify="space-between" align="center">
        <Heading size="md" fontWeight="bold" color="fg">
          {title}
        </Heading>
        <Button 
          variant="plain" 
          color="blue.500" 
          fontSize="sm" 
          fontWeight="medium" 
          _hover={{ color: 'blue.400' }}
          onClick={onViewAll}
        >
          {viewAllLabel}
        </Button>
      </Flex>
      <Box overflowX="auto">
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row bg="bg/50">
              <Table.ColumnHeader px="6" py="4" fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase">
                מזהה הזמנה
              </Table.ColumnHeader>
              <Table.ColumnHeader px="6" py="4" fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase">
                לקוח
              </Table.ColumnHeader>
              <Table.ColumnHeader px="6" py="4" fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase">
                תאריך
              </Table.ColumnHeader>
              <Table.ColumnHeader px="6" py="4" fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase">
                סכום
              </Table.ColumnHeader>
              <Table.ColumnHeader px="6" py="4" fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase">
                סטטוס
              </Table.ColumnHeader>
              <Table.ColumnHeader px="6" py="4" fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase">
                פעולות
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {orders.map((order) => {
              const avatarColors = getAvatarColor(order.color);
              return (
                <Table.Row 
                  key={order.id} 
                  _hover={{ bg: 'bg/30' }}
                  transition="background 0.2s"
                >
                  <Table.Cell px="6" py="4" fontWeight="medium" color="fg">
                    {order.id}
                  </Table.Cell>
                  <Table.Cell px="6" py="4">
                    <HStack gap="3">
                      <Flex
                        w="8"
                        h="8"
                        rounded="full"
                        bg={avatarColors.bg}
                        color={avatarColors.text}
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {order.initials}
                      </Flex>
                      <Text>{order.customer}</Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell px="6" py="4" color="fg.muted">
                    {order.date}
                  </Table.Cell>
                  <Table.Cell px="6" py="4" fontWeight="medium">
                    {order.amount}
                  </Table.Cell>
                  <Table.Cell px="6" py="4">
                    <StatusBadge status={order.status} config={orderStatusConfig} variant="dot" />
                  </Table.Cell>
                  <Table.Cell px="6" py="4">
                    <IconButton
                      aria-label="פעולות נוספות"
                      variant="ghost"
                      size="sm"
                      color="fg.muted"
                      _hover={{ color: 'blue.500' }}
                    >
                      <Text as="span" className="material-symbols-outlined" fontSize="20px">
                        more_vert
                      </Text>
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Box>
    </Card.Root>
  );
}
