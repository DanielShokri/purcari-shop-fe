import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { VStack } from '@chakra-ui/react';
import { LoadingState, PageHeader, DeleteConfirmationDialog } from '../components/shared';
import { ProductsFilterToolbar, ProductsTable } from '../components/products';
import { ProductCategory } from '@shared/types';

// Sample product images for display
const productImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA6yEFtBfCi6R-A-lM2s3rZAbfh-E1ZRqy3GQrA4VjjLpKFeHSdjz3rh2S_8JHe_JgMP3IbomRXYD8Ij8xqjUqhLMvaaYYFeVMuQ1hgwqFKr286N6OJ7Q6Gl6Sb3r5IBHJoZY5dVwrx6DV5E-Tn9WYsFcE14kQuJq_eW2oa_ylzbSprigxwXuGvE7OINLFn4q9QUnoLYn6Ie8Q2thNMMWU_-YtT88cF-ywCslkC8WoY1l460-fnKHhXITurvZBx5WlDi0t6Q-sWsg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBLQTiVirMdFO6Y3FL4kFi4w946KPqmC1Z-RfPKa-VI5ODxNqR80seXB9QHzsUwLMMniSWydWr5_d1XAxZO-yImHxBUgXhlS3TNNZ73YV0RIAfKPmwmItiQC1nYzMLs0L1_jkuW7zXOkN4i_a1ZBYpAE9qyGtQWC29mBgkjysy70Ase25CZ_T8u-fWj7EoXhXxPG5M8GSR6FIWBrlxUYQAqK5VheNhViOdKxTWb4E6Z7ZRESZKMls5u0luft54EHvqj8q3SyZkMdA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAzlo10Nq6-hELrI-Kiv1Fv4RRqwGI_Ov9S-2vtXpJ4IFj4Un2hUwZ3W0aLW6ZIiaSFE5w_3De3Jol3YG6XI9_S3NmrlhpgvgvySlF6dpoashzc1XTWay2pPZMRo-FEvOfcH3bi-Iae3noHitVgfsar8-PCEgXaw41gfpFOQkgGZeZUX7SDlDtFqySVGENw7yKBv48D8pOR4DsLCDqO1Wkg3MCWjuTX4b-xwHfuEHU4P95JMOEFPbwKnvv_ChqmdcaRYGsgUdSAgA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAXSM94jp3rYNUvmGTNi_jD4pB-FLQ1lg9f0THA4YkzA_DG-MKIBnFP8SyuhhSekru7ErOs5KvDtC3Bl_NPAwW92MiOFPW0WXyUPeQ6vwqApJNQtH5tEPAoo38x9jm_8dyeV7UyuvZbsblBdOh8mdsQVN_2h4D_SpGXMnsIIoy8QqhCLlkEaZxo_d5_cM-tDMWUuKnjpq8kysSH90qfs9YhU_nBSVDTX7riUR-m9xG24HT1DuFhmlKyggnJSGRNdwzWlZl32LBMFQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuClJjWbcXEQCsicgRXJpssjEfrfl6ij503ghWJb6B5e9e5GpEchfrSHslsSzIKDnwEQ52nvlYwdvQ2axU_Hjocbsps5powZLQpjbHXh0aLexU8UDnSdUcY0R0cZrzHAYd3Ly-0XifNvR-7k0tUp71N7HfXMj-tbf1M6BLRuWzS0qSKex4gbnxZS4Q8BjqYsEJo9HCJcVlZfTDi0JOe2i3tpgnX__6IZeSt21BYf4hgiBgTR5u2tcFVfY1TBxd7B4KARfD_t7FiCXw',
];

// Category labels in Hebrew (matching Appwrite enum values with hyphens)
const categoryLabels: Record<string, string> = {
  'red_wine': 'יינות אדומים',
  'white_wine': 'יינות לבנים',
  'rose_wine': 'יינות רוזה',
  'sparkling_wine': 'יינות מבעבעים',
  'dessert_wine': 'יינות קינוח',
  'gift_sets': 'מארזי מתנה',
};

export default function Products() {
  const navigate = useNavigate();
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const products = useQuery(api.products.list, {
    category: statusFilter === 'all' ? undefined : statusFilter
  });
  
  const deleteProductMutation = useMutation(api.products.remove);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

  if (products === undefined) {
    return <LoadingState message="טוען מוצרים..." />;
  }

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await deleteProductMutation({ id: productToDelete });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(paginatedProducts.map(p => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const getCategoryLabel = (category: string): string => categoryLabels[category] || category;
  const getRandomImage = (index: number): string => productImages[index % productImages.length];

  // Map Convex products to table compatible format
  const tableProducts = paginatedProducts.map(p => ({
    ...p,
    $id: p._id,
    $createdAt: p.createdAt,
  }));

  return (
    <VStack gap="0" align="stretch" h="full">
      <PageHeader
        title="מוצרים"
        subtitle="ניהול ועריכת המוצרים בחנות, מעקב אחר מלאי וסטטוסים."
        actionLabel="מוצר חדש"
        actionIcon="add"
        onAction={() => navigate('/products/new')}
      />

      <ProductsFilterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <ProductsTable
        products={tableProducts}
        selectedProducts={selectedProducts}
        onSelectAll={handleSelectAll}
        onSelectProduct={handleSelectProduct}
        onEdit={(productId) => navigate(`/products/${productId}/edit`)}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredProducts.length}
        itemsPerPage={productsPerPage}
        onPageChange={setCurrentPage}
        getCategoryLabel={getCategoryLabel}
        getRandomImage={getRandomImage}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="מחיקת מוצר"
        message="האם אתה בטוח שברצונך למחוק מוצר זה? פעולה זו לא ניתנת לביטול."
      />
    </VStack>
  );
}

