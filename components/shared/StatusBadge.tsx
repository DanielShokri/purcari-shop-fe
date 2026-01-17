import React from 'react';
import { HStack, Box, Text, Badge } from '@chakra-ui/react';

type BadgeVariant = 'dot' | 'simple';

interface StatusConfig {
  colorPalette: string;
  label: string;
  showDot?: boolean;
}

interface StatusBadgeProps {
  status: string;
  config: Record<string, StatusConfig>;
  variant?: BadgeVariant;
}

export default function StatusBadge({ status, config, variant = 'simple' }: StatusBadgeProps) {
  const statusConfig = config[status] || { colorPalette: 'gray', label: status };
  
  if (variant === 'dot') {
    return (
      <HStack
        gap="1.5"
        px="2.5"
        py="1"
        rounded="full"
        fontSize="xs"
        fontWeight="medium"
        bg={`${statusConfig.colorPalette}.500/10`}
        color={`${statusConfig.colorPalette}.500`}
      >
        <Box w="1.5" h="1.5" rounded="full" bg={`${statusConfig.colorPalette}.500`} />
        <Text>{statusConfig.label}</Text>
      </HStack>
    );
  }

  return (
    <Badge
      colorPalette={statusConfig.colorPalette}
      variant="subtle"
      px="2.5"
      py="0.5"
      rounded="full"
      fontSize="xs"
      fontWeight="medium"
    >
      {statusConfig.showDot && (
        <HStack gap="1">
          <Box w="1.5" h="1.5" rounded="full" bg={`${statusConfig.colorPalette}.500`} />
          <Text as="span">{statusConfig.label}</Text>
        </HStack>
      )}
      {!statusConfig.showDot && statusConfig.label}
    </Badge>
  );
}

// Pre-configured status badges for common use cases
export const productStatusConfig: Record<string, StatusConfig> = {
  published: { colorPalette: 'green', label: 'פורסם' },
  draft: { colorPalette: 'gray', label: 'טיוטה' },
  archived: { colorPalette: 'orange', label: 'ממתין' },
};

export const categoryStatusConfig: Record<string, StatusConfig> = {
  active: { colorPalette: 'green', label: 'פעיל' },
  hidden: { colorPalette: 'gray', label: 'מוסתר' },
  draft: { colorPalette: 'orange', label: 'טיוטה' },
};

export const userStatusConfig: Record<string, StatusConfig> = {
  active: { colorPalette: 'green', label: 'פעיל', showDot: true },
  suspended: { colorPalette: 'red', label: 'מושהה' },
  inactive: { colorPalette: 'gray', label: 'לא פעיל' },
};

export const userRoleConfig: Record<string, StatusConfig> = {
  admin: { colorPalette: 'blue', label: 'מנהל' },
  editor: { colorPalette: 'purple', label: 'עורך' },
  viewer: { colorPalette: 'gray', label: 'צופה' },
};

export const orderStatusConfig: Record<string, StatusConfig> = {
  completed: { colorPalette: 'green', label: 'הושלם' },
  processing: { colorPalette: 'blue', label: 'בטיפול' },
  pending: { colorPalette: 'yellow', label: 'ממתין' },
  cancelled: { colorPalette: 'red', label: 'בוטל' },
};
