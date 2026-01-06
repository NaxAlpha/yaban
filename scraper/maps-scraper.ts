/**
 * Google Maps scraper using Puppeteer
 * Scrapes restaurant listings and basic information
 */

import puppeteer, { type Browser, type Page } from "npm:puppeteer@23.11.1";
import type { ScrapedPlace } from "./storage.ts";

export interface ScrapeOptions {
  query: string;
  maxResults?: number;
  headless?: boolean;
  slowMo?: number;
}

export class GoogleMapsScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(headless = true, slowMo = 100): Promise<void> {
    console.log("🚀 Launching browser...");
    this.browser = await puppeteer.launch({
      headless,
      slowMo,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    this.page = await this.browser.newPage();

    // Set realistic viewport and user agent
    await this.page.setViewport({ width: 1366, height: 768 });
    await this.page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    console.log("✓ Browser initialized");
  }

  async searchPlaces(query: string, maxResults = 20): Promise<ScrapedPlace[]> {
    if (!this.page) {
      throw new Error("Browser not initialized. Call initialize() first.");
    }

    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    console.log(`🔍 Searching: ${query}`);
    console.log(`📍 URL: ${searchUrl}`);

    await this.page.goto(searchUrl, { waitUntil: "networkidle2" });

    // Wait for results to load
    await this.waitForResults();

    // Scroll to load more results
    await this.scrollResults(maxResults);

    // Extract place data
    const places = await this.extractPlaces(query);

    console.log(`✓ Found ${places.length} places`);
    return places;
  }

  private async waitForResults(): Promise<void> {
    if (!this.page) return;

    try {
      // Wait for the results feed to appear
      // Google Maps uses a feed container with role="feed"
      await this.page.waitForSelector('[role="feed"]', { timeout: 10000 });
      console.log("✓ Results loaded");

      // Give it a moment for initial items to render
      await this.delay(2000);
    } catch (error) {
      console.error("⚠ Timeout waiting for results");
      throw error;
    }
  }

  private async scrollResults(maxResults: number): Promise<void> {
    if (!this.page) return;

    console.log(`📜 Scrolling to load up to ${maxResults} results...`);

    // The scrollable container in Google Maps
    const scrollableSelector = '[role="feed"]';

    let previousCount = 0;
    let noNewResultsCount = 0;
    const maxNoNewResults = 3;

    while (noNewResultsCount < maxNoNewResults) {
      // Count current results
      const currentCount = await this.page.evaluate((selector) => {
        const items = document.querySelectorAll(`${selector} > div[role="article"]`);
        return items.length;
      }, scrollableSelector);

      console.log(`  Current results: ${currentCount}`);

      if (currentCount >= maxResults) {
        console.log(`✓ Reached target of ${maxResults} results`);
        break;
      }

      if (currentCount === previousCount) {
        noNewResultsCount++;
        console.log(`  No new results (${noNewResultsCount}/${maxNoNewResults})`);
      } else {
        noNewResultsCount = 0;
        previousCount = currentCount;
      }

      // Scroll to bottom of feed
      await this.page.evaluate((selector) => {
        const feed = document.querySelector(selector);
        if (feed) {
          feed.scrollTop = feed.scrollHeight;
        }
      }, scrollableSelector);

      // Wait for new content to load
      await this.delay(1500);
    }

    console.log("✓ Scrolling complete");
  }

  private async extractPlaces(query: string): Promise<ScrapedPlace[]> {
    if (!this.page) return [];

    console.log("📊 Extracting place data...");

    const places = await this.page.evaluate((searchQuery) => {
      const results: ScrapedPlace[] = [];
      const feed = document.querySelector('[role="feed"]');
      if (!feed) return results;

      const articles = feed.querySelectorAll('div[role="article"]');

      articles.forEach((article) => {
        try {
          // Extract place name
          const nameEl = article.querySelector('a[href*="/maps/place/"]');
          const name = nameEl?.getAttribute("aria-label") || "";

          // Extract URL
          const url = nameEl?.getAttribute("href") || "";

          // Generate place ID from URL
          const placeIdMatch = url.match(/!1s([^!]+)/);
          const placeId = placeIdMatch ? placeIdMatch[1] : "";

          // Extract rating
          const ratingEl = article.querySelector('span[role="img"][aria-label*="stars"]');
          const ratingText = ratingEl?.getAttribute("aria-label") || "";
          const ratingMatch = ratingText.match(/([\d.]+)\s+stars/);
          const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

          // Extract review count
          const reviewEl = article.querySelector('span[aria-label*="reviews"]');
          const reviewText = reviewEl?.getAttribute("aria-label") || "";
          const reviewMatch = reviewText.match(/([\d,]+)\s+reviews/);
          const totalReviews = reviewMatch
            ? parseInt(reviewMatch[1].replace(/,/g, ""))
            : undefined;

          // Extract category and price level (usually in the same area)
          const metaEls = article.querySelectorAll('span[aria-label]');
          let category = undefined;
          let priceLevel = undefined;

          metaEls.forEach((el) => {
            const ariaLabel = el.getAttribute("aria-label") || "";
            if (ariaLabel.includes("Price:")) {
              priceLevel = ariaLabel.replace("Price:", "").trim();
            }
          });

          // Try to get category from text content
          const categoryEl = article.querySelector('div[style*="font-weight"]');
          if (categoryEl) {
            const textParts = categoryEl.textContent?.split("·") || [];
            if (textParts.length > 0) {
              category = textParts[0].trim();
            }
          }

          if (name && placeId) {
            results.push({
              placeId,
              name,
              rating,
              totalReviews,
              category,
              priceLevel,
              url: url.startsWith("http") ? url : `https://www.google.com${url}`,
              scrapedAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Error extracting place:", error);
        }
      });

      return results;
    }, query);

    return places;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log("✓ Browser closed");
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
