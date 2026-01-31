import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { VStack } from '@chakra-ui/react';
import { LoadingState, PageHeader, DeleteConfirmationDialog } from '../components/shared';
import { CartRulesFilterToolbar, CartRulesTable } from '../components/cart-rules';

export default function CartRules() {
  const navigate = useNavigate();
  const cartRules = useQuery(api.cartRules.get);
  const deleteCartRule = useMutation(api.cartRules.remove);
  const isLoading = cartRules === undefined;

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCartRules, setSelectedCartRules] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cartRulesPerPage = 10;

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cartRuleToDelete, setCartRuleToDelete] = useState<Id<"cartRules"> | null>(null);

  if (isLoading) {
    return <LoadingState message="טוען חוקי עגלה..." />;
  }

  const filteredCartRules = cartRules?.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesType = typeFilter === 'all' || rule.ruleType === typeFilter;
    const matchesStatus = statusFilter === 'all' || rule.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const totalPages = Math.ceil(filteredCartRules.length / cartRulesPerPage);
  const paginatedCartRules = filteredCartRules.slice(
    (currentPage - 1) * cartRulesPerPage,
    currentPage * cartRulesPerPage
  ).map(r => ({ ...r, $id: r._id }));

  const handleDelete = (id: string) => {
    setCartRuleToDelete(id as Id<"cartRules">);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (cartRuleToDelete) {
      await deleteCartRule({ id: cartRuleToDelete });
      setDeleteDialogOpen(false);
      setCartRuleToDelete(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCartRules(paginatedCartRules.map(r => r._id));
    } else {
      setSelectedCartRules([]);
    }
  };

  const handleSelectCartRule = (cartRuleId: string, checked: boolean) => {
    if (checked) {
      setSelectedCartRules(prev => [...prev, cartRuleId]);
    } else {
      setSelectedCartRules(prev => prev.filter(id => id !== cartRuleId));
    }
  };

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
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <CartRulesTable
        cartRules={paginatedCartRules}
        selectedCartRules={selectedCartRules}
        onSelectAll={handleSelectAll}
        onSelectCartRule={handleSelectCartRule}
        onEdit={(cartRuleId) => navigate(`/cart-rules/${cartRuleId}/edit`)}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredCartRules.length}
        itemsPerPage={cartRulesPerPage}
        onPageChange={setCurrentPage}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCartRuleToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="מחיקת חוק עגלה"
        message="האם אתה בטוח שברצונך למחוק חוק זה? פעולה זו לא ניתנת לביטול."
      />
    </VStack>
  );
}
