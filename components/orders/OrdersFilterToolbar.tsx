import React from 'react';
import { Flex, Box, Input, InputGroup, Text } from '@chakra-ui/react';
import { NativeSelect } from '@chakra-ui/react';

interface OrdersFilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
}

export default function OrdersFilterToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
}: OrdersFilterToolbarProps) {
  return (
    <Flex
      gap="4"
      mb="4"
      direction={{ base: 'column', md: 'row' }}
      flexWrap="wrap"
    >
      {/* Search Filter */}
      <Box flex="2" minW="200px">
        <InputGroup
          startElement={
            <Text as="span" className="material-symbols-outlined" fontSize="20px" color="fg.muted">
              search
            </Text>
          }
        >
          <Input
            placeholder="חיפוש לפי מספר הזמנה או שם לקוח..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            size="md"
            bg="bg.panel"
            borderColor="border"
            _hover={{ borderColor: 'border.hover' }}
          />
        </InputGroup>
      </Box>

      {/* Status Filter */}
      <Box flex="1" minW="150px">
        <NativeSelect.Root size="md">
          <NativeSelect.Field
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            bg="bg.panel"
            borderColor="border"
            _hover={{ borderColor: 'border.hover' }}
          >
            <option value="all">כל הסטטוסים</option>
            <option value="completed">הושלם</option>
            <option value="processing">בטיפול</option>
            <option value="pending">ממתין לתשלום</option>
            <option value="cancelled">בוטל</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator>
            <Text as="span" className="material-symbols-outlined" fontSize="18px" color="fg.muted">
              filter_list
            </Text>
          </NativeSelect.Indicator>
        </NativeSelect.Root>
      </Box>

      {/* Date Filter */}
      <Box flex="1" minW="150px">
        <NativeSelect.Root size="md">
          <NativeSelect.Field
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            bg="bg.panel"
            borderColor="border"
            _hover={{ borderColor: 'border.hover' }}
          >
            <option value="all">כל התאריכים</option>
            <option value="today">היום</option>
            <option value="week">השבוע</option>
            <option value="month">החודש</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator>
            <Text as="span" className="material-symbols-outlined" fontSize="18px" color="fg.muted">
              calendar_today
            </Text>
          </NativeSelect.Indicator>
        </NativeSelect.Root>
      </Box>
    </Flex>
  );
}
