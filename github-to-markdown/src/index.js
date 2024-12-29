import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import { SSRProvider } from '@react-aria/ssr';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <SSRProvider>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
    </SSRProvider>
  </React.StrictMode>
);