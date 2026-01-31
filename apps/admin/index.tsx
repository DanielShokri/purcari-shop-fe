import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { Provider as ChakraProvider } from './components/ui/provider';
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
        <ChakraProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </ChakraProvider>
      </ConvexAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

