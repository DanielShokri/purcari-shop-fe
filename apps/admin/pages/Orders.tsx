import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from "convex/react";
import { api } from '@convex/api';
import { OrderStatus, Order } from '@shared/types';
import { VStack, HStack, Button, Text } from '@chakra-ui/react';
import { LoadingState, PageHeader, Breadcrumbs, DeleteConfirmationDialog } from '../components/shared';
import { OrdersFilterToolbar, OrderStatusChips, OrdersTable } from '../components/orders';
import { toaster } from '../components/ui/toaster';

export default function Orders() {
  const navigate = useNavigate();
  const [activeChip, setActiveChip] = useState<string>('all');
  
  const orders = useQuery(api.orders.listAll, { 
    status: activeChip !== 'all' ? (activeChip as any) : undefined 
  });
  const isLoading = orders === undefined;
  const updateOrderStatus = useMutation(api.orders.updateStatus);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Calculate status counts for chips
  const statusCounts = useMemo(() => {
    if (!orders) return {};
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [orders]);

  if (isLoading) {
    return <LoadingState message="טוען הזמנות..." />;
  }

  // Filter by date helper
  const isWithinDateRange = (dateStr: string, range: string): boolean => {
    if (range === 'all') return true;
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return date >= today;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return date >= monthAgo;
      default:
        return true;
    }
  };

  const filteredOrders = orders?.filter(order => {
    // Search filter
    const matchesSearch = 
      order._id.includes(searchTerm) || 
      order.customerName.includes(searchTerm) ||
      order.customerEmail.includes(searchTerm);
    
    // Status filter (from dropdown)
    const matchesStatusFilter = statusFilter === 'all' || order.status === statusFilter;
    
    // Status chip filter
    const matchesChip = activeChip === 'all' || order.status === activeChip;
    
     // Date filter
     const matchesDate = isWithinDateRange(order.createdAt, dateFilter);
    
    return matchesSearch && matchesStatusFilter && matchesChip && matchesDate;
  }) || [];

   const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
const paginatedOrders = filteredOrders.slice(
      (currentPage - 1) * ordersPerPage,
      currentPage * ordersPerPage
    ) as Order[];

  const handleDelete = (order: any) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (orderToDelete) {
      setIsCancelling(true);
      try {
        await updateOrderStatus({ orderId: orderToDelete._id, status: 'cancelled' });
        toaster.create({
          title: "הזמנה בוטלה",
          type: "success",
        });
      } catch (error) {
        toaster.create({
          title: "שגיאה בביטול הזמנה",
          type: "error",
        });
      } finally {
        setIsCancelling(false);
        setDeleteDialogOpen(false);
        setOrderToDelete(null);
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(paginatedOrders.map(o => o._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleView = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleEdit = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleChipChange = (chip: string) => {
    setActiveChip(chip);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const handleExport = () => {
    // Export functionality placeholder
  };

  const handleNewOrder = () => {
    // New order functionality placeholder
  };

  return (
    <VStack gap="0" align="stretch" h="full">
      <Breadcrumbs items={[{ label: 'בית', href: '#/' }, { label: 'הזמנות' }]} />

      {/* Page Header with Actions */}
      <VStack align="stretch" gap="4" py="8">
        <HStack justify="space-between" align="start" flexWrap="wrap" gap="4">
          <VStack align="start" gap="1">
            <Text fontSize="3xl" fontWeight="bold" color="fg" letterSpacing="tight">
              הזמנות
            </Text>
            <Text color="fg.muted" fontSize="sm">
              נהל את כל ההזמנות והסטטוסים במקום אחד
            </Text>
          </VStack>
          <HStack gap="3">
            <Button
              variant="outline"
              size="md"
              onClick={handleExport}
              borderColor="border"
              _hover={{ bg: 'bg.subtle' }}
            >
              <Text as="span" className="material-symbols-outlined" fontSize="20px">
                download
              </Text>
              <Text as="span">ייצוא דוח</Text>
            </Button>
            <Button
              colorPalette="blue"
              size="md"
              shadow="sm"
              onClick={handleNewOrder}
            >
              <Text as="span" className="material-symbols-outlined" fontSize="20px">
                add
              </Text>
              <Text as="span">הזמנה חדשה</Text>
            </Button>
          </HStack>
        </HStack>
      </VStack>

      <OrdersFilterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      <OrderStatusChips
        activeChip={activeChip}
        onChipChange={handleChipChange}
        statusCounts={statusCounts}
        totalCount={orders?.length || 0}
      />

      <OrdersTable
        orders={paginatedOrders}
        selectedOrders={selectedOrders}
        onSelectAll={handleSelectAll}
        onSelectOrder={handleSelectOrder}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredOrders.length}
        itemsPerPage={ordersPerPage}
        onPageChange={setCurrentPage}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setOrderToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="ביטול הזמנה"
        message="האם אתה בטוח שברצונך לבטל הזמנה זו?"
        isDeleting={isCancelling}
      />
    </VStack>
  );
}
