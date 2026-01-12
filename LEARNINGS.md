# Project Learnings

## Project Setup

This is a Cloudflare Workers project built with:
- **Runtime**: Cloudflare Workers
- **Framework**: Hono (lightweight web framework)
- **Package Manager**: Bun (v1.3.5)
- **Language**: TypeScript
- **Deployment Tool**: Wrangler (v4.42.0)

### Installed Dependencies
- `hono@4.11.3` - Web framework
- `@cloudflare/workers-types@4.20260111.0` - TypeScript types
- `wrangler@3.114.16` - Cloudflare deployment tool

## Project Structure

```
phoenix/
├── src/
│   └── index.ts          # Main entry point - Hono app with CORS, error handling
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── wrangler.toml         # Cloudflare Workers configuration
├── .gitignore            # Git ignore patterns
└── bun.lock              # Bun lockfile
```

## Key Configuration Files

### package.json
- Uses `bun` scripts for dev workflow
- Dependencies: `hono` for routing
- Dev dependencies: `wrangler`, `@cloudflare/workers-types`

### wrangler.toml
- Worker name: `phoenix-worker`
- Entry point: `src/index.ts`
- Compatibility date: `2025-01-01`
- Node compatibility enabled for packages requiring Node.js built-ins
- Environment-specific configuration (dev/production)

### tsconfig.json
- Target: ES2022
- Module resolution: Bundler (suitable for Cloudflare Workers)
- Includes Cloudflare Workers types
- Strict mode enabled

## Available Commands

```bash
# Development
bun run dev          # Start local development server with Wrangler

# Deployment
bun run deploy       # Deploy to Cloudflare Workers

# Monitoring
bun run tail         # Tail real-time logs from deployed worker

# Testing
bun run test         # Run tests (when tests are added)
```

## Worker Endpoints

The worker includes the following endpoints:

- `GET /` - Hello World endpoint with environment info
- `GET /api/status` - Health check endpoint
- All routes include CORS headers

## Development Notes

1. **Environment Variables**: Use `.dev.vars` for local development secrets (never commit this file)
2. **Local Development**: Wrangler will spin up a local server that mimics Cloudflare Workers environment
3. **Hot Reload**: The dev server supports hot reload for rapid development
4. **Deployment**: Requires Cloudflare account setup with Wrangler (`wrangler login`)

## Important: Auto-generated

This project is designed to be AI-first. All code is optimized for:
- LLM reasoning and regeneration
- Predictable structure
- Easy debugging
- Minimal coupling between files

Any file can be safely rewritten from scratch without breaking the system.
