// Appwrite Configuration and Database Schema
// This file defines the structure for the Appwrite backend integration

/**
 * Appwrite Database Schema for 3D Printing News Aggregator
 * 
 * Database Name: 3d_printing_news
 * 
 * Collection: articles
 * 
 * Attributes:
 * - id (string, unique) - Article ID
 * - title (string, 255 chars) - Article title in Japanese
 * - summary (string, 1000 chars) - Article summary in Japanese
 * - content (string, unlimited) - Full article content (optional)
 * - imageUrl (string, 500 chars) - URL to article image
 * - sourceUrl (string, 500 chars) - Original article URL
 * - sourceName (string, 100 chars) - Source website name
 * - publishedAt (datetime) - Original publication date
 * - tags (string[], 20 items) - Array of tags
 * - category (string, 50 chars) - Article category
 * - maker (string, 50 chars, optional) - 3D printer manufacturer
 * - country (string, 50 chars) - Country of origin
 * - language (string, 10 chars) - Original language (ja/en/other)
 * - translatedFrom (string, 50 chars, optional) - Original language if translated
 * - createdAt (datetime) - When article was added to database
 * - expiresAt (datetime) - When article should be deleted (30 days after creation)
 * 
 * Indexes:
 * - publishedAt_desc (descending) - For sorting by date
 * - category (key) - For filtering by category
 * - tags (fulltext) - For tag-based filtering
 * - maker (key) - For filtering by manufacturer
 * - country (key) - For filtering by country
 * - expiresAt (ascending) - For cleanup job
 */

export const APPWRITE_CONFIG = {
  // These values should be set in your environment variables
  ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
  DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID || '3d_printing_news',
  
  COLLECTIONS: {
    ARTICLES: 'articles',
    SOURCES: 'sources', // For storing news source configurations
    SCRAPER_LOGS: 'scraper_logs', // For tracking scraper runs
  },
  
  BUCKETS: {
    IMAGES: 'article_images',
  },
};

// Article document type matching Appwrite schema
export interface AppwriteArticle {
  $id?: string;
  title: string;
  summary: string;
  content?: string;
  imageUrl: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
  tags: string[];
  category: string;
  maker?: string;
  country: string;
  language: 'ja' | 'en' | 'other';
  translatedFrom?: string;
  createdAt: string;
  expiresAt: string;
}

// Source configuration for web scraping
export interface NewsSource {
  $id?: string;
  name: string;
  url: string;
  rssFeed?: string;
  scrapeConfig: {
    articleSelector: string;
    titleSelector: string;
    summarySelector: string;
    imageSelector?: string;
    dateSelector: string;
    dateFormat: string;
  };
  isActive: boolean;
  lastScrapedAt?: string;
  scrapeInterval: number; // in minutes
}

/**
 * Appwrite Functions for Automation
 * 
 * 1. scraper-cron (Scheduled Function)
 *    - Runs every hour
 *    - Fetches news from configured sources
 *    - Translates non-Japanese content
 *    - Stores articles in database
 *    - Sets 30-day expiration
 * 
 * 2. cleanup-expired (Scheduled Function)
 *    - Runs daily at midnight
 *    - Deletes articles where expiresAt < current time
 *    - Logs cleanup statistics
 * 
 * 3. translate-article (Background Function)
 *    - Triggered when new article is added
 *    - If language != 'ja', translates title and summary
 *    - Updates article with translated content
 */

/**
 * Environment Variables Required:
 * 
 * VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
 * VITE_APPWRITE_PROJECT_ID=your_project_id
 * VITE_APPWRITE_DATABASE_ID=3d_printing_news
 * 
 * // For server-side functions (set in Appwrite Console)
 * APPWRITE_API_KEY=your_api_key
 * OPENAI_API_KEY=your_openai_key // For translation
 * 
 * // Optional: For custom domain
 * VITE_APPWRITE_HOSTNAME=your-app.appwrite.network
 */

// Helper function to calculate expiration date (30 days from now)
export function calculateExpirationDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
}

// Helper function to check if article is expired
export function isArticleExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}
