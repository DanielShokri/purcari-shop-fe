import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';
import { Id } from '@convex/dataModel';
import { VStack } from '@chakra-ui/react';
import { LoadingState, PageHeader, DeleteConfirmationDialog } from '../components/shared';
import { CouponsFilterToolbar, CouponsTable } from '../components/coupons';
import { CouponStatus, CouponDiscountType, Coupon } from '@shared/types';

export default function Coupons() {
  const navigate = useNavigate();
  const coupons = useQuery(api.coupons.list, {});
  const deleteMutation = useMutation(api.coupons.remove);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [discountTypeFilter, setDiscountTypeFilter] = useState<string>('all');
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const couponsPerPage = 10;

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  const mappedCoupons = useMemo(() => {
    return coupons?.map(coupon => ({
      ...coupon,
      $id: coupon._id,
    })) as unknown as Coupon[];
  }, [coupons]);

  if (coupons === undefined) {
    return <LoadingState message="טוען קופונים..." />;
  }

  const filteredCoupons = mappedCoupons?.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter;
    const matchesDiscountType = discountTypeFilter === 'all' || coupon.discountType === discountTypeFilter;
    return matchesSearch && matchesStatus && matchesDiscountType;
  }) || [];

  const totalPages = Math.ceil(filteredCoupons.length / couponsPerPage);
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * couponsPerPage,
    currentPage * couponsPerPage
  );

  const handleDelete = (id: string) => {
    setCouponToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (couponToDelete) {
      await deleteMutation({ id: couponToDelete as Id<"coupons"> });
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCoupons(paginatedCoupons.map(c => c._id));
    } else {
      setSelectedCoupons([]);
    }
  };

  const handleSelectCoupon = (couponId: string, checked: boolean) => {
    if (checked) {
      setSelectedCoupons(prev => [...prev, couponId]);
    } else {
      setSelectedCoupons(prev => prev.filter(id => id !== couponId));
    }
  };

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
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        discountTypeFilter={discountTypeFilter}
        onDiscountTypeFilterChange={setDiscountTypeFilter}
      />

      <CouponsTable
        coupons={paginatedCoupons}
        selectedCoupons={selectedCoupons}
        onSelectAll={handleSelectAll}
        onSelectCoupon={handleSelectCoupon}
        onEdit={(couponId) => navigate(`/coupons/${couponId}/edit`)}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredCoupons.length}
        itemsPerPage={couponsPerPage}
        onPageChange={setCurrentPage}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCouponToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="מחיקת קופון"
        message="האם אתה בטוח שברצונך למחוק קופון זה? פעולה זו לא ניתנת לביטול."
      />
    </VStack>
  );
}
