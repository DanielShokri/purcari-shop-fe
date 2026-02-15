import React, { useMemo } from 'react';
import { Box, Flex, Heading, Card, Select, Portal, createListCollection } from '@chakra-ui/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useColorModeValue } from '../ui/color-mode';
import { AnalyticsInterval } from '@shared/types';

interface DataPoint {
  name: string;
  value: number;
  timestamp: string;
  [key: string]: any;
}

interface EnhancedAreaChartProps {
  data: DataPoint[];
  title?: string;
  interval: AnalyticsInterval;
  onIntervalChange: (interval: AnalyticsInterval) => void;
  color?: string;
  secondaryDataKey?: string;
  secondaryColor?: string;
  valueFormatter?: (value: number) => string;
  showGrid?: boolean;
}

export default function EnhancedAreaChart({ 
  data, 
  title = 'נתונים לאורך זמן',
  interval,
  onIntervalChange,
  color = '#3b82f6',
  secondaryDataKey,
  secondaryColor = '#8b5cf6',
  valueFormatter = (v) => v.toLocaleString('he-IL'),
  showGrid = true,
}: EnhancedAreaChartProps) {
  const chartGridStroke = useColorModeValue('#e2e8f0', '#374151');
  const chartAxisStroke = useColorModeValue('#94a3b8', '#9CA3AF');
  const tooltipBg = useColorModeValue('#fff', '#1F2937');
  const tooltipBorder = useColorModeValue('#e5e7eb', '#374151');

  const intervalOptions = useMemo(() => {
    return createListCollection({
      items: [
        { label: 'יומי', value: 'daily' },
        { label: 'שבועי', value: 'weekly' },
        { label: 'חודשי', value: 'monthly' },
      ],
    });
  }, []);

  return (
    <Card.Root
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
    >
       <Card.Body p="6">
         <Flex 
           justify="space-between" 
           align="center" 
           mb="6"
           gap="4"
           flexDir={{ base: "column", md: "row" }}
         >
           <Heading size="md" fontWeight="bold" color="fg">
             {title}
           </Heading>
            <Select.Root
              collection={intervalOptions}
              size="md"
              style={{ minWidth: '120px' }}
              value={[interval]}
              onValueChange={(e) => onIntervalChange(e.value[0] as AnalyticsInterval)}
            >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger
                bg="bg"
                borderColor="border"
                color="fg.muted"
                fontSize="md"
                rounded="lg"
                px="3"
                py="1"
                _focus={{ borderColor: 'blue.500' }}
              >
                <Select.ValueText placeholder="בחר תקופה" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {intervalOptions.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Flex>
        <Box h="72" w="full" style={{ direction: 'ltr' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.05}/>
                </linearGradient>
                {secondaryDataKey && (
                  <linearGradient id={`gradient-${secondaryColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.05}/>
                  </linearGradient>
                )}
              </defs>
              {showGrid && (
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke={chartGridStroke}
                  opacity={0.5}
                />
              )}
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
                tickFormatter={valueFormatter}
              />
              <Tooltip
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: `1px solid ${tooltipBorder}`,
                  backgroundColor: tooltipBg,
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                }}
                labelStyle={{ color: '#64748b' }}
                formatter={(value: number) => [valueFormatter(value), '']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                fill={`url(#gradient-${color.replace('#', '')})`}
                activeDot={{ r: 6, fill: color }}
              />
              {secondaryDataKey && (
                <Area 
                  type="monotone" 
                  dataKey={secondaryDataKey} 
                  stroke={secondaryColor} 
                  strokeWidth={2}
                  fill={`url(#gradient-${secondaryColor.replace('#', '')})`}
                  activeDot={{ r: 6, fill: secondaryColor }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Card.Body>
    </Card.Root>
  );
}
