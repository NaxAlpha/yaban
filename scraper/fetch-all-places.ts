/**
 * Batch scraper for all Tokyo districts
 * Creates a timestamped directory and scrapes halal restaurants across all Tokyo wards
 */

import { GoogleMapsScraper } from "./maps-scraper.ts";

// Tokyo's 23 special wards + major districts
const TOKYO_DISTRICTS = [
  "Chiyoda",
  "Chuo",
  "Minato",
  "Shinjuku",
  "Bunkyo",
  "Taito",
  "Sumida",
  "Koto",
  "Shinagawa",
  "Meguro",
  "Ota",
  "Setagaya",
  "Shibuya",
  "Nakano",
  "Suginami",
  "Toshima",
  "Kita",
  "Arakawa",
  "Itabashi",
  "Nerima",
  "Adachi",
  "Katsushika",
  "Edogawa",
];

function getTimestampedDirName(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}-${hour}-${minute}`;
}

async function ensureDirectory(path: string): Promise<void> {
  try {
    await Deno.mkdir(path, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }
}

async function saveBatchData(
  outputDir: string,
  district: string,
  data: unknown,
): Promise<void> {
  const filename = `places-${district.toLowerCase()}-tokyo.json`;
  const filepath = `${outputDir}/${filename}`;
  const jsonData = JSON.stringify(data, null, 2);
  await Deno.writeTextFile(filepath, jsonData);
  console.log(`   💾 Saved to ${filename}`);
}

async function main() {
  const maxResults = parseInt(Deno.args[0] || "20");
  const headless = Deno.args[1] !== "false";

  console.log("=".repeat(70));
  console.log("🗾  Yaban - Tokyo-wide Halal Restaurant Scraper");
  console.log("=".repeat(70));
  console.log(`Districts to scrape: ${TOKYO_DISTRICTS.length}`);
  console.log(`Max results per district: ${maxResults}`);
  console.log(`Headless mode: ${headless}`);
  console.log("=".repeat(70));
  console.log();

  // Create timestamped output directory
  const outputDirName = getTimestampedDirName();
  const outputPath = `./data/raw/${outputDirName}`;
  await ensureDirectory(outputPath);
  console.log(`📁 Created output directory: data/raw/${outputDirName}`);
  console.log();

  const scraper = new GoogleMapsScraper();
  const results = {
    scrapedAt: new Date().toISOString(),
    outputDirectory: outputDirName,
    totalDistricts: TOKYO_DISTRICTS.length,
    districts: [] as {
      name: string;
      query: string;
      placesFound: number;
      status: "success" | "error";
      error?: string;
    }[],
  };

  try {
    await scraper.initialize(headless, 50);

    for (let i = 0; i < TOKYO_DISTRICTS.length; i++) {
      const district = TOKYO_DISTRICTS[i];
      const query = `halal restaurants ${district} tokyo japan`;
      const progress = `[${i + 1}/${TOKYO_DISTRICTS.length}]`;

      console.log(`${progress} 🔍 Scraping: ${district}`);
      console.log(`   Query: "${query}"`);

      try {
        const places = await scraper.searchPlaces(query, maxResults);

        // Save results for this district
        await saveBatchData(outputPath, district, {
          district,
          query,
          scrapedAt: new Date().toISOString(),
          totalResults: places.length,
          places,
        });

        results.districts.push({
          name: district,
          query,
          placesFound: places.length,
          status: "success",
        });

        console.log(`   ✅ Found ${places.length} places`);
        console.log();
      } catch (error) {
        console.error(`   ❌ Error scraping ${district}:`, error.message);
        results.districts.push({
          name: district,
          query,
          placesFound: 0,
          status: "error",
          error: error.message,
        });
        console.log();
      }
    }

    // Save summary file
    const summaryPath = `${outputPath}/summary.json`;
    await Deno.writeTextFile(summaryPath, JSON.stringify(results, null, 2));

    // Print final summary
    console.log("=".repeat(70));
    console.log("✅ Batch scraping complete!");
    console.log("=".repeat(70));
    console.log(`📊 Total districts scraped: ${results.districts.length}`);
    console.log(
      `✓  Successful: ${
        results.districts.filter((d) => d.status === "success").length
      }`,
    );
    console.log(
      `✗  Failed: ${
        results.districts.filter((d) => d.status === "error").length
      }`,
    );
    console.log(
      `🏪 Total places found: ${
        results.districts.reduce((sum, d) => sum + d.placesFound, 0)
      }`,
    );
    console.log(`📁 Output directory: data/raw/${outputDirName}`);
    console.log("=".repeat(70));

    // Show top districts by number of results
    console.log();
    console.log("Top districts by number of halal restaurants:");
    const topDistricts = [...results.districts]
      .filter((d) => d.status === "success")
      .sort((a, b) => b.placesFound - a.placesFound)
      .slice(0, 5);

    topDistricts.forEach((d, i) => {
      console.log(`${i + 1}. ${d.name}: ${d.placesFound} places`);
    });
  } catch (error) {
    console.error("❌ Fatal error during batch scraping:", error);
    throw error;
  } finally {
    await scraper.close();
  }
}

if (import.meta.main) {
  main();
}
