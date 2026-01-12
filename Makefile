# Phoenix Worker - Cloudflare Workers with Bun
.PHONY: help install dev deploy tail test lint lint-fix clean check-all

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE  := \033[0;34m
GREEN := \033[0;32m
RED   := \033[0;31m
NC    := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Phoenix Worker - Available Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies with bun
	@echo "$(BLUE)Installing dependencies...$(NC)"
	bun install

dev: ## Start local development server
	@echo "$(BLUE)Starting dev server...$(NC)"
	bun run dev

deploy: ## Deploy to Cloudflare Workers
	@echo "$(BLUE)Deploying to Cloudflare Workers...$(NC)"
	bun run deploy

tail: ## Tail real-time logs from production
	@echo "$(BLUE)Tailing production logs...$(NC)"
	bun run tail

test: ## Run tests
	@echo "$(BLUE)Running tests...$(NC)"
	bun test

lint: ## Run ESLint to check code quality
	@echo "$(BLUE)Running linter...$(NC)"
	bun run lint

lint-fix: ## Run ESLint and auto-fix issues
	@echo "$(BLUE)Fixing linting issues...$(NC)"
	bun run lint:fix

typecheck: ## Run TypeScript type checking
	@echo "$(BLUE)Type checking...$(NC)"
	bunx tsc --noEmit

clean: ## Clean build artifacts and cache
	@echo "$(BLUE)Cleaning...$(NC)"
	rm -rf .wrangler node_modules dist

check-all: lint typecheck test ## Run all quality checks (lint, typecheck, test)
	@echo "$(GREEN)All checks passed!$(NC)"
