import React from 'react';
import { Box, Flex, Heading, Card } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useColorModeValue } from '../ui/color-mode';

interface PopularProduct {
  productId: string;
  productName: string;
  views: number;
}

interface PopularProductsChartProps {
  data: PopularProduct[];
  title?: string;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

export default function PopularProductsChart({ 
  data, 
  title = 'מוצרים פופולריים'
}: PopularProductsChartProps) {
  const chartGridStroke = useColorModeValue('#e2e8f0', '#374151');
  const chartAxisStroke = useColorModeValue('#94a3b8', '#9CA3AF');
  const tooltipBg = useColorModeValue('#fff', '#1F2937');
  const tooltipBorder = useColorModeValue('#e5e7eb', '#374151');

  // Take top 10 and prepare for chart (truncate long names)
  const chartData = data.slice(0, 10).map(item => ({
    name: item.productName.length > 20 ? item.productName.substring(0, 20) + '...' : item.productName,
    views: item.views,
    fullName: item.productName,
  }));

  return (
    <Card.Root
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
    >
      <Card.Body p="6">
        <Heading size="md" fontWeight="bold" color="fg" mb="6">
          {title}
        </Heading>
        <Box h="64" w="full" style={{ direction: 'ltr' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                type="number"
                stroke={chartAxisStroke} 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke={chartAxisStroke} 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={false}
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
                formatter={(value: number) => [`${value} צפיות`, '']}
                labelFormatter={(label: string, payload: any) => payload?.[0]?.payload?.fullName || label}
              />
              <Bar dataKey="views" radius={[0, 8, 8, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card.Body>
    </Card.Root>
  );
}
