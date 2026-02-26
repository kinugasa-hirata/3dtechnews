import { Client, Databases, Query } from 'appwrite';

export const APPWRITE_CONFIG = {
  ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
  DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID || '3d_printing_news',
  COLLECTIONS: {
    ARTICLES: 'articles',
  },
};

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
  .setProject(APPWRITE_CONFIG.PROJECT_ID);

const databases = new Databases(client);

export async function fetchArticles() {
  const response = await databases.listDocuments(
    APPWRITE_CONFIG.DATABASE_ID,
    APPWRITE_CONFIG.COLLECTIONS.ARTICLES,
    [
      Query.orderDesc('publishedAt'),
      Query.limit(100),
    ]
  );

  return response.documents.map((doc) => ({
    id: doc.$id,
    title: doc.title,
    summary: doc.summary || '',
    content: doc.content || '',
    imageUrl: doc.imageUrl || '',
    sourceUrl: doc.sourceUrl,
    sourceName: doc.sourceName,
    publishedAt: doc.publishedAt,
    tags: doc.tags ? JSON.parse(doc.tags) : [],
    category: doc.category || 'industry',
    maker: doc.maker || undefined,
    country: doc.country || 'other',
    language: doc.language || 'en',
    translatedFrom: doc.translatedFrom || undefined,
    createdAt: doc.$createdAt,
    expiresAt: doc.expiresAt,
  }));
}

export function calculateExpirationDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
}

export function isArticleExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}