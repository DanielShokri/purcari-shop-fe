import React from 'react';
import { HStack, Button } from '@chakra-ui/react';
import { OrderStatus } from '../../types';

interface StatusChip {
  key: string;
  label: string;
  count: number;
}

interface OrderStatusChipsProps {
  activeChip: string;
  onChipChange: (chip: string) => void;
  statusCounts: Record<string, number>;
  totalCount: number;
}

export default function OrderStatusChips({
  activeChip,
  onChipChange,
  statusCounts,
  totalCount,
}: OrderStatusChipsProps) {
  const chips: StatusChip[] = [
    { key: 'all', label: 'הכל', count: totalCount },
    { key: OrderStatus.PROCESSING, label: 'בטיפול', count: statusCounts[OrderStatus.PROCESSING] || 0 },
    { key: OrderStatus.PENDING, label: 'ממתין לתשלום', count: statusCounts[OrderStatus.PENDING] || 0 },
    { key: OrderStatus.COMPLETED, label: 'הושלם', count: statusCounts[OrderStatus.COMPLETED] || 0 },
    { key: OrderStatus.CANCELLED, label: 'בוטל', count: statusCounts[OrderStatus.CANCELLED] || 0 },
  ];

  return (
    <HStack gap="2" overflowX="auto" pb="2" mb="4" flexWrap="nowrap">
      {chips.map((chip) => (
        <Button
          key={chip.key}
          size="sm"
          rounded="full"
          px="4"
          fontWeight="medium"
          whiteSpace="nowrap"
          flexShrink={0}
          variant={activeChip === chip.key ? 'solid' : 'outline'}
          colorPalette={activeChip === chip.key ? 'gray' : 'gray'}
          bg={activeChip === chip.key ? 'fg' : 'bg.panel'}
          color={activeChip === chip.key ? 'bg' : 'fg.muted'}
          borderColor={activeChip === chip.key ? 'fg' : 'border'}
          _hover={{
            bg: activeChip === chip.key ? 'fg' : 'bg.subtle',
          }}
          onClick={() => onChipChange(chip.key)}
        >
          {chip.label} ({chip.count})
        </Button>
      ))}
    </HStack>
  );
}
