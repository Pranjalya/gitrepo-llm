import React from 'react';
import { Box, Text, List, ListItem, useColorModeValue } from '@chakra-ui/react';

const FileTree = ({ treeString }) => {
    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'gray.200');

    const renderTree = (treeStr) => {
        const lines = treeStr.trim().split('\n');
        return (
          <List spacing={1}>
            {lines.map((line, index) => (
              <ListItem key={index} style={{ whiteSpace: 'pre-line' }}>
                <Text color={textColor} fontFamily="monospace" fontSize="sm">{line}</Text>
              </ListItem>
            ))}
          </List>
        );
      };
  return (
      <Box
        bg={bgColor}
        p={4}
        rounded="md"
        boxShadow="md"
        overflow="auto"
        maxHeight="400px"
      >
      <Text fontWeight="bold" mb={2}>File Structure</Text>
      {treeString && renderTree(treeString)}
      {!treeString && <Text>No file structure to display.</Text>}
    </Box>
  );
};

export default FileTree;