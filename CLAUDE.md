# Yaban - Halal Score Platform

## Project Overview
A web platform that provides halal scores for restaurants and food establishments based on Google Maps review data. The system scrapes Google Maps reviews, processes them, and serves halal scores through a web interface.

## Core Philosophy
**IMPORTANT**: This file (CLAUDE.md) should be updated whenever there are significant changes to:
- Project architecture or structure
- Technology decisions
- Feature additions or removals
- Data models or algorithms
- Deployment strategy

This ensures a perfect high-level understanding of the overall project at all times.

## Technology Stack

### Runtime & Language
- **Deno** with TypeScript/JavaScript
- **npm: specifiers** for dependencies (no package.json installs)
- Direct imports: `import ... from "npm:package-name"`
- **Puppeteer** for web scraping

### Architecture Components

#### 1. Scraping Engine (Local Runner)
- **Purpose**: Slowly and reliably gather Google Maps data
- **Method**: Unofficial web scraping using Puppeteer
- **Operation**: Runs locally, works at a measured pace to avoid detection
- **Output**: Raw JSON files containing scraped review data
- **Storage**: Stored in `data/raw/` directory

#### 2. Processing Pipeline
- **Purpose**: Clean and structure raw scraped data
- **Input**: Raw JSON files from `data/raw/`
- **Processing**:
  - Data cleaning and normalization
  - Entity extraction (places, reviews, people)
  - Score calculation using halal scoring algorithm
- **Output**: Organized JSON files in structured directories:
  - `data/places/` - Restaurant/place information
  - `data/reviews/` - Individual review data
  - `data/people/` - Reviewer information

#### 3. Web Server (Data Consumer)
- **Purpose**: Serve halal scores and restaurant information
- **Input**: Reads processed JSON files from `data/places/`, `data/reviews/`, etc.
- **Output**: Clean, formatted web interface with halal scores
- **Operation**: Serves pre-calculated scores and data

## Project Goals

### Phase 1 (Current)
- Build scraping engine for Google Maps data collection
- Establish raw data storage format (JSON)
- Create web server to read and serve scraped data
- Design basic data structure

### Phase 2 (Future)
- Develop halal scoring algorithm
- Refine score calculation based on review content
- Add filtering and search capabilities
- Enhance UI/UX

## Data Flow

```
Google Maps
    ↓
[Scraping Engine (Puppeteer)] → data/raw/
    ↓
[Processing Pipeline] → data/places/
                     → data/reviews/
                     → data/people/
    ↓
[Web Server] → Website (Halal Scores)
```

## Design Decisions

### Why Deno?
- Modern runtime with built-in TypeScript support
- Secure by default
- Direct npm: imports without package installation overhead
- Built-in tooling (formatter, linter, test runner)

### Why Unofficial Scraping?
- Google Places API limited to 5 reviews per place
- Need comprehensive review data for accurate halal scoring
- More control over data collection rate and depth

### Why Puppeteer?
- Full browser automation for reliable scraping
- Handles dynamic content and JavaScript-heavy sites
- Works well with Deno via npm: imports
- Can simulate human-like browsing behavior

### Why File-Based JSON Storage?
- Simple and portable
- Easy to inspect and debug
- No database setup required
- Sufficient for MVP and medium-scale operation
- Can migrate to database later if needed

### Why Separate Processing Step?
- Decouples data collection from data transformation
- Allows iterating on scoring algorithm without re-scraping
- Raw data preserved for debugging and algorithm refinement
- Cleaner separation of concerns

## Repository Structure (Planned)

```
yaban/
├── CLAUDE.md              # This file - project overview
├── scraper/               # Scraping engine component
│   ├── main.ts           # Entry point for scraper
│   ├── maps-scraper.ts   # Google Maps scraping logic (Puppeteer)
│   └── storage.ts        # JSON file writing utilities
├── processor/             # Data processing pipeline
│   ├── main.ts           # Entry point for processor
│   ├── cleaner.ts        # Data cleaning and normalization
│   ├── extractor.ts      # Entity extraction (places, reviews, people)
│   └── scorer.ts         # Halal scoring algorithm
├── server/                # Web server component
│   ├── main.ts           # Server entry point
│   ├── data-loader.ts    # JSON file reading utilities
│   └── routes.ts         # API/web routes
├── data/                  # Data storage
│   ├── raw/              # Raw scraped data
│   ├── places/           # Processed place/restaurant data
│   ├── reviews/          # Processed review data
│   └── people/           # Processed reviewer data
└── public/                # Static web assets (if needed)
```

## Development Approach
- Start with scraping engine to establish data collection pipeline
- Build processing pipeline to clean and structure data
- Develop halal scoring algorithm in the processor
- Build server to consume and display processed data
- Keep components loosely coupled for independent development
- Each component can be run separately and improved independently

## Current Status
- **Stage**: Initial planning
- **Next Steps**: Implement scraping engine structure and basic Google Maps scraper

---

*Last Updated: 2026-01-05*
