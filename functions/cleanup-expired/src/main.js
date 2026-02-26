import { Client, Databases, Query } from 'node-appwrite';

const client = new Client();
client
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = 'articles';

export default async ({ req, res, log, error }) => {
  log('Starting cleanup-expired...');
  let deleted = 0;

  try {
    const now = new Date().toISOString();
    let hasMore = true;

    while (hasMore) {
      const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.lessThan('expiresAt', now),
        Query.limit(100),
      ]);

      if (result.documents.length === 0) {
        hasMore = false;
        break;
      }

      for (const doc of result.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
        deleted++;
      }

      log(`Deleted ${deleted} articles so far...`);
    }
  } catch (err) {
    error(`Cleanup error: ${err.message}`);
  }

  log(`Cleanup done! Deleted ${deleted} expired articles.`);
  return res.json({ deleted });
};