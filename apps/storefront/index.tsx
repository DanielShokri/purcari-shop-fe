import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './store/index';
import { ConvexClientProvider } from './providers/ConvexClientProvider';
import { Toaster } from './components/ui/Toaster';
import App from './App';
import './index.css';

// Create a minimal Chakra system without overriding existing styles
const system = createSystem(defaultConfig, {
  cssVarsRoot: 'body',
  globalCss: {},
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ConvexClientProvider>
      <Provider store={store}>
        <ChakraProvider value={system}>
          <HelmetProvider>
            <Toaster />
            <App />
          </HelmetProvider>
        </ChakraProvider>
      </Provider>
    </ConvexClientProvider>
  </React.StrictMode>
);
