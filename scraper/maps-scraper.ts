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
        "--disable-features=IsolateOrigins,site-per-process",
      ],
      ignoreDefaultArgs: ["--enable-automation"],
    });

    this.page = await this.browser.newPage();

    // Set realistic viewport and user agent
    await this.page.setViewport({ width: 1366, height: 768 });
    await this.page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    // Set longer timeouts to avoid premature failures
    this.page.setDefaultNavigationTimeout(60000);
    this.page.setDefaultTimeout(60000);

    // Remove webdriver flag to avoid detection
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });
    });

    console.log("✓ Browser initialized");
  }

  async searchPlaces(query: string, maxResults = 20): Promise<ScrapedPlace[]> {
    if (!this.page) {
      throw new Error("Browser not initialized. Call initialize() first.");
    }

    const searchUrl = `https://www.google.com/maps/search/${
      encodeURIComponent(query)
    }`;
    console.log(`🔍 Searching: ${query}`);
    console.log(`📍 URL: ${searchUrl}`);

    // Navigate to search URL
    await this.page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Give time for page to load and stabilize
    await this.delay(4000);

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

    // Poll for the selector instead of using waitForSelector (avoids frame issues)
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const feedExists = await this.page.$('[role="feed"]');
        if (feedExists) {
          console.log("✓ Results loaded");
          await this.delay(3000);
          return;
        }
      } catch (error) {
        // Ignore errors and retry
      }

      attempts++;
      await this.delay(1000);
    }

    throw new Error("Timeout waiting for results feed");
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
      try {
        // Count current results - try multiple selectors
        const currentCount = await this.page.evaluate((selector) => {
          // Try different possible selectors for Google Maps results
          let items = document.querySelectorAll(`${selector} > div > div > a`);

          // Alternative: Look for elements with data-index attribute
          if (items.length === 0) {
            items = document.querySelectorAll(
              `${selector} a[href*="/maps/place/"]`,
            );
          }

          return items.length;
        }, scrollableSelector).catch(() => {
          // If evaluate fails due to detached frame, return previous count
          console.log("  ⚠️  Frame detached during count, retrying...");
          return previousCount;
        });

        console.log(`  Current results: ${currentCount}`);

        if (currentCount >= maxResults) {
          console.log(`✓ Reached target of ${maxResults} results`);
          break;
        }

        if (currentCount === previousCount) {
          noNewResultsCount++;
          console.log(
            `  No new results (${noNewResultsCount}/${maxNoNewResults})`,
          );
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
        }, scrollableSelector).catch(() => {
          console.log("  ⚠️  Frame detached during scroll, continuing...");
        });

        // Wait for new content to load
        await this.delay(2000);
      } catch (error) {
        console.log("  ⚠️  Error during scrolling:", error.message);
        await this.delay(2000);
      }
    }

    console.log("✓ Scrolling complete");
  }

  private async extractPlaces(query: string): Promise<ScrapedPlace[]> {
    if (!this.page) return [];

    console.log("📊 Extracting place data...");

    // Add small delay to ensure frames are stable before extraction
    await this.delay(1000);

    const places = await this.page.evaluate((searchQuery) => {
      const results: ScrapedPlace[] = [];
      const feed = document.querySelector('[role="feed"]');
      if (!feed) return results;

      // Try to find all place links - Google Maps structure varies
      const placeLinks = feed.querySelectorAll('a[href*="/maps/place/"]');

      placeLinks.forEach((link) => {
        try {
          // Extract URL
          const url = link.getAttribute("href") || "";

          // Generate place ID from URL
          const placeIdMatch = url.match(/!1s([^!]+)/);
          const placeId = placeIdMatch ? placeIdMatch[1] : "";

          // Extract place name from aria-label
          const name = link.getAttribute("aria-label") || "";

          // Find the parent container to extract other details
          let container = link.closest('div[role="article"]');
          if (!container) {
            // Try alternative structure
            container = link.parentElement?.parentElement?.parentElement;
          }

          let rating = undefined;
          let totalReviews = undefined;
          let category = undefined;
          let priceLevel = undefined;

          if (container) {
            // Extract rating
            const ratingEl = container.querySelector(
              'span[role="img"][aria-label*="stars"]',
            );
            if (!ratingEl) {
              // Try alternative: look for aria-label with rating pattern
              const spans = container.querySelectorAll("span[aria-label]");
              spans.forEach((span) => {
                const label = span.getAttribute("aria-label") || "";
                const ratingMatch = label.match(/([\d.]+)\s+stars/);
                if (ratingMatch && !rating) {
                  rating = parseFloat(ratingMatch[1]);
                }
              });
            } else {
              const ratingText = ratingEl.getAttribute("aria-label") || "";
              const ratingMatch = ratingText.match(/([\d.]+)\s+stars/);
              rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
            }

            // Extract review count
            const reviewEl = container.querySelector(
              'span[aria-label*="reviews"]',
            );
            if (reviewEl) {
              const reviewText = reviewEl.getAttribute("aria-label") || "";
              const reviewMatch = reviewText.match(/([\d,]+)\s+reviews/);
              totalReviews = reviewMatch
                ? parseInt(reviewMatch[1].replace(/,/g, ""))
                : undefined;
            }

            // Extract category from text content
            const textDivs = container.querySelectorAll("div");
            textDivs.forEach((div) => {
              const text = div.textContent || "";
              // Categories often contain "·" separator
              if (text.includes("·") && !category) {
                const parts = text.split("·");
                category = parts[0].trim();
              }
            });
          }

          if (name && placeId) {
            results.push({
              placeId,
              name,
              rating,
              totalReviews,
              category,
              priceLevel,
              url: url.startsWith("http")
                ? url
                : `https://www.google.com${url}`,
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
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
