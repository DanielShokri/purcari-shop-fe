import React from 'react';
import { Box, Flex, Heading, Card, NativeSelect } from '@chakra-ui/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useColorModeValue } from '../ui/color-mode';

interface ChartDataPoint {
  name: string;
  value: number;
}

interface SalesChartProps {
  data: ChartDataPoint[];
  title?: string;
  years?: string[];
  selectedYear?: string;
  onYearChange?: (year: string) => void;
}

export default function SalesChart({ 
  data, 
  title = 'מגמת מכירות שנתית',
  years = ['2023', '2022'],
  selectedYear,
  onYearChange
}: SalesChartProps) {
  const chartStroke = useColorModeValue('#3b82f6', '#3B82F6');
  const chartGridStroke = useColorModeValue('#e2e8f0', '#374151');
  const chartAxisStroke = useColorModeValue('#94a3b8', '#9CA3AF');
  const tooltipBg = useColorModeValue('#fff', '#1F2937');
  const tooltipBorder = useColorModeValue('#e5e7eb', '#374151');

  return (
    <Card.Root
      gridColumn={{ lg: 'span 2' }}
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
    >
      <Card.Body p="6">
        <Flex justify="space-between" align="center" mb="6">
          <Heading size="md" fontWeight="bold" color="fg">
            {title}
          </Heading>
          <NativeSelect.Root size="sm" w="auto">
            <NativeSelect.Field
              bg="bg"
              borderColor="border"
              color="fg.muted"
              fontSize="sm"
              rounded="lg"
              px="3"
              py="1"
              _focus={{ borderColor: 'blue.500' }}
              value={selectedYear}
              onChange={(e) => onYearChange?.(e.target.value)}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Flex>
        <Box h="64" w="full" style={{ direction: 'ltr' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={chartStroke} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Card.Body>
    </Card.Root>
  );
}
