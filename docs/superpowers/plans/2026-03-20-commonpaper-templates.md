# CommonPaper Templates Curation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fetch legal document templates from CommonPaper GitHub repositories and organize them with metadata catalog

**Architecture:** Python script using GitHub REST API to discover and download markdown templates from CommonPaper organization, with intelligent filtering, metadata extraction, and collision handling

**Tech Stack:** Python 3, requests library, GitHub REST API v3

---

## File Structure

```
prelegal/
├── scripts/
│   └── fetch_templates.py          # Main script with all functionality
├── requirements.txt                 # Python dependencies
├── templates/                       # Created by script
│   ├── CC-BY-4.0-ATTRIBUTION.txt   # Created by script
│   └── *.md                        # Template files
└── catalog.json                     # Created by script
```

---

### Task 1: Project Setup

**Files:**
- Create: `/Users/amit.tambe/Documents/Source_Personal/prelegal/requirements.txt`
- Create: `/Users/amit.tambe/Documents/Source_Personal/prelegal/scripts/fetch_templates.py`

- [ ] **Step 1: Create requirements.txt**

Create the Python dependencies file:

```txt
requests>=2.31.0
```

- [ ] **Step 2: Install dependencies**

Run: `pip install -r requirements.txt`

Expected: Successfully installed requests

- [ ] **Step 3: Create scripts directory and skeleton script**

```python
#!/usr/bin/env python3
"""
Fetch legal document templates from CommonPaper GitHub organization.

This script:
1. Lists all CommonPaper repositories
2. Finds markdown files in each repo
3. Filters for legal templates (excludes README, LICENSE, etc.)
4. Downloads templates to templates/ directory
5. Creates catalog.json with metadata
6. Adds CC BY 4.0 attribution
"""

import os
import sys
import json
import re
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import requests


# Constants
GITHUB_API_BASE = "https://api.github.com"
ORGANIZATION = "CommonPaper"
TEMPLATES_DIR = "templates"
CATALOG_FILE = "catalog.json"
ATTRIBUTION_FILE = "CC-BY-4.0-ATTRIBUTION.txt"

# Files to skip (not legal templates)
SKIP_FILES = {
    "README.md", "readme.md",
    "LICENSE.md", "license.md", "LICENSE", "license",
    "CONTRIBUTING.md", "contributing.md",
    "CODE_OF_CONDUCT.md", "code_of_conduct.md",
    ".github", "CHANGELOG.md", "changelog.md",
}


def main():
    """Main execution function."""
    print("CommonPaper Templates Fetcher")
    print("=" * 50)
    print()

    # Placeholder for implementation
    print("Script skeleton created successfully!")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Test script runs**

Run: `python scripts/fetch_templates.py`

Expected: Prints "CommonPaper Templates Fetcher" and "Script skeleton created successfully!"

- [ ] **Step 5: Commit setup**

```bash
git add requirements.txt scripts/fetch_templates.py
git commit -m "build: Add project setup for template fetching

- Add requirements.txt with requests dependency
- Create skeleton script for CommonPaper template fetcher

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2: GitHub API Client Functions

**Files:**
- Modify: `/Users/amit.tambe/Documents/Source_Personal/prelegal/scripts/fetch_templates.py`

- [ ] **Step 1: Add GitHub token and rate limit check functions**

Add these functions after the constants:

```python
def get_github_headers() -> Dict[str, str]:
    """Get headers for GitHub API requests with optional authentication."""
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Prelegal-Template-Fetcher"
    }

    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"token {token}"
        print("✓ Using authenticated GitHub API access")
    else:
        print("ℹ Using unauthenticated API access (60 requests/hour limit)")

    return headers


def check_rate_limit(headers: Dict[str, str]) -> Tuple[int, int]:
    """Check GitHub API rate limit status."""
    url = f"{GITHUB_API_BASE}/rate_limit"
    response = requests.get(url, headers=headers)
    response.raise_for_status()

    data = response.json()
    core = data["resources"]["core"]
    remaining = core["remaining"]
    limit = core["limit"]
    reset_time = datetime.fromtimestamp(core["reset"])

    print(f"ℹ Rate limit: {remaining}/{limit} requests remaining")
    if remaining < 10:
        print(f"⚠ Warning: Low rate limit. Resets at {reset_time}")

    return remaining, limit
```

