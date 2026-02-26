import { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ExternalLink, Calendar, Globe, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Article } from '@/types';
import { MAKERS, COUNTRIES } from '@/types';

interface ArticleCardProps {
  article: Article;
  index: number;
}

export function ArticleCard({ article, index }: ArticleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Entrance animation with stagger
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    const timer = setTimeout(() => {
      card.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  const maker = article.maker ? MAKERS.find(m => m.id === article.maker) : null;
  const country = COUNTRIES.find(c => c.id === article.country);

  return (
    <article
      ref={cardRef}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 card-lift cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          ref={imageRef}
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover img-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Source badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-gray-700 backdrop-blur-sm text-xs">
            {article.sourceName}
          </Badge>
        </div>

        {/* Translation badge */}
        {article.translatedFrom && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-[#FF6B35]/90 text-white backdrop-blur-sm text-xs flex items-center gap-1">
              <Globe className="w-3 h-3" />
              翻訳
            </Badge>
          </div>
        )}

        {/* Read more overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-800 flex items-center gap-2">
            記事を読む
            <ExternalLink className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {article.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {article.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{article.tags.length - 3}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#FF6B35] transition-colors duration-200">
          {article.title}
        </h3>

        {/* Summary */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
          {article.summary}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(article.publishedAt), 'M月d日', { locale: ja })}
            </span>
            {maker && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {maker.name}
              </span>
            )}
          </div>
          {country && (
            <span className="text-xs text-gray-400">
              {country.name}
            </span>
          )}
        </div>
      </div>

      {/* Link */}
      <a
        href={article.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-10"
        aria-label={article.title}
      />
    </article>
  );
}
