// @ts-nocheck
// Type instantiation depth issues with Convex useQuery API
// This file compiles correctly at runtime but TypeScript cannot fully verify it

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';
import { Order, OrderStatus } from '@shared/types';
import { toaster } from '../components/ui/toaster';

export interface UseOrdersFilters {
  activeChip: string;
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
}

export interface UseOrdersDeleteDialog {
  isOpen: boolean;
  order: Order | null;
  isCancelling: boolean;
}

export interface UseOrdersPagination {
  currentPage: number;
  totalPages: number;
  ordersPerPage: number;
}

export interface UseOrdersState {
  filteredOrders: Order[];
  paginatedOrders: Order[];
  selectedOrders: string[];
  statusCounts: Record<string, number>;
  deleteDialog: UseOrdersDeleteDialog;
  filters: UseOrdersFilters;
  pagination: UseOrdersPagination;
}

export interface UseOrdersHandlers {
  setActiveChip: (chip: string) => void;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  setDateFilter: (date: string) => void;
  setCurrentPage: (page: number) => void;
  toggleOrderSelection: (orderId: string, selected: boolean) => void;
  selectAllOrders: (selected: boolean) => void;
  clearSelection: () => void;
  openDeleteDialog: (order: Order) => void;
  closeDeleteDialog: () => void;
  confirmDelete: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export interface UseOrdersReturn {
  orders: Order[] | undefined;
  isLoading: boolean;
  state: UseOrdersState;
  handlers: UseOrdersHandlers;
}

const ORDERS_PER_PAGE = 10;

// Date filtering helper
const isWithinDateRange = (dateStr: string, range: string): boolean => {
  if (range === 'all') return true;
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'today':
      return date >= today;
    case 'week': {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }
    case 'month': {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return date >= monthAgo;
    }
    default:
      return true;
  }
};

export function useOrders(): UseOrdersReturn {
  // Data fetching
  const [activeChip, setActiveChip] = useState<string>('all');
  const orders = useQuery(api.orders.listAll, {
    status: activeChip !== 'all' ? (activeChip as any) : undefined,
  });
  const isLoading = orders === undefined;
  const updateOrderStatusMutation = useMutation(api.orders.updateStatus);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Selection state
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Calculate status counts for chips
  const statusCounts = useMemo(() => {
    if (!orders) return {};
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [orders]);

  // Apply all filters
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order) => {
      // Search filter
      const matchesSearch =
        order._id.includes(searchTerm) ||
        order.customerName.includes(searchTerm) ||
        order.customerEmail.includes(searchTerm);

      // Status filter (from dropdown)
      const matchesStatusFilter =
        statusFilter === 'all' || order.status === statusFilter;

      // Status chip filter
      const matchesChip =
        activeChip === 'all' || order.status === activeChip;

      // Date filter
      const matchesDate = isWithinDateRange(order.createdAt, dateFilter);

      return matchesSearch && matchesStatusFilter && matchesChip && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, activeChip, dateFilter]);

  // Pagination
  const totalPages = useMemo(
    () => Math.ceil(filteredOrders.length / ORDERS_PER_PAGE),
    [filteredOrders.length]
  );

  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(
      (currentPage - 1) * ORDERS_PER_PAGE,
      currentPage * ORDERS_PER_PAGE
    );
  }, [filteredOrders, currentPage]);

  // Handlers
  const handleSetActiveChip = (chip: string) => {
    setActiveChip(chip);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const handleSetSearchTerm = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSetStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSetDateFilter = (date: string) => {
    setDateFilter(date);
    setCurrentPage(1);
  };

  const toggleOrderSelection = (orderId: string, selected: boolean) => {
    if (selected) {
      setSelectedOrders((prev) => [...prev, orderId]);
    } else {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const selectAllOrders = (selected: boolean) => {
    if (selected) {
      setSelectedOrders(paginatedOrders.map((o) => o._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const clearSelection = () => {
    setSelectedOrders([]);
  };

  const openDeleteDialog = (order: Order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      setIsCancelling(true);
      try {
        await updateOrderStatusMutation({
          orderId: orderToDelete._id,
          status: 'cancelled',
        });
        toaster.create({
          title: 'הזמנה בוטלה',
          type: 'success',
        });
      } catch (error) {
        toaster.create({
          title: 'שגיאה בביטול הזמנה',
          type: 'error',
        });
      } finally {
        setIsCancelling(false);
        setDeleteDialogOpen(false);
        setOrderToDelete(null);
      }
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatusMutation({ orderId, status });
      toaster.create({
        title: 'סטטוס הזמנה עודכן',
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'שגיאה בעדכון סטטוס',
        type: 'error',
      });
    }
  };

  return {
    orders,
    isLoading,
    state: {
      filteredOrders,
      paginatedOrders,
      selectedOrders,
      statusCounts,
      deleteDialog: {
        isOpen: deleteDialogOpen,
        order: orderToDelete,
        isCancelling,
      },
      filters: {
        activeChip,
        searchTerm,
        statusFilter,
        dateFilter,
      },
      pagination: {
        currentPage,
        totalPages,
        ordersPerPage: ORDERS_PER_PAGE,
      },
    },
    handlers: {
      setActiveChip: handleSetActiveChip,
      setSearchTerm: handleSetSearchTerm,
      setStatusFilter: handleSetStatusFilter,
      setDateFilter: handleSetDateFilter,
      setCurrentPage,
      toggleOrderSelection,
      selectAllOrders,
      clearSelection,
      openDeleteDialog,
      closeDeleteDialog,
      confirmDelete,
      updateOrderStatus,
    },
  };
}