- [ ] **Step 2: Test rate limit check**

Update main() to test:

```python
def main():
    """Main execution function."""
    print("CommonPaper Templates Fetcher")
    print("=" * 50)
    print()

    # Get headers and check rate limit
    headers = get_github_headers()
    remaining, limit = check_rate_limit(headers)

    if remaining < 10:
        print("\n❌ Rate limit too low. Please wait or set GITHUB_TOKEN environment variable.")
        sys.exit(1)

    print("\n✓ Ready to fetch templates")
```

Run: `python scripts/fetch_templates.py`

Expected: Shows rate limit status and prints "Ready to fetch templates"

- [ ] **Step 3: Add retry logic with exponential backoff**

Add after rate limit function:

```python
def make_request_with_retry(url: str, headers: Dict[str, str], max_retries: int = 3) -> requests.Response:
    """Make HTTP request with exponential backoff retry logic."""
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise

            wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
            print(f"⚠ Request failed (attempt {attempt + 1}/{max_retries}): {e}")
            print(f"  Retrying in {wait_time} seconds...")
            time.sleep(wait_time)

    raise RuntimeError("Should not reach here")
```

- [ ] **Step 4: Add function to list organization repositories**

```python
def list_organization_repos(org: str, headers: Dict[str, str]) -> List[Dict]:
    """List all public repositories for an organization."""
    repos = []
    page = 1

    print(f"\nFetching repositories from {org} organization...")

    while True:
        url = f"{GITHUB_API_BASE}/orgs/{org}/repos?page={page}&per_page=100"
        response = make_request_with_retry(url, headers)
        data = response.json()

        if not data:
            break

        repos.extend(data)
        page += 1

    print(f"✓ Found {len(repos)} repositories")
    return repos
```

- [ ] **Step 5: Test repository listing**

Update main() to test:

```python
def main():
    """Main execution function."""
    print("CommonPaper Templates Fetcher")
    print("=" * 50)
    print()

    # Get headers and check rate limit
    headers = get_github_headers()
    remaining, limit = check_rate_limit(headers)

    if remaining < 10:
        print("\n❌ Rate limit too low. Please wait or set GITHUB_TOKEN.")
        sys.exit(1)

    # List repositories
    repos = list_organization_repos(ORGANIZATION, headers)

    for repo in repos[:5]:  # Show first 5 for testing
        print(f"  - {repo['name']}: {repo.get('description', 'No description')}")

    print("\n✓ Repository listing works")
```

Run: `python scripts/fetch_templates.py`

Expected: Lists CommonPaper repositories with descriptions

- [ ] **Step 6: Commit GitHub API client**

```bash
git add scripts/fetch_templates.py
git commit -m "feat: Add GitHub API client functions

- Add authentication header management with token support
- Implement rate limit checking with warnings
- Add retry logic with exponential backoff
- Implement organization repository listing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Repository Tree Navigation

**Files:**
- Modify: `/Users/amit.tambe/Documents/Source_Personal/prelegal/scripts/fetch_templates.py`

- [ ] **Step 1: Add function to get repository default branch**

```python
def get_default_branch(repo: Dict) -> str:
    """Get the default branch for a repository."""
    return repo.get("default_branch", "main")
