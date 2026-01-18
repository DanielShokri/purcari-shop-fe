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

// Categories matching Appwrite enum values
const categories = [
  { id: 'electronics', name: 'אלקטרוניקה' },
  { id: 'clothing', name: 'ביגוד' },
  { id: 'home', name: 'בית וגן' },
  { id: 'beauty', name: 'יופי וטיפוח' },
  { id: 'sports', name: 'ספורט' },
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

  const { register, handleSubmit, formState: { errors }, setValue, control } = useForm<Partial<Product>>({
    defaultValues: existingProduct || {
      productName: '',
      description: '',
      status: ProductStatus.DRAFT,
    },
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    existingProduct?.category ? [existingProduct.category] : ['electronics']
  );
  const [tags, setTags] = useState<string[]>(existingProduct?.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Short description state
  const [shortDescription, setShortDescription] = useState<string>(existingProduct?.shortDescription || '');

  // Pricing state
  const [price, setPrice] = useState<number>(existingProduct?.price || 0);
  const [onSale, setOnSale] = useState<boolean>(existingProduct?.onSale || false);
  const [salePrice, setSalePrice] = useState<number>(existingProduct?.salePrice || 0);

  // Inventory state
  const [sku, setSku] = useState<string>(existingProduct?.sku || '');
  const [quantityInStock, setQuantityInStock] = useState<number>(existingProduct?.quantityInStock || 0);
  const [stockStatus, setStockStatus] = useState<StockStatus>(existingProduct?.stockStatus || StockStatus.IN_STOCK);
  const [isFeatured, setIsFeatured] = useState<boolean>(existingProduct?.isFeatured || false);
  const [featuredImage, setFeaturedImage] = useState<string>(existingProduct?.featuredImage || '');

  // Related products state
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(existingProduct?.relatedProducts || []);

  // Available products for related products selector (excluding current product)
  const availableProducts = products?.filter(p => p.$id !== id).map(p => ({
    id: p.$id,
    name: p.productName
  })) || [];

  // Get related products with names
  const relatedProducts = relatedProductIds.map(rpId => {
    const product = products?.find(p => p.$id === rpId);
    return { id: rpId, name: product?.productName || 'מוצר לא נמצא' };
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
    content: existingProduct?.description || '',
    onUpdate: ({ editor }) => {
      setValue('description', editor.getHTML());
    },
  });

  // Update editor content when existingProduct changes
  useEffect(() => {
    if (editor && existingProduct?.description) {
      editor.commands.setContent(existingProduct.description);
    }
  }, [editor, existingProduct?.description]);

  // Update all state when existingProduct changes (for edit mode)
  useEffect(() => {
    if (existingProduct) {
      setSelectedCategories(existingProduct.category ? [existingProduct.category] : ['electronics']);
      setTags(existingProduct.tags || []);
      setShortDescription(existingProduct.shortDescription || '');
      setPrice(existingProduct.price || 0);
      setOnSale(existingProduct.onSale || false);
      setSalePrice(existingProduct.salePrice || 0);
      setSku(existingProduct.sku || '');
      setQuantityInStock(existingProduct.quantityInStock || 0);
      setIsFeatured(existingProduct.isFeatured || false);
      setFeaturedImage(existingProduct.featuredImage || '');
      setRelatedProductIds(existingProduct.relatedProducts || []);
    }
  }, [existingProduct]);

  if (isLoadingProducts) {
    return <LoadingState message="טוען..." />;
  }

  const onSubmit = async (data: Partial<Product>) => {
    try {
      const description = editor?.getHTML() || '';
      const productData = {
        // Required fields
        productName: data.productName,
        price,
        quantityInStock,
        sku,
        category: selectedCategories[0],
        // Optional fields
        description,
        shortDescription: shortDescription || null,
        salePrice: onSale ? salePrice : null,
        onSale,
        tags,
        relatedProducts: relatedProductIds,
        isFeatured,
        featuredImage: featuredImage || null,
        dateAdded: existingProduct?.dateAdded || new Date().toISOString(),
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
                      {...register('productName', { required: 'שדה חובה' })}
                      size="lg"
                      fontSize="lg"
                      fontWeight="medium"
                      placeholder="הוסף שם מוצר כאן..."
                      bg="bg.subtle"
                      borderColor="border"
                      _focus={{ ring: 4, ringColor: 'blue.500/10', borderColor: 'blue.500' }}
                    />
                    {errors.productName && (
                      <Text fontSize="xs" color="red.500" mt="1">{errors.productName.message}</Text>
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
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="כתוב תיאור קצר שיופיע ברשימת המוצרים..."
                      minH="80px"
                      maxLength={500}
                      bg="bg.subtle"
                      borderColor="border"
                      fontSize="sm"
                      _focus={{ ring: 4, ringColor: 'blue.500/10', borderColor: 'blue.500' }}
                    />
                    <Text fontSize="xs" color="fg.muted" mt="2" textAlign="left" dir="ltr">
                      {shortDescription.length}/500
                    </Text>
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
                  control={control}
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
                  quantityInStock={quantityInStock}
                  onQuantityChange={setQuantityInStock}
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

                <FeaturedImageCard 
                  imageUrl={featuredImage}
                  onImageUrlChange={setFeaturedImage}
                />
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
