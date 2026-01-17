import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { Provider as ChakraProvider } from './components/ui/provider';
import { store } from './store';
import App from './App';
import { pingAppwrite } from './services/appwrite';

// Verify Appwrite SDK setup on app start
pingAppwrite();

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
          <App />
        </HashRouter>
      </ChakraProvider>
    </ReduxProvider>
  </React.StrictMode>
);
