import React, { useState } from 'react';
import { VStack, SimpleGrid, Heading, Text, Box, Flex, Card, Table } from '@chakra-ui/react';
import { 
  useGetAnalyticsSummaryQuery, 
  useGetViewsSeriesQuery, 
  useGetNewUsersSeriesQuery 
} from '../services/api';
import { LoadingState } from '../components/shared';
import { StatCard } from '../components/dashboard';
import { ViewsLineChart, PopularProductsChart, RetentionCard } from '../components/analytics';
import { AnalyticsInterval } from '@shared/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useColorModeValue } from '../components/ui/color-mode';

export default function Analytics() {
   const [viewsInterval, setViewsInterval] = useState<AnalyticsInterval>(AnalyticsInterval.DAILY);
   const [usersInterval, setUsersInterval] = useState<AnalyticsInterval>(AnalyticsInterval.MONTHLY);

  const { data: summary, isLoading: summaryLoading } = useGetAnalyticsSummaryQuery();
  const { data: viewsSeries, isLoading: viewsLoading } = useGetViewsSeriesQuery(viewsInterval);
  const { data: newUsersSeries, isLoading: usersLoading } = useGetNewUsersSeriesQuery(usersInterval);

  const isLoading = summaryLoading || viewsLoading || usersLoading;

  const chartStroke = useColorModeValue('#10b981', '#10B981');
  const chartGridStroke = useColorModeValue('#e2e8f0', '#374151');
  const chartAxisStroke = useColorModeValue('#94a3b8', '#9CA3AF');
  const tooltipBg = useColorModeValue('#fff', '#1F2937');
  const tooltipBorder = useColorModeValue('#e5e7eb', '#374151');

  if (isLoading) {
    return <LoadingState message="טוען נתוני אנליטיקות..." />;
  }

  const formatChange = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <VStack gap="6" align="stretch">
      {/* Page Header */}
      <Box>
        <Heading size="xl" fontWeight="bold" color="fg" mb="1">
          אנליטיקות
        </Heading>
        <Text color="fg.muted" fontSize="sm">
          סקירה מפורטת של ביצועי האתר והמעורבות של המשתמשים
        </Text>
      </Box>

      {/* Stats Grid - Views */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
        <StatCard
          title="צפיות היום"
          value={(summary?.viewsToday || 0).toLocaleString('he-IL')}
          icon="visibility"
          iconBg="blue.500/10"
          iconColor="blue.500"
          trend={{ 
            value: formatChange(0), 
            isPositive: true, 
            label: 'מהיום אתמול' 
          }}
        />
        <StatCard
          title="צפיות השבוע"
          value={(summary?.viewsThisWeek || 0).toLocaleString('he-IL')}
          icon="trending_up"
          iconBg="purple.500/10"
          iconColor="purple.500"
          trend={{ 
            value: formatChange(0), 
            isPositive: true, 
            label: 'מהשבוע שעבר' 
          }}
        />
        <StatCard
          title="צפיות החודש"
          value={(summary?.viewsThisMonth || 0).toLocaleString('he-IL')}
          icon="bar_chart"
          iconBg="green.500/10"
          iconColor="green.500"
          trend={{ 
            value: formatChange(0), 
            isPositive: true, 
            label: 'מהחודש שעבר' 
          }}
        />
      </SimpleGrid>

      {/* Stats Grid - User Engagement */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
        <StatCard
          title="משתמשים פעילים יומי (DAU)"
          value={(summary?.dau || 0).toLocaleString('he-IL')}
          icon="person"
          iconBg="orange.500/10"
          iconColor="orange.500"
          trend={{ 
            value: formatChange(0), 
            isPositive: true, 
            label: 'מהיום אתמול' 
          }}
        />
        <StatCard
          title="משתמשים פעילים שבועי (WAU)"
          value={(summary?.wau || 0).toLocaleString('he-IL')}
          icon="groups"
          iconBg="teal.500/10"
          iconColor="teal.500"
          trend={{ 
            value: formatChange(0), 
            isPositive: true, 
            label: 'מהשבוע שעבר' 
          }}
        />
        <StatCard
          title="משתמשים פעילים חודשי (MAU)"
          value={(summary?.mau || 0).toLocaleString('he-IL')}
          icon="group"
          iconBg="cyan.500/10"
          iconColor="cyan.500"
          trend={{ 
            value: formatChange(0), 
            isPositive: true, 
            label: 'מהחודש שעבר' 
          }}
        />
      </SimpleGrid>

      {/* Charts Section */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
        <ViewsLineChart 
          data={viewsSeries || []} 
          interval={viewsInterval}
          onIntervalChange={setViewsInterval}
        />
        <PopularProductsChart data={summary?.topProducts || []} />
      </SimpleGrid>

      {/* Top 10 Products Table */}
      <Card.Root
        bg="bg.panel"
        borderWidth="1px"
        borderColor="border"
      >
        <Card.Body p="6">
          <Heading size="md" fontWeight="bold" color="fg" mb="6">
            10 המוצרים הנצפים ביותר
          </Heading>
          {summary?.topProducts && summary.topProducts.length > 0 ? (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>מיקום</Table.ColumnHeader>
                  <Table.ColumnHeader>שם המוצר</Table.ColumnHeader>
                  <Table.ColumnHeader>מספר צפיות</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {summary.topProducts.slice(0, 10).map((product, index) => (
                  <Table.Row key={product.productId}>
                    <Table.Cell>
                      <Flex
                        w="8"
                        h="8"
                        rounded="full"
                        bg={index < 3 ? 'blue.500' : 'bg.subtle'}
                        color={index < 3 ? 'white' : 'fg.muted'}
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="bold"
                        fontSize="sm"
                      >
                        {index + 1}
                      </Flex>
                    </Table.Cell>
                    <Table.Cell fontWeight="medium" color="fg">
                      {product.productName}
                    </Table.Cell>
                    <Table.Cell color="fg.muted">
                      {product.views.toLocaleString('he-IL')} צפיות
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          ) : (
            <Text color="fg.muted" textAlign="center" py="8">
              אין נתוני צפיות זמינים
            </Text>
          )}
        </Card.Body>
      </Card.Root>

      {/* User Engagement Section */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
        <Card.Root
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border"
        >
          <Card.Body p="6">
            <Heading size="md" fontWeight="bold" color="fg" mb="6">
              משתמשים חדשים לאורך זמן
            </Heading>
            <Box h="64" w="full" style={{ direction: 'ltr' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newUsersSeries || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke={chartAxisStroke} 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke={chartAxisStroke} 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false} 
                    stroke={chartGridStroke}
                    opacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: `1px solid ${tooltipBorder}`,
                      backgroundColor: tooltipBg,
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }}
                    labelStyle={{ color: '#64748b' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={chartStroke} 
                    strokeWidth={2}
                    dot={{ fill: chartStroke, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card.Body>
        </Card.Root>

        {summary?.retention && (
          <RetentionCard retention={summary.retention} />
        )}
      </SimpleGrid>
    </VStack>
  );
}
