import React, { useState } from 'react';
import axios from 'axios';
import InputForm from './components/InputForm';
import FileTree from './components/FileTree';
import MarkdownDisplay from './components/MarkdownDisplay';
import Loading from './components/Loading';
import { Container, Heading, Box, Text } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';

const printFileExtensions = {
    ".c": true, ".cpp": true, ".cc": true, ".cxx": true, ".cs": true, ".java": true, ".py": true, ".json": true, ".js": true, ".ts": true,
    ".jsx": true, ".tsx": true, ".rb": true, ".php": true, ".go": true, ".swift": true, ".kt": true, ".kts": true, ".rs": true,
    ".dart": true, ".scala": true, ".m": true, ".pl": true, ".vb": true, ".lua": true, ".r": true, ".awk": true, ".sh": true,
    ".bat": true, ".ps1": true, ".vue": true, ".html": true, ".htm": true, ".css": true, ".scss": true, ".sass": true,
    ".xml": true, ".yaml": true, ".yml": true, ".ini": true, ".env": true, ".toml": true, ".sql": true, ".psql": true,
    ".hs": true, ".erl": true, ".hrl": true, ".ml": true, ".asm": true, ".s": true, ".md": true, ".tex": true, ".makefile": true,
    ".mk": true, ".gradle": true, ".cmake": true, ".dockerfile": true, ".ipynb": true, ".coffee": true, ".h": true,
    ".hpp": true, ".pb": true, ".proto": true, ".lock": true, ".gohtml": true, ".mod": true, ".sum": true, ".gradle.kts": true
};


const TreeNode = (name) => ({
    name,
    children: {},
    add_child(child_name) {
        if (!this.children[child_name]) {
            this.children[child_name] = TreeNode(child_name);
        }
        return this.children[child_name];
    }
});
const buildTreeFromPaths = (paths, rootName = "root") => {
    const root = TreeNode(rootName);

    for (const path of paths) {
        const parts = path.split("/");
        let currentNode = root;
        for (const part of parts) {
            currentNode = currentNode.add_child(part);
        }
    }

    return root;
};

