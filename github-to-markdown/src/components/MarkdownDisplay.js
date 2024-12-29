import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';

const MarkdownDisplay = ({ mdContent }) => {
    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'gray.200');
    //   Function to strip backticks and heading syntax
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
      >
      <Text fontWeight="bold" mb={2}>Markdown Content</Text>
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
  );
};

export default MarkdownDisplay;