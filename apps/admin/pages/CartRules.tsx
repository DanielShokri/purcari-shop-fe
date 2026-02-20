// @ts-nocheck
// Type instantiation depth issues with Convex useQuery API
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from "@convex/api";
import { VStack } from '@chakra-ui/react';
import { LoadingState, PageHeader, DeleteConfirmationDialog } from '../components/shared';
import { CartRulesFilterToolbar, CartRulesTable } from '../components/cart-rules';
import { useEntityList } from '../hooks/useEntityList';
import { CartRule } from '@shared/types';

export default function CartRules() {
  const navigate = useNavigate();
  const deleteMutation = useMutation(api.cartRules.remove);
  const { items: cartRules, isLoading, hasEverLoaded, state, handlers } = useEntityList<CartRule>({
    query: api.cartRules.get,
    filters: [
      { key: 'search', type: 'search' },
      { key: 'type', type: 'select', field: 'ruleType', defaultValue: 'all' },
      { key: 'status', type: 'select', field: 'status', defaultValue: 'all' },
    ],
    itemsPerPage: 10,
    enableSelection: true,
  });
  const { paginatedItems, totalPages, currentPage, itemsPerPage, filters, selectedItems, deleteDialog } = state;
  const { setFilter, setPage, toggleSelection, selectAll, clearSelection, openDeleteDialog, closeDeleteDialog, confirmDelete } = handlers;

  // Only show spinner on first load (cold cache), not on return visits
  if (isLoading && !hasEverLoaded) return <LoadingState message="טוען חוקי עגלה..." />;

  return (
    <VStack gap="0" align="stretch" h="full">
      <PageHeader
        title="חוקי עגלה"
        subtitle="נהל את החוקים, ההנחות וההגבלות בעגלת הקניות של הלקוחות."
        actionLabel="חוק חדש"
        actionIcon="add"
        onAction={() => navigate('/cart-rules/new')}
      />
      <CartRulesFilterToolbar
        searchTerm={filters.search}
        onSearchChange={(value) => setFilter('search', value)}
        typeFilter={filters.type}
        onTypeFilterChange={(value) => setFilter('type', value)}
        statusFilter={filters.status}
        onStatusFilterChange={(value) => setFilter('status', value)}
      />
      <CartRulesTable
        cartRules={paginatedItems}
        selectedCartRules={selectedItems}
        onSelectAll={(checked) => checked ? selectAll() : clearSelection()}
        onSelectCartRule={(id, checked) => toggleSelection(id)}
        onEdit={(cartRuleId) => navigate(`/cart-rules/${cartRuleId}/edit`)}
        onDelete={(id) => {
          const rule = cartRules?.find((r) => r._id === id);
          if (rule) openDeleteDialog(rule);
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
        title="מחיקת חוק עגלה"
        message="האם אתה בטוח שברצונך למחוק חוק זה? פעולה זו לא ניתנת לביטול."
      />
    </VStack>
  );
}
