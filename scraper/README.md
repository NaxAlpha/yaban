# Google Maps Scraper

A reliable web scraper for extracting restaurant data from Google Maps using Puppeteer.

## Features

- Scrapes restaurant listings from Google Maps search results
- Extracts: name, rating, review count, category, price level
- Automatic scrolling to load more results
- Saves data to JSON files in `data/raw/`
- Robust selectors that work with Google Maps current structure

## Usage

### Basic Usage
```bash
deno run --allow-net --allow-write --allow-read --allow-env --allow-run scraper/main.ts
```

This will scrape halal restaurants in Tokyo (default query).

### Custom Query
```bash
deno run --allow-net --allow-write --allow-read --allow-env --allow-run scraper/main.ts "ramen shops in Shibuya"
```

### Specify Max Results
```bash
deno run --allow-net --allow-write --allow-read --allow-env --allow-run scraper/main.ts "halal restaurants in Tokyo" 50
```

### Run with Visible Browser (for debugging)
```bash
deno run --allow-net --allow-write --allow-read --allow-env --allow-run scraper/main.ts "halal restaurants in Tokyo" 20 false
```

## Output

Results are saved to `data/raw/` with timestamped filenames:
```
data/raw/halal-restaurants-in-tokyo_2026-01-05T12-30-45-123Z.json
```

## Selector Strategy

The scraper uses robust selectors based on ARIA roles and attributes:
- `[role="feed"]` - Main results container
- `div[role="article"]` - Individual place cards
- `a[href*="/maps/place/"]` - Place links with names
- `span[role="img"][aria-label*="stars"]` - Rating elements
- `span[aria-label*="reviews"]` - Review count

These selectors are more reliable than class-based selectors which can change frequently.
