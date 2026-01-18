import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, logoutUser } from '../store';
import { useLogoutMutation } from '../services/api';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Input,
  InputGroup,
  Button,
} from '@chakra-ui/react';
import { ColorModeButton } from './ui/color-mode';

interface SidebarLinkProps {
  to: string;
  icon: string;
  label: string;
  active: boolean;
}

const SidebarLink = ({ to, icon, label, active }: SidebarLinkProps) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <Flex
      alignItems="center"
      gap="3"
      px="3"
      py="2.5"
      rounded="lg"
      position="relative"
      transition="all 0.2s"
      bg={active ? 'blue.50' : 'transparent'}
      color={active ? 'blue.600' : 'fg.muted'}
      _hover={{
        bg: active ? 'blue.50' : 'gray.100',
        color: active ? 'blue.600' : 'fg',
      }}
      _dark={{
        bg: active ? 'blue.950' : 'transparent',
        color: active ? 'blue.400' : 'fg.muted',
        _hover: {
          bg: active ? 'blue.950' : 'gray.800',
          color: active ? 'blue.400' : 'white',
        },
      }}
    >
      {active && (
        <Box
          position="absolute"
          right="0"
          top="0"
          h="full"
          w="1"
          bg="blue.500"
          roundedStart="full"
        />
      )}
      <Text
        as="span"
        className="material-symbols-outlined"
        fontSize="22px"
        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </Text>
      <Text as="span" fontSize="sm" fontWeight="medium">
        {label}
      </Text>
    </Flex>
  </Link>
);

// Route labels for breadcrumbs
const routeLabels: Record<string, string> = {
  '/': 'ראשי',
  '/products': 'מוצרים',
  '/products/new': 'מוצר חדש',
  '/categories': 'קטגוריות',
  '/orders': 'הזמנות',
  '/users': 'משתמשים',
  '/media': 'מדיה',
  '/settings': 'הגדרות',
  '/search': 'תוצאות חיפוש',
  '/analytics': 'אנליטיקות',
};

function getPageLabel(pathname: string): string {
  // Check for exact match first
  if (routeLabels[pathname]) return routeLabels[pathname];
  
  // Check for edit routes (e.g., /products/:id/edit)
  if (pathname.includes('/products/') && pathname.includes('/edit')) {
    return 'עריכת מוצר';
  }
  
  return 'עמוד';
}

