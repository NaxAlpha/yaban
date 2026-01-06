/**
 * Install Chrome for Puppeteer using Deno
 * Usage: deno run --allow-read --allow-write --allow-env --allow-net --allow-run scripts/install-chrome.ts
 */

import { install } from "npm:@puppeteer/browsers@2.4.1";
import { join } from "jsr:@std/path@1.0.8";

const cacheDir = Deno.env.get("HOME")
  ? join(Deno.env.get("HOME")!, ".cache", "puppeteer")
  : join(Deno.cwd(), ".cache", "puppeteer");

console.log("🔧 Installing Chrome for Puppeteer...");
console.log(`📁 Cache directory: ${cacheDir}`);

try {
  const result = await install({
    browser: "chrome",
    buildId: "131.0.6778.204", // Match the version Puppeteer expects
    cacheDir,
  });

  console.log("✅ Chrome installed successfully!");
  console.log(`📍 Path: ${result.path}`);
  console.log(`🏷️  Build ID: ${result.buildId}`);
} catch (error) {
  console.error("❌ Failed to install Chrome:", error);
  Deno.exit(1);
}
