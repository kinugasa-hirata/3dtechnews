# Appwrite Backend Setup Guide

This guide walks you through setting up the Appwrite backend for the 3D Printing News Aggregator.

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Database Configuration](#database-configuration)
3. [Collection Schema](#collection-schema)
4. [Cloud Functions](#cloud-functions)
5. [Automation Setup](#automation-setup)
6. [Environment Variables](#environment-variables)
7. [Testing](#testing)

---

## Initial Setup

### 1. Create Appwrite Account

1. Go to https://cloud.appwrite.io
2. Sign up for a free account
3. Create a new project named "3D Printing News"

### 2. Get Project Credentials

1. In your project dashboard, go to **Overview**
2. Copy the **Project ID**
3. Go to **API Keys** and create a new API key with these permissions:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `documents.read`
   - `documents.write`
   - `documents.delete`
   - `functions.read`
   - `functions.write`
   - `functions.execute`

---

## Database Configuration

### 1. Create Database

1. Go to **Databases** in the left sidebar
2. Click **Create Database**
3. Name: `3d_printing_news`
4. Database ID: `3d_printing_news` (or auto-generate)

### 2. Create Collections

#### Collection: `articles`

**Create Collection:**
1. Click **Create Collection**
2. Name: `articles`
3. Collection ID: `articles`

**Add Attributes:**

| Attribute ID | Type | Size/Config | Required | Default |
|--------------|------|-------------|----------|---------|
| `title` | string | 255 | Yes | - |
| `summary` | string | 2000 | Yes | - |
| `content` | string | 10000 | No | - |
| `imageUrl` | string | 500 | Yes | - |
| `sourceUrl` | string | 500 | Yes | - |
| `sourceName` | string | 100 | Yes | - |
| `publishedAt` | datetime | - | Yes | - |
| `tags` | string[] | 20 items | Yes | [] |
| `category` | string | 50 | Yes | - |
| `maker` | string | 50 | No | - |
| `country` | string | 50 | Yes | - |
| `language` | string | 10 | Yes | 'ja' |
| `translatedFrom` | string | 50 | No | - |
| `createdAt` | datetime | - | Yes | - |
| `expiresAt` | datetime | - | Yes | - |

**Add Indexes:**

1. Click **Indexes** tab
2. Add these indexes:

| Index Name | Type | Attributes |
|------------|------|------------|
| `publishedAt_desc` | Descending | `publishedAt` |
| `category_idx` | Key | `category` |
| `tags_idx` | Fulltext | `tags` |
| `maker_idx` | Key | `maker` |
| `country_idx` | Key | `country` |
| `expiresAt_idx` | Ascending | `expiresAt` |

#### Collection: `sources` (Optional)

For storing news source configurations:

| Attribute ID | Type | Size | Required |
|--------------|------|------|----------|
| `name` | string | 100 | Yes |
| `url` | string | 500 | Yes |
| `rssFeed` | string | 500 | No |
| `scrapeConfig` | json | - | Yes |
| `isActive` | boolean | - | Yes |
| `lastScrapedAt` | datetime | - | No |
| `scrapeInterval` | integer | - | Yes |

---

## Cloud Functions

### Function 1: `scraper-cron`

This function scrapes news from configured sources and adds them to the database.

**Create Function:**
1. Go to **Functions** in the left sidebar
2. Click **Create Function**
3. Name: `scraper-cron`
4. Runtime: `Node.js 18.0`
5. Entrypoint: `src/main.js`

**Function Code:**

```javascript
const { Client, Databases, ID, Query } = require('node-appwrite');
const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Calculate expiration date (30 days from now)
function getExpirationDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
}

// Translate text using OpenAI
async function translateToJapanese(text, sourceLang) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator. Translate the following text to natural Japanese. Keep technical terms in English if they are commonly used in the 3D printing industry.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

// Scrape article from URL
async function scrapeArticle(url, config) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    return {
      title: $(config.titleSelector).first().text().trim(),
      summary: $(config.summarySelector).first().text().trim(),
      imageUrl: $(config.imageSelector).first().attr('src') || '',
      publishedAt: $(config.dateSelector).first().attr('datetime') || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return null;
  }
}

// Main function
module.exports = async function (context) {
  try {
    // Get active sources
    const sources = await databases.listDocuments(
      process.env.DATABASE_ID,
      'sources',
      [Query.equal('isActive', true)]
    );

    const results = [];

    for (const source of sources.documents) {
      try {
        // Check if it's time to scrape this source
        const lastScraped = source.lastScrapedAt ? new Date(source.lastScrapedAt) : null;
        const now = new Date();
        const intervalMs = source.scrapeInterval * 60 * 1000;
        
        if (lastScraped && (now - lastScraped) < intervalMs) {
          continue; // Skip if not enough time has passed
        }

        // Scrape articles
        const articles = await scrapeArticlesFromSource(source);
        
        for (const article of articles) {
          // Check if article already exists
          const existing = await databases.listDocuments(
            process.env.DATABASE_ID,
            'articles',
            [Query.equal('sourceUrl', article.sourceUrl)]
          );

          if (existing.total > 0) {
            continue; // Skip duplicates
          }

          // Translate if needed
          let title = article.title;
          let summary = article.summary;
          let translatedFrom = null;

          if (source.language !== 'ja') {
            title = await translateToJapanese(article.title, source.language);
            summary = await translateToJapanese(article.summary, source.language);
            translatedFrom = source.language;
          }

          // Create document
          await databases.createDocument(
            process.env.DATABASE_ID,
            'articles',
            ID.unique(),
            {
              title,
              summary,
              imageUrl: article.imageUrl,
              sourceUrl: article.sourceUrl,
              sourceName: source.name,
              publishedAt: article.publishedAt,
              tags: article.tags || [],
              category: article.category || 'industry',
              maker: article.maker || null,
              country: source.country || 'other',
              language: 'ja',
              translatedFrom,
              createdAt: new Date().toISOString(),
              expiresAt: getExpirationDate(),
            }
          );

          results.push({ source: source.name, title: article.title });
        }

        // Update last scraped time
        await databases.updateDocument(
          process.env.DATABASE_ID,
          'sources',
          source.$id,
          { lastScrapedAt: new Date().toISOString() }
        );

      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error);
      }
    }

    return context.res.json({ 
      success: true, 
      processed: results.length,
      articles: results 
    });

  } catch (error) {
    console.error('Function error:', error);
    return context.res.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
};
```

**Environment Variables for Function:**

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
DATABASE_ID=3d_printing_news
OPENAI_API_KEY=your_openai_api_key
```

**Schedule:**
1. Go to function settings
2. Under **Schedule**, set: `0 * * * *` (every hour)

---

### Function 2: `cleanup-expired`

This function deletes articles that have passed their expiration date.

**Create Function:**
1. Name: `cleanup-expired`
2. Runtime: `Node.js 18.0`

**Function Code:**

```javascript
const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

module.exports = async function (context) {
  try {
    const now = new Date().toISOString();
    
    // Find expired articles
    const expired = await databases.listDocuments(
      process.env.DATABASE_ID,
      'articles',
      [
        Query.lessThan('expiresAt', now),
        Query.limit(100) // Process in batches
      ]
    );

    let deleted = 0;
    
    for (const article of expired.documents) {
      await databases.deleteDocument(
        process.env.DATABASE_ID,
        'articles',
        article.$id
      );
      deleted++;
    }

    return context.res.json({
      success: true,
      deleted,
      remaining: expired.total - deleted
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return context.res.json({
      success: false,
      error: error.message
    }, 500);
  }
};
```

**Schedule:**
1. Go to function settings
2. Under **Schedule**, set: `0 0 * * *` (daily at midnight)

---

## Environment Variables

### Frontend (.env file)

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=3d_printing_news
```

### Function Environment Variables (in Appwrite Console)

For each function, set these environment variables:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
DATABASE_ID=3d_printing_news
OPENAI_API_KEY=your_openai_api_key
```

---

## Testing

### 1. Test Database Connection

Add a test article manually:

```javascript
const { Client, Databases, ID } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('your_project_id')
  .setKey('your_api_key');

const databases = new Databases(client);

async function test() {
  try {
    const doc = await databases.createDocument(
      '3d_printing_news',
      'articles',
      ID.unique(),
      {
        title: 'テスト記事',
        summary: 'これはテスト記事です',
        imageUrl: 'https://example.com/image.jpg',
        sourceUrl: 'https://example.com/article',
        sourceName: 'Test Source',
        publishedAt: new Date().toISOString(),
        tags: ['PLA', 'FDM'],
        category: 'hardware',
        country: 'japan',
        language: 'ja',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
    );
    console.log('Success:', doc);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
```

### 2. Test Functions

1. Go to your function in Appwrite Console
2. Click **Execute**
3. Check the **Logs** tab for output

### 3. Test Frontend

1. Update `.env` with your Appwrite credentials
2. Run `npm run dev`
3. Check browser console for connection errors

---

## Troubleshooting

### Common Issues

**1. "Permission denied" errors**
- Check that your API key has the correct permissions
- Verify collection permissions allow function access

**2. "Document not found" errors**
- Check database ID and collection ID are correct
- Verify document exists before updating/deleting

**3. Translation not working**
- Verify OPENAI_API_KEY is set correctly
- Check OpenAI API usage limits

**4. Images not loading**
- Ensure image URLs are absolute (not relative)
- Check CORS settings on image sources

---

## Free Tier Limits

Appwrite Cloud Free Tier:
- **Database**: 1GB storage, unlimited reads/writes
- **Functions**: 750K executions/month
- **Bandwidth**: 10GB/month

To stay within limits:
- Keep articles for max 30 days (automatic cleanup)
- Scrape sources every 1-2 hours (not continuously)
- Use image hotlinking (don't store images)

---

## Next Steps

1. Set up custom domain (optional): `your-app.appwrite.network`
2. Configure monitoring and alerts
3. Add more news sources
4. Implement user authentication (for favorites/bookmarks)
5. Add email notifications for new articles

---

## Support

- Appwrite Documentation: https://appwrite.io/docs
- Appwrite Discord: https://appwrite.io/discord
- OpenAI API Docs: https://platform.openai.com/docs
