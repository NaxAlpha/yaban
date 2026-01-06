/**
 * Storage utilities for saving scraped data to JSON files
 */

export interface ScrapedPlace {
  placeId: string;
  name: string;
  address?: string;
  rating?: number;
  totalReviews?: number;
  category?: string;
  priceLevel?: string;
  url: string;
  scrapedAt: string;
}

export interface ScrapedReview {
  reviewId: string;
  placeId: string;
  authorName: string;
  authorUrl?: string;
  rating: number;
  text?: string;
  publishedTime?: string;
  scrapedAt: string;
}

export async function saveRawData(
  filename: string,
  data: unknown,
): Promise<void> {
  const filepath = `./data/raw/${filename}`;
  const jsonData = JSON.stringify(data, null, 2);
  await Deno.writeTextFile(filepath, jsonData);
  console.log(`✓ Saved data to ${filepath}`);
}

export function generateFilename(query: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const sanitized = query.toLowerCase().replace(/\s+/g, "-");
  return `${sanitized}_${timestamp}.json`;
}
