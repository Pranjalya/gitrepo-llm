import React, { useState } from 'react';
import {
  Input,
  Button,
  Box,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { DownloadIcon } from '@chakra-ui/icons';

const InputForm = ({ onSubmit, onDownload, loading, mdContent, isDownloadEnabled }) => {
  const [owner, setOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [branch, setBranch] = useState('master');
  const [ignoreFolders, setIgnoreFolders] = useState('');
  const [ignoreFiles, setIgnoreFiles] = useState('');
  const toast = useToast();
  const handleSubmit = (event) => {
    event.preventDefault();
    const parsedIgnoreFolders = ignoreFolders.split(',').map(s => s.trim()).filter(s => s !== '');
    const parsedIgnoreFiles = ignoreFiles.split(',').map(s => s.trim()).filter(s => s !== '');
    if (!owner || !repoName) {
      toast({
        title: 'Please enter owner and repository name',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return;
    }
    onSubmit({ owner, repoName, branch, ignoreFolders: parsedIgnoreFolders, ignoreFiles: parsedIgnoreFiles });
  };
    const handleDownload = () => {
        if(mdContent) {
            onDownload(mdContent, owner, repoName, branch);
        }
        else {
            toast({
                title: "No markdown to download",
                description: "Please submit a repository first",
                status: "error",
                duration: 5000,
                isClosable: true
              })
        }
    }
  return (
    <Box p={4} boxShadow="md" rounded="md" bg="white">
    <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
        <Text fontSize="lg" fontWeight="bold">
          GitHub Repository Details
        </Text>
        <FormControl>
          <FormLabel>Owner</FormLabel>
          <Input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="e.g., Pranjalya"
            required
          />
        </FormControl>
        <FormControl>
          <FormLabel>Repository Name</FormLabel>
          <Input
            type="text"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder="e.g., my-repo"
            required
          />
        </FormControl>
        <FormControl>
          <FormLabel>Branch</FormLabel>
          <Input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="e.g., main or master"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Ignore Folders (comma separated)</FormLabel>
          <Input
            type="text"
            value={ignoreFolders}
            onChange={(e) => setIgnoreFolders(e.target.value)}
            placeholder="e.g., .git, node_modules"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Ignore Files (comma separated)</FormLabel>
          <Input
            type="text"
            value={ignoreFiles}
            onChange={(e) => setIgnoreFiles(e.target.value)}
            placeholder="e.g., package-lock.json, yarn.lock"
          />
        </FormControl>
          <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              loadingText="Processing"
              sx={{
                  borderLeftWidth: '1px',
                  paddingLeft: '1rem', // Added left padding
                  marginLeft: 0
              }}
          >
            Generate Markdown
          </Button>
         <Button
           colorScheme="teal"
             onClick={handleDownload}
           ml={2}
             leftIcon={<DownloadIcon />}
           isDisabled={!isDownloadEnabled}
             sx={{
                 borderLeftWidth: '1px',
                 paddingLeft: '1rem', // Added left padding
                 marginLeft: 0
             }}
         >
                Download .md
            </Button>
        </Stack>
    </form>
    </Box>
  );
};

export default InputForm;