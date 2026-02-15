import React from 'react';
import { Box, Flex, Heading, Card, SimpleGrid, HStack, Text, Progress } from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';

interface ConversionMetrics {
  productToCartRate: number;
  cartToCheckoutRate: number;
  checkoutToOrderRate: number;
  overallConversionRate: number;
  productToCartRateChange: number;
  overallConversionRateChange: number;
  productViewsToday: number;
  addToCartsToday: number;
  checkoutsStartedToday: number;
  ordersCompletedToday: number;
}

interface ConversionMetricsCardProps {
  metrics: ConversionMetrics;
  title?: string;
}

export default function ConversionMetricsCard({ 
  metrics,
  title = 'שיעורי המרה'
}: ConversionMetricsCardProps) {
  const progressTrackBg = useColorModeValue('gray.100', 'gray.700');

  const conversionSteps = [
    {
      label: 'צפייה במוצר → הוספה לסל',
      rate: metrics.productToCartRate,
      change: metrics.productToCartRateChange,
      color: 'blue.500',
      counts: `${metrics.addToCartsToday.toLocaleString('he-IL')} / ${metrics.productViewsToday.toLocaleString('he-IL')}`,
    },
    {
      label: 'סל → התחלת תשלום',
      rate: metrics.cartToCheckoutRate,
      change: 0,
      color: 'cyan.500',
      counts: `${metrics.checkoutsStartedToday.toLocaleString('he-IL')} / ${metrics.addToCartsToday.toLocaleString('he-IL')}`,
    },
    {
      label: 'תשלום → הזמנה מושלמת',
      rate: metrics.checkoutToOrderRate,
      change: 0,
      color: 'green.500',
      counts: `${metrics.ordersCompletedToday.toLocaleString('he-IL')} / ${metrics.checkoutsStartedToday.toLocaleString('he-IL')}`,
    },
  ];

  return (
    <Card.Root bg="bg.panel" borderWidth="1px" borderColor="border">
      <Card.Body p="6">
        <Flex justify="space-between" align="center" mb="6">
          <Heading size="md" fontWeight="bold" color="fg">
            {title}
          </Heading>
          <Box textAlign="center">
            <Text fontSize="xs" color="fg.muted">שיעור המרה כולל</Text>
            <HStack gap="2" justify="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {metrics.overallConversionRate.toFixed(2)}%
              </Text>
              {metrics.overallConversionRateChange !== 0 && (
                <Text 
                  fontSize="sm" 
                  color={metrics.overallConversionRateChange > 0 ? 'green.500' : 'red.500'}
                >
                  {metrics.overallConversionRateChange > 0 ? '+' : ''}
                  {metrics.overallConversionRateChange.toFixed(1)}%
                </Text>
              )}
            </HStack>
          </Box>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap="6">
          {conversionSteps.map((step, index) => (
            <Box key={step.label}>
              <Flex justify="space-between" align="center" mb="2">
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  {step.label}
                </Text>
                <HStack gap="2">
                  <Text fontSize="sm" color="fg.muted">
                    {step.counts}
                  </Text>
                </HStack>
              </Flex>
              
              <Box position="relative" h="3" bg={progressTrackBg} rounded="full" overflow="hidden" mb="2">
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  h="full"
                  w={`${Math.min(step.rate, 100)}%`}
                  bg={step.color}
                  rounded="full"
                  transition="width 0.5s ease"
                />
              </Box>
              
              <Flex justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="bold" color={step.color}>
                  {step.rate.toFixed(1)}%
                </Text>
                {step.change !== 0 && (
                  <Text 
                    fontSize="xs" 
                    color={step.change > 0 ? 'green.500' : 'red.500'}
                  >
                    {step.change > 0 ? '↗' : '↘'} {Math.abs(step.change).toFixed(1)}%
                  </Text>
                )}
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      </Card.Body>
    </Card.Root>
  );
}
