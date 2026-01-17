import React from 'react';
import { Box, Flex, HStack, Text, Button, Card, Menu, Portal } from '@chakra-ui/react';
import { ProductStatus } from '../../types';
import { SearchInput } from '../shared';

interface ProductsFilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export default function ProductsFilterToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}: ProductsFilterToolbarProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'all': return 'הכל';
      case ProductStatus.PUBLISHED: return 'פורסם';
      case ProductStatus.DRAFT: return 'טיוטה';
      case ProductStatus.ARCHIVED: return 'ממתין';
      default: return 'הכל';
    }
  };

  return (
    <Box pb="6" flexShrink={0}>
      <Card.Root>
        <Card.Body p="4">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="space-between"
            gap="4"
          >
            {/* Search */}
            <SearchInput
              placeholder="חיפוש לפי שם מוצר..."
              value={searchTerm}
              onChange={onSearchChange}
              width={{ base: 'full', md: '80' }}
            />

            {/* Filter Buttons */}
            <HStack gap="3" flexWrap="wrap" w={{ base: 'full', md: 'auto' }}>
              {/* Status Filter */}
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button variant="ghost" size="sm" bg="bg.subtle" px="3" py="2.5">
                    <Text as="span">
                      סטטוס: {getStatusLabel(statusFilter)}
                    </Text>
                    <Text as="span" className="material-symbols-outlined" fontSize="18px" color="fg.muted">
                      keyboard_arrow_down
                    </Text>
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item value="all" onClick={() => onStatusFilterChange('all')}>הכל</Menu.Item>
                      <Menu.Item value="published" onClick={() => onStatusFilterChange(ProductStatus.PUBLISHED)}>פורסם</Menu.Item>
                      <Menu.Item value="draft" onClick={() => onStatusFilterChange(ProductStatus.DRAFT)}>טיוטה</Menu.Item>
                      <Menu.Item value="archived" onClick={() => onStatusFilterChange(ProductStatus.ARCHIVED)}>ממתין</Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>

              {/* Category Filter */}
              <Button variant="ghost" size="sm" bg="bg.subtle" px="3" py="2.5">
                <Text as="span">קטגוריה: הכל</Text>
                <Text as="span" className="material-symbols-outlined" fontSize="18px" color="fg.muted">
                  keyboard_arrow_down
                </Text>
              </Button>

              {/* Date Filter */}
              <Button variant="ghost" size="sm" bg="bg.subtle" px="3" py="2.5">
                <Text as="span" className="material-symbols-outlined" fontSize="18px" color="fg.muted">
                  calendar_today
                </Text>
                <Text as="span">תאריך</Text>
              </Button>
            </HStack>
          </Flex>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
