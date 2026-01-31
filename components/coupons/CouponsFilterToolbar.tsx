import React from 'react';
import { Box, Flex, HStack, Text, Button, Card, Menu, Portal } from '@chakra-ui/react';
import { SearchInput } from '../shared';
import { CouponStatus, CouponDiscountType } from '@shared/types';

// Status options
const statusOptions = [
  { value: 'all', label: 'הכל' },
  { value: CouponStatus.ACTIVE, label: 'פעיל' },
  { value: CouponStatus.PAUSED, label: 'מושהה' },
  { value: CouponStatus.EXPIRED, label: 'פג תוקף' },
  { value: CouponStatus.SCHEDULED, label: 'מתוזמן' },
];

// Discount type options
const discountTypeOptions = [
  { value: 'all', label: 'הכל' },
  { value: CouponDiscountType.PERCENTAGE, label: 'אחוז הנחה' },
  { value: CouponDiscountType.FIXED_AMOUNT, label: 'סכום קבוע' },
  { value: CouponDiscountType.FREE_SHIPPING, label: 'משלוח חינם' },
  { value: CouponDiscountType.FREE_PRODUCT, label: 'מוצר חינם' },
  { value: CouponDiscountType.BUY_X_GET_Y, label: 'קנה X קבל Y' },
];

interface CouponsFilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  discountTypeFilter: string;
  onDiscountTypeFilterChange: (type: string) => void;
}

export default function CouponsFilterToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  discountTypeFilter,
  onDiscountTypeFilterChange
}: CouponsFilterToolbarProps) {
  const getStatusLabel = (status: string) => {
    const found = statusOptions.find(opt => opt.value === status);
    return found?.label || 'הכל';
  };

  const getDiscountTypeLabel = (type: string) => {
    const found = discountTypeOptions.find(opt => opt.value === type);
    return found?.label || 'הכל';
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
              placeholder="חיפוש לפי קוד קופון..."
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
                      {statusOptions.map((option) => (
                        <Menu.Item 
                          key={option.value} 
                          value={option.value} 
                          onClick={() => onStatusFilterChange(option.value)}
                        >
                          {option.label}
                        </Menu.Item>
                      ))}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>

              {/* Discount Type Filter */}
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button variant="ghost" size="sm" bg="bg.subtle" px="3" py="2.5">
                    <Text as="span">
                      סוג הנחה: {getDiscountTypeLabel(discountTypeFilter)}
                    </Text>
                    <Text as="span" className="material-symbols-outlined" fontSize="18px" color="fg.muted">
                      keyboard_arrow_down
                    </Text>
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      {discountTypeOptions.map((option) => (
                        <Menu.Item 
                          key={option.value} 
                          value={option.value} 
                          onClick={() => onDiscountTypeFilterChange(option.value)}
                        >
                          {option.label}
                        </Menu.Item>
                      ))}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </HStack>
          </Flex>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
