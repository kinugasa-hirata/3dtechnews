export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
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

export interface FilterState {
  search: string;
  tags: string[];
  categories: string[];
  makers: string[];
  countries: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export type ViewMode = 'grid' | 'list';

export interface CalendarEvent {
  date: Date;
  count: number;
}

export const TAGS = [
  'PLA',
  'ABS',
  'PETG',
  'TPU',
  'ナイロン',
  '樹脂',
  '金属',
  'SLS',
  'SLA',
  'FDM',
  'MJF',
  'DMLS',
  'カーボン',
  '木材',
] as const;

export const CATEGORIES = [
  { id: 'materials', name: '材料', nameEn: 'Materials' },
  { id: 'software', name: 'ソフトウェア', nameEn: 'Software' },
  { id: 'hardware', name: 'ハードウェア', nameEn: 'Hardware' },
  { id: 'post-processing', name: '後処理', nameEn: 'Post-processing' },
  { id: 'applications', name: '応用事例', nameEn: 'Applications' },
  { id: 'industry', name: '業界動向', nameEn: 'Industry News' },
] as const;

export const MAKERS = [
  { id: 'prusa', name: 'Prusa Research', country: 'Czech Republic' },
  { id: 'ultimaker', name: 'UltiMaker', country: 'Netherlands' },
  { id: 'formlabs', name: 'Formlabs', country: 'USA' },
  { id: 'markforged', name: 'Markforged', country: 'USA' },
  { id: 'eos', name: 'EOS', country: 'Germany' },
  { id: 'hp', name: 'HP', country: 'USA' },
  { id: 'stratasys', name: 'Stratasys', country: 'USA' },
  { id: '3dsystems', name: '3D Systems', country: 'USA' },
  { id: 'creality', name: 'Creality', country: 'China' },
  { id: 'bambu', name: 'Bambu Lab', country: 'China' },
  { id: 'snapmaker', name: 'Snapmaker', country: 'China' },
  { id: 'raise3d', name: 'Raise3D', country: 'China' },
  { id: 'xyzprinting', name: 'XYZprinting', country: 'Taiwan' },
  { id: 'mimaki', name: 'Mimaki', country: 'Japan' },
  { id: 'roland', name: 'Roland DG', country: 'Japan' },
] as const;

export const COUNTRIES = [
  { id: 'japan', name: '日本', nameEn: 'Japan' },
  { id: 'usa', name: 'アメリカ', nameEn: 'USA' },
  { id: 'germany', name: 'ドイツ', nameEn: 'Germany' },
  { id: 'china', name: '中国', nameEn: 'China' },
  { id: 'netherlands', name: 'オランダ', nameEn: 'Netherlands' },
  { id: 'czech', name: 'チェコ', nameEn: 'Czech Republic' },
  { id: 'taiwan', name: '台湾', nameEn: 'Taiwan' },
  { id: 'other', name: 'その他', nameEn: 'Other' },
] as const;
