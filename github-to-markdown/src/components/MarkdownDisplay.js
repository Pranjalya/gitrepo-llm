import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Box, Text, useColorModeValue, IconButton, Tooltip } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';

const MarkdownDisplay = ({ mdContent }) => {
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
  const stripMarkdownFormatting = (md) => {
      return md.replace(/^```\s*[\w-]*\s*|```$/g, '').replace(/^##\s+/gm, '');
  };

  return (
    <Box
      bg={bgColor}
      p={4}
      rounded="md"
      boxShadow="md"
      overflow="auto"
      maxHeight="600px"
          position="relative"
    >
     <Text fontWeight="bold" mb={2}>Markdown Content</Text>
     <Box position="absolute" top="4" right="4">
         <Tooltip label="Copy Content">
              <IconButton
                  aria-label="Copy Content"
                  icon={<CopyIcon />}
                  size="sm"
                  onClick={handleCopy}
              />
          </Tooltip>
      </Box>
      <Box ref={textRef}>
      {mdContent ? (
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = (className || '').match(/language-(?<lang>[\w-]+)/);
              return !inline && match ? (
                <SyntaxHighlighter
                  style={dracula}
                  language={match.groups.lang}
                  PreTag="div"
                  children={String(children).replace(/\n$/, '')}
                  {...props}
                  
                />
              ) : (
                  <code className={className} {...props}>
                      {children}
                  </code>
              )
            }
          }}
            style={{ color: textColor }}
          >
          {stripMarkdownFormatting(mdContent)}
        </ReactMarkdown>
      ) : (
        <Text>No markdown content to display.</Text>
      )}
    </Box>
    </Box>
  );
};

export default MarkdownDisplay;