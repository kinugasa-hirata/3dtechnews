import { useState, useMemo, useCallback } from 'react';
import type { Article, FilterState } from '@/types';

export function useArticles(articles: Article[]) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tags: [],
    categories: [],
    makers: [],
    countries: [],
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          article.title.toLowerCase().includes(searchLower) ||
          article.summary.toLowerCase().includes(searchLower) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasTag = filters.tags.some(tag => article.tags.includes(tag));
        if (!hasTag) return false;
      }

      // Categories filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(article.category)) return false;
      }

      // Makers filter
      if (filters.makers.length > 0) {
        if (!article.maker || !filters.makers.includes(article.maker)) return false;
      }

      // Countries filter
      if (filters.countries.length > 0) {
        if (!filters.countries.includes(article.country)) return false;
      }

      // Date filter
      if (selectedDate) {
        const articleDate = new Date(article.publishedAt);
        const selectedDateStr = selectedDate.toDateString();
        const articleDateStr = articleDate.toDateString();
        if (selectedDateStr !== articleDateStr) return false;
      }

      return true;
    });
  }, [articles, filters, selectedDate]);

  const toggleTag = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  const toggleMaker = useCallback((maker: string) => {
    setFilters(prev => ({
      ...prev,
      makers: prev.makers.includes(maker)
        ? prev.makers.filter(m => m !== maker)
        : [...prev.makers, maker],
    }));
  }, []);

  const toggleCountry = useCallback((country: string) => {
    setFilters(prev => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country],
    }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      tags: [],
      categories: [],
      makers: [],
      countries: [],
    });
    setSelectedDate(null);
  }, []);

  const activeFiltersCount = useMemo(() => {
    return (
      filters.tags.length +
      filters.categories.length +
      filters.makers.length +
      filters.countries.length +
      (selectedDate ? 1 : 0)
    );
  }, [filters, selectedDate]);

  return {
    filters,
    filteredArticles,
    selectedDate,
    setSelectedDate,
    toggleTag,
    toggleCategory,
    toggleMaker,
    toggleCountry,
    setSearch,
    clearFilters,
    activeFiltersCount,
  };
}
