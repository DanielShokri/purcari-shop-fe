import React from 'react';
import { Box, Flex, Heading, Card, SimpleGrid, HStack, Text, ProgressCircle, VStack } from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';

interface CartMetrics {
  cartsCreatedToday: number;
  cartsCreatedWeek: number;
  abandonedCartsToday: number;
  abandonmentRateToday: number;
  abandonmentRateChange: number;
  averageCartValueToday: number;
  averageCartValueWeek: number;
  ordersToday: number;
  ordersWeek: number;
}

interface CartMetricsCardProps {
  metrics: CartMetrics;
  title?: string;
}

export default function CartMetricsCard({ 
  metrics,
  title = 'נתוני סל קניות'
}: CartMetricsCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const recoveryRate = 100 - metrics.abandonmentRateToday;

  return (
    <Card.Root bg="bg.panel" borderWidth="1px" borderColor="border">
      <Card.Body p="6">
        <Heading size="md" fontWeight="bold" color="fg" mb="6">
          {title}
        </Heading>

        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="6">
          {/* Abandonment Rate Circle */}
          <Flex direction="column" align="center" gap="3">
            <ProgressCircle.Root
              value={recoveryRate}
              size="xl"
              colorPalette="green"
            >
              <ProgressCircle.Circle>
                <ProgressCircle.Track stroke={useColorModeValue('#fee2e2', '#7f1d1d')} />
                <ProgressCircle.Range />
              </ProgressCircle.Circle>
              <ProgressCircle.Label>
                <Box textAlign="center">
                  <Text fontSize="lg" fontWeight="bold" color="fg">
                    {recoveryRate.toFixed(0)}%
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    השלמה
                  </Text>
                </Box>
              </ProgressCircle.Label>
            </ProgressCircle.Root>
            <Box textAlign="center">
              <Text fontSize="sm" fontWeight="medium" color="fg">
                שיעור נטישת סל
              </Text>
              <HStack justify="center" gap="1" mt="1">
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {metrics.abandonmentRateToday.toFixed(1)}%
                </Text>
                {metrics.abandonmentRateChange !== 0 && (
                  <Text 
                    fontSize="sm" 
                    color={metrics.abandonmentRateChange < 0 ? 'green.500' : 'red.500'}
                  >
                    {metrics.abandonmentRateChange > 0 ? '+' : ''}
                    {metrics.abandonmentRateChange.toFixed(1)}%
                  </Text>
                )}
              </HStack>
            </Box>
          </Flex>

          {/* Stats Grid */}
          <VStack gap="3" align="stretch">
            <StatRow
              label="סלים נוצרו היום"
              value={metrics.cartsCreatedToday.toLocaleString('he-IL')}
              subValue={`${metrics.cartsCreatedWeek.toLocaleString('he-IL')} השבוע`}
              icon="shopping_cart"
            />
            <StatRow
              label="הזמנות הושלמו היום"
              value={metrics.ordersToday.toLocaleString('he-IL')}
              subValue={`${metrics.ordersWeek.toLocaleString('he-IL')} השבוע`}
              icon="check_circle"
            />
            <StatRow
              label="ערך סל ממוצע היום"
              value={formatCurrency(metrics.averageCartValueToday)}
              subValue={`${formatCurrency(metrics.averageCartValueWeek)} השבוע`}
              icon="payments"
            />
            <StatRow
              label="סלים נטושים היום"
              value={metrics.abandonedCartsToday.toLocaleString('he-IL')}
              subValue="דרוש שחזור"
              icon="remove_shopping_cart"
              color="red.500"
            />
          </VStack>
        </SimpleGrid>
      </Card.Body>
    </Card.Root>
  );
}

interface StatRowProps {
  label: string;
  value: string;
  subValue: string;
  icon: string;
  color?: string;
}

function StatRow({ label, value, subValue, icon, color = 'blue.500' }: StatRowProps) {
  return (
    <HStack 
      p="3" 
      bg="bg.muted" 
      rounded="lg"
      justify="space-between"
    >
      <HStack gap="3">
        <Flex
          p="2"
          rounded="md"
          bg={`${color}/10`}
          color={color}
          alignItems="center"
          justifyContent="center"
        >
          <Text as="span" className="material-symbols-outlined" fontSize="20px">
            {icon}
          </Text>
        </Flex>
        <Box>
          <Text fontSize="xs" color="fg.muted">
            {label}
          </Text>
          <Text fontWeight="bold" color="fg">
            {value}
          </Text>
        </Box>
      </HStack>
      <Text fontSize="xs" color="fg.muted">
        {subValue}
      </Text>
    </HStack>
  );
}
