import React from 'react';
import { Box, Flex, HStack, Heading, Text, Card } from '@chakra-ui/react';

export interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  trend: {
    value: string;
    isPositive: boolean;
    label: string;
  };
}

export default function StatCard({ title, value, icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <Card.Root
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      _hover={{ borderColor: 'blue.500/30' }}
      transition="all 0.2s"
    >
      <Card.Body p="5">
        <Flex justify="space-between" align="start" mb="4">
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="fg.muted" mb="1">
              {title}
            </Text>
            <Heading size="xl" fontWeight="bold" color="fg">
              {value}
            </Heading>
          </Box>
          <Flex
            p="2"
            rounded="lg"
            bg={iconBg}
            color={iconColor}
            alignItems="center"
            justifyContent="center"
          >
            <Text as="span" className="material-symbols-outlined" fontSize="24px">
              {icon}
            </Text>
          </Flex>
        </Flex>
        <HStack fontSize="xs">
          <HStack
            gap="1"
            bg={trend.isPositive ? 'green.500/10' : 'red.500/10'}
            color={trend.isPositive ? 'green.500' : 'red.500'}
            px="1.5"
            py="0.5"
            rounded="md"
            fontWeight="medium"
          >
            <Text as="span" className="material-symbols-outlined" fontSize="14px">
              {trend.isPositive ? 'trending_up' : 'trending_down'}
            </Text>
            <Text>{trend.value}</Text>
          </HStack>
          <Text color="fg.muted">{trend.label}</Text>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
