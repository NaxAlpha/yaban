/**
 * Main entry point for the Google Maps scraper
 * Usage: deno run --allow-net --allow-write --allow-read --allow-env --allow-run scraper/main.ts
 */

import { GoogleMapsScraper } from "./maps-scraper.ts";
import { generateFilename, saveRawData } from "./storage.ts";

async function main() {
  const query = Deno.args[0] || "halal restaurants in Tokyo";
  const maxResults = parseInt(Deno.args[1] || "20");
  const headless = Deno.args[2] !== "false"; // Set to false to see the browser

  console.log("=".repeat(60));
  console.log("🍽️  Yaban - Google Maps Scraper");
  console.log("=".repeat(60));
  console.log(`Query: ${query}`);
  console.log(`Max Results: ${maxResults}`);
  console.log(`Headless: ${headless}`);
  console.log("=".repeat(60));
  console.log();

  const scraper = new GoogleMapsScraper();

  try {
    await scraper.initialize(headless, 50);
    const places = await scraper.searchPlaces(query, maxResults);

    // Save results
    const filename = generateFilename(query);
    await saveRawData(filename, {
      query,
      scrapedAt: new Date().toISOString(),
      totalResults: places.length,
      places,
    });

    console.log();
    console.log("=".repeat(60));
    console.log("✅ Scraping complete!");
    console.log(`📊 Total places scraped: ${places.length}`);
    console.log(`💾 Data saved to: data/raw/${filename}`);
    console.log("=".repeat(60));

    // Show preview of first few results
    if (places.length > 0) {
      console.log();
      console.log("Preview of results:");
      places.slice(0, 3).forEach((place, i) => {
        console.log(`\n${i + 1}. ${place.name}`);
        console.log(`   ⭐ Rating: ${place.rating || "N/A"} (${place.totalReviews || 0} reviews)`);
        console.log(`   📍 Category: ${place.category || "N/A"}`);
        console.log(`   💰 Price: ${place.priceLevel || "N/A"}`);
      });
    }
  } catch (error) {
    console.error("❌ Error during scraping:", error);
    throw error;
  } finally {
    await scraper.close();
  }
}

if (import.meta.main) {
  main();
}
