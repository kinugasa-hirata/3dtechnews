import { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, Globe, Building2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Article } from '@/types';
import { MAKERS, COUNTRIES } from '@/types';

interface ArticleListItemProps {
  article: Article;
  index: number;
}

export function ArticleListItem({ article, index }: ArticleListItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const item = itemRef.current;
    if (!item) return;

    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    
    const timer = setTimeout(() => {
      item.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      item.style.opacity = '1';
      item.style.transform = 'translateX(0)';
    }, index * 80);

    return () => clearTimeout(timer);
  }, [index]);

  const maker = article.maker ? MAKERS.find(m => m.id === article.maker) : null;
  const country = COUNTRIES.find(c => c.id === article.country);

  return (
    <article
      ref={itemRef}
      className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-[#FF6B35]/30 transition-all duration-300 hover:shadow-lg cursor-pointer"
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {article.translatedFrom && (
            <div className="absolute top-1 left-1">
              <Badge className="bg-[#FF6B35]/90 text-white text-[10px] px-1.5 py-0.5">
                翻訳
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-2">
                {article.tags.slice(0, 4).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-[#FF6B35] transition-colors duration-200">
                {article.title}
              </h3>

              {/* Summary */}
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                {article.summary}
              </p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-full flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-[#FF6B35]" />
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(article.publishedAt), 'yyyy年M月d日', { locale: ja })}
            </span>
            {maker && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {maker.name}
              </span>
            )}
            {country && (
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                {country.name}
              </span>
            )}
            <span className="text-gray-400 ml-auto">
              {article.sourceName}
            </span>
          </div>
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
