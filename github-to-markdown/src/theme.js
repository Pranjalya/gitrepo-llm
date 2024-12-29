import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50', // Light background
        color: 'gray.800', // Dark text
      },
    },
  },
});

export default theme;