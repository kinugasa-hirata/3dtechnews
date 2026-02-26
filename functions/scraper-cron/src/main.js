import { Client, Databases, ID, Query } from 'node-appwrite';
import Parser from 'rss-parser';

const client = new Client();
client
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const parser = new Parser({ timeout: 8000 });

const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = 'articles';

const RSS_SOURCES = [
  { name: '3DPrint.com', url: 'https://3dprint.com/feed/', country: 'usa', language: 'en' },
  { name: 'Hackaday', url: 'https://hackaday.com/blog/feed/', country: 'usa', language: 'en' },
  { name: 'Fabbaloo', url: 'https://www.fabbaloo.com/feed', country: 'usa', language: 'en' },
];

function detectCategory(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  if (text.match(/material|pla|abs|petg|tpu|resin|filament|nylon/)) return 'materials';
  if (text.match(/software|slicer|cura|prusa slicer|bambu studio|firmware/)) return 'software';
  if (text.match(/printer|hardware|extruder|hotend|bed|frame/)) return 'hardware';
  if (text.match(/post.process|finish|paint|sand|support removal/)) return 'post-processing';
  if (text.match(/medical|aerospace|automotive|construction|food|fashion/)) return 'applications';
  return 'industry';
}

function detectMaker(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  const makers = [
    { id: 'prusa', keywords: ['prusa'] },
    { id: 'bambu', keywords: ['bambu'] },
    { id: 'creality', keywords: ['creality', 'ender', 'cr-'] },
    { id: 'formlabs', keywords: ['formlabs', 'form 3', 'form 4'] },
    { id: 'ultimaker', keywords: ['ultimaker'] },
    { id: 'stratasys', keywords: ['stratasys'] },
    { id: '3dsystems', keywords: ['3d systems'] },
    { id: 'markforged', keywords: ['markforged'] },
    { id: 'eos', keywords: [' eos '] },
    { id: 'hp', keywords: ['hp jet fusion', 'hp multi jet'] },
    { id: 'snapmaker', keywords: ['snapmaker'] },
    { id: 'raise3d', keywords: ['raise3d'] },
    { id: 'mimaki', keywords: ['mimaki'] },
    { id: 'roland', keywords: ['roland dg'] },
  ];
  for (const maker of makers) {
    if (maker.keywords.some(k => text.includes(k))) return maker.id;
  }
  return null;
}

function detectTags(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  const tagMap = {
    'PLA': ['pla'],
    'ABS': ['abs'],
    'PETG': ['petg'],
    'TPU': ['tpu'],
    'SLS': ['sls', 'selective laser sintering'],
    'SLA': ['sla', 'stereolithography'],
    'FDM': ['fdm', 'fused deposition'],
    'MJF': ['mjf', 'multi jet fusion'],
    'DMLS': ['dmls', 'direct metal laser'],
  };
  const found = [];
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some(k => text.includes(k))) found.push(tag);
  }
  return found.slice(0, 5);
}

async function articleExists(sourceUrl) {
  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('sourceUrl', sourceUrl),
      Query.limit(1),
    ]);
    return result.total > 0;
  } catch {
    return false;
  }
}

function getExpiryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
}

export default async ({ req, res, log, error }) => {
  log('Starting scraper-cron...');
  let totalAdded = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const source of RSS_SOURCES) {
    try {
      log(`Fetching feed: ${source.name}`);
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items.slice(0, 10)) {
        try {
          const sourceUrl = item.link || item.guid;
          if (!sourceUrl) continue;

          if (await articleExists(sourceUrl)) {
            totalSkipped++;
            continue;
          }

          const title = item.title || 'Untitled';
          const content = item.contentSnippet || item.content || item.summary || '';
          const summary = content.slice(0, 500);
          const publishedAt = item.isoDate || item.pubDate
            ? new Date(item.isoDate || item.pubDate).toISOString()
            : new Date().toISOString();

          const article = {
            title,
            summary,
            content: content.slice(0, 5000),
            imageUrl: item.enclosure?.url || '',
            sourceUrl,
            sourceName: source.name,
            publishedAt,
            tags: detectTags(title, content),
            category: detectCategory(title, content),
            maker: detectMaker(title, content),
            country: source.country,
            language: source.language,
            expiresAt: getExpiryDate(),
          };

          await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            article
          );
          totalAdded++;
          log(`Added: ${title.slice(0, 60)}`);
        } catch (itemError) {
          error(`Error processing item: ${itemError.message}`);
          totalErrors++;
        }
      }
    } catch (feedError) {
      error(`Error fetching ${source.name}: ${feedError.message}`);
      totalErrors++;
    }
  }

  log(`Done! Added: ${totalAdded}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`);
  return res.json({ totalAdded, totalSkipped, totalErrors });
};