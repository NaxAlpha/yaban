#!/usr/bin/env bun

/**
 * CLI tool for scraping data using SerpAPI
 *
 * This tool runs locally and stores scraped data under data/
 *
 * Usage:
 *   bun run cli <command> [options]
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface CityConfig {
	cities: string[]
}

const command = process.argv[2]

switch (command) {
	case 'scrape':
		scrapeCommand()
		break
	case '--help':
	case '-h':
	case undefined:
		showHelp()
		break
	default:
		console.error(`Unknown command: ${command}`)
		showHelp()
		process.exit(1)
}

function showHelp() {
	console.log(`
CLI tool for scraping data using SerpAPI

Usage:
  bun run cli <command> [options]

Commands:
  scrape    Scrape halal restaurant data for Tokyo special wards
  -h, --help  Show this help message

Environment Variables:
  SERPAPI_KEY  Your SerpAPI API key (required for scrape command)
  `)
}

async function scrapeCommand() {
	const apiKey = process.env.SERPAPI_KEY

	if (!apiKey) {
		console.error('Error: SERPAPI_KEY environment variable is required')
		console.error('Set it with: export SERPAPI_KEY=your_key_here')
		process.exit(1)
	}

	console.log('Starting scrape for Tokyo special wards...')

	// Load cities from config
	const cities = loadCitiesConfig()
	console.log(`Found ${cities.length} cities to scrape`)

	// Create snapshot directory
	const timestamp = createTimestamp()
	const snapshotDir = join(process.cwd(), 'data', timestamp)
	mkdirSync(snapshotDir, { recursive: true })
	console.log(`Created snapshot directory: ${snapshotDir}`)

	// Scrape each city
	const results: Record<string, { success: boolean; error?: string }> = {}

	for (let i = 0; i < cities.length; i++) {
		const city = cities[i]
		const citySlug = city.toLowerCase().replace(/\s+/g, '-')

		console.log(`[${i + 1}/${cities.length}] Scraping ${city}...`)

		try {
			const data = await scrapeCity(city, apiKey)
			const outputFile = join(snapshotDir, `places-${citySlug}.json`)
			writeFileSync(outputFile, JSON.stringify(data, null, 2))
			results[city] = { success: true }
			console.log(`  ✓ Saved to ${outputFile}`)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			results[city] = { success: false, error: errorMessage }
			console.error(`  ✗ Error scraping ${city}: ${errorMessage}`)
		}

		// Rate limiting: wait 1 second between requests
		if (i < cities.length - 1) {
			await sleep(1000)
		}
	}

	// Print summary
	console.log('\n=== Scrape Summary ===')
	const successful = Object.values(results).filter(r => r.success).length
	const failed = Object.values(results).filter(r => !r.success).length
	console.log(`Successful: ${successful}/${cities.length}`)
	console.log(`Failed: ${failed}/${cities.length}`)

	if (failed > 0) {
		console.log('\nFailed cities:')
		Object.entries(results)
			.filter(([, r]) => !r.success)
			.forEach(([city, r]) => {
				console.log(`  - ${city}: ${r.error}`)
			})
	}

	console.log(`\nData saved to: ${snapshotDir}`)
}

function loadCitiesConfig(): string[] {
	const configPath = join(process.cwd(), 'cli', 'tokyo-cities.json')
	const configContent = readFileSync(configPath, 'utf-8')
	const config: CityConfig = JSON.parse(configContent)
	return config.cities
}

async function scrapeCity(city: string, apiKey: string): Promise<unknown> {
	console.log(`  Querying SerpAPI for "${city}"...`)

	const url = new URL('https://serpapi.com/search.json')
	url.searchParams.set('engine', 'google_maps')
	url.searchParams.set('q', `halal restaurant ${city}`)
	url.searchParams.set('api_key', apiKey)

	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`)
	}

	return response.json()
}

function createTimestamp(): string {
	const now = new Date()

	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	const hours = String(now.getHours()).padStart(2, '0')
	const minutes = String(now.getMinutes()).padStart(2, '0')
	const seconds = String(now.getSeconds()).padStart(2, '0')

	return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`
}

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}
