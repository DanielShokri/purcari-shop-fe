import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetStatsQuery } from '../services/api';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import { LoadingState } from '../components/shared';
import { StatCard, SalesChart, ActivityFeed, OrdersTable } from '../components/dashboard';
import type { ActivityItem, Order } from '../components/dashboard';

// Chart data
const chartData = [
  { name: 'ינו', value: 20 },
  { name: 'פבר', value: 25 },
  { name: 'מרץ', value: 35 },
  { name: 'אפר', value: 30 },
  { name: 'מאי', value: 60 },
  { name: 'יוני', value: 70 },
  { name: 'יולי', value: 65 },
  { name: 'אוג', value: 55 },
  { name: 'ספט', value: 65 },
  { name: 'אוק', value: 75 },
  { name: 'נוב', value: 80 },
  { name: 'דצמ', value: 85 },
];

// Orders data
const recentOrders: Order[] = [
  { id: '#ORD-001', customer: 'רחל לוי', initials: 'רל', color: 'blue', date: '12 אוק, 2023', amount: '₪450.00', status: 'completed' },
  { id: '#ORD-002', customer: 'משה שרון', initials: 'מש', color: 'purple', date: '11 אוק, 2023', amount: '₪1,200.00', status: 'pending' },
  { id: '#ORD-003', customer: 'דנה נחמני', initials: 'דנ', color: 'orange', date: '10 אוק, 2023', amount: '₪89.90', status: 'cancelled' },
];

// Activity data
const recentActivity: ActivityItem[] = [
  { title: 'הזמנה חדשה #4023', subtitle: 'לפני 2 דקות • יוסי כהן', color: 'blue.500' },
  { title: 'התשלום התקבל בהצלחה', subtitle: 'לפני 15 דקות • חשבונית 5002', color: 'green.500' },
  { title: 'התראה על מלאי נמוך', subtitle: 'לפני שעה • מוצר #X99', color: 'yellow.500' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useGetStatsQuery(undefined);

  if (isLoading) {
    return <LoadingState message="טוען נתונים..." />;
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Page Header */}
      <Flex justify="space-between" align="end" mb="2">
        <Box>
          <Heading size="xl" fontWeight="bold" color="fg" mb="1">
            סקירה כללית
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            ברוך הבא למערכת הניהול, להלן הנתונים להיום.
          </Text>
        </Box>
        <Button
          colorPalette="blue"
          size="sm"
          fontWeight="medium"
          shadow="lg"
          _hover={{ bg: 'blue.600' }}
        >
          <Text as="span" className="material-symbols-outlined" fontSize="18px" ml="2">
            add
          </Text>
          דוח חדש
        </Button>
      </Flex>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="6">
        <StatCard
          title="סה״כ הכנסות"
          value="₪124,500"
          icon="payments"
          iconBg="green.500/10"
          iconColor="green.500"
          trend={{ value: '+12.5%', isPositive: true, label: 'מהחודש שעבר' }}
        />
        <StatCard
          title="משתמשים פעילים"
          value="8,236"
          icon="group"
          iconBg="blue.500/10"
          iconColor="blue.500"
          trend={{ value: '+5.2%', isPositive: true, label: 'מהשבוע האחרון' }}
        />
        <StatCard
          title="הזמנות חדשות"
          value="458"
          icon="shopping_bag"
          iconBg="purple.500/10"
          iconColor="purple.500"
          trend={{ value: '-2.1%', isPositive: false, label: 'מהיום אתמול' }}
        />
        <StatCard
          title="אחוז המרה"
          value="3.45%"
          icon="bar_chart"
          iconBg="orange.500/10"
          iconColor="orange.500"
          trend={{ value: '+1.2%', isPositive: true, label: 'יחסית לממוצע' }}
        />
      </SimpleGrid>

      {/* Charts Section */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="6">
        <SalesChart data={chartData} />
        <ActivityFeed activities={recentActivity} />
      </SimpleGrid>

      {/* Orders Table */}
      <OrdersTable orders={recentOrders} onViewAll={() => navigate('/orders')} />

      {/* Footer */}
      <Box textAlign="center" fontSize="xs" color="fg.muted" mt="4">
        © 2023 כל הזכויות שמורות למערכת הניהול. עוצב עבור ממשק RTL כהה.
      </Box>
    </VStack>
  );
}
