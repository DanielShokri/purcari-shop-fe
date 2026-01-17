import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useGetProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } from '../services/api';
import { Product, ProductStatus, StockStatus } from '../types';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Input,
  Textarea,
  Button,
  Card,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { LoadingState, Breadcrumbs } from '../components/shared';
import {
  PublishCard,
  CategoriesCard,
  TagsCard,
  FeaturedImageCard,
  EditorFooter,
  PricingCard,
  InventoryCard,
  RelatedProductsCard,
} from '../components/post-editor';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { RichTextEditor, Control } from '../components/ui/rich-text-editor';

// Sample categories
const categories = [
  { id: '1', name: 'ביגוד והנעלה' },
  { id: '2', name: 'אלקטרוניקה' },
  { id: '3', name: 'בית וגן' },
  { id: '4', name: 'אביזרים' },
];

export default function ProductEditor() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const { data: products, isLoading: isLoadingProducts } = useGetProductsQuery(undefined);
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const existingProduct = isEditMode ? products?.find(p => p.$id === id) : null;

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<Partial<Product>>({
    defaultValues: existingProduct || {
      title: '',
      content: '',
      status: ProductStatus.DRAFT,
    },
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    existingProduct?.categoryId ? [existingProduct.categoryId] : ['1']
  );
  const [tags, setTags] = useState<string[]>(['חדש', 'מבצע']);
  const [tagInput, setTagInput] = useState('');

  // Pricing state
  const [price, setPrice] = useState<number>(existingProduct?.price || 0);
  const [onSale, setOnSale] = useState<boolean>(existingProduct?.onSale || false);
  const [salePrice, setSalePrice] = useState<number>(existingProduct?.salePrice || 0);

  // Inventory state
  const [sku, setSku] = useState<string>(existingProduct?.sku || '');
  const [stockStatus, setStockStatus] = useState<StockStatus>(existingProduct?.stockStatus || StockStatus.IN_STOCK);
  const [isFeatured, setIsFeatured] = useState<boolean>(existingProduct?.isFeatured || false);

  // Related products state
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(existingProduct?.relatedProducts || []);

  // Available products for related products selector (excluding current product)
  const availableProducts = products?.filter(p => p.$id !== id).map(p => ({
    id: p.$id,
    name: p.title
  })) || [];

  // Get related products with names
  const relatedProducts = relatedProductIds.map(rpId => {
    const product = products?.find(p => p.$id === rpId);
    return { id: rpId, name: product?.title || 'מוצר לא נמצא' };
  });

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'התחל לכתוב את תיאור המוצר...',
      }),
    ],
    content: existingProduct?.content || '',
    onUpdate: ({ editor }) => {
      setValue('content', editor.getHTML());
    },
  });

  // Update editor content when existingProduct changes
  useEffect(() => {
    if (editor && existingProduct?.content) {
      editor.commands.setContent(existingProduct.content);
    }
  }, [editor, existingProduct?.content]);

  if (isLoadingProducts) {
    return <LoadingState message="טוען..." />;
  }

  const onSubmit = async (data: Partial<Product>) => {
    try {
      const content = editor?.getHTML() || '';
      const productData = {
        ...data,
        content,
        categoryId: selectedCategories[0],
        price,
        onSale,
        salePrice: onSale ? salePrice : undefined,
        sku,
        stockStatus,
        isFeatured,
        relatedProducts: relatedProductIds,
      };
      if (isEditMode && id) {
        await updateProduct({ id, ...productData }).unwrap();
      } else {
        await createProduct(productData).unwrap();
      }
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleSave = () => {
    handleSubmit(onSubmit)();
  };

  const handleCancel = () => {
    navigate('/products');
  };

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
      try {
        await deleteProduct(id).unwrap();
        navigate('/products');
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleAddRelatedProduct = (productId: string) => {
    if (!relatedProductIds.includes(productId)) {
      setRelatedProductIds([...relatedProductIds, productId]);
    }
  };

  const handleRemoveRelatedProduct = (productId: string) => {
    setRelatedProductIds(relatedProductIds.filter(id => id !== productId));
  };

  return (
    <Box h="full" display="flex" flexDirection="column">
      <Box flex="1" overflowY="auto" css={{ scrollBehavior: 'smooth' }}>
        <Box maxW="1200px" mx="auto" w="full" pb="24">
          <Breadcrumbs 
            items={[
              { label: 'ראשי', href: '#' },
              { label: 'מוצרים', href: '#/products' },
              { label: isEditMode ? 'עריכת מוצר' : 'יצירת מוצר' }
            ]} 
          />

          {/* Header */}
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between"
            align={{ base: 'start', sm: 'center' }}
            gap="4"
            mb="8"
          >
            <Box>
              <Heading size="2xl" color="fg" mb="1" letterSpacing="tight">
                {isEditMode ? 'עריכת מוצר' : 'יצירת מוצר'}
              </Heading>
              <Text color="fg.muted" fontSize="sm">
                {isEditMode ? 'ערוך את פרטי המוצר, התיאור וההגדרות' : 'צור מוצר חדש עם תיאור והגדרות'}
              </Text>
            </Box>
            <Button variant="outline" size="sm" bg="bg.panel" borderColor="border">
              <Text as="span" className="material-symbols-outlined" fontSize="lg">
                visibility
              </Text>
              תצוגה מקדימה
            </Button>
          </Flex>

          <form id="product-form" onSubmit={handleSubmit(onSubmit)}>
            <SimpleGrid columns={{ base: 1, lg: 12 }} gap={{ base: 6, lg: 8 }} alignItems="start">
              {/* Main Content Column */}
              <VStack gap="6" gridColumn={{ lg: 'span 8' }} align="stretch">
                {/* Title */}
                <Card.Root>
                  <Card.Body p="6">
                    <Text fontSize="sm" fontWeight="bold" color="fg" mb="3">
                      שם המוצר
                    </Text>
                    <Input
                      {...register('title', { required: 'שדה חובה' })}
                      size="lg"
                      fontSize="lg"
                      fontWeight="medium"
                      placeholder="הוסף שם מוצר כאן..."
                      bg="bg.subtle"
                      borderColor="border"
                      _focus={{ ring: 4, ringColor: 'blue.500/10', borderColor: 'blue.500' }}
                    />
                    {errors.title && (
                      <Text fontSize="xs" color="red.500" mt="1">{errors.title.message}</Text>
                    )}
                  </Card.Body>
                </Card.Root>

                {/* Rich Text Editor */}
                <RichTextEditor.Root 
                  editor={editor}
                  css={{
                    "--content-min-height": "400px",
                  }}
                >
                  <RichTextEditor.Toolbar>
                    <RichTextEditor.ControlGroup>
                      <Control.TextStyle />
                    </RichTextEditor.ControlGroup>
                    <RichTextEditor.ControlGroup>
                      <Control.Bold />
                      <Control.Italic />
                      <Control.Strikethrough />
                    </RichTextEditor.ControlGroup>
                    <RichTextEditor.ControlGroup>
                      <Control.AlignRight />
                      <Control.AlignCenter />
                      <Control.AlignLeft />
                    </RichTextEditor.ControlGroup>
                    <RichTextEditor.ControlGroup>
                      <Control.BulletList />
                      <Control.OrderedList />
                      <Control.Blockquote />
                    </RichTextEditor.ControlGroup>
                    <RichTextEditor.ControlGroup>
                      <Control.Undo />
                      <Control.Redo />
                    </RichTextEditor.ControlGroup>
                  </RichTextEditor.Toolbar>
                  <RichTextEditor.Content />
                </RichTextEditor.Root>

                {/* Short Description */}
                <Card.Root>
                  <Card.Body p="6">
                    <Flex justify="space-between" align="center" mb="3">
                      <Text fontSize="sm" fontWeight="bold" color="fg">
                        תיאור קצר
                      </Text>
                      <Badge fontSize="xs" bg="bg.subtle" px="2" py="1" rounded="md">
                        אופציונלי
                      </Badge>
                    </Flex>
                    <Textarea
                      {...register('slug')}
                      placeholder="כתוב תיאור קצר שיופיע ברשימת המוצרים..."
                      minH="80px"
                      bg="bg.subtle"
                      borderColor="border"
                      fontSize="sm"
                      _focus={{ ring: 4, ringColor: 'blue.500/10', borderColor: 'blue.500' }}
                    />
                  </Card.Body>
                </Card.Root>

                {/* Related Products */}
                <RelatedProductsCard
                  relatedProducts={relatedProducts}
                  availableProducts={availableProducts}
                  onAddProduct={handleAddRelatedProduct}
                  onRemoveProduct={handleRemoveRelatedProduct}
                />
              </VStack>

              {/* Sidebar Column */}
              <VStack gap="6" gridColumn={{ lg: 'span 4' }} align="stretch">
                <PublishCard
                  register={register}
                  isEditMode={isEditMode}
                  isCreating={isCreating}
                  isUpdating={isUpdating}
                  isDeleting={isDeleting}
                  onDelete={handleDelete}
                />

                <PricingCard
                  price={price}
                  onPriceChange={setPrice}
                  onSale={onSale}
                  onSaleChange={setOnSale}
                  salePrice={salePrice}
                  onSalePriceChange={setSalePrice}
                />

                <InventoryCard
                  sku={sku}
                  onSkuChange={setSku}
                  stockStatus={stockStatus}
                  onStockStatusChange={setStockStatus}
                  isFeatured={isFeatured}
                  onFeaturedChange={setIsFeatured}
                />

                <CategoriesCard
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onCategoryToggle={handleCategoryToggle}
                />

                <TagsCard
                  tags={tags}
                  tagInput={tagInput}
                  onTagInputChange={setTagInput}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                />

                <FeaturedImageCard />
              </VStack>
            </SimpleGrid>
          </form>
        </Box>
      </Box>

      <EditorFooter
        isEditMode={isEditMode}
        isCreating={isCreating}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
    </Box>
  );
}
