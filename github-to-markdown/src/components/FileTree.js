import React, { useRef } from 'react';
import { Box, Text, List, ListItem, useColorModeValue, IconButton, Tooltip } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';

const FileTree = ({ treeString }) => {
    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'gray.200');
    const textRef = useRef(null);

      const handleCopy = async () => {
          if (textRef.current) {
               try {
                   await navigator.clipboard.writeText(textRef.current.innerText)
                   console.log("Content copied");
               }
               catch(error) {
                console.log("Error copying content: ", error)
                }
          }
      };
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
          position="relative"
      >
      <Text fontWeight="bold" mb={2}>File Structure</Text>
      <Box  position="absolute" top="4" right="4">
        <Tooltip label="Copy Content" >
           <IconButton
               aria-label="Copy Content"
               icon={<CopyIcon />}
               size="sm"
               onClick={handleCopy}
                />
          </Tooltip>
      </Box>
      <Box ref={textRef}>
        {treeString && renderTree(treeString)}
        {!treeString && <Text>No file structure to display.</Text>}
      </Box>
    </Box>
  );
};

export default FileTree;