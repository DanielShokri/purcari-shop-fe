import React from 'react';
import { Box, Flex, HStack, VStack, Text, Button } from '@chakra-ui/react';
import SidebarLink from './SidebarLink';
import { navigationConfig, secondaryNavItems, isNavItemActive } from './routeConfig';

interface SidebarProps {
  currentPath: string;
  onLogout: () => void;
}

export default function Sidebar({ currentPath, onLogout }: SidebarProps) {
  return (
    <Box
      as="aside"
      w="64"
      flexShrink={0}
      bg="bg.panel"
      borderLeftWidth="1px"
      borderColor="border"
      display="flex"
      flexDirection="column"
      h="full"
      shadow="xl"
      zIndex={20}
    >
      {/* Logo */}
      <HStack h="16" px="6" borderBottomWidth="1px" borderColor="border">
        <Flex
          w="8"
          h="8"
          rounded="lg"
          bg="blue.100"
          alignItems="center"
          justifyContent="center"
          color="blue.600"
          ml="3"
          _dark={{ bg: 'blue.900', color: 'blue.400' }}
        >
          <Text as="span" className="material-symbols-outlined" fontSize="20px">
            wine_bar
          </Text>
        </Flex>
        <Text fontSize="xl" fontWeight="bold" color="fg">
          פורקרי<Text as="span" color="blue.500"> אדמין</Text>
        </Text>
      </HStack>

      {/* Navigation */}
      <Box as="nav" flex="1" px="3" py="6" overflowY="auto">
        {navigationConfig.map((section, sectionIndex) => (
          <Box key={section.title} mt={sectionIndex > 0 ? '6' : '0'}>
            <Text
              px="3"
              fontSize="xs"
              fontWeight="semibold"
              color="fg.muted"
              textTransform="uppercase"
              letterSpacing="wider"
              mb="2"
            >
              {section.title}
            </Text>
            <VStack gap="1" align="stretch">
              {section.items.map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  active={isNavItemActive(item, currentPath)}
                />
              ))}
            </VStack>
          </Box>
        ))}

        <Box my="4" borderTopWidth="1px" borderColor="border" />

        <VStack gap="1" align="stretch">
          {secondaryNavItems.map((item) => (
            <SidebarLink
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={isNavItemActive(item, currentPath)}
            />
          ))}
        </VStack>
      </Box>

      {/* Logout Section */}
      <Box p="4" borderTopWidth="1px" borderColor="border">
        <Button
          onClick={onLogout}
          variant="ghost"
          colorPalette="red"
          w="full"
          justifyContent="center"
          gap="2"
        >
          <Text as="span" className="material-symbols-outlined" fontSize="20px">
            logout
          </Text>
          <Text as="span" fontSize="sm" fontWeight="semibold">
            התנתק
          </Text>
        </Button>
      </Box>
    </Box>
  );
}
