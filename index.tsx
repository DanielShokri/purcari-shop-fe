import './index.css';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { Provider as ChakraProvider } from './components/ui/provider';
import { store, setCredentials, setInitialized } from './store';
import App from './App';
import { useGetCurrentUserQuery } from './services/api';
import { Center, Spinner, VStack, Text } from '@chakra-ui/react';

// Component to check for existing Appwrite session on app load
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { data: user, isLoading, isSuccess } = useGetCurrentUserQuery(undefined);

  useEffect(() => {
    if (isSuccess) {
      if (user) {
        // User has an active session
        dispatch(setCredentials({ user }));
      } else {
        // No active session
        dispatch(setInitialized());
      }
    }
  }, [user, isSuccess, dispatch]);

  if (isLoading) {
    return (
      <Center minH="100vh" bg="bg.subtle">
        <VStack gap="4">
          <Spinner size="xl" color="blue.500" borderWidth="4px" />
          <Text color="fg.muted">טוען...</Text>
        </VStack>
      </Center>
    );
  }

  return <>{children}</>;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <ChakraProvider>
        <HashRouter>
          <AuthInitializer>
            <App />
          </AuthInitializer>
        </HashRouter>
      </ChakraProvider>
    </ReduxProvider>
  </React.StrictMode>
);
