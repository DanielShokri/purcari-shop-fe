import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '../services/api';
import { Category, CategoryStatus } from '../types';
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
import { LoadingState, Breadcrumbs } from '../components/shared';
import { CategoryTreeToolbar, CategoryTreeItem, CategoryForm } from '../components/categories';

interface CategoryFormData {
  name: string;
  parentId: string | null;
  displayOrder: number;
  status: CategoryStatus;
  description: string;
}

export default function Categories() {
  const { data: categories, isLoading } = useGetCategoriesQuery(undefined);
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['1']));

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      parentId: null,
      displayOrder: 0,
      status: CategoryStatus.ACTIVE,
      description: '',
    },
  });

  const selectedCategory = useMemo(() => {
    return categories?.find(c => c.$id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  // Build tree structure
  const buildCategoryTree = (categories: Category[]): (Category & { children?: Category[] })[] => {
    const categoryMap = new Map<string, Category & { children?: Category[] }>();
    const rootCategories: (Category & { children?: Category[] })[] = [];

    // First pass: create map
    categories.forEach(cat => {
      categoryMap.set(cat.$id, { ...cat, children: [] });
    });

    // Second pass: build tree
    categories.forEach(cat => {
      const category = categoryMap.get(cat.$id)!;
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
    if (!categories) return [];
    const filtered = categories.filter(cat => 
      cat.name.includes(searchTerm)
    );
    return buildCategoryTree(filtered);
  }, [categories, searchTerm]);

  // Update form when category is selected
  useEffect(() => {
    if (selectedCategory) {
      reset({
        name: selectedCategory.name,
        parentId: selectedCategory.parentId || null,
        displayOrder: selectedCategory.displayOrder,
        status: selectedCategory.status,
        description: selectedCategory.description || '',
      });
    }
  }, [selectedCategory, reset]);

  if (isLoading) {
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
    setExpandedCategories(new Set(categories.map(c => c.$id)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (selectedCategoryId) {
        await updateCategory({ id: selectedCategoryId, ...data });
      } else {
        await createCategory(data);
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו?')) {
      await deleteCategory(categoryId);
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
        reset();
      }
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
                    key={category.$id}
                    category={category}
                    level={0}
                    isExpanded={expandedCategories.has(category.$id)}
                    isSelected={selectedCategoryId === category.$id}
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
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            register={register}
            errors={errors}
            onSubmit={handleSubmit(onSubmit)}
            onCancel={handleCancel}
          />
        </Box>
      </Flex>
    </VStack>
  );
}
