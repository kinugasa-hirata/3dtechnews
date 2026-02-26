# 3Dプリンターテック - 3D Printing Technology News Aggregator

A Japanese-language news aggregation platform for 3D printing technology updates, featuring automated content collection, translation, and intelligent filtering.

## Live Demo

🌐 **Website**: https://isoml7lssbrqw.ok.kimi.link

## Features

### Frontend Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dual View Modes**: Grid and list view for article browsing
- **Advanced Filtering**:
  - Full-text search
  - Tag-based filtering (PLA, ABS, PETG, SLS, SLA, etc.)
  - Category filtering (Materials, Software, Hardware, etc.)
  - Maker/Manufacturer filtering
  - Country/Region filtering
  - Calendar-based date navigation
- **Glassmorphism UI**: Modern, clean interface with subtle animations
- **Japanese Language Support**: Full Japanese UI with proper typography

### Backend Architecture (Appwrite)

#### Database Schema

**Collection: `articles`**

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Article title in Japanese |
| `summary` | string | Article summary (translated if needed) |
| `content` | string | Full article content (optional) |
| `imageUrl` | string | URL to article image |
| `sourceUrl` | string | Original article URL |
| `sourceName` | string | Source website name |
| `publishedAt` | datetime | Original publication date |
| `tags` | string[] | Array of tags |
| `category` | string | Article category |
| `maker` | string | 3D printer manufacturer (optional) |
| `country` | string | Country of origin |
| `language` | string | Original language (ja/en/other) |
| `translatedFrom` | string | Original language if translated |
| `createdAt` | datetime | When added to database |
| `expiresAt` | datetime | Auto-delete after 30 days |

#### Automation Functions

1. **`scraper-cron`** (Scheduled Function)
   - Runs every hour
   - Scrapes configured news sources
   - Translates non-Japanese content using OpenAI API
   - Stores articles with 30-day expiration

2. **`cleanup-expired`** (Scheduled Function)
   - Runs daily at midnight
   - Deletes articles past expiration date
   - Maintains database size within free tier limits

3. **`translate-article`** (Background Function)
   - Triggered on new article creation
   - Translates title and summary if needed

## Setup Instructions

### 1. Appwrite Setup

1. Create an Appwrite account at https://appwrite.io
2. Create a new project
3. Set up a new database called `3d_printing_news`
4. Create the `articles` collection with the schema above
5. Create indexes:
   - `publishedAt` (descending)
   - `category` (key)
   - `tags` (fulltext)
   - `maker` (key)
   - `country` (key)
   - `expiresAt` (ascending)

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=3d_printing_news

# Optional: For custom Appwrite domain
VITE_APPWRITE_HOSTNAME=your-app.appwrite.network
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation header with search
│   ├── Sidebar.tsx     # Filter sidebar with calendar
│   ├── ArticleCard.tsx # Grid view article card
│   ├── ArticleListItem.tsx # List view article item
│   └── Footer.tsx      # Site footer
├── hooks/              # Custom React hooks
│   └── useArticles.ts  # Article filtering logic
├── data/               # Mock data
│   └── mockArticles.ts # Sample articles for demo
├── types/              # TypeScript types
│   └── index.ts        # Type definitions
├── lib/                # Utility functions
│   └── appwrite.ts     # Appwrite configuration
├── App.tsx             # Main application
└── index.css           # Global styles
```

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: GSAP + CSS transitions
- **Backend**: Appwrite (Database + Functions)
- **Translation**: OpenAI API (GPT-4)
- **Deployment**: Static hosting via Appwrite or any CDN

## News Sources Configuration

To add new news sources, configure them in the Appwrite `sources` collection:

```typescript
interface NewsSource {
  name: string;           // Source name
  url: string;           // Base URL
  rssFeed?: string;      // RSS feed URL (optional)
  scrapeConfig: {
    articleSelector: string;   // CSS selector for articles
    titleSelector: string;     // CSS selector for title
    summarySelector: string;   // CSS selector for summary
    imageSelector?: string;    // CSS selector for image
    dateSelector: string;      // CSS selector for date
    dateFormat: string;        // Date format string
  };
  isActive: boolean;     // Enable/disable scraping
  scrapeInterval: number; // Minutes between scrapes
}
```

## Cost Optimization (Free Tier)

- **Database**: 30-day TTL automatically removes old articles
- **Storage**: Images are hotlinked from sources (not stored)
- **Functions**: Scheduled functions run only when needed
- **Bandwidth**: Static site can be CDN-cached

## Customization

### Adding New Tags
Edit `src/types/index.ts`:

```typescript
export const TAGS = [
  'PLA',
  'ABS',
  // Add new tags here
] as const;
```

### Adding New Categories
Edit `src/types/index.ts`:

```typescript
export const CATEGORIES = [
  { id: 'your-category', name: 'カテゴリー名', nameEn: 'Category Name' },
] as const;
```

### Adding New Makers
Edit `src/types/index.ts`:

```typescript
export const MAKERS = [
  { id: 'maker-id', name: 'Maker Name', country: 'Country' },
] as const;
```

## License

MIT License - feel free to use for your own projects!

## Support

For questions or issues, please open a GitHub issue or contact the development team.
