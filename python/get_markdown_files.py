import os
import re
import requests
import asyncio
from tqdm import tqdm
from aiohttp import ClientSession


print_file_extensions = {
    ".c", ".cpp", ".cc", ".cxx", ".cs", ".java", ".py", ".json", ".js", ".ts",
    ".jsx", ".tsx", ".rb", ".php", ".go", ".swift", ".kt", ".kts", ".rs",
    ".dart", ".scala", ".m", ".pl", ".vb", ".lua", ".r", ".awk", ".sh",
    ".bat", ".ps1", ".vue", ".html", ".htm", ".css", ".scss", ".sass",
    ".xml", ".yaml", ".yml", ".ini", ".env", ".toml", ".sql", ".psql",
    ".hs", ".erl", ".hrl", ".ml", ".asm", ".s", ".md", ".tex", ".makefile",
    ".mk", ".gradle", ".cmake", ".dockerfile", ".ipynb", ".coffee", ".h",
    ".hpp", ".pb", ".proto", ".lock", ".gohtml", ".mod", ".sum", ".gradle.kts"
}


class TreeNode:
    def __init__(self, name):
        self.name = name
        self.children = {}

    def add_child(self, child_name):
        if child_name not in self.children:
            self.children[child_name] = TreeNode(child_name)
        return self.children[child_name]


def get_files_list(owner, reponame, branch, ignore_folders=[]):
    response = requests.get(f"https://api.github.com/repos/{owner}/{reponame}/git/trees/{branch}?recursive=true")
    if response.status_code == 200:
        data = response.json()
        files = data["tree"]
        patterns = []
        for ignore_folder in ignore_folders:
            pattern = fr"^\{ignore_folder}(?:/.*)?$"
            patterns.append(pattern)
        return [f["path"] for f in files if
                all(not re.match(pattern, f["path"]) for pattern in patterns) and f["type"] == "blob"]


def build_tree_from_paths(paths, root_name="root"):
    root = TreeNode(root_name)

    for path in paths:
        parts = path.split("/")
        current_node = root
        for part in parts:
            current_node = current_node.add_child(part)

    return root


def tree_to_string(node, prefix=""):
    result = prefix + node.name + "\n"
    children = list(node.children.values())
    for i, child in enumerate(children):
        is_last = i == len(children) - 1
        new_prefix = prefix + ("└── " if is_last else "├── ")
        result += tree_to_string(child, prefix=new_prefix)
    return result


async def get_file_content(session, owner, reponame, branch, filepath):
    url = f"https://raw.githubusercontent.com/{owner}/{reponame}/refs/heads/{branch}/{filepath}"
    try:
        async with session.get(url) as response:
            if response.status == 200:
                text = await response.text()
                return "```\n" + text + "\n```\n"
            else:
                print(f"Error {response.status} for {url}")
                return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

async def prepare_markdown(owner, reponame, branch, filelists, ignore_files):
    markdown_content = f"** {reponame} **\n\n"

    tree = build_tree_from_paths(filelists, root_name=reponame)
    tree_string = tree_to_string(tree)

    markdown_content += "**Filepath Tree** : \n"
    markdown_content += "```\n" + tree_string + "```\n"

    markdown_content += "\n**File Contents**\n"

    async with ClientSession() as session:
        tasks = []
        filtered_files = []  # Keep track of files that pass the filters

        for fileitem in filelists:
            extension = fileitem.rsplit(".", maxsplit=1)
            if len(extension) == 1 or f".{extension[1]}" not in print_file_extensions or fileitem in ignore_files:
                continue
            filtered_files.append(fileitem)  # Add to filtered_files
            tasks.append(get_file_content(session, owner, reponame, branch, fileitem))

        file_contents = await asyncio.gather(*tasks)

        # Use filtered_files to ensure correct association
        for file_content, fileitem in tqdm(zip(file_contents, filtered_files), total=len(filtered_files)):
            if file_content:
                markdown_content += f"\n\n## {fileitem}\n"
                markdown_content += file_content

    return markdown_content


async def main():
    owner = "Pranjalya"
    reponame = "pranjalya.github.io"
    branch = "master"
    result_file = "content2.md"

    ignore_folders = [".github"]
    ignore_files = ["package-lock.json"]

    files_list = get_files_list(owner, reponame, branch, ignore_folders)
    markdown_content = await prepare_markdown(owner, reponame, branch, files_list, ignore_files)
    with open(result_file, "w", encoding="utf-8") as f:
        f.write(markdown_content)

if __name__ == "__main__":
    asyncio.run(main())