export default function Layout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [apiLogout] = useLogoutMutation();
  const navigate = useNavigate();
  
  // Search state - initialize from URL if on search page
  const [searchInput, setSearchInput] = useState(
    location.pathname === '/search' ? searchParams.get('q') || '' : ''
  );

  const currentPageLabel = getPageLabel(location.pathname);

  const handleLogout = async () => {
    await apiLogout();
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleSearchClick = () => {
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <Flex
      bg="bg"
      color="fg"
      fontFamily="body"
      h="100vh"
      overflow="hidden"
      css={{ '::selection': { bg: 'blue.500/30', color: 'white' } }}
    >
      {/* Sidebar */}
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
              dashboard
            </Text>
          </Flex>
          <Text fontSize="xl" fontWeight="bold" color="fg">
            Admin<Text as="span" color="blue.500">Panel</Text>
          </Text>
        </HStack>

        {/* Navigation */}
        <Box as="nav" flex="1" px="3" py="6" overflowY="auto">
          <Text
            px="3"
            fontSize="xs"
            fontWeight="semibold"
            color="fg.muted"
            textTransform="uppercase"
            letterSpacing="wider"
            mb="2"
          >
            ראשי
          </Text>
          <VStack gap="1" align="stretch">
            <SidebarLink to="/" icon="home" label="לוח בקרה" active={location.pathname === '/'} />
            <SidebarLink to="/products" icon="inventory_2" label="מוצרים" active={location.pathname === '/products' || location.pathname.startsWith('/products/')} />
            <SidebarLink to="/categories" icon="category" label="קטגוריות" active={location.pathname === '/categories'} />
          </VStack>

          <Text
            px="3"
            fontSize="xs"
            fontWeight="semibold"
            color="fg.muted"
            textTransform="uppercase"
            letterSpacing="wider"
            mt="6"
            mb="2"
          >
            ניהול
          </Text>
          <VStack gap="1" align="stretch">
            <SidebarLink to="/orders" icon="shopping_bag" label="הזמנות" active={location.pathname === '/orders'} />
            <SidebarLink to="/users" icon="group" label="משתמשים" active={location.pathname === '/users'} />
            <SidebarLink to="/analytics" icon="insights" label="אנליטיקות" active={location.pathname === '/analytics'} />
            <SidebarLink to="/media" icon="image" label="מדיה" active={location.pathname === '/media'} />
          </VStack>

          <Box my="4" borderTopWidth="1px" borderColor="border" />

          <VStack gap="1" align="stretch">
            <SidebarLink to="/search" icon="search" label="חיפוש" active={location.pathname === '/search'} />
            <SidebarLink to="/settings" icon="settings" label="הגדרות" active={location.pathname === '/settings'} />
          </VStack>
        </Box>

        {/* Logout Section */}
        <Box p="4" borderTopWidth="1px" borderColor="border">
          <Button
            onClick={handleLogout}
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

      {/* Main Content */}
      <Flex as="main" flex="1" flexDirection="column" minW="0" overflow="hidden" bg="bg" position="relative">
        {/* Top Header */}
        <HStack
          as="header"
          h="16"
          flexShrink={0}
          bg="bg.panel"
          borderBottomWidth="1px"
          borderColor="border"
          justifyContent="space-between"
          px={{ base: '4', md: '8' }}
          position="sticky"
          top="0"
          zIndex={10}
        >
          {/* Left side: Mobile menu + Breadcrumbs */}
          <HStack gap="4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              p="1"
              display={{ base: 'flex', lg: 'none' }}
              color="fg.muted"
              _hover={{ bg: 'bg.subtle' }}
            >
              <Text as="span" className="material-symbols-outlined" fontSize="24px">
                menu
              </Text>
            </Button>
            
            {/* Breadcrumbs */}
            <HStack display={{ base: 'none', md: 'flex' }} fontSize="sm" color="fg.muted">
              <Text opacity={0.7}>ניהול</Text>
              <Text mx="2">/</Text>
              <Text fontWeight="medium" color="fg">{currentPageLabel}</Text>
            </HStack>
          </HStack>

          {/* Right side: Search, Icons, Profile */}
          <HStack gap={{ base: '2', md: '6' }} flex="1" justify="flex-end">
            {/* Global Search */}
            <Box display={{ base: 'none', md: 'block' }} w="full" maxW="sm">
              <InputGroup
                startElement={
                  <Text 
                    as="span" 
                    className="material-symbols-outlined" 
                    fontSize="20px" 
                    color="fg.muted"
                    cursor="pointer"
                    _hover={{ color: 'blue.500' }}
                    onClick={handleSearchClick}
                  >
                    search
                  </Text>
                }
              >
                <Input
                  placeholder="חיפוש גלובלי..."
                  size="sm"
                  bg="bg.subtle"
                  borderColor="transparent"
                  _hover={{ borderColor: 'border' }}
                  _focus={{ borderColor: 'blue.500', bg: 'bg.panel' }}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </InputGroup>
            </Box>

            {/* Icon buttons */}
            <HStack gap="2">
              <ColorModeButton />
              <Box position="relative">
                <Flex
                  as="button"
                  w="10"
                  h="10"
                  alignItems="center"
                  justifyContent="center"
                  rounded="full"
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border"
                  color="fg.muted"
                  transition="all 0.15s"
                  _hover={{ bg: 'bg.subtle' }}
                >
                  <Text as="span" className="material-symbols-outlined" fontSize="22px">
                    notifications
                  </Text>
                </Flex>
                <Box
                  position="absolute"
                  top="2"
                  left="2"
                  w="2"
                  h="2"
                  bg="red.500"
                  rounded="full"
                  borderWidth="1px"
                  borderColor="bg.panel"
                />
              </Box>
              <Flex
                as="button"
                w="10"
                h="10"
                alignItems="center"
                justifyContent="center"
                rounded="full"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border"
                color="fg.muted"
                transition="all 0.15s"
                _hover={{ bg: 'bg.subtle' }}
              >
                <Text as="span" className="material-symbols-outlined" fontSize="22px">
                  settings
                </Text>
              </Flex>
            </HStack>

            {/* Divider + User Profile */}
            <HStack
              gap="3"
              pr="2"
              borderRightWidth="1px"
              borderColor="border"
              mr="2"
            >
              <Box
                w="9"
                h="9"
                rounded="full"
                backgroundSize="cover"
                backgroundPosition="center"
                bgColor="gray.200"
                ring="2px"
                ringColor="bg.panel"
                shadow="sm"
                style={{
                  backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC84pEa-1y1bE3s7A03M2qF9pYvmDqOD7lom5F-nMf9RyxCUAeOQ0rJzpBiY2GWHYQRBtOVDXO1VP9Nd7qU99UxsPO0xHG0syvrrniqVFNjew5zAD_0-U20U8Htgr-ivxula3q71m2tP7q-wHnXgA_4cUwOO-nn55PLv0qTuGceV0t_xiqOK69MhTXk8LX-1O7IbVLUEk8oKI8IuwGZ18wLZHi0MdtQQYbLBzuYxL4DKRl4rGiI0BikKmtK1BLpEtJLR5fiKoLEhA")',
                }}
              />
              <VStack gap="0" align="end" display={{ base: 'none', lg: 'flex' }}>
                <Text fontSize="sm" fontWeight="bold" color="fg" lineHeight="tight">
                  {user?.name || 'דניאל כהן'}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  מנהל מערכת
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </HStack>

        {/* Page Content Container - Flex column to allow footer at bottom */}
        <Flex flex="1" flexDirection="column" minH="0" overflow="hidden">
          {/* Scrollable Content */}
          <Box flex="1" overflowY="auto" p="6" css={{ scrollBehavior: 'smooth' }}>
            {children}
          </Box>

          {/* Editor Footer Slot - Footer will be rendered here via context */}
          <Box id="editor-footer-slot" flexShrink={0} />
        </Flex>
      </Flex>
    </Flex>
  );
}

