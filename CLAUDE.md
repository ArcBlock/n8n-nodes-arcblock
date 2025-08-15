# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `pnpm build` - Full build process (TypeScript compilation + icon copying)
- `pnpm dev` - Watch mode TypeScript compilation  
- `pnpm prebuild` - Clean dist directory before build

### Code Quality
- `pnpm lint` - Run ESLint on nodes, credentials, and package.json
- `pnpm lintfix` - Auto-fix linting issues where possible
- `pnpm format` - Format code with Prettier

### Publishing
- `pnpm bump:version` - Bump version using zx script
- `pnpm prepublishOnly` - Build and lint before publishing (uses stricter .eslintrc.prepublish.js)

## Architecture Overview

### Node Structure
This is an N8N community node package that provides ArcBlock platform integration. Each node follows N8N's INodeType interface pattern:

- **Credentials**: Located in `/credentials/` - API authentication for different ArcBlock services
- **Nodes**: Located in `/nodes/` - Individual N8N nodes implementing specific functionality
- **Build Output**: All compiled code goes to `/dist/` for distribution

### Key Node Categories

#### Platform Nodes
- **BlockletServer**: Manages blocklet server operations (users, tags, blocklets)  
- **BlockletService**: Handles blocklet service interactions
- Both use GraphQL APIs with Bearer token authentication

#### Kit Nodes (Blocklet Components)
- **DiscussKit**: Forum/discussion functionality (boards, content, labels, search)
- **PaymentKit**: Payment processing operations  
- **MediaKit**: Media file management
- **SnapKit**: Snapshot/backup operations
- **VoteKit**: Voting system functionality

#### Utility Nodes
- **MarkdownToLexical**: Transforms Markdown content to Lexical JSON format
- **RandomId**: Generates random identifiers
- **TwitterMediaUpload**: Uploads media to Twitter using session tokens

### Node Implementation Pattern
Each node follows this structure:
```
NodeDirectory/
├── NodeName.node.ts        # Main node implementation (INodeType)  
├── NodeName.svg           # Node icon
├── *Description.ts        # Resource/operation definitions
└── GenericFunctions.ts    # Shared API utilities (if applicable)
```

### Authentication Patterns

#### Credential-Based Authentication
Three main credential types for ArcBlock services:
- `BlockletServerApi` - Server-level access with GraphQL endpoint discovery
- `BlockletServiceApi` - Service-level API access  
- `BlockletComponentApi` - Component-level API access (optional for some kit nodes)

#### Session-Based Authentication
Some nodes use session tokens as node parameters instead of credentials:
- **TwitterMediaUpload** - Uses `auth_token` session cookie and optional `ct0` CSRF token as node parameters
- Supports HTTP proxy configuration with authentication in URL format (e.g., `http://user:pass@proxy.com:8080`)
- Provides more flexibility for users who don't want to store credentials

### Build Process
1. TypeScript compilation (`tsc`) generates JavaScript in `/dist/`
2. Gulp task (`build:icons`) copies SVG/PNG icons to `/dist/`  
3. Package configuration (`package.json` n8n section) declares credential and node entry points

### ESLint Configuration
Uses `eslint-plugin-n8n-nodes-base` with strict rules for:
- N8N node/credential naming conventions
- Parameter validation and types
- Documentation requirements
- Community package standards

### Dependencies
- Core: n8n-workflow (peer dependency)
- ArcBlock: @abtnode/client, @blocklet/error
- Lexical: Full lexical ecosystem for rich text processing  
- Utilities: lodash, uuid, marked, jsdom, mime-types, ufo, is-url

## Important Notes

- All nodes support `usableAsTool: true` for N8N's AI tool integration
- TypeScript configured for strict mode with comprehensive error checking
- Icons must be SVG format and copied during build process
- GraphQL is the primary API protocol for server/service nodes
- Credentials handle automatic endpoint discovery via `.well-known/did.json`
- Use `// @ts-ignore` for external library imports without type definitions (mime-types, is-url)
- Session-based nodes should use `Record<string, string>` for flexible header typing