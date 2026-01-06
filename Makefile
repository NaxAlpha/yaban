# Yaban - Halal Score Platform
# Makefile for common operations

.PHONY: help scrape scrape-debug format lint check clean clean-raw clean-all test setup

# Default target
.DEFAULT_GOAL := help

# Variables
SCRAPER_MAIN = scraper/main.ts
PROCESSOR_MAIN = processor/main.ts
SERVER_MAIN = server/main.ts
DENO_PERMISSIONS = --allow-net --allow-write --allow-read --allow-env --allow-run --allow-sys

# Colors for output
BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(BLUE)Yaban - Halal Score Platform$(NC)"
	@echo "Available commands:"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Scraping

scrape: ## Run the scraper (args: QUERY="halal restaurants" MAX=20)
	@echo "$(BLUE)Running scraper...$(NC)"
	deno run $(DENO_PERMISSIONS) $(SCRAPER_MAIN) "$(QUERY)" "$(MAX)"

scrape-debug: ## Run scraper with visible browser (args: QUERY="halal restaurants" MAX=20)
	@echo "$(BLUE)Running scraper in debug mode (browser visible)...$(NC)"
	deno run $(DENO_PERMISSIONS) $(SCRAPER_MAIN) "$(QUERY)" "$(MAX)" false

scrape-default: ## Run scraper with default settings (halal restaurants in Tokyo)
	@echo "$(BLUE)Running scraper with default query...$(NC)"
	deno run $(DENO_PERMISSIONS) $(SCRAPER_MAIN)

fetch:all-places: ## Batch scrape all Tokyo districts (args: MAX=20)
	@echo "$(BLUE)Scraping all Tokyo districts...$(NC)"
	deno run $(DENO_PERMISSIONS) scraper/fetch-all-places.ts "$(MAX)"

##@ Processing

process: ## Run the data processor (coming soon)
	@echo "$(YELLOW)Processor not yet implemented$(NC)"
	@# deno run $(DENO_PERMISSIONS) $(PROCESSOR_MAIN)

##@ Server

serve: ## Start the web server (coming soon)
	@echo "$(YELLOW)Server not yet implemented$(NC)"
	@# deno run $(DENO_PERMISSIONS) $(SERVER_MAIN)

##@ Development

format: ## Format code with deno fmt
	@echo "$(BLUE)Formatting code...$(NC)"
	deno fmt

format-check: ## Check code formatting without modifying
	@echo "$(BLUE)Checking code formatting...$(NC)"
	deno fmt --check

lint: ## Lint code with deno lint
	@echo "$(BLUE)Linting code...$(NC)"
	deno lint

check: ## Type check all TypeScript files
	@echo "$(BLUE)Type checking...$(NC)"
	deno check scraper/*.ts

test: ## Run tests (when implemented)
	@echo "$(YELLOW)Tests not yet implemented$(NC)"
	@# deno test

##@ Data Management

clean-raw: ## Remove all raw scraped data
	@echo "$(YELLOW)Removing raw data...$(NC)"
	rm -rf data/raw/*
	@echo "$(GREEN)Raw data cleaned$(NC)"

clean-processed: ## Remove all processed data
	@echo "$(YELLOW)Removing processed data...$(NC)"
	rm -rf data/places/* data/reviews/* data/people/*
	@echo "$(GREEN)Processed data cleaned$(NC)"

clean-all: clean-raw clean-processed ## Remove all data (raw and processed)
	@echo "$(GREEN)All data cleaned$(NC)"

clean: clean-all ## Alias for clean-all

##@ Setup

install-chrome: ## Install Chrome for Puppeteer
	@echo "$(BLUE)Installing Chrome for Puppeteer...$(NC)"
	deno run --allow-read --allow-write --allow-env --allow-net --allow-run scripts/install-chrome.ts

setup: ## Create necessary directories and install Chrome
	@echo "$(BLUE)Setting up project directories...$(NC)"
	mkdir -p data/raw
	mkdir -p data/places
	mkdir -p data/reviews
	mkdir -p data/people
	mkdir -p processor
	mkdir -p server
	mkdir -p scripts
	@echo "$(GREEN)Directories created!$(NC)"
	@echo ""
	@$(MAKE) install-chrome

##@ Common Workflows

dev-scrape: format lint check scrape-default ## Format, lint, check, and scrape with defaults
	@echo "$(GREEN)Development workflow complete!$(NC)"

quick-check: format-check lint check ## Quick validation without modifications
	@echo "$(GREEN)Quick check complete!$(NC)"
