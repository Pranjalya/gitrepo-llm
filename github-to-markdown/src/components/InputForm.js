import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Box,
  Stack,
  Text,
  useToast,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { DownloadIcon, LinkIcon } from '@chakra-ui/icons';
import axios from 'axios';

const InputForm = ({ onSubmit, onDownload, loading, mdContent, isDownloadEnabled, githubPAT }) => {
  const [owner, setOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [branch, setBranch] = useState('');
  const [availableBranches, setAvailableBranches] = useState([]); // New state for branches
  const [ignoreFolders, setIgnoreFolders] = useState('');
  const [ignoreFiles, setIgnoreFiles] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const toast = useToast();

  const parseRepoUrl = (url) => {
    try {
      const urlParts = url.split('/');
      const owner = urlParts[3];
      const repoName = urlParts[4].replace('.git', '');
      const branch = urlParts.length > 7 ? urlParts[6] : 'main';

      setOwner(owner);
      setRepoName(repoName);
      setBranch(branch);
    } catch (error) {
      toast({
        title: 'Invalid URL',
        description: 'Could not parse the repository URL.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUrlPaste = (event) => {
    const url = event.target.value;
    setRepoUrl(url);
    parseRepoUrl(url);
  };

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
    onSubmit({ owner, repoName, branch, ignoreFolders: parsedIgnoreFolders, ignoreFiles: parsedIgnoreFiles, githubPAT });
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

  useEffect(() => {
    // Fetch branches when owner and repoName are available
    if (owner && repoName) {
      const fetchBranches = async () => {
        try {
          const headers = githubPAT ? { Authorization: `token ${githubPAT}` } : {};
          const response = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/branches`, { headers });
          setAvailableBranches(response.data.map(branch => branch.name));

          // Optionally set the default branch if 'branch' state is empty
          if (!branch && response.data.length > 0) {
            // Assuming the first branch in the API response is the default branch
            setBranch(response.data[0].name);
          }
        } catch (error) {
          console.error("Could not fetch branches:", error);
          toast({
            title: 'Could not fetch branches',
            description: 'Failed to retrieve branch list from GitHub.',
            status: 'error',
          });
        }
      };

      fetchBranches();
    }
  }, [owner, repoName, branch, githubPAT, toast]); // Add branch to the dependency array

  return (
    <Box p={4} boxShadow="md" rounded="md" bg="white">
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Repository URL</FormLabel>
          <InputGroup>
            <InputLeftElement
              pointerEvents='none'
              children={<LinkIcon color='gray.300' />}
            />
            <Input
              type="url"
              placeholder="Enter GitHub Repository URL"
              value={repoUrl}
              onChange={handleUrlPaste}
            />
          </InputGroup>
        </FormControl>
      </Stack>
      <br />
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
          <FormControl id="branch">
            <FormLabel>Branch</FormLabel>
            <Select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Select branch"
            >
              {availableBranches.map((branchName) => (
                <option key={branchName} value={branchName}>
                  {branchName}
                </option>
              ))}
            </Select>
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