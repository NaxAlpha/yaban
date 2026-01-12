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
- `serpapi@2.1.0` - Google Maps API client for data scraping

## Project Structure

```
phoenix/
├── src/
│   └── index.ts          # Main entry point - Hono app with CORS, error handling
├── cli/
│   ├── index.ts          # CLI tool for scraping data
│   └── tokyo-cities.json # Tokyo special wards configuration
├── data/                 # Scraped data storage (created at runtime)
│   └── YYYY-MM-DD-HH-mm-ss/  # Timestamped snapshots
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

# CLI Tool
bun run cli          # Run the CLI tool
bun run cli scrape   # Scrape halal restaurant data for Tokyo special wards
bun run cli -h       # Show CLI help
```

## Worker Endpoints

The worker includes the following endpoints:

- `GET /` - Hello World endpoint with environment info
- `GET /api/status` - Health check endpoint
- All routes include CORS headers

## CLI Tool

The project includes a CLI tool for scraping halal restaurant data using SerpAPI.

### Setup

1. Set your SerpAPI key as an environment variable:
   ```bash
   export SERPAPI_KEY=your_api_key_here
   ```

2. Run the scrape command:
   ```bash
   bun run cli scrape
   ```

### Data Storage

Scraped data is stored in timestamped directories under `data/`:
- Format: `data/YYYY-MM-DD-HH-mm-ss/` (e.g., `data/2026-01-12-14-33-23/`)
- Each city's results are saved as `places-{city}.json`
- File names use lowercase, hyphenated city names (e.g., `places-chiyoda.json`)

### Tokyo Special Wards

The CLI scrapes data for all 23 Tokyo special wards:
Adachi, Arakawa, Bunkyo, Chiyoda, Chuo, Edogawa, Itabashi, Katsushika, Kita, Koto, Meguro, Minato, Nakano, Nerima, Ota, Setagaya, Shibuya, Shinagawa, Shinjuku, Suginami, Sumida, Taito, Toshima

### Rate Limiting

The CLI includes built-in rate limiting with a 1-second delay between API requests to avoid hitting rate limits.

### Error Handling

The CLI provides comprehensive error handling:
- Validates SERPAPI_KEY environment variable
- Continues scraping other cities if one fails
- Provides detailed summary of successful/failed scrapes
- Logs specific error messages for troubleshooting

## Development Notes

1. **Environment Variables**: Use `.dev.vars` for local development secrets (never commit this file)
2. **Local Development**: Wrangler will spin up a local server that mimics Cloudflare Workers environment
3. **Hot Reload**: The dev server supports hot reload for rapid development
4. **Deployment**: Requires Cloudflare account setup with Wrangler (`wrangler login`)
5. **CLI Development**: Always run `bun run lint:fix` after modifying CLI code

## Important: Auto-generated

This project is designed to be AI-first. All code is optimized for:
- LLM reasoning and regeneration
- Predictable structure
- Easy debugging
- Minimal coupling between files

Any file can be safely rewritten from scratch without breaking the system.
