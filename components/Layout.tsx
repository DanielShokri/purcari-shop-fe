import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, logoutUser } from '../store';
import { useLogoutMutation } from '../services/api';
import { Box, Flex } from '@chakra-ui/react';
import { Sidebar, Header, getPageLabel } from './layout-parts';

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

  const handleSearchSubmit = () => {
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
      <Sidebar currentPath={location.pathname} onLogout={handleLogout} />

      {/* Main Content */}
      <Flex as="main" flex="1" flexDirection="column" minW="0" overflow="hidden" bg="bg" position="relative">
        <Header
          currentPageLabel={currentPageLabel}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          onSearchKeyDown={handleSearchKeyDown}
          user={user}
        />

        {/* Page Content Container */}
        <Flex flex="1" flexDirection="column" minH="0" overflow="hidden">
          {/* Scrollable Content */}
          <Box flex="1" overflowY="auto" p="6" css={{ scrollBehavior: 'smooth' }}>
            {children}
          </Box>

          {/* Editor Footer Slot */}
          <Box id="editor-footer-slot" flexShrink={0} />
        </Flex>
      </Flex>
    </Flex>
  );
}
