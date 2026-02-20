// @ts-nocheck
// Type instantiation depth issues with Convex useQuery API
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '@convex/api';
import { VStack } from '@chakra-ui/react';
import { LoadingState, PageHeader, DeleteConfirmationDialog } from '../components/shared';
import { CouponsFilterToolbar, CouponsTable } from '../components/coupons';
import { useEntityList } from '../hooks/useEntityList';
import { Coupon } from '@shared/types';

export default function Coupons() {
  const navigate = useNavigate();
  const deleteMutation = useMutation(api.coupons.remove);
  const { items: coupons, isLoading, hasEverLoaded, state, handlers } = useEntityList<Coupon>({
    query: api.coupons.list,
    filters: [
      { key: 'search', type: 'search' },
      { key: 'status', type: 'select', field: 'status', defaultValue: 'all' },
      { key: 'discountType', type: 'select', field: 'discountType', defaultValue: 'all' },
    ],
    itemsPerPage: 10,
    enableSelection: true,
  });
  const { paginatedItems, totalPages, currentPage, itemsPerPage, filters, selectedItems, deleteDialog } = state;
  const { setFilter, setPage, toggleSelection, selectAll, clearSelection, openDeleteDialog, closeDeleteDialog, confirmDelete } = handlers;

  // Only show spinner on first load (cold cache), not on return visits
  if (isLoading && !hasEverLoaded) return <LoadingState message="טוען קופונים..." />;

  return (
    <VStack gap="0" align="stretch" h="full">
      <PageHeader
        title="קופונים"
        subtitle="ניהול ועריכת קופונים, מעקב אחר שימושים ותוקף."
        actionLabel="קופון חדש"
        actionIcon="add"
        onAction={() => navigate('/coupons/new')}
      />
      <CouponsFilterToolbar
        searchTerm={filters.search}
        onSearchChange={(value) => setFilter('search', value)}
        statusFilter={filters.status}
        onStatusFilterChange={(value) => setFilter('status', value)}
        discountTypeFilter={filters.discountType}
        onDiscountTypeFilterChange={(value) => setFilter('discountType', value)}
      />
      <CouponsTable
        coupons={paginatedItems}
        selectedCoupons={selectedItems}
        onSelectAll={(checked) => checked ? selectAll() : clearSelection()}
        onSelectCoupon={(id, checked) => toggleSelection(id)}
        onEdit={(couponId) => navigate(`/coupons/${couponId}/edit`)}
        onDelete={(id) => {
          const coupon = coupons?.find((c) => c._id === id);
          if (coupon) openDeleteDialog(coupon);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={state.filteredItems.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setPage}
      />
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={() => confirmDelete(deleteMutation)}
        isLoading={deleteDialog.isDeleting}
        title="מחיקת קופון"
        message="האם אתה בטוח שברצונך למחוק קופון זה? פעולה זו לא ניתנת לביטול."
      />
    </VStack>
  );
}
