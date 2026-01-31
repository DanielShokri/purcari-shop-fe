import './index.css';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { Provider as ChakraProvider } from './components/ui/provider';
import { store } from './store';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <ReduxProvider store={store}>
          <ChakraProvider>
            <HashRouter>
              <App />
            </HashRouter>
          </ChakraProvider>
        </ReduxProvider>
      </ConvexAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
