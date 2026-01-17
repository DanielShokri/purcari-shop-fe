import React from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Card,
  Switch,
  NativeSelect,
} from '@chakra-ui/react';
import { StockStatus } from '../../types';

interface InventoryCardProps {
  sku: string;
  onSkuChange: (sku: string) => void;
  stockStatus: StockStatus;
  onStockStatusChange: (status: StockStatus) => void;
  isFeatured: boolean;
  onFeaturedChange: (isFeatured: boolean) => void;
}

export default function InventoryCard({
  sku,
  onSkuChange,
  stockStatus,
  onStockStatusChange,
  isFeatured,
  onFeaturedChange,
}: InventoryCardProps) {
  const getStockStatusColor = (status: StockStatus) => {
    switch (status) {
      case StockStatus.IN_STOCK:
        return 'green';
      case StockStatus.LOW_STOCK:
        return 'yellow';
      case StockStatus.OUT_OF_STOCK:
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Card.Root>
      <Card.Header
        px="5"
        py="4"
        borderBottomWidth="1px"
        borderColor="border"
        bg="bg.subtle"
      >
        <Flex justify="space-between" alignItems="center">
          <Heading size="md" color="fg">
            מלאי
          </Heading>
          <Text as="span" className="material-symbols-outlined" fontSize="lg" color="fg.muted">
            inventory_2
          </Text>
        </Flex>
      </Card.Header>
      <Card.Body p="5">
        <VStack gap="4" align="stretch">
          {/* SKU */}
          <VStack align="start" gap="2">
            <Text fontSize="xs" fontWeight="bold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
              מק"ט (SKU)
            </Text>
            <Input
              size="sm"
              dir="ltr"
              textAlign="left"
              value={sku}
              onChange={(e) => onSkuChange(e.target.value)}
              placeholder="SKU-001"
              bg="bg.subtle"
              borderColor="border"
              _focus={{ ringColor: 'blue.500', borderColor: 'blue.500' }}
            />
          </VStack>

          {/* Stock Status */}
          <VStack align="start" gap="2">
            <Text fontSize="xs" fontWeight="bold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
              סטטוס מלאי
            </Text>
            <NativeSelect.Root
              size="sm"
              bg="bg.subtle"
              borderColor="border"
              _focus={{ ringColor: 'blue.500', borderColor: 'blue.500' }}
            >
              <NativeSelect.Field
                value={stockStatus}
                onChange={(e) => onStockStatusChange(e.target.value as StockStatus)}
              >
                <option value={StockStatus.IN_STOCK}>במלאי</option>
                <option value={StockStatus.LOW_STOCK}>מלאי נמוך</option>
                <option value={StockStatus.OUT_OF_STOCK}>אזל מהמלאי</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator>
                <Text as="span" className="material-symbols-outlined" fontSize="xl" color="fg.muted">
                  expand_more
                </Text>
              </NativeSelect.Indicator>
            </NativeSelect.Root>
            <HStack gap="1.5" mt="1">
              <Box
                w="2"
                h="2"
                rounded="full"
                bg={`${getStockStatusColor(stockStatus)}.500`}
              />
              <Text fontSize="xs" color="fg.muted">
                {stockStatus === StockStatus.IN_STOCK && 'המוצר זמין למכירה'}
                {stockStatus === StockStatus.LOW_STOCK && 'יש להזמין מלאי נוסף'}
                {stockStatus === StockStatus.OUT_OF_STOCK && 'המוצר לא זמין כרגע'}
              </Text>
            </HStack>
          </VStack>

          {/* Featured Product Toggle */}
          <Box pt="2" borderTopWidth="1px" borderColor="border">
            <HStack justify="space-between" py="2">
              <VStack align="start" gap="0">
                <HStack gap="2">
                  <Text fontSize="sm" fontWeight="medium" color="fg">
                    מוצר מומלץ
                  </Text>
                  <Text as="span" className="material-symbols-outlined" fontSize="lg" color="yellow.500">
                    star
                  </Text>
                </HStack>
                <Text fontSize="xs" color="fg.muted">
                  הצג בעמוד הבית ובמקומות בולטים
                </Text>
              </VStack>
              <Box style={{ direction: 'ltr' }}>
                <Switch.Root
                  checked={isFeatured}
                  onCheckedChange={(e) => onFeaturedChange(e.checked)}
                  colorPalette="yellow"
                >
                  <Switch.HiddenInput />
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
              </Box>
            </HStack>
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
