import './lib/beforeunloadGuard'; // must be first — patches window.addEventListener
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './store/index';
import { ConvexClientProvider } from './providers/ConvexClientProvider';
import { CartUIProvider } from './hooks/useCartUI';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ConvexClientProvider>
      <Provider store={store}>
        <CartUIProvider>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </CartUIProvider>
      </Provider>
    </ConvexClientProvider>
  </React.StrictMode>
);