const treeToString = (node, prefix = "") => {
    let result = prefix + node.name + "\n";
    const children = Object.values(node.children);
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const isLast = i === children.length - 1;
        const newPrefix = prefix + (isLast ? "└── " : "├── ");
        result += treeToString(child, newPrefix);
    }
    return result;
};
const App = () => {
  const [mdContent, setMdContent] = useState('');
  const [fileTree, setFileTree] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDownloadEnabled, setIsDownloadEnabled] = useState(false);
  const toast = useToast();

    const getFilesList = async (owner, reponame, branch, ignoreFolders = []) => {
        try {
            const response = await axios.get(
                `https://api.github.com/repos/${owner}/${reponame}/git/trees/${branch}?recursive=true`
            );

            if (response.status === 200) {
                const data = response.data;
                const files = data.tree;
                const patterns = ignoreFolders.map(ignoreFolder => new RegExp(`^${ignoreFolder}(?:/.*)?$`));

                return files
                    .filter(f => f.type === 'blob' && !patterns.some(pattern => pattern.test(f.path)))
                    .map(f => f.path);
            } else {
                console.error(`Failed to get file list: Status code ${response.status}`);
                toast({
                    title: 'Failed to fetch data from GitHub',
                    description: `Status Code: ${response.status}`,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
                return [];
            }
        } catch (error) {
            console.error("Error fetching file list:", error);
            toast({
                title: 'Error fetching data from GitHub',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return [];
        }
    };


    const getFileContent = async (owner, reponame, branch, filepath) => {
      try {
          const url = `https://raw.githubusercontent.com/${owner}/${reponame}/refs/heads/${branch}/${filepath}`;
          const response = await axios.get(url);
  
          if (response.status === 200) {
              let content = response.data;
              if (content == null) {
                  return "```\nContent was Null\n```\n";
              }
             // Check if the file is a JSON file
              if (filepath.endsWith(".json")) {
                try {
                    // Check if content is already an object, if not then try parsing
                      if (typeof content !== 'object' ) {
                         content = JSON.parse(content);
                      }
                      // Stringify JSON content with indentation for better readability
                      content = JSON.stringify(content, null, 2);
                  } catch (jsonError) {
                      console.error(`Error parsing JSON for ${filepath}:`, jsonError);
                    toast({
                      title: 'Error parsing JSON',
                      description: `Error parsing JSON for ${filepath}:`,
                      status: 'error',
                      duration: 5000,
                      isClosable: true,
                    })
                     // If parsing fails, keep original content.
                  }
              }
              return "```\n" + content + "\n```\n";
          } else {
              console.error(`Error ${response.status} for ${url}`);
              toast({
                  title: 'Failed to fetch file content from GitHub',
                  description: `Status Code: ${response.status} for file: ${filepath}`,
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
              });
              return null
          }
      } catch (error) {
          console.error(`An error occurred for file: ${filepath}:`, error);
            toast({
                title: 'Error fetching file content from GitHub',
                description: error.message,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          return null
      }
  };

  const prepareMarkdown = async (owner, reponame, branch, filelists, ignoreFiles) => {
    let markdownContent = `** ${reponame} **\n\n`;

    const tree = buildTreeFromPaths(filelists, reponame);
    const treeString = treeToString(tree);
    markdownContent += "**Filepath Tree** : \n";
    markdownContent += "```\n" + treeString + "```\n";

    markdownContent += "\n**File Contents**\n";

  const filteredFiles = filelists.filter(fileitem => {
        const extension = fileitem.split('.').pop();
        return (fileitem && printFileExtensions[`.${extension}`] && !ignoreFiles.includes(fileitem));
    });

   let processedCount = 0;
    for (const fileitem of filteredFiles) {
       const fileContent = await getFileContent(owner, reponame, branch, fileitem)
        if (fileContent) {
            markdownContent += `\n\n## ${fileitem}\n`;
            markdownContent += fileContent;
        }
        processedCount++;
        setProgress(Math.round((processedCount / filteredFiles.length) * 100));

    }
    return markdownContent
};


const handleSubmit = async (repoDetails) => {
    setLoading(true);
    setIsDownloadEnabled(false)
    setProgress(0)
    try {
        const { owner, repoName, branch, ignoreFolders, ignoreFiles } = repoDetails;
        const filesList = await getFilesList(owner, repoName, branch, ignoreFolders);
        const markdown = await prepareMarkdown(owner, repoName, branch, filesList, ignoreFiles);
        const tree = buildTreeFromPaths(filesList, repoName);
        const treeString = treeToString(tree);
        setMdContent(markdown);
        setFileTree(treeString);
        setIsDownloadEnabled(true)
    } catch (error) {
        console.error("Error during conversion:", error);
        toast({
            title: 'Error during conversion',
            description: error.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
        })
    } finally {
        setLoading(false);
    }
};
    const handleDownload = (mdContent) => {
        const blob = new Blob([mdContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'repo_content.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
      <Container maxW="container.lg" mt={8} >
           <Heading as="h1" mb={6} textAlign="center">
               GitHub Repo to Markdown Converter
           </Heading>
           <Box display="grid" gridTemplateColumns="1fr 1fr" gap={6}>
               <InputForm onSubmit={handleSubmit} onDownload={handleDownload} loading={loading} mdContent={mdContent} isDownloadEnabled={isDownloadEnabled}/>
               <Box>
                   {loading && <Loading />}
                   {!loading && <FileTree treeString={fileTree} />}
               </Box>
           </Box>
             {loading && (
                 <Box  mt={6} alignItems="center">
                    <Text mb={2} textAlign="center">Processing Files: {progress}%</Text>
                    </Box>
               )}
           <Box mt={6}>
               {loading && <Loading />}
               {!loading && <MarkdownDisplay mdContent={mdContent} />}
           </Box>
       </Container>
   );
};

export default App;