```

- [ ] **Step 2: Add function to get repository tree**

```python
def get_repo_tree(owner: str, repo: str, branch: str, headers: Dict[str, str]) -> List[Dict]:
    """Get the file tree for a repository."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"

    try:
        response = make_request_with_retry(url, headers)
        data = response.json()
        return data.get("tree", [])
    except requests.exceptions.RequestException as e:
        print(f"  ⚠ Could not fetch tree for {repo}: {e}")
        return []
```

- [ ] **Step 3: Add function to find markdown files**

```python
def find_markdown_files(tree: List[Dict], repo_name: str) -> List[Dict]:
    """Find markdown files in repository tree, excluding documentation files."""
    markdown_files = []

    for item in tree:
        if item["type"] != "blob":
            continue

        path = item["path"]
        filename = os.path.basename(path)

        # Check if it's a markdown file
        if not path.lower().endswith(".md"):
            continue

        # Skip documentation files
        if filename in SKIP_FILES:
            continue

        # Skip files in .github directory
        if ".github" in path:
            continue

        markdown_files.append({
            "path": path,
            "filename": filename,
            "sha": item["sha"],
            "url": item["url"]
        })

    return markdown_files
```

- [ ] **Step 4: Test tree navigation**

Update main() to test:

```python
def main():
    """Main execution function."""
    print("CommonPaper Templates Fetcher")
    print("=" * 50)
    print()

    # Get headers and check rate limit
    headers = get_github_headers()
    remaining, limit = check_rate_limit(headers)

    if remaining < 10:
        print("\n❌ Rate limit too low. Please wait or set GITHUB_TOKEN.")
        sys.exit(1)

    # List repositories
    repos = list_organization_repos(ORGANIZATION, headers)

    # Test with first repo
    if repos:
        test_repo = repos[0]
        print(f"\nTesting tree navigation with: {test_repo['name']}")

        branch = get_default_branch(test_repo)
        tree = get_repo_tree(ORGANIZATION, test_repo["name"], branch, headers)
        md_files = find_markdown_files(tree, test_repo["name"])

        print(f"✓ Found {len(md_files)} markdown file(s):")
        for f in md_files:
            print(f"  - {f['path']}")

    print("\n✓ Tree navigation works")
```

Run: `python scripts/fetch_templates.py`

Expected: Shows markdown files found in first repository

- [ ] **Step 5: Commit tree navigation**

```bash
git add scripts/fetch_templates.py
git commit -m "feat: Add repository tree navigation

- Implement default branch detection
- Add recursive tree fetching
- Filter markdown files excluding docs/meta files

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Template Content Fetching

**Files:**
- Modify: `/Users/amit.tambe/Documents/Source_Personal/prelegal/scripts/fetch_templates.py`

- [ ] **Step 1: Add function to fetch file content**

```python
def fetch_file_content(owner: str, repo: str, path: str, headers: Dict[str, str]) -> Optional[str]:
    """Fetch the content of a file from GitHub."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{path}"

    try:
        response = make_request_with_retry(url, headers)
        data = response.json()

        # GitHub returns content as base64
        import base64
        content = base64.b64decode(data["content"]).decode("utf-8")
        return content
    except Exception as e:
        print(f"  ⚠ Could not fetch {path}: {e}")
        return None
