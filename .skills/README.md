# Adobe Skills for AEM Edge Delivery Services

This directory contains Adobe Skills for AEM Edge Delivery Services that have been installed in this project.

## Installed Skills

### 1. accessibility-fix
**Purpose**: Scan pages for WCAG 2.1 AA accessibility violations and generate specific fixes.

**Usage**: 
```
Please use the accessibility-fix skill to audit [page URL or block name] for accessibility issues
```

**Key Features**:
- Identifies missing alt text, heading hierarchy issues, link text problems
- Separates document-level fixes from code-level fixes
- Provides specific remediation steps

### 2. content-audit
**Purpose**: Comprehensive page quality audit for content, SEO, accessibility, and performance.

**Usage**:
```
Run a content-audit on [page URL]
```

**Key Features**:
- Checks content structure, metadata, performance, accessibility, SEO
- Validates against EDS best practices
- Produces prioritized fix list (P0-P3)

### 3. bulk-metadata
**Purpose**: Audit and update metadata across multiple pages using pattern matching.

**Usage**:
```
Use bulk-metadata to audit site metadata and generate a metadata spreadsheet
```

**Key Features**:
- Uses query index to scan all pages
- Generates bulk metadata spreadsheet
- Pattern-based defaults (`/**`, `/blog/**`, etc.)

### 4. structured-data
**Purpose**: Generate JSON-LD structured data for rich search results.

**Usage**:
```
Generate structured-data for [page URL or content type]
```

**Key Features**:
- Analyzes page content to determine schema.org types
- Generates validated JSON-LD snippets
- Provides EDS-specific implementation guidance

### 5. image-seo
**Purpose**: Audit images for SEO, performance, and accessibility.

**Usage**:
```
Run image-seo audit on [page URL or block name]
```

**Key Features**:
- Checks alt text quality, lazy loading, fetch priority
- Identifies LCP image issues
- Separates author fixes from developer fixes

## How to Use Skills

Skills are invoked by referencing them in your prompts to Claude. Each skill has detailed documentation in its SKILL.md file.

### Example Workflows

**Before Launch**:
1. Run content-audit on all key pages
2. Run accessibility-fix on all pages
3. Verify bulk-metadata is configured
4. Add structured-data to key pages
5. Run image-seo audit

**During Development**:
- Run accessibility-fix on modified blocks
- Run image-seo after adding images
- Use structured-data when creating new pages

## Skill Documentation

Each skill directory contains:
- `SKILL.md` - Complete skill documentation with usage instructions
- `references/` - Additional reference materials
- `evals/` - Evaluation criteria (where applicable)
- `assets/` - Templates and examples (where applicable)

## Source Repository

These skills are sourced from: `/Users/martinnoble/development/customers/ecxio/skills`

For the latest versions and additional skills, refer to the source repository.

## Support

For detailed usage instructions, refer to:
- Individual skill SKILL.md files in each subdirectory
- The main SKILLS_INTEGRATION_GUIDE.md in the project root
- The source repository documentation