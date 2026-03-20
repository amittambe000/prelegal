# Legal Document Templates Dataset Curation

**Date:** 2026-03-20
**Issue:** KAN-4
**Status:** Approved

## Overview

This is a one-time data curation task to prepare legal document templates for the Prelegal project. We will fetch template legal agreements from CommonPaper's GitHub repositories (licensed under CC BY 4.0) and organize them into our project with proper attribution and metadata cataloging.

## Requirements

1. Browse CommonPaper's GitHub organization to identify all repositories containing legal agreement templates
2. Download all markdown template legal agreements to a `templates/` directory in the project root
3. Create a `catalog.json` file in the project root containing metadata for each template
4. Add proper CC BY 4.0 license attribution in the templates directory

## Architecture

### Components

1. **GitHub API Client**
   - Uses GitHub REST API to list all repositories under the CommonPaper organization
   - Navigates repository trees to discover markdown files
   - Fetches file content and metadata (last updated date, repo info)
   - Supports both authenticated (with token) and unauthenticated access

2. **Template Filter**
   - Identifies actual legal templates vs. documentation files
   - Skips common non-template files: README.md, LICENSE.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, etc.
   - Focuses on substantive legal agreement documents

3. **Metadata Extractor**
   - Parses templates for descriptions using multiple strategies:
     - Check for YAML front matter in markdown files
     - Use repository description from GitHub
     - Generate description from filename if no other source available
   - Extracts or infers template names

4. **Catalog Builder**
   - Constructs catalog.json with rich metadata for each template:
     - `name`: Template title (from front matter, filename, or repo)
     - `description`: From front matter, repo description, or generated
     - `filename`: Local filename in templates/ directory
     - `source_repo`: Original CommonPaper repository name
     - `source_url`: Direct GitHub URL to original file
     - `last_updated`: ISO 8601 timestamp of last commit to the file

5. **Attribution Generator**
   - Creates CC-BY-4.0-ATTRIBUTION.txt file in templates/ directory
   - Documents that all templates are from CommonPaper and licensed under CC BY 4.0
   - Includes link to original repositories

## Data Flow

```
1. GitHub API → List CommonPaper repos
2. For each repo → Navigate tree to find .md files
3. Filter → Identify legal templates (skip docs/meta files)
4. Download → Fetch file content with metadata
5. Handle Collisions → Rename if duplicate filenames exist
6. Build Catalog → Aggregate all metadata into catalog.json
7. Write Attribution → Create CC BY 4.0 attribution file
```

## Output Structure

```
prelegal/
├── templates/
│   ├── CC-BY-4.0-ATTRIBUTION.txt
│   ├── template-1.md
│   ├── template-2.md
│   └── ...
└── catalog.json
```

### catalog.json Schema

```json
{
  "templates": [
    {
      "name": "Template Name",
      "description": "Brief description of the template",
      "filename": "template-file.md",
      "source_repo": "repo-name",
      "source_url": "https://github.com/CommonPaper/repo-name/blob/main/template.md",
      "last_updated": "2026-03-15T10:30:00Z"
    }
  ],
  "metadata": {
    "fetched_at": "2026-03-20T14:30:00Z",
    "source_organization": "CommonPaper",
    "total_templates": 42,
    "license": "CC BY 4.0"
  }
}
```

## Error Handling

### API Rate Limits
- GitHub API allows 60 requests/hour unauthenticated, 5000/hour authenticated
- Script checks rate limit status before starting
- Supports GITHUB_TOKEN environment variable for authenticated access
- Provides clear error message if rate limit exceeded with time until reset

### Duplicate Filenames
- If multiple repos contain files with the same name, prepend repo name
- Example: `repo-name-template.md` instead of `template.md`
- Log all renamed files for transparency

### Invalid or Empty Files
- Validate file content before saving (check for minimum length, valid UTF-8)
- Skip files that are empty or appear corrupted
- Log all skipped files with reason

### Network Failures
- Implement retry logic with exponential backoff (3 attempts)
- Handle timeout errors gracefully
- Provide clear error messages for debugging

## Implementation Approach

1. **Script Location:** `scripts/fetch_templates.py`
2. **Dependencies:**
   - `requests` library for HTTP requests
   - Standard library only for everything else (json, os, re, time)
3. **Configuration:**
   - Optional GITHUB_TOKEN environment variable
   - Hardcoded CommonPaper organization name
4. **Execution:**
   - Run once to populate templates
   - Outputs progress to console (which repos being scanned, files found, files downloaded)
   - Creates templates/ directory if it doesn't exist
   - Uses atomic writes for catalog.json (write to temp file, then rename)

## Testing & Validation

Since this is a one-time data curation task:

1. **Manual Verification:**
   - Spot-check downloaded templates for correct content
   - Verify templates are actual legal agreements
   - Check that descriptions are reasonable

2. **Automated Validation:**
   - Validate catalog.json is well-formed JSON
   - Verify all files listed in catalog exist in templates/
   - Confirm CC BY 4.0 attribution file is present
   - Check no duplicate filenames in templates/

3. **Metadata Quality:**
   - Review that source_url fields link to correct GitHub locations
   - Verify last_updated timestamps are reasonable
   - Ensure template names and descriptions are meaningful

## Success Criteria

- All markdown legal templates from CommonPaper repos are downloaded to `templates/`
- `catalog.json` accurately describes each template with complete metadata
- CC BY 4.0 attribution is properly documented
- No errors or warnings during execution
- File structure is clean and organized
- All templates are usable for the next phase of the Prelegal project

## Future Considerations

- This is explicitly a one-time data curation task
- Future updates to CommonPaper templates would require re-running the script
- Could be enhanced later to track versions or updates, but not required now
- The catalog structure is extensible for additional metadata fields if needed later