```

- [ ] **Step 2: Add function to get file last commit date**

```python
def get_file_last_commit(owner: str, repo: str, path: str, headers: Dict[str, str]) -> Optional[str]:
    """Get the last commit date for a file."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/commits?path={path}&page=1&per_page=1"

    try:
        response = make_request_with_retry(url, headers)
        commits = response.json()

        if commits:
            commit_date = commits[0]["commit"]["committer"]["date"]
            return commit_date

        return None
    except Exception as e:
        print(f"  ⚠ Could not fetch commit date for {path}: {e}")
        return None
```

- [ ] **Step 3: Add validation function**

```python
def validate_content(content: str, min_length: int = 100) -> bool:
    """Validate that content is substantial and not empty."""
    if not content or len(content.strip()) < min_length:
        return False

    # Basic check for legal content - should have some legal keywords
    legal_keywords = ["agreement", "contract", "terms", "party", "parties", "liability"]
    content_lower = content.lower()

    return any(keyword in content_lower for keyword in legal_keywords)
```

- [ ] **Step 4: Test content fetching**

Update main() to test:

```python
def main():
    """Main execution function."""
    print("CommonPaper Templates Fetcher")
    print("=" * 50)
    print()

    headers = get_github_headers()
    remaining, limit = check_rate_limit(headers)

    if remaining < 10:
        print("\n❌ Rate limit too low.")
        sys.exit(1)

    repos = list_organization_repos(ORGANIZATION, headers)

    # Test content fetching with first file found
    for repo in repos[:3]:
        branch = get_default_branch(repo)
        tree = get_repo_tree(ORGANIZATION, repo["name"], branch, headers)
        md_files = find_markdown_files(tree, repo["name"])

        if md_files:
            test_file = md_files[0]
            print(f"\nTesting content fetch: {repo['name']}/{test_file['path']}")

            content = fetch_file_content(ORGANIZATION, repo["name"], test_file["path"], headers)
            if content:
                print(f"✓ Fetched {len(content)} characters")
                print(f"✓ Valid: {validate_content(content)}")

                last_commit = get_file_last_commit(ORGANIZATION, repo["name"], test_file["path"], headers)
                print(f"✓ Last updated: {last_commit}")
            break

    print("\n✓ Content fetching works")
```

Run: `python scripts/fetch_templates.py`

Expected: Fetches and validates content from a template file

- [ ] **Step 5: Commit content fetching**

```bash
git add scripts/fetch_templates.py
git commit -m "feat: Add template content fetching

- Implement file content fetching with base64 decoding
- Add last commit date retrieval
- Add content validation for legal templates

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 5: Metadata Extraction

**Files:**
- Modify: `/Users/amit.tambe/Documents/Source_Personal/prelegal/scripts/fetch_templates.py`

- [ ] **Step 1: Add function to extract YAML front matter**

```python
def extract_front_matter(content: str) -> Optional[Dict]:
    """Extract YAML front matter from markdown content."""
    # Check for front matter delimiters
    if not content.startswith("---"):
        return None

    try:
        # Find the closing delimiter
        parts = content.split("---", 2)
        if len(parts) < 3:
            return None

        front_matter = parts[1].strip()

        # Simple YAML parsing for common fields
        metadata = {}
        for line in front_matter.split("\n"):
            if ":" in line:
                key, value = line.split(":", 1)
                metadata[key.strip()] = value.strip().strip('"').strip("'")

        return metadata
    except Exception:
        return None
```

- [ ] **Step 2: Add function to generate name from filename**

```python
def generate_name_from_filename(filename: str) -> str:
    """Generate a human-readable name from a filename."""
    # Remove .md extension
    name = filename.replace(".md", "")

    # Replace hyphens and underscores with spaces
    name = name.replace("-", " ").replace("_", " ")

    # Title case
    name = name.title()

    return name
```

- [ ] **Step 3: Add function to extract or generate description**

```python
def extract_description(content: str, front_matter: Optional[Dict], repo_description: str, filename: str) -> str:
    """Extract or generate description for a template."""
    # Priority 1: Front matter description
    if front_matter and "description" in front_matter:
        return front_matter["description"]

    # Priority 2: Use repo description if it mentions the filename topic
    if repo_description:
        return repo_description

    # Priority 3: Generate from first paragraph
    lines = content.split("\n")
    for line in lines:
        line = line.strip()
        if line and not line.startswith("#") and len(line) > 50:
            # Return first substantial line (truncate if too long)
            return line[:200] + ("..." if len(line) > 200 else "")

    # Priority 4: Generate from filename
    name = generate_name_from_filename(filename)
    return f"Legal agreement template for {name}"
```

- [ ] **Step 4: Add function to extract template name**

```python
def extract_template_name(content: str, front_matter: Optional[Dict], filename: str) -> str:
    """Extract or generate template name."""
    # Priority 1: Front matter title
    if front_matter and "title" in front_matter:
        return front_matter["title"]

    # Priority 2: First H1 heading
    lines = content.split("\n")
    for line in lines:
        if line.startswith("# "):
            return line[2:].strip()

    # Priority 3: Generate from filename
    return generate_name_from_filename(filename)
```

- [ ] **Step 5: Test metadata extraction**

Update main() to test:

```python
def main():
    """Main execution function."""
    print("CommonPaper Templates Fetcher")
    print("=" * 50)
    print()

    headers = get_github_headers()
    remaining, limit = check_rate_limit(headers)

    if remaining < 10:
        print("\n❌ Rate limit too low.")
        sys.exit(1)

    repos = list_organization_repos(ORGANIZATION, headers)

    # Test metadata extraction
    for repo in repos[:3]:
        branch = get_default_branch(repo)
        tree = get_repo_tree(ORGANIZATION, repo["name"], branch, headers)
        md_files = find_markdown_files(tree, repo["name"])

        if md_files:
            test_file = md_files[0]
            print(f"\nTesting metadata: {repo['name']}/{test_file['path']}")

            content = fetch_file_content(ORGANIZATION, repo["name"], test_file["path"], headers)
            if content:
                front_matter = extract_front_matter(content)
                name = extract_template_name(content, front_matter, test_file["filename"])
                description = extract_description(content, front_matter, repo.get("description", ""), test_file["filename"])

                print(f"✓ Name: {name}")
                print(f"✓ Description: {description[:80]}...")
                print(f"✓ Has front matter: {front_matter is not None}")
            break

    print("\n✓ Metadata extraction works")
```

Run: `python scripts/fetch_templates.py`

Expected: Extracts and displays template name and description

- [ ] **Step 6: Commit metadata extraction**

```bash
git add scripts/fetch_templates.py
git commit -m "feat: Add metadata extraction

- Implement YAML front matter parsing
- Add name generation from filename
- Add multi-strategy description extraction
- Add template name extraction from various sources

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 6: File Writing and Collision Handling

**Files:**
- Modify: `/Users/amit.tambe/Documents/Source_Personal/prelegal/scripts/fetch_templates.py`

- [ ] **Step 1: Add function to handle filename collisions**

```python
def handle_filename_collision(filename: str, repo_name: str, existing_files: set) -> str:
    """Handle filename collisions by prepending repo name."""
    if filename not in existing_files:
        return filename

    # Collision detected - prepend repo name
    new_filename = f"{repo_name}-{filename}"
    print(f"  ℹ Collision detected: {filename} -> {new_filename}")

    # Handle unlikely case where even prepended name collides
    counter = 1
    while new_filename in existing_files:
        name, ext = os.path.splitext(filename)
        new_filename = f"{repo_name}-{name}-{counter}{ext}"
        counter += 1

    return new_filename
```

- [ ] **Step 2: Add function to create templates directory**

```python
def ensure_templates_dir(base_dir: str = ".") -> Path:
    """Ensure templates directory exists."""
    templates_path = Path(base_dir) / TEMPLATES_DIR
    templates_path.mkdir(exist_ok=True)
    return templates_path
```

- [ ] **Step 3: Add function to write template file**

```python
def write_template_file(templates_dir: Path, filename: str, content: str) -> bool:
    """Write template content to file."""
    try:
        file_path = templates_dir / filename
        file_path.write_text(content, encoding="utf-8")
        return True
    except Exception as e:
        print(f"  ❌ Failed to write {filename}: {e}")
        return False
```

- [ ] **Step 4: Add function to create attribution file**

```python
def create_attribution_file(templates_dir: Path):
    """Create CC BY 4.0 attribution file."""
    attribution_text = """# Attribution

