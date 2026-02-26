import { useState, useEffect } from 'react';
import { LayoutGrid, List, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { ArticleCard } from '@/components/ArticleCard';
import { ArticleListItem } from '@/components/ArticleListItem';
import { Footer } from '@/components/Footer';
import { useArticles } from '@/hooks/useArticles';
import { fetchArticles } from '@/lib/appwrite';
import type { Article, ViewMode } from '@/types';
import './App.css';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const {
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
  } = useArticles(articles);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchArticles()
      .then(setArticles)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 noise-overlay">
      <Header
        searchValue={filters.search}
        onSearchChange={setSearch}
      />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-fade-in-up">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B35]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FF6B35]/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <Badge className="bg-[#FF6B35] text-white mb-4">
                  毎日更新
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  3Dプリンティング技術の
                  <br className="hidden sm:block" />
                  最新情報をお届け
                </h1>
                <p className="text-gray-300 max-w-xl">
                  世界中の3Dプリンティング関連ニュースを収集し、
                  日本語で要約して毎日お届けします。
                  技術者やメーカーの方々の情報収集をサポートします。
                </p>

                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    現在 {articles.length} 件の記事を掲載中
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-[#FF6B35] rounded-full" />
                    30日間のアーカイブを保持
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Sidebar
                selectedTags={filters.tags}
                selectedCategories={filters.categories}
                selectedMakers={filters.makers}
                selectedCountries={filters.countries}
                selectedDate={selectedDate}
                activeFiltersCount={activeFiltersCount}
                onToggleTag={toggleTag}
                onToggleCategory={toggleCategory}
                onToggleMaker={toggleMaker}
                onToggleCountry={toggleCountry}
                onSelectDate={setSelectedDate}
                onClearFilters={clearFilters}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    最新記事
                  </h2>
                  <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                    {filteredArticles.length}件
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    className={`hover:bg-gray-100 ${isLoading ? 'animate-spin' : ''}`}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                      className={`w-8 h-8 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                      className={`w-8 h-8 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                  <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">記事を読み込み中...</p>
                </div>
              ) : filteredArticles.length > 0 ? (
                <div className={`
                  ${viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                    : 'space-y-4'
                  }
                `}>
                  {filteredArticles.map((article, index) => (
                    viewMode === 'grid' ? (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        index={index}
                      />
                    ) : (
                      <ArticleListItem
                        key={article.id}
                        article={article}
                        index={index}
                      />
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    該当する記事が見つかりません
                  </h3>
                  <p className="text-gray-500 mb-4">
                    フィルターを変更するか、検索条件を調整してください
                  </p>
                  <Button
                    onClick={clearFilters}
                    className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                  >
                    フィルターをクリア
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;