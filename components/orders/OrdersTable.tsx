import React from 'react';
import { Box, Table, Checkbox, Card } from '@chakra-ui/react';
import { Order } from '@shared/types';
import { Pagination } from '../shared';
import OrderTableRow from './OrderTableRow';

interface OrdersTableProps {
  orders: Order[];
  selectedOrders: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOrder: (orderId: string, checked: boolean) => void;
  onView: (orderId: string) => void;
  onEdit: (orderId: string) => void;
  onDelete: (orderId: string) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function OrdersTable({
  orders,
  selectedOrders,
  onSelectAll,
  onSelectOrder,
  onView,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: OrdersTableProps) {
  return (
    <Box flex="1" minH="0">
      <Card.Root overflow="hidden" h="full" display="flex" flexDirection="column">
        <Table.ScrollArea flex="1">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row bg="bg.subtle">
                <Table.ColumnHeader px="6" py="4" w="12">
                  <Checkbox.Root
                    size="sm"
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onCheckedChange={(e) => onSelectAll(!!e.checked)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="4" fontSize="xs" textTransform="uppercase" fontWeight="semibold" color="fg.muted">
                  מזהה הזמנה
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="4" fontSize="xs" textTransform="uppercase" fontWeight="semibold" color="fg.muted">
                  שם לקוח
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="4" fontSize="xs" textTransform="uppercase" fontWeight="semibold" color="fg.muted" display={{ base: 'none', md: 'table-cell' }}>
                  תאריך
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="4" fontSize="xs" textTransform="uppercase" fontWeight="semibold" color="fg.muted">
                  סה"כ
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="4" fontSize="xs" textTransform="uppercase" fontWeight="semibold" color="fg.muted">
                  סטטוס
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="4" fontSize="xs" textTransform="uppercase" fontWeight="semibold" color="fg.muted" textAlign="start">
                  פעולות
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {orders.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7} px="6" py="8" textAlign="center" color="fg.subtle">
                    לא נמצאו הזמנות
                  </Table.Cell>
                </Table.Row>
              ) : (
                orders.map((order) => (
                  <OrderTableRow
                    key={order.$id}
                    order={order}
                    isSelected={selectedOrders.includes(order.$id)}
                    onSelect={(checked) => onSelectOrder(order.$id, checked)}
                    onView={() => onView(order.$id)}
                    onEdit={() => onEdit(order.$id)}
                    onDelete={() => onDelete(order.$id)}
                  />
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          itemLabel="הזמנות"
        />
      </Card.Root>
    </Box>
  );
}
