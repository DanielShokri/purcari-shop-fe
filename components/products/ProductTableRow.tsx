import React from 'react';
import { Box, HStack, VStack, Text, Table, Checkbox, IconButton } from '@chakra-ui/react';
import { Product, ProductStatus } from '../../types';
import { StatusBadge, productStatusConfig } from '../shared';

interface ProductTableRowProps {
  product: Product;
  index: number;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  getRandomCategory: (index: number) => string;
  getRandomImage: (index: number) => string;
}

export default function ProductTableRow({
  product,
  index,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  getRandomCategory,
  getRandomImage
}: ProductTableRowProps) {
  return (
    <Table.Row
      _hover={{ bg: 'bg.subtle' }}
      transition="colors"
      css={{
        '& .action-buttons': { opacity: 0 },
        '&:hover .action-buttons': { opacity: 1 },
      }}
    >
      <Table.Cell px="6" py="4">
        <Checkbox.Root
          size="sm"
          checked={isSelected}
          onCheckedChange={(e) => onSelect(!!e.checked)}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      </Table.Cell>
      <Table.Cell px="6" py="4">
        <HStack gap="3">
          <Box
            w="10"
            h="10"
            rounded="lg"
            backgroundSize="cover"
            backgroundPosition="center"
            bgColor="gray.200"
            flexShrink={0}
            style={{ backgroundImage: `url("${getRandomImage(index)}")` }}
          />
          <VStack align="start" gap="0">
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="fg"
              _hover={{ color: 'blue.500' }}
              cursor="pointer"
              transition="colors"
            >
              {product.title}
            </Text>
            <Text fontSize="xs" color="fg.muted">
              מק"ט: {product.$id}
            </Text>
          </VStack>
        </HStack>
      </Table.Cell>
      <Table.Cell px="6" py="4">
        <Text fontSize="sm" color="fg">
          {getRandomCategory(index)}
        </Text>
      </Table.Cell>
      <Table.Cell px="6" py="4">
        <StatusBadge status={product.status} config={productStatusConfig} />
      </Table.Cell>
      <Table.Cell px="6" py="4" color="fg.muted" dir="ltr">
        <Text fontSize="sm">
          {new Date(product.publishedAt).toLocaleDateString('he-IL')}
        </Text>
      </Table.Cell>
      <Table.Cell px="6" py="4">
        <HStack gap="1" className="action-buttons" transition="opacity" justify="flex-end">
          <IconButton
            variant="ghost"
            size="sm"
            color="fg.muted"
            _hover={{ bg: 'gray.100', color: 'blue.500' }}
            aria-label="ערוך"
            onClick={onEdit}
          >
            <Text as="span" className="material-symbols-outlined" fontSize="20px">
              edit
            </Text>
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            color="fg.muted"
            _hover={{ bg: 'gray.100', color: 'red.500' }}
            aria-label="מחק"
            onClick={onDelete}
          >
            <Text as="span" className="material-symbols-outlined" fontSize="20px">
              delete
            </Text>
          </IconButton>
        </HStack>
      </Table.Cell>
    </Table.Row>
  );
}
