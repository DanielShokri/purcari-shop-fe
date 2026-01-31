import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Product, ProductStatus, StockStatus, WineType } from '@shared/types';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Textarea,
  Button,
  Card,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { LoadingState, Breadcrumbs, DeleteConfirmationDialog } from '../components/shared';
import {
  PublishCard,
  CategoriesCard,
  TagsCard,
  FeaturedImageCard,
  EditorFooter,
  PricingCard,
  InventoryCard,
  RelatedProductsCard,
  WineDetailsCard,
} from '../components/post-editor';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { RichTextEditor, Control } from '../components/ui/rich-text-editor';
import { toaster } from '../components/ui/toaster';

// Categories matching Convex/Appwrite enum values
const categories = [
  { id: 'red_wine', name: 'יינות אדומים' },
  { id: 'white_wine', name: 'יינות לבנים' },
  { id: 'rose_wine', name: 'יינות רוזה' },
  { id: 'sparkling_wine', name: 'יינות מבעבעים' },
  { id: 'dessert_wine', name: 'יינות קינוח' },
  { id: 'gift_sets', name: 'מארזי מתנה' },
];

export default function ProductEditor() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const existingProduct = useQuery(api.products.getById, isEditMode ? { productId: id as Id<"products"> } : "skip");
  const allProducts = useQuery(api.products.list, {});
  
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, control, reset } = useForm<Partial<Product>>({
    defaultValues: {
      productName: '',
      description: '',
      status: ProductStatus.DRAFT,
    },
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>(['red_wine']);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Wine-specific state
  const normalizeWineType = (value: any): WineType => {
    if (!value) return WineType.RED;
    const normalized = String(value); // Keep case for Convex matching if needed
    const wineTypeValues = Object.values(WineType);
    return (wineTypeValues.includes(normalized as WineType) ? normalized : WineType.RED) as WineType;
  };
  
  const [wineType, setWineType] = useState<WineType>(WineType.RED);
  const [volume, setVolume] = useState<string>('750 מ"ל');
  const [grapeVariety, setGrapeVariety] = useState<string>('');
  const [vintage, setVintage] = useState<number>(new Date().getFullYear());
  const [servingTemperature, setServingTemperature] = useState<string>('');

  // Short description state
  const [shortDescription, setShortDescription] = useState<string>('');

  // Pricing state
  const [price, setPrice] = useState<number>(0);
  const [onSale, setOnSale] = useState<boolean>(false);
  const [salePrice, setSalePrice] = useState<number>(0);

  // Inventory state
  const [sku, setSku] = useState<string>('');
  const [quantityInStock, setQuantityInStock] = useState<number>(0);
  const [stockStatus, setStockStatus] = useState<StockStatus>(StockStatus.IN_STOCK);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [featuredImage, setFeaturedImage] = useState<string>('');

  // Related products state
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Available products for related products selector (excluding current product)
  const availableProducts = allProducts?.filter(p => p._id !== id).map(p => ({
    id: p._id,
    name: p.productName
  })) || [];

  // Get related products with names
  const relatedProducts = relatedProductIds.map(rpId => {
    const product = allProducts?.find(p => p._id === rpId);
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
    content: '',
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
      // Reset form values with existing product data
      reset({
        productName: existingProduct.productName,
        description: existingProduct.description || '',
        status: (existingProduct.status as ProductStatus) || ProductStatus.DRAFT,
      });
      
      setSelectedCategories(existingProduct.category ? [existingProduct.category] : ['red_wine']);
      setTags(existingProduct.tags || []);
      setShortDescription(existingProduct.shortDescription || '');
      setPrice(existingProduct.price || 0);
      setOnSale(existingProduct.onSale || false);
      setSalePrice(existingProduct.salePrice || 0);
      setSku(existingProduct.sku || '');
      setQuantityInStock(Number(existingProduct.quantityInStock) || 0);
      setIsFeatured(existingProduct.isFeatured || false);
      setFeaturedImage(existingProduct.featuredImage || '');
      setRelatedProductIds(existingProduct.relatedProducts || []);
      
      // Update wine specific fields
      setWineType(normalizeWineType(existingProduct.wineType));
      setVolume(existingProduct.volume || '750 מ"ל');
      setGrapeVariety(existingProduct.grapeVariety || '');
      setVintage(Number(existingProduct.vintage) || new Date().getFullYear());
      setServingTemperature(existingProduct.servingTemperature || '');
    }
  }, [existingProduct, reset]);

  if (isEditMode && existingProduct === undefined) {
    return <LoadingState message="טוען מוצר..." />;
  }

  const onSubmit = async (data: Partial<Product>) => {
    try {
      setIsSaving(true);
      const description = editor?.getHTML() || '';
      
      const commonData = {
        productName: data.productName!,
        price,
        quantityInStock: BigInt(quantityInStock),
        sku,
        category: selectedCategories[0],
        description,
        shortDescription: shortDescription || undefined,
        salePrice: onSale ? salePrice : undefined,
        onSale,
        // tags: tags, // Tags not in schema yet? Check products.ts
        // relatedProducts: relatedProductIds, // Not in mutation schema yet
        isFeatured,
        featuredImage: featuredImage || undefined,
        status: (data.status as "draft" | "active" | "hidden" | "discontinued") || "draft",
        wineType: wineType as any,
        // volume, grapeVariety, vintage, servingTemperature - not in current mutation schema
      };

      if (isEditMode && id) {
        await updateProduct({ 
          id: id as Id<"products">, 
          ...commonData 
        });
        toaster.create({
          title: "המוצר עודכן בהצלחה",
          type: "success",
        });
      } else {
        await createProduct(commonData);
        toaster.create({
          title: "המוצר נוצר בהצלחה",
          type: "success",
        });
      }
      
      setSaveError(null);
      navigate('/products');
    } catch (error: any) {
      setSaveError(error?.message || 'שגיאה בשמירת המוצר. וודא שכל השדות תקינים.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    handleSubmit(onSubmit)();
  };

  const handleCancel = () => {
    navigate('/products');
  };

  const handleDelete = () => {
    if (!id) return;
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await deleteProduct({ id: id as Id<"products"> });
      toaster.create({
        title: "המוצר נמחק בהצלחה",
        type: "success",
      });
      navigate('/products');
    } catch (error: any) {
      setSaveError(error?.message || 'שגיאה במחיקת המוצר');
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
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
              { label: isEditMode ? (existingProduct?.productName || 'עריכת מוצר') : 'יצירת מוצר' }
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
                {isEditMode ? (existingProduct?.productName || 'עריכת מוצר') : 'יצירת מוצר'}
              </Heading>
              <Text color="fg.muted" fontSize="sm">
                {isEditMode ? 'ערוך את פרטי המוצר, התיאור וההגדרות' : 'צור מוצר חדש עם תיאור והגדרות'}
              </Text>
            </Box>
            
            {saveError && (
              <Box bg="red.500/10" borderLeftWidth="4px" borderColor="red.500" p="4" my="4" rounded="md" w="full">
                <HStack>
                  <Text as="span" className="material-symbols-outlined" color="red.500">error</Text>
                  <Text color="red.600" fontWeight="medium">{saveError}</Text>
                </HStack>
              </Box>
            )}

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
                  isCreating={isSaving && !isEditMode}
                  isUpdating={isSaving && isEditMode}
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

                <WineDetailsCard
                  wineType={wineType}
                  onWineTypeChange={setWineType}
                  volume={volume}
                  onVolumeChange={setVolume}
                  grapeVariety={grapeVariety}
                  onGrapeVarietyChange={setGrapeVariety}
                  vintage={vintage}
                  onVintageChange={setVintage}
                  servingTemperature={servingTemperature}
                  onServingTemperatureChange={setServingTemperature}
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
        isCreating={isSaving && !isEditMode}
        isUpdating={isSaving && isEditMode}
        isDeleting={isDeleting}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="מחיקת מוצר"
        message="האם אתה בטוח שברצונך למחוק מוצר זה? פעולה זו לא ניתנת לביטול."
        isDeleting={isDeleting}
      />
    </Box>
  );
}