All legal document templates in this directory are sourced from CommonPaper
(https://github.com/CommonPaper) and are licensed under the Creative Commons
Attribution 4.0 International License (CC BY 4.0).

## License

These templates are available under CC BY 4.0:
https://creativecommons.org/licenses/by/4.0/

You are free to:
- Share: copy and redistribute the material in any medium or format
- Adapt: remix, transform, and build upon the material for any purpose

Under the following terms:
- Attribution: You must give appropriate credit to CommonPaper, provide a link
  to the license, and indicate if changes were made.

## Source

Original templates: https://github.com/CommonPaper
Fetched: {fetch_date}

## About CommonPaper

CommonPaper provides standardized legal templates to help businesses create
fair, balanced agreements. Visit https://commonpaper.com for more information.
"""

    fetch_date = datetime.now().strftime("%Y-%m-%d")
    attribution_content = attribution_text.format(fetch_date=fetch_date)

    attribution_path = templates_dir / ATTRIBUTION_FILE
    attribution_path.write_text(attribution_content, encoding="utf-8")
    print(f"✓ Created attribution file: {ATTRIBUTION_FILE}")
```

- [ ] **Step 5: Test file writing**

Update main() to test:

```python
def main():
    """Main execution function."""
    print("CommonPaper Templates Fetcher")
    print("=" * 50)
    print()

    # Test directory creation
    templates_dir = ensure_templates_dir()
    print(f"✓ Templates directory ready: {templates_dir}")

    # Test attribution file
    create_attribution_file(templates_dir)

    # Test collision handling
    existing = {"test.md"}
    new_name = handle_filename_collision("test.md", "example-repo", existing)
    print(f"✓ Collision handling: test.md -> {new_name}")

    print("\n✓ File writing works")
```

Run: `python scripts/fetch_templates.py`

Expected: Creates templates/ directory and attribution file

- [ ] **Step 6: Verify attribution file created**

Run: `cat templates/CC-BY-4.0-ATTRIBUTION.txt`

Expected: Shows proper CC BY 4.0 attribution content

- [ ] **Step 7: Commit file writing**

```bash
git add scripts/fetch_templates.py
git commit -m "feat: Add file writing and collision handling

- Implement filename collision detection and resolution
- Add templates directory creation
- Add template file writing
- Create CC BY 4.0 attribution file

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 7: Catalog Builder

**Files:**
- Modify: `/Users/amit.tambe/Documents/Source_Personal/prelegal/scripts/fetch_templates.py`

- [ ] **Step 1: Add catalog building function**

```python
def build_catalog(templates: List[Dict], output_path: str = CATALOG_FILE):
    """Build and write catalog.json with atomic write."""
    catalog = {
        "templates": templates,
        "metadata": {
            "fetched_at": datetime.now().isoformat(),
            "source_organization": ORGANIZATION,
            "total_templates": len(templates),
            "license": "CC BY 4.0"
        }
    }

    # Atomic write: write to temp file, then rename
    temp_path = f"{output_path}.tmp"

    try:
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(catalog, f, indent=2, ensure_ascii=False)

        # Rename is atomic on most systems
        os.replace(temp_path, output_path)

        print(f"\n✓ Created catalog: {output_path}")
        print(f"  - Total templates: {len(templates)}")
        print(f"  - Fetched at: {catalog['metadata']['fetched_at']}")

    except Exception as e:
        print(f"❌ Failed to write catalog: {e}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise
```

- [ ] **Step 2: Test catalog building**

Update main() to test:

```python
def main():
    """Main execution function."""
    print("CommonPaper Templates Fetcher")
    print("=" * 50)
    print()

    # Test catalog with sample data
    sample_templates = [
        {
            "name": "Test Agreement",
            "description": "A test legal agreement template",
            "filename": "test-agreement.md",
            "source_repo": "test-repo",
            "source_url": "https://github.com/CommonPaper/test-repo/blob/main/test.md",
            "last_updated": "2026-03-20T10:00:00Z"
        }
    ]

    build_catalog(sample_templates, "test-catalog.json")

    # Verify it's valid JSON
    with open("test-catalog.json") as f:
        data = json.load(f)
        print(f"\n✓ Catalog is valid JSON")
        print(f"✓ Contains {len(data['templates'])} template(s)")

    # Clean up test file
    os.remove("test-catalog.json")

    print("\n✓ Catalog building works")
```

Run: `python scripts/fetch_templates.py`

Expected: Creates and validates test catalog file

- [ ] **Step 3: Commit catalog builder**

```bash
git add scripts/fetch_templates.py
git commit -m "feat: Add catalog builder with atomic writes

- Implement catalog.json construction
- Add atomic write using temp file and rename
- Include metadata section with fetch timestamp

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 8: Main Orchestration

**Files:**
- Modify: `/Users/amit.tambe/Documents/Source_Personal/prelegal/scripts/fetch_templates.py`

- [ ] **Step 1: Implement complete main function**

Replace the main() function with the full orchestration:

```python
def main():
    """Main execution function."""
    print("CommonPaper Templates Fetcher")
    print("=" * 50)
    print()

    # Setup
    headers = get_github_headers()
    remaining, limit = check_rate_limit(headers)

    if remaining < 10:
        print("\n❌ Rate limit too low. Please wait or set GITHUB_TOKEN environment variable.")
        print("   Export your token: export GITHUB_TOKEN=your_token_here")
        sys.exit(1)

    # Ensure templates directory exists
    templates_dir = ensure_templates_dir()

    # Track existing filenames for collision detection
    existing_filenames = set()
    templates_data = []

    # Fetch all repositories
    repos = list_organization_repos(ORGANIZATION, headers)

    print(f"\nProcessing {len(repos)} repositories...")
    print("-" * 50)

    # Process each repository
    for repo in repos:
        repo_name = repo["name"]
        repo_description = repo.get("description", "")

        print(f"\n📁 {repo_name}")

        # Get repository tree
        branch = get_default_branch(repo)
        tree = get_repo_tree(ORGANIZATION, repo_name, branch, headers)

        if not tree:
            print("  ⚠ Could not fetch tree, skipping")
            continue

        # Find markdown files
        md_files = find_markdown_files(tree, repo_name)

        if not md_files:
            print("  ℹ No template files found")
            continue

        print(f"  Found {len(md_files)} markdown file(s)")

        # Process each markdown file
        for md_file in md_files:
            path = md_file["path"]
            filename = md_file["filename"]

            print(f"  Processing: {path}")

            # Fetch content
            content = fetch_file_content(ORGANIZATION, repo_name, path, headers)

            if not content:
                print(f"    ⚠ Could not fetch content, skipping")
                continue

            # Validate content
            if not validate_content(content):
                print(f"    ⚠ Content validation failed, skipping")
                continue

            # Get last commit date
            last_updated = get_file_last_commit(ORGANIZATION, repo_name, path, headers)

            # Extract metadata
            front_matter = extract_front_matter(content)
            template_name = extract_template_name(content, front_matter, filename)
            description = extract_description(content, front_matter, repo_description, filename)

            # Handle filename collisions
            final_filename = handle_filename_collision(filename, repo_name, existing_filenames)
            existing_filenames.add(final_filename)

            # Write template file
            if write_template_file(templates_dir, final_filename, content):
                # Build source URL
                source_url = f"https://github.com/{ORGANIZATION}/{repo_name}/blob/{branch}/{path}"

                # Add to catalog
                templates_data.append({
                    "name": template_name,
                    "description": description,
                    "filename": final_filename,
                    "source_repo": repo_name,
                    "source_url": source_url,
                    "last_updated": last_updated or datetime.now().isoformat()
                })

                print(f"    ✓ Saved as: {final_filename}")

            # Small delay to be nice to GitHub API
            time.sleep(0.1)

    # Create attribution file
    print("\n" + "=" * 50)
    create_attribution_file(templates_dir)

    # Build catalog
    build_catalog(templates_data)

    # Summary
    print("\n" + "=" * 50)
    print("Summary:")
    print(f"  ✓ Templates downloaded: {len(templates_data)}")
    print(f"  ✓ Repositories processed: {len(repos)}")
    print(f"  ✓ Output directory: {templates_dir}")
    print(f"  ✓ Catalog file: {CATALOG_FILE}")
    print("\n✅ Template fetching complete!")
```

- [ ] **Step 2: Test dry run (comment out writes temporarily)**

Add a DRY_RUN flag for testing if desired, or just review the code logic.

- [ ] **Step 3: Commit main orchestration**

```bash
git add scripts/fetch_templates.py
git commit -m "feat: Add main orchestration logic

- Implement complete workflow from repo listing to catalog
- Add progress reporting and error handling
- Include collision detection and validation
- Add summary statistics

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 9: Execute Template Fetching

**Files:**
- Execute: `/Users/amit.tambe/Documents/Source_Personal/prelegal/scripts/fetch_templates.py`

- [ ] **Step 1: Run the complete script**

Run: `python scripts/fetch_templates.py`

Expected: Script fetches all templates from CommonPaper repos

Monitor output for:
- Repository count
- Files found per repo
- Download progress
- Any errors or warnings

- [ ] **Step 2: Verify templates directory**

Run: `ls -la templates/`

Expected: Shows .md files and CC-BY-4.0-ATTRIBUTION.txt

- [ ] **Step 3: Count downloaded templates**

Run: `ls templates/*.md | wc -l`

Expected: Shows number of template files

- [ ] **Step 4: Verify catalog.json exists and is valid**

Run: `python -m json.tool catalog.json > /dev/null && echo "✓ Valid JSON"`

Expected: Confirms catalog.json is valid JSON

- [ ] **Step 5: Review catalog contents**

Run: `python -c "import json; data = json.load(open('catalog.json')); print(f'Total: {data[\"metadata\"][\"total_templates\"]} templates'); [print(f'  - {t[\"name\"]}') for t in data['templates'][:5]]"`

Expected: Shows template count and first 5 template names

---

### Task 10: Manual Validation

**Files:**
- Verify: Templates and catalog

- [ ] **Step 1: Spot-check template content**

Run: `head -20 templates/*.md | head -40`

Expected: Shows beginning of template files with legal content

- [ ] **Step 2: Verify no duplicate filenames**

Run: `ls templates/*.md | sort | uniq -d`

Expected: No output (no duplicates)

- [ ] **Step 3: Verify attribution file**

Run: `cat templates/CC-BY-4.0-ATTRIBUTION.txt`

Expected: Shows proper CC BY 4.0 attribution with CommonPaper source

- [ ] **Step 4: Validate catalog completeness**

Run: `python -c "import json; import os; data = json.load(open('catalog.json')); files = {t['filename'] for t in data['templates']}; actual = {f for f in os.listdir('templates') if f.endswith('.md')}; missing = actual - files; print('✓ All files in catalog' if not missing else f'Missing: {missing}')"`

Expected: "✓ All files in catalog"

- [ ] **Step 5: Check source URLs are valid**

Run: `python -c "import json; data = json.load(open('catalog.json')); print('Sample URLs:'); [print(f'  {t[\"source_url\"]}') for t in data['templates'][:3]]"`

Expected: Shows properly formatted GitHub URLs

- [ ] **Step 6: Verify metadata timestamps**

Run: `python -c "import json; from datetime import datetime; data = json.load(open('catalog.json')); print(f'Fetched at: {data[\"metadata\"][\"fetched_at\"]}'); print(f'License: {data[\"metadata\"][\"license\"]}')"`

Expected: Shows current date and "CC BY 4.0"

---

### Task 11: Git Commit and Update Issue

**Files:**
- Add: `templates/*`, `catalog.json`

- [ ] **Step 1: Check git status**

Run: `git status`

Expected: Shows templates/, catalog.json as untracked

- [ ] **Step 2: Add templates and catalog**

```bash
git add templates/ catalog.json
```

- [ ] **Step 3: Review what will be committed**

Run: `git status`

Expected: Shows templates and catalog.json staged

- [ ] **Step 4: Commit the templates**

```bash
git commit -m "feat: Add CommonPaper legal document templates (KAN-4)

- Fetch ${TEMPLATE_COUNT} legal agreement templates from CommonPaper
- Create catalog.json with rich metadata
- Add CC BY 4.0 attribution file
- Templates sourced from https://github.com/CommonPaper

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

Note: Replace `${TEMPLATE_COUNT}` with actual number from catalog.json

- [ ] **Step 5: Verify commit**

Run: `git log -1 --stat`

Expected: Shows commit with templates and catalog.json

---

### Task 12: Create Pull Request

**Files:**
- Branch and PR creation

- [ ] **Step 1: Check current branch**

Run: `git branch --show-current`

Expected: Shows current branch name

- [ ] **Step 2: Push branch to remote**

Run: `git push -u origin $(git branch --show-current)`

Expected: Successfully pushed to remote

- [ ] **Step 3: Create pull request**

```bash
gh pr create --title "Add CommonPaper legal document templates (KAN-4)" --body "$(cat <<'EOF'
## Summary
- Implemented automated script to fetch legal document templates from CommonPaper GitHub organization
- Downloaded all markdown legal agreement templates to `templates/` directory
- Created `catalog.json` with comprehensive metadata for each template (name, description, source URL, last updated date)
- Added CC BY 4.0 attribution file documenting license and source

## Implementation Details
- **Script:** `scripts/fetch_templates.py`
- **Templates fetched:** See catalog.json for complete list
- **Source:** https://github.com/CommonPaper
- **License:** CC BY 4.0
- **Features:**
  - GitHub API integration with rate limit handling
  - Filename collision detection and resolution
  - Content validation for legal templates
  - Metadata extraction from front matter and repo descriptions
  - Retry logic with exponential backoff

## Test Plan
- [x] Verify all templates downloaded successfully
- [x] Validate catalog.json is well-formed JSON
- [x] Confirm no duplicate filenames in templates/
- [x] Check CC BY 4.0 attribution file exists
- [x] Spot-check template content is legal agreements
- [x] Verify source URLs point to correct GitHub locations

## Files Changed
- `scripts/fetch_templates.py` - Template fetching script
- `requirements.txt` - Python dependencies
- `templates/*.md` - Legal agreement templates
- `templates/CC-BY-4.0-ATTRIBUTION.txt` - License attribution
- `catalog.json` - Template metadata catalog

Closes #KAN-4

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 4: Verify PR created**

Run: `gh pr view --web`

Expected: Opens PR in browser

---

## Completion

After all tasks are complete:

1. ✅ Templates downloaded from CommonPaper
2. ✅ Catalog.json created with metadata
3. ✅ CC BY 4.0 attribution added
4. ✅ All files committed to git
5. ✅ Pull request created

The templates are now ready for the next phase of the Prelegal project.
