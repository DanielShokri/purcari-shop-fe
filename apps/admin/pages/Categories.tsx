// @ts-nocheck
// Type instantiation depth issues with Convex useQuery API
// This file compiles correctly at runtime but TypeScript cannot fully verify it

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';
import { Id } from '@convex/dataModel';
import { Category, CategoryStatus } from '@shared/types';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
} from '@chakra-ui/react';
import { LoadingState, Breadcrumbs, DeleteConfirmationDialog } from '../components/shared';
import { CategoryTreeToolbar, CategoryTreeItem, CategoryForm } from '../components/categories';

interface CategoryFormData {
  name: string;
  parentId: string | null;
  displayOrder: number;
  status: CategoryStatus;
  description: string;
}

export default function Categories() {
  const categories = useQuery(api.categories.list, { includeInactive: true });
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const deleteCategory = useMutation(api.categories.remove);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['1']));

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      parentId: null,
      displayOrder: 0,
      status: CategoryStatus.ACTIVE,
      description: '',
    },
  });

  const mappedCategories = useMemo(() => {
    return categories?.map(cat => ({
      ...cat,
      $id: cat._id,
      displayOrder: Number(cat.order) || 0,
    })) as unknown as (Category & { order?: bigint })[];
  }, [categories]);

  const selectedCategory = useMemo(() => {
    return mappedCategories?.find(c => c._id === selectedCategoryId) || null;
  }, [mappedCategories, selectedCategoryId]);

  // Build tree structure
  const buildCategoryTree = (cats: Category[]): (Category & { children?: Category[] })[] => {
    const categoryMap = new Map<string, Category & { children?: Category[] }>();
    const rootCategories: (Category & { children?: Category[] })[] = [];

    // First pass: create map
    cats.forEach(cat => {
      categoryMap.set(cat._id, { ...cat, children: [] });
    });

    // Second pass: build tree
    cats.forEach(cat => {
      const category = categoryMap.get(cat._id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parent = categoryMap.get(cat.parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(category);
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories.sort((a, b) => a.displayOrder - b.displayOrder);
  };

  const categoryTree = useMemo(() => {
    if (!mappedCategories) return [];
    const filtered = mappedCategories.filter(cat => 
      cat.name.includes(searchTerm)
    );
    return buildCategoryTree(filtered);
  }, [mappedCategories, searchTerm]);

   // Update form when category is selected
   useEffect(() => {
     if (selectedCategory) {
        reset({
          name: selectedCategory.name,
          parentId: selectedCategory.parentId || null,
          displayOrder: Number(selectedCategory.order ?? (selectedCategory as any).displayOrder) || 0,
          status: (selectedCategory.status as CategoryStatus) || CategoryStatus.ACTIVE,
          description: selectedCategory.description || '',
        });
     }
   }, [selectedCategory, reset]);

  if (categories === undefined) {
    return <LoadingState message="טוען קטגוריות..." />;
  }

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!categories) return;
    setExpandedCategories(new Set(categories.map(c => c._id)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const payload = {
        name: data.name,
        slug: data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        description: data.description,
        parentId: data.parentId || undefined,
        order: BigInt(data.displayOrder),
        status: data.status as "active" | "draft" | "hidden",
      };

      if (selectedCategoryId) {
        await updateCategory({ id: selectedCategoryId as Id<"categories">, ...payload });
      } else {
        await createCategory(payload);
      }
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  const handleDelete = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      await deleteCategory({ id: categoryToDelete as Id<"categories"> });
      if (selectedCategoryId === categoryToDelete) {
        setSelectedCategoryId(null);
        reset();
      }
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleCancel = () => {
    setSelectedCategoryId(null);
    reset({
      name: '',
      parentId: null,
      displayOrder: 0,
      status: CategoryStatus.ACTIVE,
      description: '',
    });
  };

  const handleCreateNew = () => {
    setSelectedCategoryId(null);
    reset({
      name: '',
      parentId: null,
      displayOrder: 0,
      status: CategoryStatus.ACTIVE,
      description: '',
    });
  };

  return (
    <VStack gap="6" align="stretch">
      <Breadcrumbs items={[{ label: 'בית', href: '#' }, { label: 'קטגוריות' }]} />

      {/* Page Title */}
      <Flex justify="space-between" align="start">
        <Box>
          <Heading size="xl" color="fg" mb="1">
            ניהול קטגוריות
          </Heading>
          <Text color="fg.muted">
            צפה, ערוך, והוסף קטגוריות חדשות לחנות שלך.
          </Text>
        </Box>
        <Button
          colorPalette="blue"
          size="md"
          shadow="sm"
          onClick={handleCreateNew}
          disabled={!selectedCategoryId}
        >
          <Text as="span" className="material-symbols-outlined" fontSize="20px">
            add
          </Text>
          <Text as="span">קטגוריה ראשית חדשה</Text>
        </Button>
      </Flex>

      {/* Split View Layout */}
      <Flex direction={{ base: 'column', lg: 'row' }} gap="6">
        {/* Left Side: Tree View */}
        <Box w={{ base: 'full', lg: '7/12' }} display="flex" flexDirection="column" gap="4">
          <CategoryTreeToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Tree List Container */}
          <Card.Root flex="1" display="flex" flexDirection="column" minH="0">
            <Box p="4" borderBottomWidth="1px" borderColor="border" bg="bg.subtle">
              <Flex justify="space-between" alignItems="center">
                <Text fontSize="sm" fontWeight="semibold" color="fg">
                  מבנה הקטגוריות
                </Text>
                <HStack gap="2">
                  <Button
                    variant="ghost"
                    size="xs"
                    colorPalette="blue"
                    onClick={expandAll}
                  >
                    הרחב הכל
                  </Button>
                  <Text color="border.muted">|</Text>
                  <Button
                    variant="ghost"
                    size="xs"
                    colorPalette="blue"
                    onClick={collapseAll}
                  >
                    כווץ הכל
                  </Button>
                </HStack>
              </Flex>
            </Box>
            <Box flex="1" overflowY="auto" p="2" maxH="600px">
              <VStack gap="1" align="stretch">
                {categoryTree.map(category => (
                  <CategoryTreeItem
                    key={category._id}
                    category={category}
                    level={0}
                    isExpanded={expandedCategories.has(category._id)}
                    isSelected={selectedCategoryId === category._id}
                    onToggleExpand={toggleExpand}
                    onSelect={setSelectedCategoryId}
                    onEdit={setSelectedCategoryId}
                    onDelete={handleDelete}
                    expandedCategories={expandedCategories}
                    selectedCategoryId={selectedCategoryId}
                  />
                ))}
              </VStack>
            </Box>
          </Card.Root>
        </Box>

        {/* Right Side: Edit Form */}
        <Box w={{ base: 'full', lg: '5/12' }} position={{ lg: 'sticky' }} top="0">
          <CategoryForm
            selectedCategory={selectedCategory}
            categories={mappedCategories}
            selectedCategoryId={selectedCategoryId}
            register={register}
            errors={errors}
            control={control}
            onSubmit={handleSubmit(onSubmit)}
            onCancel={handleCancel}
          />
        </Box>
      </Flex>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="מחיקת קטגוריה"
        message="האם אתה בטוח שברצונך למחוק קטגוריה זו? פעולה זו לא ניתנת לביטול."
      />
    </VStack>
  );
}
